
import { GoogleGenAI } from "@google/genai";

export const generateMarketingContent = async (prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key is missing. Please click the Key icon in the top navigation bar to select your Google Cloud project API key.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are MarketMind AI, a world-class digital marketing strategist and copywriter. Your goal is to provide high-quality, professional, and creative marketing output. Keep responses clean, well-formatted, and actionable.",
        temperature: 0.7,
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error communicating with AI. Please try again later.";
  }
};

export interface MarketResearchResult {
  text: string;
  sources: { title: string; uri: string }[];
}

export const researchMarketTrends = async (query: string): Promise<MarketResearchResult | null> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please select your API key using the Key icon in the navigation bar.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform a deep market research and trend analysis for: ${query}. Focus on current marketing strategies, audience sentiment, and competitive landscape.`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a senior market research analyst. Provide a structured, data-driven report based on current search results. Be concise and professional."
      },
    });

    const text = response.text || "";
    // Extract grounding chunks/sources
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title || "Source",
        uri: chunk.web.uri
      }));

    return { text, sources };
  } catch (error) {
    console.error("Research Error:", error);
    return null;
  }
};

export interface ImageGenerationOptions {
  prompt: string;
  aspectRatio: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
}

export const generateAdImage = async (options: ImageGenerationOptions): Promise<string | null> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please select your API key using the Key icon in the navigation bar.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `High-quality professional advertising photography for: ${options.prompt}. Commercial style, aesthetic lighting, high resolution, marketing quality.` }],
      },
      config: { imageConfig: { aspectRatio: options.aspectRatio } },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Error:", error);
    return null;
  }
};

export interface VideoGenerationOptions {
  prompt: string;
  aspectRatio: "16:9" | "9:16";
}

export const generateAdVideo = async (options: VideoGenerationOptions, onProgress?: (status: string) => void): Promise<string | null> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please select your API key using the Key icon in the navigation bar.");
  }

  try {
    // Guidelines: Create a new GoogleGenAI instance right before making an API call 
    // to ensure it always uses the most up-to-date API key from the dialog.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    onProgress?.("Initiating Veo Engine...");
    
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `A high-end, professional marketing video for: ${options.prompt}. Cinematic lighting, 4k resolution, advertising quality, aesthetic and modern.`,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: options.aspectRatio
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      onProgress?.("Rendering Scenes...");
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) return null;

    const response = await window.fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error: any) {
    console.error("Gemini Video Error:", error);
    // Rethrow to allow component to handle specific key-related errors
    throw error;
  }
};
