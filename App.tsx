
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Wallet, RefreshCw, AlertCircle, Info, TrendingUp, DollarSign, ExternalLink, Globe } from 'lucide-react';
import { fetchCryptoPrices } from './services/cryptoService';
import { generateMarketInsight } from './services/geminiService';
import { MarketState, InsightData, CryptoData, Currency } from './types';
import { CryptoCard } from './components/CryptoCard';
import { MarketSummary } from './components/MarketSummary';

const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'brl', symbol: 'R$', locale: 'pt-BR' },
  { code: 'usd', symbol: '$', locale: 'en-US' },
  { code: 'eur', symbol: '€', locale: 'de-DE' }
];

const App: React.FC = () => {
  const [currency, setCurrency] = useState<Currency>(SUPPORTED_CURRENCIES[0]);
  const [inputValue, setInputValue] = useState<string>('1.000,00');
  const [market, setMarket] = useState<MarketState>({
    prices: {},
    loading: true,
    error: null,
    lastUpdated: null
  });
  const [insight, setInsight] = useState<InsightData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateData = useCallback(async (isInitial = false) => {
    setMarket(prev => ({ ...prev, loading: true, error: null }));
    try {
      const cryptoList = await fetchCryptoPrices(currency.code);
      const pricesMap = cryptoList.reduce((acc, curr) => {
        acc[curr.id] = curr;
        return acc;
      }, {} as Record<string, CryptoData>);
      
      setMarket({
        prices: pricesMap,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });

      const newInsight = await generateMarketInsight(cryptoList, currency);
      setInsight(newInsight);
    } catch (err: any) {
      setMarket(prev => ({
        ...prev,
        loading: false,
        error: 'Falha ao sincronizar dados. Tente novamente em alguns segundos.'
      }));
    }
  }, [currency]);

  useEffect(() => {
    updateData(true);
    const interval = setInterval(() => updateData(), 60000);
    return () => clearInterval(interval);
  }, [updateData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value === "") value = "0";
    
    const numericValue = parseInt(value, 10) / 100;
    const formatted = numericValue.toLocaleString(currency.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    setInputValue(formatted);
  };

  const getNumericAmount = () => {
    // Parse numeric value based on locale-aware string
    // This is a simple fallback since complex locale parsing is hard in JS
    // We strip non-numeric except the intended decimal separator
    const clean = inputValue.replace(/[^0-9]/g, '');
    return parseInt(clean, 10) / 100 || 0;
  };

  const amount = getNumericAmount();

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    // Reset input to current numeric value formatted for new locale
    const currentNumeric = amount;
    setInputValue(currentNumeric.toLocaleString(newCurrency.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }));
  };

  return (
    <div className="min-h-screen text-slate-200 pb-20 selection:bg-amber-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-amber-500/5 blur-[120px] rounded-full" />
      </div>

      <header className="max-w-7xl mx-auto px-6 pt-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-amber-600 to-yellow-400 rounded-2xl shadow-xl shadow-amber-900/20">
            <Wallet className="text-slate-900" size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-2">
              CryptoCalc<span className="text-amber-500">Pro</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 uppercase tracking-widest font-bold h-fit mt-1">v2.5</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium">Conversão multi-moeda de ativos digitais.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-slate-800/50 shadow-lg">
          <div className="px-4 py-1.5 border-r border-slate-800/50">
            <span className="text-[9px] uppercase tracking-widest text-slate-600 font-black block">Status da Rede</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${market.error ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
              <span className={`text-[11px] font-bold uppercase tracking-tight ${market.error ? 'text-rose-500' : 'text-emerald-500'}`}>
                {market.error ? 'Offline' : 'Live Syncing'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-slate-950/40 p-1 rounded-xl border border-slate-800/50">
            {SUPPORTED_CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => handleCurrencyChange(c)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${
                  currency.code === c.code 
                    ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {c.code}
              </button>
            ))}
          </div>
          <button 
            onClick={() => updateData()}
            disabled={market.loading}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 p-3 rounded-xl transition-all border border-slate-700 text-slate-300 hover:text-white group active:scale-95"
          >
            <RefreshCw size={18} className={market.loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-12">
        {market.error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} />
              <span className="text-sm font-semibold">{market.error}</span>
            </div>
            <button onClick={() => updateData()} className="text-xs font-bold underline uppercase tracking-widest hover:text-rose-300 transition-colors">Tentar novamente</button>
          </div>
        )}

        {/* Hero Input Section */}
        <div className="glass rounded-[2.5rem] p-10 mb-12 shadow-2xl relative overflow-hidden group border-white/5">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-amber-500/15 transition-all duration-700" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8">
              <label className="flex items-center gap-2 text-xs font-black text-amber-500 uppercase tracking-[0.2em] mb-4">
                <Globe size={14} />
                Aporte em {currency.code.toUpperCase()} ({currency.symbol})
              </label>
              <div className="relative group/input">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-5xl font-black text-slate-700 group-focus-within/input:text-amber-500 transition-colors duration-300">
                  {currency.symbol}
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-none outline-none text-6xl md:text-8xl font-black text-white py-4 pl-20 transition-all placeholder:text-slate-800 mono tracking-tighter"
                  autoFocus
                />
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-6 text-slate-500 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <Info size={14} className="text-slate-600" />
                  <span>Câmbio via CoinGecko ({currency.code.toUpperCase()})</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-emerald-500/50" />
                  <span>Precificação Global 24h</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="p-6 bg-slate-950/50 rounded-3xl border border-slate-800/50 backdrop-blur-sm">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">Simulação Base</span>
                <div className="text-3xl font-black text-white mono truncate">
                  {currency.symbol} {amount.toLocaleString(currency.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 p-4 bg-slate-900/30 rounded-2xl border border-slate-800/40">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1">Última Sync</span>
                  <div className="text-xs font-bold text-slate-400 mono">
                    {market.lastUpdated ? market.lastUpdated.toLocaleTimeString(currency.locale) : '--:--:--'}
                  </div>
                </div>
                <div className="p-4 bg-slate-900/30 rounded-2xl border border-slate-800/40 flex items-center justify-center">
                  <ExternalLink size={16} className="text-slate-700" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <MarketSummary insight={insight} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(Object.values(market.prices) as CryptoData[]).map((crypto) => (
            <CryptoCard key={crypto.id} crypto={crypto} amount={amount} currency={currency} />
          ))}
          
          {(market.loading && Object.keys(market.prices).length === 0) && (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass rounded-3xl p-8 h-72 animate-pulse flex flex-col gap-6">
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-slate-800/50 rounded-2xl" />
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-5 bg-slate-800/50 rounded-lg w-3/4" />
                    <div className="h-4 bg-slate-800/50 rounded-lg w-1/4" />
                  </div>
                </div>
                <div className="mt-auto space-y-6">
                  <div className="h-10 bg-slate-800/50 rounded-xl" />
                  <div className="h-20 bg-slate-800/50 rounded-2xl" />
                </div>
              </div>
            ))
          )}
        </div>

        <footer className="mt-24 border-t border-slate-800/50 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-5 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                  <Wallet size={16} className="text-slate-900" />
                </div>
                <h3 className="font-black text-white tracking-widest uppercase text-sm">CryptoCalc Pro Enterprise</h3>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Suporte nativo para BRL, USD e EUR. Conversões globais com precisão de 8 casas decimais para satoshis e unidades secundárias.
              </p>
            </div>
            
            <div className="md:col-span-3 space-y-6">
              <h5 className="font-black text-white uppercase text-[10px] tracking-[0.3em]">Protocolo de Dados</h5>
              <ul className="space-y-4">
                {['Global Currency Support', 'IEEE 754 Arithmetic', 'Gemini AI Analysis', 'Market Cap Order'].map(item => (
                  <li key={item} className="flex items-center gap-3 group cursor-default">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-amber-500 transition-colors" />
                    <span className="text-xs font-bold text-slate-500 group-hover:text-slate-300 transition-colors uppercase tracking-widest">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-4">
              <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <AlertCircle size={80} />
                </div>
                <h5 className="font-black text-white text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                  <AlertCircle size={14} className="text-amber-500" />
                  Aviso Legal
                </h5>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Os valores exibidos em {currency.code.toUpperCase()} dependem da latência das exchanges mundiais. Verifique sempre com sua corretora antes de realizar operações financeiras.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
              © 2024 DIGITAL ASSETS LTD. ALL RIGHTS RESERVED.
            </div>
            <div className="flex gap-8">
              {['BRL Sync', 'USD Spot', 'EUR Fix', 'API V3'].map(link => (
                <span key={link} className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">
                  {link}
                </span>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
