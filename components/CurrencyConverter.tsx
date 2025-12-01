import React, { useState } from 'react';
import { CURRENCIES } from '../constants';
import { fetchExchangeRate } from '../services/geminiService';
import { ExchangeRateResult } from '../types';

const CurrencyConverter: React.FC = () => {
  const [amount, setAmount] = useState<number>(1);
  const [from, setFrom] = useState(CURRENCIES[0].code);
  const [to, setTo] = useState(CURRENCIES[1].code);
  const [result, setResult] = useState<ExchangeRateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await fetchExchangeRate(from, to);
      setResult(data);
    } catch (err) {
      setError('Failed to fetch live rates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 md:p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
        <span className="bg-emerald-100 text-emerald-600 p-2 rounded-lg mr-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </span>
        Live Currency Converter
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono text-lg"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">From</label>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">To</label>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none"
          >
             {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleUpdate}
        disabled={loading}
        className={`w-full py-4 rounded-lg font-bold text-white shadow-md transition-all flex justify-center items-center space-x-2 ${
          loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700 hover:shadow-lg active:transform active:scale-[0.99]'
        }`}
      >
        {loading ? (
           <>
             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
             <span>AI Updating with World Bank Data...</span>
           </>
        ) : (
           <>
             <span>Update Live Exchange Rate</span>
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
           </>
        )}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 animate-fade-in">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 p-6 bg-emerald-50 rounded-xl border border-emerald-100 animate-fade-in">
          {/* Main Calculation Display */}
          {result.rate > 0 && (
             <div className="mb-6 text-center">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Conversion Result</div>
                <div className="text-4xl md:text-5xl font-extrabold text-emerald-800 font-mono tracking-tight flex items-center justify-center flex-wrap gap-2">
                    <span>{(amount * result.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className="text-2xl md:text-3xl text-emerald-600">{to}</span>
                </div>
                <div className="text-slate-400 text-sm mt-2 font-medium">
                    1 {from} = {result.rate} {to}
                </div>
             </div>
          )}

          <div className="flex flex-col justify-between items-start pt-4 border-t border-emerald-200">
            <div>
              <p className="text-xs text-emerald-800 font-semibold uppercase tracking-wider mb-2">AI Market Context</p>
              <div className="prose prose-sm prose-emerald text-slate-700 max-w-none">
                 <p className="leading-relaxed">{result.details}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-emerald-200 flex justify-between items-center text-xs text-slate-500">
             <span className="truncate max-w-[200px]">Source: {result.source}</span>
             <span>Last Checked: {result.lastUpdated}</span>
          </div>
        </div>
      )}
      
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-400 italic">
          Powered by Gemini 2.5 Flash with Google Search Grounding for real-time accuracy.
        </p>
      </div>
    </div>
  );
};

export default CurrencyConverter;