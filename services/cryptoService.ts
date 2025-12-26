
import { CryptoData } from '../types';

const COINGECKO_IDS = 'bitcoin,ethereum,binancecoin,tether';

export const fetchCryptoPrices = async (vsCurrency: string = 'brl'): Promise<CryptoData[]> => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vsCurrency}&ids=${COINGECKO_IDS}&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`
    );
    
    if (!response.ok) {
      throw new Error('Falha ao obter dados da CoinGecko');
    }

    const data = await response.json();

    const unitMap: Record<string, { unit: string; factor: number }> = {
      bitcoin: { unit: 'Satoshi', factor: 100_000_000 },
      ethereum: { unit: 'Wei', factor: 1_000_000_000_000_000_000 },
      binancecoin: { unit: 'Jager', factor: 100_000_000 },
      tether: { unit: 'Cent', factor: 100 },
    };

    return data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      image: coin.image,
      min_unit_name: unitMap[coin.id]?.unit || 'Units',
      min_unit_factor: unitMap[coin.id]?.factor || 1,
    }));
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    throw error;
  }
};
