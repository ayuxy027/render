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

/**
 * Summarizes a document using Google Gemini API
 * @param file Document file to summarize
 * @param prompt Prompt template to use for summarization
 * @returns Summary text
 */
export const summarizeDocument = async (file: File, prompt: string): Promise<string> => {
  try {
    // First convert the file to base64 for sending to Gemini API
    const base64Data = await readFileAsBase64(file);
    const mimeType = file.type || 'application/octet-stream';
    
    // Get API key and URL from environment variables
    const apiKey = import.meta.env.VITE_API_KEY;
    const apiUrl = import.meta.env.VITE_API_URL;
    
    if (!apiKey) {
      throw new Error("Gemini API key is missing. Please check your environment variables.");
    }
    
    const requestUrl = `${apiUrl}?key=${apiKey}`;
    
    // Prepare the request body for Gemini API
    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType, data: base64Data } }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,       // Lower temperature for more precise, deterministic outputs
        topK: 32,               // Lower topK for more focused responses
        topP: 0.8,              // Lower topP for more predictable outputs
        maxOutputTokens: 8192,  // Keep high max tokens for comprehensive summaries
        stopSequences: [],      // No stop sequences needed
        responseMimeType: "text/plain", // Plain text response type for Markdown
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
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
    
    // Extract summary text from response
    const summaryText = data.candidates[0]?.content?.parts[0]?.text || '';
    return summaryText;
    
  } catch (error) {
    console.error('Error in Gemini summarization:', error);
    throw error;
  }
}; 