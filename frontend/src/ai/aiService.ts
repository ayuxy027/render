import Groq from "groq-sdk";
import getAIPrompt, { KisanAIContext } from "./aiPrompt";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface StreamingResponse {
  text: string;
  done: boolean;
}

export const getAIResponse = async (
  userInput: string,
  context: Partial<KisanAIContext> = {},
  onStream?: (response: StreamingResponse) => void
): Promise<string> => {
  if (!import.meta.env.VITE_GROQ_API_KEY) {
    throw new Error("Missing required VITE_GROQ_API_KEY environment variable");
  }

  const fullContext: KisanAIContext = {
    userInput,
    userLanguage: context.userLanguage || "en",
    userLocation: context.userLocation,
    previousMessages: context.previousMessages || []
  };

  const fullPrompt = getAIPrompt(fullContext);
  const [systemPrompt, userMessage] = fullPrompt.split('USER QUERY:');
  
  const messages: GroqMessage[] = [
    {
      role: "system",
      content: systemPrompt.trim()
    },
    {
      role: "user",
      content: userMessage.trim()
    }
  ];

  try {
    if (onStream) {
      // Streaming mode with 50% slower speed
      const stream = await groq.chat.completions.create({
        messages,
        model: "llama3-70b-8192",
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.9,
        stream: true,
        stop: ["Human:", "Assistant:"]
      });

      let accumulatedResponse = "";
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        accumulatedResponse += content;
        onStream({ text: content, done: false });
        // Add delay to slow down streaming
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay between chunks
      }

      onStream({ text: "", done: true });
      return postProcessResponse(accumulatedResponse);
    } else {
      // Non-streaming mode with full speed
      const chatCompletion = await groq.chat.completions.create({
        messages,
        model: "llama3-70b-8192",
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.9,
        stream: false,
        stop: ["Human:", "Assistant:"]
      });

      if (!chatCompletion.choices[0]?.message?.content) {
        throw new Error("Empty response from Groq API");
      }

      return postProcessResponse(chatCompletion.choices[0].message.content);
    }
  } catch (error) {
    console.error("Groq API Error:", error);
    throw new Error(`Groq API Error: ${(error as Error).message}`);
  }
}

function postProcessResponse(response: string): string {
  return response
    .replace(/\$(\d+)/g, '₹$1') // Convert $ to ₹
    .replace(/\b(\d+)\s*(?:acres?|hectares?)\b/gi, (_match, num) => {
      const acres = parseFloat(num);
      const hectares = acres * 0.404686;
      return `${num} acres (${hectares.toFixed(2)} hectares)`;
    })
    .replace(/\b(\d+)\s*(?:kg|kilograms?)\b/gi, (_match, num) => {
      const kg = parseFloat(num);
      const quintals = kg / 100;
      return `${num} kg (${quintals.toFixed(2)} quintals)`;
    })
    .trim();
}

export default { getAIResponse };