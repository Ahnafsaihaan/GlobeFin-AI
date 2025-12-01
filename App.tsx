import React, { useState } from 'react';
import CurrencyConverter from './components/CurrencyConverter';
import FinancialNews from './components/FinancialNews';
import NewsDetail from './components/NewsDetail';
import { NewsItem } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'news-detail'>('home');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [activeTab, setActiveTab] = useState<'converter' | 'news'>('converter');

  const handleSelectNews = (item: NewsItem) => {
    setSelectedNews(item);
    setView('news-detail');
  };

  const handleBack = () => {
    setView('home');
    setSelectedNews(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur shadow-md text-white border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setView('home'); setActiveTab('converter'); }}>
               <div className="bg-emerald-500 p-1.5 rounded-lg">
                 <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               </div>
               <span className="font-bold text-xl tracking-tight">GlobalFin AI</span>
            </div>
            {view === 'home' && (
              <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('converter')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'converter' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Converter
                </button>
                <button
                  onClick={() => setActiveTab('news')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'news' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Financial News
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'news-detail' && selectedNews ? (
          <NewsDetail item={selectedNews} onBack={handleBack} />
        ) : (
          <div className="animate-fade-in">
             {activeTab === 'converter' ? (
                <div className="max-w-2xl mx-auto">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                           Global Currency Exchange
                        </h1>
                        <p className="mt-4 text-lg text-slate-600">
                           Real-time rates powered by Gemini AI & World Bank data.
                        </p>
                    </div>
                    <CurrencyConverter />
                </div>
             ) : (
                <div className="max-w-6xl mx-auto">
                    <div className="mb-10 border-b border-slate-200 pb-6">
                         <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                           International Financial Intelligence
                        </h1>
                        <p className="mt-4 text-lg text-slate-600 max-w-3xl">
                           Curated updates from major international agencies and your local region.
                        </p>
                    </div>
                    <FinancialNews onSelectNews={handleSelectNews} />
                </div>
             )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} GlobalFin AI. Powered by Google Gemini 2.5 Flash & Pro.
          </p>
          <div className="mt-2 text-xs flex justify-center space-x-4">
             <span>Terms of Service</span>
             <span>Privacy Policy</span>
             <span>World Bank Data Policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;