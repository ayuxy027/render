import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { aiPrompt, GROQ_CONFIG, SUPPORTED_LANGUAGES } from '../ai/aiPrompt';
import axios from 'axios';
import ISO6391 from 'iso-639-1';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Explicitly import the Groq SDK
import Groq from 'groq-sdk';

// Declare ImportMeta environment variables
declare global {
  interface ImportMeta {
    env: {
      VITE_SUPABASE_URL: string;
      VITE_SUPABASE_ANON_KEY: string;
      VITE_GROQ_API_KEY?: string;
      VITE_API_KEY?: string;
      VITE_API_URL?: string;
    };
  }
}

// Check which API is available and set up configuration
const USE_GROQ = import.meta.env.VITE_GROQ_API_KEY ? true : false;
const USE_ORIGINAL_API = import.meta.env.VITE_API_KEY && import.meta.env.VITE_API_URL ? true : false;

// Initialize GROQ client
let groqClient: any = null;
if (USE_GROQ) {
  try {
    groqClient = new Groq({
      apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
      dangerouslyAllowBrowser: true,
      timeout: GROQ_CONFIG.TIMEOUT_MS
    });
    console.log("GROQ client initialized successfully");
  } catch (error) {
    console.error("Error initializing GROQ client:", error);
  }
}

// Message types for GROQ API
type GroqRole = "system" | "user" | "assistant";

interface GroqMessage {
  role: GroqRole;
  content: string;
}

// Groq API parameters
const GROQ_MODEL = GROQ_CONFIG.DEFAULT_MODEL; // Default model
const GROQ_FALLBACK_MODEL = GROQ_CONFIG.FALLBACK_MODEL; // Fallback model

// Language selector component
const LanguageSelector: React.FC<{
  selectedLanguage: string;
  onSelectLanguage: (language: string) => void;
}> = ({ selectedLanguage, onSelectLanguage }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-2 py-1 space-x-1 text-xs text-white rounded-full sm:text-sm bg-white/20 hover:bg-white/30"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>{SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage)?.nativeName || "English"}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="overflow-y-auto absolute right-0 z-50 py-1 mt-1 w-48 max-h-60 bg-white rounded-lg shadow-lg"
          >
            {SUPPORTED_LANGUAGES.map((language) => (
              <motion.button
                key={language.code}
                onClick={() => {
                  onSelectLanguage(language.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-primary/10 transition-colors ${selectedLanguage === language.code ? 'bg-primary/20 font-medium' : ''
                  }`}
                whileHover={{ x: 5 }}
              >
                <span className="block text-gray-800">{language.nativeName}</span>
                <span className="block text-xs text-gray-500">{language.name}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Markdown renderer component
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className="max-w-none prose prose-sm prose-headings:text-primary prose-a:text-primary hover:prose-a:text-primary-dark"
      components={{
        // Customize list items to match the bullet points style
        li: ({ ...props }) => <li className="list-item marker:text-primary" {...props} />,
        // Ensure links open in new tab
        a: ({ ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />,
        // Style code blocks
        code: ({ className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          return !match ? (
            <code className="px-1 py-0.5 bg-gray-100 rounded text-sm font-mono" {...props}>{children}</code>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

// Ambient particle effect component
const AmbientParticles: React.FC = () => (
  <div className="overflow-hidden absolute inset-0 pointer-events-none">
    <div className="absolute inset-0 bg-repeat opacity-20 bg-ambient-pattern"></div>
    {Array.from({ length: 20 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-primary"
        initial={{
          x: Math.random() * 100 + "%",
          y: Math.random() * 100 + "%",
          opacity: Math.random() * 0.5 + 0.2,
          scale: Math.random() * 0.5 + 0.5,
        }}
        animate={{
          x: [
            Math.random() * 100 + "%",
            Math.random() * 100 + "%",
            Math.random() * 100 + "%",
          ],
          y: [
            Math.random() * 100 + "%",
            Math.random() * 100 + "%",
            Math.random() * 100 + "%",
          ],
          opacity: [
            Math.random() * 0.5 + 0.2,
            Math.random() * 0.5 + 0.5,
            Math.random() * 0.5 + 0.2,
          ],
        }}
        transition={{
          duration: Math.random() * 20 + 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    ))}
  </div>
);

// Text generating animation
const TypingAnimation: React.FC = () => (
  <motion.div
    className="inline-flex items-center space-x-1 h-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    {[0, 1, 2].map((dot) => (
      <motion.div
        key={dot}
        className="w-1 h-1 rounded-full bg-primary"
        animate={{ y: ["0%", "-60%", "0%"] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: dot * 0.1,
          ease: "easeInOut",
        }}
      />
    ))}
  </motion.div>
);

// Enhanced thinking indicator with pulse effect
const ThinkingIndicator: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.5 }}
    className="flex justify-start"
  >
    <div className="relative p-3 sm:p-4 rounded-2xl max-w-[70%] bg-secondary overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-primary/20"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
      />
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        className="flex relative z-10 items-center text-sm font-medium text-white sm:text-base"
      >
        <motion.svg
          className="mr-2 -ml-1 w-4 h-4 text-white sm:w-5 sm:h-5 sm:mr-3"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </motion.svg>
        Thinking
        <motion.span
          className="ml-1"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >...</motion.span>
      </motion.div>
    </div>
  </motion.div>
);

// Improved type definitions
type ButtonVariant = 'default' | 'ghost';
type ButtonSize = 'default' | 'sm' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button: React.FC<ButtonProps> = ({
  className = '',
  variant = 'default',
  size = 'default',
  children,
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center text-sm font-medium transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none rounded-full";
  const variants: Record<ButtonVariant, string> = {
    default: "bg-primary text-white hover:bg-primary-dark",
    ghost: "text-primary hover:bg-secondary",
  };
  const sizes: Record<ButtonSize, string> = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 py-1 text-xs",
    lg: "h-12 px-6 py-3",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => {
  return (
    <input
      className={`flex px-3 py-2 w-full h-10 text-sm bg-white rounded-full border sm:h-12 border-primary sm:px-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${className}`}
      {...props}
    />
  );
};

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

const LegaleChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [apiReady, setApiReady] = useState<boolean>(false);
  const [activeAPI, setActiveAPI] = useState<string>('none');
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [showParticles, setShowParticles] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if any API is available
  useEffect(() => {
    if (USE_GROQ && groqClient) {
      setApiReady(true);
      setActiveAPI('groq');
      console.log("Using GROQ API for chat");
    } else if (USE_ORIGINAL_API) {
      setApiReady(true);
      setActiveAPI('original');
      console.log("Using original API for chat");
    } else {
      console.warn("No API configuration found. Chat will not function properly.");
    }
  }, []);

  // Detect browser language on initial load
  useEffect(() => {
    const detectLanguage = () => {
      const browserLang = navigator.language.split('-')[0].toLowerCase();
      // Check if browser language is supported
      const isSupported = SUPPORTED_LANGUAGES.some(lang => lang.code === browserLang);
      if (isSupported) {
        setSelectedLanguage(browserLang);
      }
    };
    detectLanguage();
  }, []);

  // Toggle particles when streaming
  useEffect(() => {
    if (isStreaming) {
      setShowParticles(true);
    } else {
      const timer = setTimeout(() => setShowParticles(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isStreaming]);

  const predefinedQuestions: string[] = [
    "Legal rights",
    "Court procedures",
    "Legal documents",
    "Criminal law",
    "Civil law",
    "Constitutional law",
  ];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom, streamingContent]);

  // Add language instruction to the system prompt
  const generateGroqMessages = (userInput: string): GroqMessage[] => {
    // Get language name for the prompt
    const langName = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name || "English";

    const languageInstruction = selectedLanguage !== 'en'
      ? `\n\nIMPORTANT: The user's language is ${langName}. Please respond in ${langName}.`
      : '';

    return [
      {
        role: "system",
        content: aiPrompt + languageInstruction
      },
      {
        role: "user",
        content: userInput
      }
    ];
  };

  // Enhanced text formatting - now preserves markdown
  const formatResponse = (content: string): string => {
    if (!content) return "I apologize, but I couldn't generate a response. Please try again.";

    // Clean up the response but preserve markdown
    let cleanedContent = content.trim();

    // Remove triple backtick blocks that don't have a language specified
    cleanedContent = cleanedContent.replace(/```\s*\n([\s\S]*?)\n```/g, (match, codeContent) => {
      return '```text\n' + codeContent + '\n```';
    });

    return cleanedContent;
  };

  // Render streaming text with typewriter effect and markdown
  const renderStreamingText = (text: string) => {
    if (!text) return <TypingAnimation />;

    return (
      <>
        <MarkdownRenderer content={text} />
        <TypingAnimation />
      </>
    );
  };

  // Main handler for sending messages
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!input.trim() || isLoading || !apiReady) return;

    const userMessage: Message = {
      text: input.trim(),
      sender: 'user',
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let response: string;

      // Decide which API to use
      if (activeAPI === 'groq') {
        // Add empty AI message immediately for streaming
        const streamPlaceholder: Message = {
          text: '',
          sender: 'ai',
        };
        setMessages(prev => [...prev, streamPlaceholder]);

        // Stream the response
        response = await handleStreamWithGroq(userMessage.text);

        // Update the last message with the full response
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = response;
          return newMessages;
        });
      } else if (activeAPI === 'original') {
        response = await handleSendWithOriginalApi(userMessage.text);

        const aiMessage: Message = {
          text: response,
          sender: 'ai',
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error("No API is active. Please check your configuration.");
      }
    } catch (error) {
      console.error('Error sending message:', error);

      // Add an error message to the chat
      const errorMessage = error instanceof Error
        ? error.message
        : 'An unknown error occurred. Please try again.';

      const aiErrorMessage: Message = {
        text: `I apologize, but I encountered an error: ${errorMessage}`,
        sender: 'ai',
      };

      setMessages(prev => [...prev, aiErrorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleQuestionClick = (question: string) => {
    setInput(question);
    if (!isLoading && apiReady) {
      setTimeout(() => handleSendMessage(), 100);
    }
  };

  const handleClearChat = useCallback(() => {
    setMessages([]);
  }, []);

  // Animation variants
  const containerVariants: Variants = {
    open: (isExpanded) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      width: isExpanded ? '90vw' : '90vw',
      height: isExpanded ? '90vh' : '80vh',
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }),
    closed: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  // Message bubble animations
  const messageBubbleVariants: Variants = {
    initial: {
      opacity: 0,
      y: 10,
      scale: 0.9,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2,
      }
    }
  };

  // Ambient background gradient animation
  const backgroundGradientVariants: Variants = {
    animate: {
      backgroundPosition: ['0% 0%', '100% 100%'],
      transition: {
        duration: 15,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "linear",
      }
    }
  };

  // Handle streaming GROQ API with animated text effect
  const handleStreamWithGroq = async (userInput: string) => {
    try {
      if (!groqClient) {
        throw new Error("GROQ client not initialized. Please check your configuration.");
      }

      console.log("Streaming request to GROQ API...");
      const messages = generateGroqMessages(userInput);
      setIsStreaming(true);
      setStreamingContent('');

      // Try with primary model first
      try {
        const startTime = Date.now();
        console.log(`Using GROQ model: ${GROQ_CONFIG.DEFAULT_MODEL}`);

        const stream = await groqClient.chat.completions.create({
          messages: messages as any,
          model: GROQ_CONFIG.DEFAULT_MODEL,
          temperature: GROQ_CONFIG.GENERATION_PARAMS.temperature,
          max_tokens: GROQ_CONFIG.GENERATION_PARAMS.max_tokens,
          top_p: GROQ_CONFIG.GENERATION_PARAMS.top_p,
          stream: true
        });

        let fullResponse = '';
        let lastChunkTime = Date.now();

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';

          // Add small random delay between chunks for more natural typing effect
          const now = Date.now();
          const elapsed = now - lastChunkTime;
          if (elapsed < 30) {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 30));
          }
          lastChunkTime = Date.now();

          fullResponse += content;
          setStreamingContent(prev => prev + content);
        }

        const endTime = Date.now();
        console.log(`GROQ response streamed in ${endTime - startTime}ms`);

        // Format response to match the aiPrompt instructions
        const formattedResponse = formatResponse(fullResponse);

        // Small delay before completing to show the full message
        await new Promise(resolve => setTimeout(resolve, 300));
        setIsStreaming(false);
        return formattedResponse;
      } catch (error) {
        console.error('Primary GROQ streaming error:', error);

        // Try with fallback model
        console.log(`Attempting with fallback GROQ model: ${GROQ_CONFIG.FALLBACK_MODEL}`);
        setStreamingContent('');

        const fallbackStream = await groqClient.chat.completions.create({
          messages: messages as any,
          model: GROQ_CONFIG.FALLBACK_MODEL,
          temperature: GROQ_CONFIG.GENERATION_PARAMS.temperature,
          max_tokens: GROQ_CONFIG.GENERATION_PARAMS.max_tokens,
          top_p: GROQ_CONFIG.GENERATION_PARAMS.top_p,
          stream: true
        });

        let fallbackResponse = '';
        let lastChunkTime = Date.now();

        for await (const chunk of fallbackStream) {
          const content = chunk.choices[0]?.delta?.content || '';

          // Add small random delay between chunks for more natural typing effect
          const now = Date.now();
          const elapsed = now - lastChunkTime;
          if (elapsed < 30) {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 30));
          }
          lastChunkTime = Date.now();

          fallbackResponse += content;
          setStreamingContent(prev => prev + content);
        }

        // Format response to match the aiPrompt instructions
        const formattedResponse = formatResponse(fallbackResponse);

        // Small delay before completing to show the full message
        await new Promise(resolve => setTimeout(resolve, 300));
        setIsStreaming(false);
        return formattedResponse;
      }
    } catch (error) {
      console.error('Error with GROQ API streaming:', error);
      setIsStreaming(false);

      // More detailed error logging for GROQ
      if (error.status) {
        console.error(`GROQ API returned status: ${error.status}`);
      }

      throw error;
    }
  };

  // Handle non-streaming GROQ API
  const handleSendWithGroq = async (userInput: string) => {
    try {
      if (!groqClient) {
        throw new Error("GROQ client not initialized. Please check your configuration.");
      }

      console.log("Sending request to GROQ API...");
      const messages = generateGroqMessages(userInput);

      // Try with primary model first
      try {
        const startTime = Date.now();
        console.log(`Using GROQ model: ${GROQ_CONFIG.DEFAULT_MODEL}`);

        const completion = await groqClient.chat.completions.create({
          messages: messages as any,
          model: GROQ_CONFIG.DEFAULT_MODEL,
          temperature: GROQ_CONFIG.GENERATION_PARAMS.temperature,
          max_tokens: GROQ_CONFIG.GENERATION_PARAMS.max_tokens,
          top_p: GROQ_CONFIG.GENERATION_PARAMS.top_p,
          stream: false
        });

        const endTime = Date.now();
        console.log(`GROQ response generated in ${endTime - startTime}ms`);

        if (!completion.choices?.[0]?.message?.content) {
          throw new Error('No valid content received from GROQ API');
        }

        // Format response to match the aiPrompt instructions
        let formattedResponse = formatResponse(completion.choices[0].message.content);
        console.log("GROQ response formatted successfully");

        return formattedResponse;
      } catch (error) {
        console.error('Primary GROQ model error:', error);

        // Try with fallback model
        console.log(`Attempting with fallback GROQ model: ${GROQ_CONFIG.FALLBACK_MODEL}`);

        const fallbackCompletion = await groqClient.chat.completions.create({
          messages: messages as any,
          model: GROQ_CONFIG.FALLBACK_MODEL,
          temperature: GROQ_CONFIG.GENERATION_PARAMS.temperature,
          max_tokens: GROQ_CONFIG.GENERATION_PARAMS.max_tokens,
          top_p: GROQ_CONFIG.GENERATION_PARAMS.top_p,
          stream: false
        });

        if (!fallbackCompletion.choices?.[0]?.message?.content) {
          throw new Error('No valid content received from fallback GROQ model');
        }

        // Format response to match the aiPrompt instructions
        let formattedResponse = formatResponse(fallbackCompletion.choices[0].message.content);
        console.log("Fallback GROQ response formatted successfully");

        return formattedResponse;
      }
    } catch (error) {
      console.error('Error with GROQ API:', error);

      // More detailed error logging for GROQ
      if (error.status) {
        console.error(`GROQ API returned status: ${error.status}`);
      }

      throw error;
    }
  };

  // Handle message sending using original API
  const handleSendWithOriginalApi = async (userInput: string) => {
    try {
      // Validate API key and URL
      if (!import.meta.env.VITE_API_KEY) {
        throw new Error("Original API key is not configured");
      }

      if (!import.meta.env.VITE_API_URL) {
        throw new Error("Original API URL is not configured");
      }

      console.log(`Sending request to original API at ${import.meta.env.VITE_API_URL}`);

      // Format the URL correctly
      let apiUrl = import.meta.env.VITE_API_URL;

      // Prepare the request payload
      const payload = {
        prompt: userInput,
        system_prompt: aiPrompt
      };

      console.log("Sending payload to original API:", {
        ...payload,
        system_prompt: "[redacted for brevity]" // Don't log the full system prompt
      });

      // Send the request
      const startTime = Date.now();
      const response = await axios.post(apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`
        },
        timeout: GROQ_CONFIG.TIMEOUT_MS // Use same timeout as GROQ
      });

      const endTime = Date.now();
      console.log(`Original API response received in ${endTime - startTime}ms`);

      // Validate the response
      if (!response.data) {
        throw new Error('No data received from original API');
      }

      console.log("Original API response structure:", Object.keys(response.data));

      // Extract content from the response
      let content = '';
      if (response.data.content) {
        content = response.data.content;
      } else if (response.data.choices && response.data.choices[0]?.message?.content) {
        content = response.data.choices[0].message.content;
      } else if (typeof response.data === 'string') {
        content = response.data;
      } else {
        console.error("Unexpected response format:", response.data);
        throw new Error('Unexpected response format from original API');
      }

      // Format the response
      const formattedResponse = formatResponse(content);
      console.log("Original API response formatted successfully");

      return formattedResponse;
    } catch (error) {
      console.error('Error with original API:', error);

      // Detailed error logging for original API
      if (axios.isAxiosError(error)) {
        console.error(`Original API error status: ${error.response?.status}`);
        console.error(`Original API error message: ${error.message}`);

        if (error.response?.status === 404) {
          throw new Error('API endpoint not found. Please check the API URL configuration.');
        } else if (error.response?.status === 401 || error.response?.status === 403) {
          throw new Error('Authentication failed. Please check your API key.');
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Request timed out. The server took too long to respond.');
        }
      }

      throw error;
    }
  };

  // Update system prompt with selected language on change
  useEffect(() => {
    inputRef.current?.focus();
  }, [selectedLanguage]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Get appropriate placeholder text based on language
  const getPlaceholderText = (): string => {
    const languageCode = selectedLanguage;

    const placeholders: Record<string, string> = {
      'en': 'Ask about legal matters...',
      'hi': 'मुझसे भारतीय कानून के बारे में पूछें...',
      'bn': 'আমাকে ভারতীয় আইন সম্পর্কে জিজ্ঞাসা করুন...',
      'te': 'భారతీయ చట్టం గురించి నన్ను అడగండి...',
      'mr': 'मला भारतीय कायद्याबद्दल विचारा...',
      'ta': 'இந்திய சட்டம் பற்றி என்னிடம் கேளுங்கள்...',
      'gu': 'મને ભારતીય કાયદા વિશે પૂછો...',
      'kn': 'ಭಾರತೀಯ ಕಾನೂನಿನ ಬಗ್ಗೆ ನನ್ನನ್ನು ಕೇಳಿ...',
      'ml': 'ഇന്ത്യൻ നിയമത്തെക്കുറിച്ച് എന്നോട് ചോദിക്കൂ...',
      'pa': 'ਮੈਨੂੰ ਭਾਰਤੀ ਕਾਨੂੰਨ ਬਾਰੇ ਪੁੱਛੋ...',
      'ur': 'مجھ سے بھارتی قانون کے بارے میں پوچھیں...',
    };

    return placeholders[languageCode] || placeholders['en'];
  };

  // Sample questions based on selected language
  const getSampleQuestions = (): string[] => {
    const languageCode = selectedLanguage;

    const questions: Record<string, string[]> = {
      'en': [
        'What are my rights if arrested?',
        'How to file an FIR in India?',
        'Explain divorce procedure in India'
      ],
      'hi': [
        'गिरफ्तारी के समय मेरे क्या अधिकार हैं?',
        'भारत में FIR कैसे दर्ज करें?',
        'भारत में तलाक की प्रक्रिया समझाएं'
      ],
      'bn': [
        'গ্রেপ্তার হলে আমার অধিকারগুলি কী?',
        'ভারতে FIR কীভাবে দায়ের করবেন?',
        'ভারতে বিবাহবিচ্ছেদের পদ্ধতি ব্যাখ্যা করুন'
      ],
      // Add more languages as needed
    };

    return questions[languageCode] || questions['en'];
  };

  return (
    <div className="fixed right-4 bottom-4 z-50 sm:bottom-8 sm:right-8">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={containerVariants}
            custom={isExpanded}
            className="flex flex-col overflow-hidden bg-white shadow-2xl rounded-3xl max-w-[550px] w-full mx-auto relative"
            style={{
              boxShadow: '0 10px 25px -5px rgba(200, 155, 0, 0.5), 0 8px 10px -6px rgba(200, 155, 0, 0.3)',
            }}
          >
            {/* Ambient background effect */}
            <motion.div
              className="absolute inset-0 z-0 bg-gradient-to-br pointer-events-none from-primary/5 via-secondary/5 to-primary/5"
              variants={backgroundGradientVariants}
              animate="animate"
            />
            {showParticles && <AmbientParticles />}

            <motion.div
              className="flex relative z-10 justify-between items-center p-4 text-white bg-gradient-to-r rounded-t-3xl cursor-move sm:p-6 from-primary to-primary-dark"
              whileHover={{ backgroundImage: 'linear-gradient(to right, #C89B00, #9C7F00)' }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center space-x-3">
                <div className="flex overflow-hidden relative justify-center items-center w-10 h-10 text-base font-bold bg-white rounded-full shadow-inner sm:w-12 sm:h-12 sm:text-lg text-primary">
                  <span className="relative z-10">AI</span>
                  {isStreaming && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold sm:text-md">Legal-E Assistant</h3>
                  <p className="text-xs sm:text-sm text-secondary">Your legal guide</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {/* Language selector */}
                <LanguageSelector
                  selectedLanguage={selectedLanguage}
                  onSelectLanguage={setSelectedLanguage}
                />

                <Button variant="ghost" size="sm" onClick={handleClearChat} className="text-white hover:text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="text-white hover:text-black">
                  {isExpanded ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white hover:text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            </motion.div>
            <div className="overflow-y-auto relative z-10 flex-1 p-4 space-y-4 bg-gradient-to-b to-white sm:p-6 from-background">
              {!apiReady && (
                <div className="p-4 text-center text-red-500 bg-red-100 rounded-lg">
                  <p>API configuration missing. Chat functionality is disabled.</p>
                  <p className="mt-2 text-sm">Please check your environment variables.</p>
                </div>
              )}
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    variants={messageBubbleVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 sm:p-4 rounded-2xl shadow-md text-sm sm:text-base relative overflow-hidden ${message.sender === 'user'
                        ? 'bg-gradient-to-br from-primary to-primary-dark text-white'
                        : 'bg-white text-gray-800 border border-secondary'
                        }`}
                    >
                      {/* Subtle gradient background for messages */}
                      {message.sender === 'ai' && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br pointer-events-none from-secondary/5 to-primary/5"
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: [0.2, 0.5, 0.2],
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
                          }}
                          transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                      )}

                      {/* Message content with streaming effect if needed */}
                      <div className={`relative z-10 ${message.sender === 'user' ? 'text-white' : 'text-gray-800'}`}>
                        {index === messages.length - 1 && message.sender === 'ai' && isStreaming ? (
                          renderStreamingText(streamingContent)
                        ) : (
                          <MarkdownRenderer content={message.text} />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && !isStreaming && <ThinkingIndicator />}
              <div ref={messagesEndRef} />
            </div>
            <div className="relative z-10 p-4 bg-gradient-to-b from-white rounded-b-3xl sm:p-6 to-background">
              <div className="flex mb-4 space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={getPlaceholderText()}
                  className="flex-grow shadow-inner bg-background"
                  disabled={!apiReady || isLoading}
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!apiReady || isLoading || !input.trim()}
                    className="overflow-hidden relative bg-gradient-to-r rounded-full shadow-lg transition-shadow hover:shadow-xl from-primary to-primary-dark hover:from-primary-dark hover:to-primary"
                  >
                    {isLoading ? (
                      <svg
                        className="w-5 h-5 text-white animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <>
                        {/* Animated shine effect on send button */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent via-white/30"
                          initial={{ x: '-100%' }}
                          animate={{ x: '100%' }}
                          transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 1 }}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="relative z-10 w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
              <div className="flex flex-wrap gap-2">
                {getSampleQuestions().map((question, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuestionClick(question)}
                      className="text-xs rounded-full border transition-colors sm:text-sm border-primary hover:bg-secondary"
                      disabled={!apiReady || isLoading}
                    >
                      {question}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="overflow-hidden relative p-3 text-white bg-gradient-to-r rounded-full shadow-lg transition-all sm:p-4 from-primary to-primary-dark hover:shadow-xl"
        >
          {/* Orbit animation around chat button */}
          <motion.div
            className="absolute w-1.5 h-1.5 rounded-full bg-white/70"
            animate={{
              rotate: 360,
              x: ["0%", "0%"],
              y: ["0%", "0%"],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              offsetPath: "path('M 0 -15 A 15 15 0 1 1 0 15 A 15 15 0 1 1 0 -15')",
            }}
          />

          {/* Button content */}
          <svg xmlns="http://www.w3.org/2000/svg" className="relative z-10 w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </motion.button>
      )}
    </div>
  );
};

export default LegaleChatbot;