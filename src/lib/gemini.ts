/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { Event } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function draftEventFromText(prompt: string): Promise<Partial<Event>> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Translate this event description into a structured event object: "${prompt}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          date: { type: Type.STRING, description: "ISO 8601 format" },
          location: { type: Type.STRING },
        },
        required: ["title", "description", "date", "location"],
      },
    },
  });

  try {
    const result = JSON.parse(response.text || '{}');
    return result;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return {};
  }
}

export async function generateEventCover(title: string, description: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `A high-quality, minimalist, cinematic event cover image for an event titled "${title}". Description: ${description}. Aesthetic: clean, premium, architectural.`,
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  return 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2670&auto=format&fit=crop'; // Fallback
}
