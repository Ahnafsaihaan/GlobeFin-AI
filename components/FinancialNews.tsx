import React, { useEffect, useState } from 'react';
import { NewsItem } from '../types';
import { fetchGlobalFinancialNews, fetchLocationContext, fetchLocalFinancialNews } from '../services/geminiService';

interface FinancialNewsProps {
  onSelectNews: (item: NewsItem) => void;
}

const FinancialNews: React.FC<FinancialNewsProps> = ({ onSelectNews }) => {
  const [globalNews, setGlobalNews] = useState<NewsItem[]>([]);
  const [localNews, setLocalNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState<string>('');
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initData = async () => {
      // Fetch Global News first
      const global = await fetchGlobalFinancialNews();
      if (mounted) setGlobalNews(global);

      // Try Geolocation
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Get Context via Maps Grounding
            const context = await fetchLocationContext(latitude, longitude);
            if (mounted) setLocationName(context);

            // Fetch Local News
            const local = await fetchLocalFinancialNews(context);
            if (mounted) setLocalNews(local);
            if (mounted) setLoading(false);
          },
          (error) => {
            console.warn("Geolocation denied or failed", error);
            if (mounted) {
                setPermissionDenied(true);
                setLoading(false);
            }
          }
        );
      } else {
        if (mounted) setLoading(false);
      }
    };

    initData();
    return () => { mounted = false; };
  }, []);

  const NewsCard = ({ item, isLocal = false }: { item: NewsItem; isLocal?: boolean }) => (
    <div 
      onClick={() => onSelectNews(item)}
      className={`group cursor-pointer rounded-xl overflow-hidden border transition-all hover:shadow-2xl hover:-translate-y-1 bg-white
        ${isLocal ? 'border-blue-200' : 'border-slate-200'}
      `}
    >
      <div className={`h-32 w-full flex items-center justify-center relative overflow-hidden ${isLocal ? 'bg-gradient-to-br from-blue-600 to-indigo-700' : 'bg-slate-800'}`}>
         {/* Placeholder visual pattern since we don't generate images for the list automatically to save time/tokens */}
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         <div className="text-center p-4 z-10">
            <h3 className="text-white font-serif text-lg font-bold line-clamp-2 leading-tight">
                {item.agency}
            </h3>
            {isLocal && <span className="text-blue-200 text-xs uppercase tracking-widest mt-1 block">Regional Insight</span>}
         </div>
         {/* Dynamic "Expand" overlay */}
         <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white font-semibold text-sm border border-white/50 px-3 py-1 rounded-full">Read Analysis</span>
         </div>
      </div>
      <div className="p-5">
        <h4 className="font-bold text-slate-800 mb-2 leading-snug line-clamp-2 min-h-[3rem]">{item.title}</h4>
        <p className="text-sm text-slate-500 line-clamp-3 mb-4">{item.summary}</p>
        <div className="flex justify-between items-center text-xs text-slate-400 font-medium uppercase tracking-wider">
           <span>{item.topic || 'Finance'}</span>
           <span className="text-emerald-600 flex items-center">
             Read More <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
           </span>
        </div>
      </div>
    </div>
  );

  if (loading && globalNews.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
         {[1, 2, 3, 4, 5, 6].map(i => (
           <div key={i} className="bg-slate-200 h-64 rounded-xl"></div>
         ))}
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Local Section */}
      {!permissionDenied && localNews.length > 0 && (
        <section>
          <div className="flex items-center space-x-2 mb-6">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Regional Updates</h2>
                <p className="text-sm text-slate-500">
                    Insights for <span className="font-semibold text-blue-600">{locationName || "your area"}</span>
                    <span className="text-xs ml-2 opacity-60">(Based on your location)</span>
                </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localNews.map(item => <NewsCard key={item.id} item={item} isLocal />)}
          </div>
        </section>
      )}

      {/* Global Section */}
      <section>
        <div className="flex items-center space-x-2 mb-6">
             <div className="bg-slate-800 text-white p-2 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Global Financial Affairs</h2>
                <p className="text-sm text-slate-500">Latest from World Bank, IMF, BRICS & more</p>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {globalNews.map(item => <NewsCard key={item.id} item={item} />)}
        </div>
      </section>
    </div>
  );
};

export default FinancialNews;