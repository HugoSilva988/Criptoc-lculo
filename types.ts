
export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
  min_unit_name: string;
  min_unit_factor: number;
}

export interface Currency {
  code: string;
  symbol: string;
  locale: string;
}

export interface MarketState {
  prices: Record<string, CryptoData>;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface InsightData {
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
}
