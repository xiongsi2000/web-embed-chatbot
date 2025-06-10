import OpenAI from "openai";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerateContentRequest } from "@google/generative-ai";
import { companyInfo } from "../conpanyinfo";

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_AI_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!DEEPSEEK_API_KEY && !GEMINI_API_KEY) {
  console.error("API keys are missing. Please add them to your .env file.");
}

const deepseek = new OpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: DEEPSEEK_API_KEY,
  dangerouslyAllowBrowser: true,
});

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  hideInChat?: boolean;
}

export class Assistant {
  #client!: OpenAI | GoogleGenerativeAI;
  #model: string;
  #type: "deepseek" | "gemini";

  constructor(type: "deepseek" | "gemini" = "deepseek", model: string = "deepseek-chat") {
    this.#type = type;
    this.#model = model;
    
    if (type === "gemini") {
      if (!GEMINI_API_KEY) {
        console.error("Gemini API key is missing");
        return;
      }
      this.#client = new GoogleGenerativeAI(GEMINI_API_KEY);
    } else {
      this.#client = deepseek;
    }
  }

  async chat(content: string, history: ChatMessage[]) {
    try {
      if (this.#type === "gemini") {
        if (!this.#client) {
          throw new Error("Gemini client is not initialized. Check your API key.");
        }

        const systemPrompt = {
          role: "system",
          parts: [{ text: `You are a professional Chatbot website support. Keep responses brief and concise.

Company Information:
${companyInfo}

Guidelines:
1. Use simple, clear language
2. Format information in a structured way:
   • Use clear headings for main topics
   • Break down complex information into sections
   • Use bullet points (•) for lists
   • Use single line breaks between sections
3. Keep paragraphs short and well-spaced
4. Use emojis sparingly to make text more engaging
5. Focus on essential information only
6. Format text with proper spacing and indentation
7. Avoid excessive line breaks` }]
        };

        const filteredHistory = history
          .filter((msg: ChatMessage) => !msg.hideInChat)
          .map((msg: ChatMessage) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
          }));

        const model = (this.#client as GoogleGenerativeAI).getGenerativeModel({ model: "gemini-2.0-flash" });

        const request: GenerateContentRequest = {
          contents: [
            { role: "user", parts: [{ text: systemPrompt.parts[0].text }] },
            { role: "model", parts: [{ text: "I understand. I will keep responses brief and easy to read." }] },
            ...filteredHistory,
            { role: "user", parts: [{ text: content }] }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            }
          ]
        };

        const result = await model.generateContent(request);
        const response = await result.response;
        const text = response.text();
        
        return this.#cleanResponse(text);
      } else {
        if (!DEEPSEEK_API_KEY) {
          throw new Error("DeepSeek API key is missing. Please add it to the .env file.");
        }

        const systemMessage: OpenAI.Chat.ChatCompletionMessageParam = {
          role: "system",
          content: `You are a professional Chatbot website support. Keep responses brief and concise.

Company Information:
${companyInfo}

Guidelines:
1. Use simple, clear language
2. Format information in a structured way
3. Keep paragraphs short and well-spaced
4. Use emojis sparingly to make text more engaging
5. Focus on essential information only`
        };

        const result = await (this.#client as OpenAI).chat.completions.create({
          model: this.#model,
          messages: [systemMessage, ...history, { content, role: "user" }],
        });

        const responseContent = result.choices[0]?.message?.content;
        if (!responseContent) {
          throw new Error("No response content received from DeepSeek");
        }

        return this.#cleanResponse(responseContent);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw this.#parseError(error);
      }
      throw new Error("An unknown error occurred");
    }
  }

  async *chatStream(content: string, history: ChatMessage[]) {
    try {
      if (this.#type === "gemini") {
        if (!GEMINI_API_KEY) {
          throw new Error("Gemini API key is missing. Please add it to the .env file.");
        }

        const model = (this.#client as GoogleGenerativeAI).getGenerativeModel({ model: "gemini-2.0-flash" });
        const chat = model.startChat({
          history: history.map((msg: ChatMessage) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
          }))
        });

        const result = await chat.sendMessage(content);
        const response = await result.response;
        const text = response.text();
        
        // Split text into chunks for streaming
        const chunks = text.split(/(?<=[.!?])\s+/);
        for (const chunk of chunks) {
          yield this.#cleanResponse(chunk);
        }
      } else {
        if (!DEEPSEEK_API_KEY) {
          throw new Error("DeepSeek API key is missing. Please add it to the .env file.");
        }

        const result = await (this.#client as OpenAI).chat.completions.create({
          model: this.#model,
          messages: [...history, { content, role: "user" }],
          stream: true,
        });

        let buffer = "";
        for await (const chunk of result) {
          const content = chunk.choices[0]?.delta?.content || "";
          buffer += content;
    
          if (content.match(/[.!?]\s*$/) || content.includes("\n")) {
            yield this.#cleanResponse(buffer);
            buffer = "";
          }
        }
        
        if (buffer) {
          yield this.#cleanResponse(buffer);
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw this.#parseError(error);
      }
      throw new Error("An unknown error occurred");
    }
  }

  #cleanResponse(text: string): string {
    return text
      .replace(/^Response:\s*\n*/i, '')
      .replace(/\s*\[Note:.*?\]/g, '')
      .replace(/\n\s*—.*$/g, '')
      .replace(/\n\s*(Best regards|Regards|Sincerely|Cheers|Thanks|Thank you),.*$/g, '')
      .replace(/\n\s*The\s+[A-Za-z\s]+Team.*$/g, '')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  }

  #parseError(error: Error): Error {
    if (error.message.includes("API key is missing")) {
      return error;
    }
    
    if (error.message.includes("Headers")) {
      return new Error(`Invalid API key. Please check your ${this.#type === "gemini" ? "Gemini" : "DeepSeek"} API key in the .env file.`);
    }

    return new Error(`Failed to connect to ${this.#type === "gemini" ? "Gemini" : "DeepSeek"}. Please try again later.`);
  }
} 