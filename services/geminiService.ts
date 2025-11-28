import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const askAI = async (query: string, context: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are 'DeshiSheba Bot', a knowledgeable local assistant for Bangladesh.
    
    YOUR KNOWLEDGE BASE:
    You have access to a list of local services provided in JSON format in the context below. 
    Always prioritize this provided context when answering questions about specific locations, phone numbers, or services.
    
    CONTEXT DATA:
    ${context}

    INSTRUCTIONS:
    1. If the user asks for a service (e.g., "Hospital in Mirpur"), look strictly at the CONTEXT DATA first.
    2. If you find matches, list them clearly with Name, Location, and Phone Number.
    3. If the user asks a general question about Bangladesh (e.g., "Emergency number for police"), provide general knowledge (999).
    4. Keep responses concise, friendly, and formatted for easy reading (use bullet points).
    5. If no data matches the query in the context, say: "I couldn't find that specific service in our database, but generally in Bangladesh..." and provide helpful advice.
    
    Tone: Professional, helpful, and community-focused.`;

    const response = await ai.models.generateContent({
      model,
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.5, // Lower temperature for more factual retrieval
      }
    });

    return response.text || "Sorry, I couldn't process that request right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the AI service right now. Please try searching manually.";
  }
};