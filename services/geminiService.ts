
import { GoogleGenAI, Type } from "@google/genai";
import { CryptoData, InsightData, Currency } from "../types";

export const generateMarketInsight = async (cryptoList: CryptoData[], currency: Currency): Promise<InsightData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const marketSummary = cryptoList.map(c => 
    `${c.name}: ${currency.symbol} ${c.current_price.toLocaleString(currency.locale)} (${c.price_change_percentage_24h.toFixed(2)}% em 24h)`
  ).join(', ');

  const prompt = `Analise os seguintes dados de mercado de criptomoedas (em ${currency.code}) e forneça um breve resumo (máximo 3 frases) e o sentimento geral (bullish, bearish ou neutral). Dados: ${marketSummary}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "Resumo do mercado em português brasileiro.",
            },
            sentiment: {
              type: Type.STRING,
              description: "Sentimento: bullish, bearish ou neutral.",
            },
          },
          required: ["summary", "sentiment"],
        },
      },
    });

    const text = response.text || '{}';
    const result = JSON.parse(text);
    
    return {
      summary: result.summary || "Mercado instável com variações leves.",
      sentiment: (result.sentiment?.toLowerCase() as InsightData['sentiment']) || "neutral"
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      summary: "O mercado de criptomoedas demonstra volatilidade típica. Recomenda-se cautela nas conversões de alto volume.",
      sentiment: "neutral"
    };
  }
};
