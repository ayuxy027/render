import { readFileAsBase64 } from '../utils/fileUtils';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

/**
 * Initializes a chat with a document using Google Gemini
 * @param file Document file to analyze
 * @param systemPrompt Initial system prompt for document analysis
 * @returns Initial context string from the document
 */
export const initializeDocumentChat = async (file: File, systemPrompt: string): Promise<string> => {
  try {
    // Convert file to base64 for sending to Gemini API
    const base64Data = await readFileAsBase64(file);
    const mimeType = file.type || 'application/octet-stream';
    
    // Get API key and URL from environment variables
    const apiKey = import.meta.env.VITE_API_KEY;
    const apiUrl = import.meta.env.VITE_API_URL;
    
    if (!apiKey) {
      throw new Error("Gemini API key is missing. Please check your environment variables.");
    }
    
    // Initial prompt to extract document context
    const initialPrompt = `${systemPrompt}\n\nPlease analyze this document and provide a concise initial understanding that I can refer to in our conversation. Focus on extracting key information that will be useful for answering potential questions.`;
    
    const requestUrl = `${apiUrl}?key=${apiKey}`;
    
    // Prepare the request body for Gemini API
    const requestBody = {
      contents: [
        {
          parts: [
            { text: initialPrompt },
            { inline_data: { mime_type: mimeType, data: base64Data } }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 4096,
      }
    };
    
    // Make the API request
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json() as GeminiResponse;
    
    // Extract context from response
    const initialContext = data.candidates[0]?.content?.parts[0]?.text || '';
    return initialContext;
    
  } catch (error) {
    console.error('Error initializing document chat:', error);
    throw error;
  }
};

/**
 * Sends a chat message to Google Gemini with document context
 * @param message User's message
 * @param chatHistory Previous chat messages
 * @param documentContext Context extracted from the document
 * @returns Response from the model
 */
export const sendChatMessage = async (
  message: string, 
  chatHistory: ChatMessage[],
  documentContext: string
): Promise<string> => {
  try {
    // Get API key and URL from environment variables
    const apiKey = import.meta.env.VITE_API_KEY;
    const apiUrl = import.meta.env.VITE_API_URL;
    
    if (!apiKey) {
      throw new Error("Gemini API key is missing. Please check your environment variables.");
    }
    
    const requestUrl = `${apiUrl}?key=${apiKey}`;
    
    // Prepare the parts array with chat history
    const parts = [
      // First add the system context combining document context and instructions
      {
        text: `You are an AI assistant helping with document analysis. You have access to the following document context:\n\n${documentContext}\n\nWhen answering questions, refer to this context. If the answer cannot be found in the document context, say so clearly. Always be helpful, concise, and accurate.`
      }
    ];
    
    // Add the chat history
    chatHistory.forEach(msg => {
      parts.push({
        text: `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      });
    });
    
    // Add the current message
    parts.push({ text: `User: ${message}` });
    parts.push({ text: "Assistant: " });
    
    // Prepare the request body
    const requestBody = {
      contents: [
        {
          parts: parts
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 4096,
      }
    };
    
    // Make the API request
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json() as GeminiResponse;
    
    // Extract response text
    const responseText = data.candidates[0]?.content?.parts[0]?.text || '';
    return responseText;
    
  } catch (error) {
    console.error('Error in chat with document:', error);
    throw error;
  }
}; 