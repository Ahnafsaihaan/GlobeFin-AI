export interface Currency {
  code: string;
  name: string;
  flag: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  agency: string; // e.g., "World Bank", "IMF"
  topic: string;
  imageUrl?: string;
  generatedImage?: string;
  sourceUrl?: string; // From search grounding
}

export interface ExchangeRateResult {
  rate: number;
  lastUpdated: string;
  source: string;
  details: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}

export type ImageResolution = '1K' | '2K' | '4K';

export interface ImageGenerationConfig {
  resolution: ImageResolution;
}