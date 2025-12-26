
import React, { useEffect, useState, useRef } from 'react';
import { CryptoData, Currency } from '../types';
import { ArrowUpRight, ArrowDownRight, Coins, Layers } from 'lucide-react';

interface CryptoCardProps {
  crypto: CryptoData;
  amount: number;
  currency: Currency;
}

export const CryptoCard: React.FC<CryptoCardProps> = ({ crypto, amount, currency }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const prevPriceRef = useRef(crypto.current_price);
  const prevAmountRef = useRef(amount);

  const cryptoAmount = amount / crypto.current_price;
  const minUnits = cryptoAmount * crypto.min_unit_factor;

  useEffect(() => {
    if (prevPriceRef.current !== crypto.current_price || prevAmountRef.current !== amount) {
      setIsUpdating(true);
      const timer = setTimeout(() => setIsUpdating(false), 1000);
      prevPriceRef.current = crypto.current_price;
      prevAmountRef.current = amount;
      return () => clearTimeout(timer);
    }
  }, [crypto.current_price, amount]);

  const formatCrypto = (val: number) => {
    if (val === 0) return "0,00";
    return val.toLocaleString(currency.locale, { maximumFractionDigits: 8 });
  };

  const formatMinUnits = (val: number) => {
    if (val < 1) return val.toFixed(10).replace(/\.?0+$/, "");
    return val.toLocaleString(currency.locale, { maximumFractionDigits: 0 });
  };

  const isPositive = crypto.price_change_percentage_24h >= 0;

  return (
    <div className="glass rounded-[2rem] p-8 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:shadow-amber-500/5 hover:-translate-y-2 border-white/5 group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-[3rem] pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-white/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-slate-800 p-3 rounded-2xl border border-slate-700 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-black/20">
              <img src={crypto.image} alt={crypto.name} className="w-10 h-10 object-contain" />
            </div>
          </div>
          <div>
            <h3 className="font-black text-white text-xl tracking-tight leading-none mb-1">{crypto.name}</h3>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">{crypto.symbol}</span>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl border ${isPositive ? 'text-emerald-400 bg-emerald-400/5 border-emerald-500/20' : 'text-rose-400 bg-rose-400/5 border-rose-500/20 shadow-rose-500/5 shadow-lg'}`}>
          {isPositive ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
          {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-black mb-2 block">Referência de Mercado</label>
          <div className={`text-2xl font-black transition-all duration-700 mono tracking-tighter ${isUpdating ? 'text-amber-400 scale-[1.02]' : 'text-white'}`}>
            {currency.symbol} {crypto.current_price.toLocaleString(currency.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80">
          <div className="flex justify-between items-start mb-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-amber-500 font-black mb-2 block">Simulação de Conversão</label>
              <div className={`text-3xl font-black transition-all duration-700 mono break-all tracking-tighter ${isUpdating ? 'text-amber-400 scale-[1.02]' : 'text-white'}`}>
                {formatCrypto(cryptoAmount)} <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{crypto.symbol}</span>
              </div>
            </div>
          </div>

          <div className={`bg-slate-900/40 rounded-2xl p-4 border transition-all duration-700 group-hover:bg-slate-900/60 ${isUpdating ? 'border-amber-500/40 bg-amber-500/5' : 'border-slate-800/50'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Layers size={12} className={`transition-colors duration-700 ${isUpdating ? 'text-amber-400' : 'text-amber-500/50'}`} />
                <label className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-black">Escala Mínima Estimada</label>
              </div>
              <Coins size={12} className="text-slate-700" />
            </div>
            <div className={`text-sm font-bold transition-colors duration-700 mono truncate ${isUpdating ? 'text-amber-200' : 'text-slate-300'}`}>
              {formatMinUnits(minUnits)} <span className="text-[10px] opacity-50">{crypto.min_unit_name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
