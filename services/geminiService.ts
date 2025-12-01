import { GoogleGenAI, Type } from "@google/genai";
import { ExchangeRateResult, ImageResolution, NewsItem } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const extractJson = (text: string) => {
  try {
    let cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Find the first '[' or '{'
    const firstMatch = cleanedText.match(/\[|\{/);
    if (firstMatch && firstMatch.index !== undefined) {
        const start = firstMatch.index;
        const isArray = firstMatch[0] === '[';
        const endChar = isArray ? ']' : '}';
        const end = cleanedText.lastIndexOf(endChar);
        if (end !== -1) {
            cleanedText = cleanedText.substring(start, end + 1);
        }
    }
    
    return JSON.parse(cleanedText);
  } catch (e) {
    // console.warn("JSON extraction failed, returning null", e);
    return null;
  }
};

export const fetchExchangeRate = async (from: string, to: string): Promise<ExchangeRateResult> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Get the latest live exchange rate from 1 ${from} to ${to} using Google Search.
      Return a JSON object strictly adhering to this structure:
      {
        "rate": 0.00,
        "explanation": "Brief confirmation text with date and source."
      }
      Ensure "rate" is a number.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const data = extractJson(response.text || "");
    const rate = (data && typeof data.rate === 'number') ? data.rate : 0;
    const explanation = data?.explanation || response.text || "Rate fetched via Search.";
    
    // Grounding Metadata
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((c: any) => c.web?.title || c.web?.uri)
      .filter(Boolean)
      .join(", ") || "Google Search";

    return {
      rate: rate,
      lastUpdated: new Date().toLocaleTimeString(),
      source: sources,
      details: explanation,
    };
  } catch (error) {
    console.error("Exchange rate fetch error:", error);
    throw new Error("Failed to fetch exchange rates.");
  }
};

export const fetchGlobalFinancialNews = async (): Promise<NewsItem[]> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find the latest key financial decisions and news from World Bank, IMF, SAARC, BRICS, ASEAN, and UNO.
      Summarize 6 distinct key stories (one for each if possible or mix).
      For each story, provide a title, the agency involved, and a brief 2-sentence summary.
      Format the output strictly as a valid JSON array of objects: [{ "title": "...", "agency": "...", "summary": "...", "topic": "..." }]`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const data = extractJson(response.text || "[]");
    const items = Array.isArray(data) ? data : [];
    
    // Extract sources to comply with guidelines
    const allSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((c: any) => c.web?.uri)
        .filter(Boolean) || [];
    
    return items.map((item: any, index: number) => ({
      ...item,
      id: `global-${index}`,
      sourceUrl: allSources[index % allSources.length] || undefined
    }));
  } catch (error) {
    console.error("News fetch error:", error);
    return [];
  }
};

export const fetchLocationContext = async (lat: number, lng: number): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Identify the city, country, and economic region for these coordinates: ${lat}, ${lng}.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      },
    });
    return response.text || "Unknown Location";
  } catch (error) {
    console.error("Location context error:", error);
    return "Unknown Region";
  }
};

export const fetchLocalFinancialNews = async (locationContext: string): Promise<NewsItem[]> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Search for the latest financial and economic news specifically for ${locationContext}.
      Focus on regional markets, central bank decisions, or trade updates.
      Return 3 distinct items in a strict JSON array format: [{ "title": "...", "agency": "Local/Regional", "summary": "...", "topic": "..." }]`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    const data = extractJson(response.text || "[]");
    const items = Array.isArray(data) ? data : [];
    
    const allSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((c: any) => c.web?.uri)
        .filter(Boolean) || [];

    return items.map((item: any, index: number) => ({
      ...item,
      id: `local-${index}`,
      agency: "Regional News",
      sourceUrl: allSources[index % allSources.length] || undefined
    }));

  } catch (error) {
    console.error("Local news error:", error);
    return [];
  }
};

export const generateTopicExplanation = async (topic: string, agency: string): Promise<string> => {
    const ai = getAI();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: `Write a formal, detailed explanation (about 150 words) regarding the recent financial topic: "${topic}" involving ${agency}. Explain the implications for the global economy.`,
        });
        return response.text || "No explanation available.";
    } catch (e) {
        return "Could not generate explanation.";
    }
}

export const generateNewsImage = async (topic: string, resolution: ImageResolution): Promise<string | null> => {
  const ai = getAI();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: `A professional, high-quality, photorealistic editorial illustration for financial news about: ${topic}. 
            Formal style, cinematic lighting, corporate aesthetic. No text overlays.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: resolution,
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
};