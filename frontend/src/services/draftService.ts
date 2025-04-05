import Groq from "groq-sdk";
import { FormInputs } from '../types/draft';
import { SYSTEM_PROMPT, getContextualPrompt, validateDocumentType, GENERATION_CONFIG, GROQ_MODELS } from '../ai/draftPrompt';

// Maximum number of retries for API calls
const MAX_RETRIES = 3;

// Retry delay in milliseconds (with exponential backoff)
const RETRY_DELAY_MS = 1000;

// Timeout for API calls in milliseconds (60 seconds)
const API_TIMEOUT_MS = 60000;

/**
 * Enhanced error types for better error handling
 */
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  API_ERROR = 'API_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  MODEL_ERROR = 'MODEL_ERROR',
  CONTENT_FILTER_ERROR = 'CONTENT_FILTER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Custom error class for better error handling and reporting
 */
export class DraftServiceError extends Error {
  type: ErrorType;
  statusCode?: number;
  retryable: boolean;

  constructor(message: string, type: ErrorType, statusCode?: number, retryable = false) {
    super(message);
    this.name = 'DraftServiceError';
    this.type = type;
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}

// Initialize GROQ client with configured timeout
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  dangerouslyAllowBrowser: true, // Enable in browser usage
  timeout: API_TIMEOUT_MS
});

// Message type for GROQ API
interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Service class for legal document generation using GROQ API
 */
export class DraftService {
  /**
   * Validates form inputs to ensure they meet requirements
   * @param params Form inputs to validate
   * @throws DraftServiceError if validation fails
   */
  private static validateInputs(params: FormInputs): void {
    // Check if document type is valid
    if (!validateDocumentType(params.documentType)) {
      throw new DraftServiceError(
        'Invalid document type. Please select a valid document type.',
        ErrorType.VALIDATION_ERROR
      );
    }

    // Check if required fields are present
    if (!params.partyA || params.partyA.trim() === '') {
      throw new DraftServiceError(
        'Party A information is required.',
        ErrorType.VALIDATION_ERROR
      );
    }

    if (!params.partyB || params.partyB.trim() === '') {
      throw new DraftServiceError(
        'Party B information is required.',
        ErrorType.VALIDATION_ERROR
      );
    }

    // Check for minimum content length in details
    if (!params.additionalDetails || params.additionalDetails.length < 10) {
      throw new DraftServiceError(
        'Additional details must be more descriptive (at least 10 characters).',
        ErrorType.VALIDATION_ERROR
      );
    }

    if (!params.specificDetails || params.specificDetails.length < 10) {
      throw new DraftServiceError(
        'Specific details must be more descriptive (at least 10 characters).',
        ErrorType.VALIDATION_ERROR
      );
    }
  }

  /**
   * Prepare messages for GROQ API
   * @param params Form inputs
   * @returns Array of messages for GROQ API
   */
  private static prepareMessages(params: FormInputs): GroqMessage[] {
    return [
      { 
        role: "system", 
        content: SYSTEM_PROMPT
      },
      { 
        role: "user", 
        content: getContextualPrompt(
          params.documentType,
          params.partyA,
          params.partyB,
          `${params.additionalDetails}${params.state ? `\nState: ${params.state}` : ''}`,
          params.specificDetails
        )
      }
    ];
  }

  /**
   * Process error from GROQ API and convert to a standardized error object
   * @param error Error from GROQ API
   * @returns Standardized error object
   */
  private static processError(error: any): DraftServiceError {
    console.error('GROQ API error details:', error);
    
    // Default error
    let errorType = ErrorType.UNKNOWN_ERROR;
    let message = 'An unknown error occurred while generating the document.';
    let statusCode: number | undefined = undefined;
    let retryable = false;
    
    if (error instanceof Error) {
      message = error.message;
      
      // Extract error details from error message
      if (message.includes('authorization') || message.includes('Invalid API key')) {
        errorType = ErrorType.AUTH_ERROR;
        message = 'Authentication failed. Please check your API key.';
      } else if (message.includes('model') || message.includes('not found') || message.includes('decommissioned')) {
        errorType = ErrorType.MODEL_ERROR;
        message = 'The selected AI model is unavailable. Will try an alternative model.';
        retryable = true;
      } else if (message.includes('rate limit') || message.includes('429')) {
        errorType = ErrorType.RATE_LIMIT_ERROR;
        message = 'Rate limit exceeded. Please try again in a moment.';
        retryable = true;
      } else if (message.includes('timeout') || message.includes('timed out')) {
        errorType = ErrorType.TIMEOUT_ERROR;
        message = 'The request timed out. Please try again.';
        retryable = true;
      } else if (message.includes('content filter') || message.includes('flagged') || message.includes('moderation')) {
        errorType = ErrorType.CONTENT_FILTER_ERROR;
        message = 'Your request was flagged by content filters. Please modify your inputs and try again.';
      }
      
      // Extract status code if available
      const statusMatch = message.match(/(\d{3})/);
      if (statusMatch) {
        statusCode = parseInt(statusMatch[1], 10);
        
        // Set error type based on status code
        if (statusCode === 401 || statusCode === 403) {
          errorType = ErrorType.AUTH_ERROR;
          message = 'Authentication failed. Please check your API key.';
        } else if (statusCode === 429) {
          errorType = ErrorType.RATE_LIMIT_ERROR;
          message = 'Rate limit exceeded. Please try again in a moment.';
          retryable = true;
        } else if (statusCode >= 500) {
          errorType = ErrorType.API_ERROR;
          message = 'The AI service is experiencing issues. Please try again later.';
          retryable = true;
        }
      }
    }
    
    return new DraftServiceError(message, errorType, statusCode, retryable);
  }

  /**
   * Implements exponential backoff retry strategy
   * @param fn Function to retry
   * @param retries Number of retries remaining
   * @param delay Delay between retries in milliseconds
   * @returns Result of function
   * @throws Last error encountered
   */
  private static async withRetry<T>(
    fn: () => Promise<T>,
    retries = MAX_RETRIES,
    delay = RETRY_DELAY_MS
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      // Process error to determine if it's retryable
      const processedError = this.processError(error);
      
      // If no retries left or error is not retryable, throw
      if (retries <= 0 || !processedError.retryable) {
        throw processedError;
      }
      
      // Log retry attempt
      console.warn(`Retrying operation due to error: ${processedError.message}. Retries left: ${retries}`);
      
      // Wait with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry with exponential backoff
      return this.withRetry(fn, retries - 1, delay * 2);
    }
  }

  /**
   * Generate a legal document using GROQ API with robust error handling and retries
   * @param params Form inputs containing document details
   * @returns Generated document content
   * @throws DraftServiceError if generation fails
   */
  static async generateDocument(params: FormInputs): Promise<string> {
    try {
      // Validate inputs
      this.validateInputs(params);
      
      // Check for API key
      if (!import.meta.env.VITE_GROQ_API_KEY) {
        throw new DraftServiceError(
          "Missing required GROQ API key. Please check your environment variables.",
          ErrorType.AUTH_ERROR
        );
      }

      // Prepare messages
      const messages = this.prepareMessages(params);
      
      // Log generation start
      console.log('Starting document generation with GROQ using model:', GROQ_MODELS.PRIMARY);
      
      // Generate document with primary model with retries
      try {
        const result = await this.withRetry(async () => {
          const startTime = Date.now();
          
          const completion = await groq.chat.completions.create({
            messages,
            model: GROQ_MODELS.PRIMARY,
            temperature: GENERATION_CONFIG.temperature,
            max_tokens: GENERATION_CONFIG.max_tokens,
            top_p: GENERATION_CONFIG.top_p,
            stream: false
          });
          
          const endTime = Date.now();
          console.log(`Document generated in ${endTime - startTime}ms`);
          
          if (!completion.choices?.[0]?.message?.content) {
            throw new DraftServiceError(
              'No valid content received from GROQ API',
              ErrorType.API_ERROR,
              undefined,
              true
            );
          }
          
          return completion.choices[0].message.content;
        });
        
        return result;
      } catch (error) {
        // If error is related to model, try fallback model
        const processedError = this.processError(error);
        
        if (processedError.type === ErrorType.MODEL_ERROR || 
            (processedError.type === ErrorType.API_ERROR && processedError.retryable)) {
          console.log('Primary model failed, attempting with fallback model:', GROQ_MODELS.FALLBACK);
          
          // Try with fallback model
          return await this.withRetry(async () => {
            const startTime = Date.now();
            
            const completion = await groq.chat.completions.create({
              messages,
              model: GROQ_MODELS.FALLBACK,
              temperature: GENERATION_CONFIG.temperature,
              max_tokens: GENERATION_CONFIG.max_tokens,
              top_p: GENERATION_CONFIG.top_p,
              stream: false
            });
            
            const endTime = Date.now();
            console.log(`Document generated with fallback model in ${endTime - startTime}ms`);
            
            if (!completion.choices?.[0]?.message?.content) {
              throw new DraftServiceError(
                'No valid content received from fallback model',
                ErrorType.API_ERROR
              );
            }
            
            return completion.choices[0].message.content;
          });
        }
        
        // Rethrow error if not related to model
        throw processedError;
      }
    } catch (error) {
      // Process and throw standardized error
      throw this.processError(error);
    }
  }
  
  /**
   * Stream document generation with realtime updates and robust error handling
   * @param params Form inputs
   * @param onChunk Callback for each chunk of generated text
   * @returns Complete document text
   * @throws DraftServiceError if streaming fails
   */
  static async streamDocument(
    params: FormInputs, 
    onChunk: (chunk: string, done: boolean) => void
  ): Promise<string> {
    try {
      // Validate inputs
      this.validateInputs(params);
      
      // Check for API key
      if (!import.meta.env.VITE_GROQ_API_KEY) {
        throw new DraftServiceError(
          "Missing required GROQ API key",
          ErrorType.AUTH_ERROR
        );
      }

      // Prepare messages
      const messages = this.prepareMessages(params);
      
      // Try streaming with primary model
      try {
        console.log('Streaming document with GROQ using model:', GROQ_MODELS.PRIMARY);
        let accumulatedResponse = "";
        let startTime = Date.now();
        
        const stream = await groq.chat.completions.create({
          messages,
          model: GROQ_MODELS.PRIMARY,
          temperature: GENERATION_CONFIG.temperature,
          max_tokens: GENERATION_CONFIG.max_tokens,
          top_p: GENERATION_CONFIG.top_p,
          stream: true
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          accumulatedResponse += content;
          
          // Call the chunk handler
          onChunk(content, false);
          
          // Add artificial delay to avoid overwhelming the UI
          // Comment this out in production if not needed
          // await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        let endTime = Date.now();
        console.log(`Document streamed in ${endTime - startTime}ms`);
        
        // Signal completion
        onChunk("", true);
        return accumulatedResponse;
      } catch (error) {
        // Process error to check if it's model-related
        const processedError = this.processError(error);
        
        // If model-related error, try fallback model
        if (processedError.type === ErrorType.MODEL_ERROR || 
            (processedError.type === ErrorType.API_ERROR && processedError.retryable)) {
          console.log('Streaming with fallback model:', GROQ_MODELS.FALLBACK);
          
          try {
            let accumulatedResponse = "";
            let startTime = Date.now();
            
            const fallbackStream = await groq.chat.completions.create({
              messages,
              model: GROQ_MODELS.FALLBACK,
              temperature: GENERATION_CONFIG.temperature,
              max_tokens: GENERATION_CONFIG.max_tokens,
              top_p: GENERATION_CONFIG.top_p,
              stream: true
            });
    
            for await (const chunk of fallbackStream) {
              const content = chunk.choices[0]?.delta?.content || "";
              accumulatedResponse += content;
              onChunk(content, false);
              
              // Add artificial delay to avoid overwhelming the UI
              // Comment this out in production if not needed
              // await new Promise(resolve => setTimeout(resolve, 10));
            }
            
            let endTime = Date.now();
            console.log(`Document streamed with fallback model in ${endTime - startTime}ms`);
            
            onChunk("", true);
            return accumulatedResponse;
          } catch (fallbackError) {
            // Process and throw error from fallback model
            const fallbackProcessedError = this.processError(fallbackError);
            console.error('Fallback streaming error:', fallbackProcessedError);
            throw new DraftServiceError(
              `Failed with fallback model: ${fallbackProcessedError.message}`,
              fallbackProcessedError.type
            );
          }
        }
        
        // If not model-related, rethrow
        throw processedError;
      }
    } catch (error) {
      // Process and throw standardized error
      const processedError = this.processError(error);
      console.error('Streaming error:', processedError);
      throw processedError;
    }
  }
  
  /**
   * Provides a simplified document generation that handles all errors internally
   * and never throws. Useful for situations where you need guaranteed response.
   * 
   * @param params Form inputs
   * @returns Generated document or fallback message
   */
  static async generateDocumentSafe(params: FormInputs): Promise<string> {
    try {
      return await this.generateDocument(params);
    } catch (error) {
      console.error("Safe generation encountered error:", error);
      
      // Generate a basic document as fallback
      const fallbackDocument = `# ${params.documentType || 'Legal Agreement'}

## Between Parties
- **Party A**: ${params.partyA || 'First Party'}
- **Party B**: ${params.partyB || 'Second Party'}

## Terms and Conditions
The following document could not be fully generated due to technical issues. Please try again later or contact support.

### Basic Terms
1. This agreement is made between the parties mentioned above.
2. Both parties agree to fulfill their obligations in good faith.
3. Any disputes shall be resolved through mutual discussion and, if necessary, arbitration.

*Note: This is a basic fallback document created when the AI generation service encountered an error. Please regenerate for a complete legal document.*`;

      return fallbackDocument;
    }
  }
} 