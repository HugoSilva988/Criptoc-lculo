
import React from 'react';
import { InsightData } from '../types';
import { Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MarketSummaryProps {
  insight: InsightData | null;
}

export const MarketSummary: React.FC<MarketSummaryProps> = ({ insight }) => {
  if (!insight) return null;

  const sentimentIcon = () => {
    switch (insight.sentiment) {
      case 'bullish': return <TrendingUp className="text-emerald-400" size={20} />;
      case 'bearish': return <TrendingDown className="text-rose-400" size={20} />;
      default: return <Minus className="text-slate-400" size={20} />;
    }
  };

  const sentimentColor = () => {
    switch (insight.sentiment) {
      case 'bullish': return 'border-emerald-500/30 bg-emerald-500/5';
      case 'bearish': return 'border-rose-500/30 bg-rose-500/5';
      default: return 'border-slate-500/30 bg-slate-500/5';
    }
  };

  return (
    <div className={`glass border-l-4 ${sentimentColor()} rounded-xl p-5 mb-8 flex items-start gap-4 transition-all duration-500`}>
      <div className="bg-slate-800 p-2 rounded-lg mt-1">
        <Sparkles size={18} className="text-amber-400" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-bold text-white uppercase tracking-tighter">Market Insight (Gemini AI)</h4>
          <span className="text-slate-500">•</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/80 text-[10px] font-bold uppercase tracking-wider text-slate-300">
            {sentimentIcon()}
            {insight.sentiment}
          </div>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed italic">
          "{insight.summary}"
        </p>
      </div>
    </div>
  );
};
