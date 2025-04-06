import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { aiPrompt, GROQ_CONFIG, SUPPORTED_LANGUAGES } from '../ai/aiPrompt';
import axios from 'axios';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Groq from 'groq-sdk';

// Add window.ethereum type for TypeScript
declare global {
  interface Window {
    ethereum: any;
  }
}

// Check which API is available
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

// Message types
type GroqRole = "system" | "user" | "assistant";

interface GroqMessage {
  role: GroqRole;
  content: string;
}

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

// Markdown renderer component
const MarkdownRenderer = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className="max-w-none prose prose-sm text-inherit"
      components={{
        li: ({ ...props }) => <li className="list-item marker:text-primary" {...props} />,
        a: ({ ...props }) => <a target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" {...props} />,
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

// Language selector component
const LanguageSelector = ({
  selectedLanguage,
  onSelectLanguage
}: {
  selectedLanguage: string;
  onSelectLanguage: (language: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg px-3 py-1.5"
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
      </button>

      {isOpen && (
        <div
          className="overflow-y-auto absolute right-0 z-50 mt-2 w-48 max-h-60 bg-white rounded-lg shadow-lg"
        >
          {SUPPORTED_LANGUAGES.map((language) => (
            <button
              key={language.code}
              onClick={() => {
                onSelectLanguage(language.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedLanguage === language.code ? 'bg-primary/10 font-medium' : ''
                }`}
            >
              <span className="block text-gray-800">{language.nativeName}</span>
              <span className="block text-xs text-gray-500">{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Simple loading indicator
const LoadingIndicator = () => (
  <div className="flex justify-center items-center p-3 space-x-1 text-gray-500 bg-gray-100 rounded-lg">
    <div className="w-2 h-2 rounded-full animate-pulse bg-primary" style={{ animationDelay: "0ms" }}></div>
    <div className="w-2 h-2 rounded-full animate-pulse bg-primary" style={{ animationDelay: "300ms" }}></div>
    <div className="w-2 h-2 rounded-full animate-pulse bg-primary" style={{ animationDelay: "600ms" }}></div>
  </div>
);

// Chat typing indicator
const TypingIndicator = () => (
  <span className="inline-flex">
    <span className="animate-pulse">.</span>
    <span className="animate-pulse" style={{ animationDelay: "300ms" }}>.</span>
    <span className="animate-pulse" style={{ animationDelay: "600ms" }}>.</span>
  </span>
);

// Button component
const Button = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}) => {
  const baseClasses = "flex items-center justify-center font-medium rounded-lg transition-colors";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark disabled:bg-gray-300",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 disabled:text-gray-300"
  };

  const sizes = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-2",
    lg: "text-base px-4 py-2.5"
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Add animation variants
const chatWindowVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 20,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

const messageVariants: Variants = {
  hidden: {
    opacity: 0,
    // @ts-ignore 
    x: (message: Message) => message.sender === 'user' ? 20 : -20,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

const toggleButtonVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.1 },
  tap: { scale: 0.95 }
};
// Main Chatbot component
const LegaleChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [apiReady, setApiReady] = useState(false);
  const [activeAPI, setActiveAPI] = useState('none');
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check API availability
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

  // Detect browser language
  useEffect(() => {
    const detectLanguage = () => {
      const browserLang = navigator.language.split('-')[0].toLowerCase();
      const isSupported = SUPPORTED_LANGUAGES.some(lang => lang.code === browserLang);
      if (isSupported) {
        setSelectedLanguage(browserLang);
      }
    };
    detectLanguage();
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  // Format chat response
  const formatResponse = (content: string): string => {
    if (!content) return "I apologize, but I couldn't generate a response. Please try again.";

    let cleanedContent = content.trim();
    cleanedContent = cleanedContent.replace(/```\s*\n([\s\S]*?)\n```/g, (_match, codeContent) => {
      return '```text\n' + codeContent + '\n```';
    });

    return cleanedContent;
  };

  // Generate GROQ messages
  const generateGroqMessages = (userInput: string): GroqMessage[] => {
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

  // Handle sending message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!input.trim() || isLoading || !apiReady) return;

    const userMessage = {
      text: input.trim(),
      sender: 'user' as const,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let response: string;

      if (activeAPI === 'groq') {
        // Add empty AI message for streaming
        const streamPlaceholder = {
          text: '',
          sender: 'ai' as const,
        };
        setMessages(prev => [...prev, streamPlaceholder]);

        // Stream the response
        response = await handleStreamWithGroq(userMessage.text);

        // Update the last message with full response
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = response;
          return newMessages;
        });
      } else if (activeAPI === 'original') {
        response = await handleSendWithOriginalApi(userMessage.text);

        const aiMessage = {
          text: response,
          sender: 'ai' as const,
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error("No API is active. Please check your configuration.");
      }
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage = error instanceof Error
        ? error.message
        : 'An unknown error occurred. Please try again.';

      const aiErrorMessage = {
        text: `I apologize, but I encountered an error: ${errorMessage}`,
        sender: 'ai' as const,
      };

      setMessages(prev => [...prev, aiErrorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  // Stream response with GROQ
  const handleStreamWithGroq = async (userInput: string): Promise<string> => {
    try {
      if (!groqClient) {
        throw new Error("GROQ client not initialized");
      }

      setIsStreaming(true);
      setStreamingContent('');

      const messages = generateGroqMessages(userInput);
      const startTime = Date.now();

      // Try primary model
      try {
        console.log(`Using GROQ model: ${GROQ_CONFIG.DEFAULT_MODEL}`);

        const stream = await groqClient.chat.completions.create({
          messages: messages as any,
          model: GROQ_CONFIG.DEFAULT_MODEL,
          temperature: 0.7, // Lower for faster responses
          max_tokens: GROQ_CONFIG.GENERATION_PARAMS.max_tokens,
          top_p: 0.95,
          stream: true
        });

        let fullResponse = '';

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          fullResponse += content;
          setStreamingContent(fullResponse);
        }

        console.log(`GROQ response time: ${Date.now() - startTime}ms`);
        return formatResponse(fullResponse);
      } catch (error) {
        console.error('Primary model error, trying fallback:', error);

        // Try fallback model
        setStreamingContent('');
        const fallbackStream = await groqClient.chat.completions.create({
          messages: messages as any,
          model: GROQ_CONFIG.FALLBACK_MODEL,
          temperature: 0.7,
          max_tokens: GROQ_CONFIG.GENERATION_PARAMS.max_tokens,
          top_p: 0.95,
          stream: true
        });

        let fallbackResponse = '';

        for await (const chunk of fallbackStream) {
          const content = chunk.choices[0]?.delta?.content || '';
          fallbackResponse += content;
          setStreamingContent(fallbackResponse);
        }

        return formatResponse(fallbackResponse);
      } finally {
        setIsStreaming(false);
      }
    } catch (error) {
      console.error('Error with GROQ API:', error);
      setIsStreaming(false);
      throw error;
    }
  };

  // Handle original API
  const handleSendWithOriginalApi = async (userInput: string): Promise<string> => {
    try {
      if (!import.meta.env.VITE_API_KEY || !import.meta.env.VITE_API_URL) {
        throw new Error("API credentials not configured");
      }

      console.log("Sending request to original API");

      const response = await axios.post(
        import.meta.env.VITE_API_URL,
        {
          prompt: userInput,
          system_prompt: aiPrompt
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`
          },
          timeout: GROQ_CONFIG.TIMEOUT_MS
        }
      );

      if (!response.data) {
        throw new Error('No data received from API');
      }

      let content = '';
      if (response.data.content) {
        content = response.data.content;
      } else if (response.data.choices && response.data.choices[0]?.message?.content) {
        content = response.data.choices[0].message.content;
      } else if (typeof response.data === 'string') {
        content = response.data;
      } else {
        throw new Error('Unexpected response format');
      }

      return formatResponse(content);
    } catch (error) {
      console.error('Error with original API:', error);
      throw error;
    }
  };

  // Predefined questions for quick start
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

  // Handle quick question selection
  const handleQuestionClick = (question: string) => {
    setInput(question);
    if (!isLoading && apiReady) {
      setTimeout(() => handleSendMessage(), 100);
    }
  };

  // Clear chat history
  const handleClearChat = () => {
    setMessages([]);
  };

  // Get placeholder text in selected language
  const getPlaceholderText = (): string => {
    const placeholders: Record<string, string> = {
      'en': 'Ask about legal matters...',
      'hi': 'कानूनी मामलों के बारे में पूछें...',
      'bn': 'আইনি বিষয়ে জিজ্ঞাসা করুন...',
      // Add more languages as needed
    };

    return placeholders[selectedLanguage] || placeholders['en'];
  };

  // Render message with streaming effect
  const renderStreamingText = (text: string) => {
    if (!text) return <TypingIndicator />;
    return (
      <>
        <MarkdownRenderer content={text} />
        <TypingIndicator />
      </>
    );
  };

  return (
    <motion.div
      className="fixed right-4 bottom-4 z-40 sm:right-8 sm:bottom-8"
      initial="rest"
      whileHover="hover"
      whileTap="tap"
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="chat-window"
            variants={chatWindowVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-xl shadow-xl max-w-[550px] w-full h-[70vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <motion.div
              className="flex justify-between items-center p-4 text-white bg-primary"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center space-x-3">
                <div className="flex justify-center items-center w-10 h-10 font-bold bg-white rounded-full text-primary">
                  AI
                </div>
                <div>
                  <h3 className="font-semibold">Legal-E Assistant</h3>
                  <p className="text-xs opacity-80">Your legal guide</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <LanguageSelector
                  selectedLanguage={selectedLanguage}
                  onSelectLanguage={setSelectedLanguage}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearChat}
                  className="text-white hover:bg-white/20"
                  aria-label="Clear chat"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-white hover:bg-white/20"
                  aria-label={isExpanded ? "Minimize" : "Maximize"}
                >
                  {isExpanded ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            </motion.div>

            {/* Messages area */}
            <div className="overflow-y-auto flex-1 p-4 bg-gray-50">
              {!apiReady && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 text-center text-red-500 bg-red-100 rounded-lg"
                >
                  <p>API configuration missing. Chat functionality is disabled.</p>
                  <p className="mt-2 text-sm">Please check your environment variables.</p>
                </motion.div>
              )}

              {/* Message bubbles */}
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    custom={message}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`max-w-[80%] p-3 rounded-lg ${message.sender === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-white border border-gray-200 text-gray-800'
                        }`}
                    >
                      {index === messages.length - 1 && message.sender === 'ai' && isStreaming ? (
                        renderStreamingText(streamingContent)
                      ) : (
                        <MarkdownRenderer content={message.text} />
                      )}
                    </motion.div>
                  </motion.div>
                ))}

                {/* Loading indicator */}
                <AnimatePresence>
                  {isLoading && !isStreaming && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex justify-start"
                    >
                      <LoadingIndicator />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 bg-white border-t border-gray-200"
            >
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={getPlaceholderText()}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  disabled={!apiReady || isLoading}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!apiReady || isLoading || !input.trim()}
                  className="flex justify-center items-center px-4 py-2 font-medium text-white rounded-lg bg-primary hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  )}
                </motion.button>
              </form>

              {/* Sample questions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-2 mt-3"
              >
                {getSampleQuestions().map((question, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuestionClick(question)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full truncate max-w-[200px]"
                    disabled={!apiReady || isLoading}
                  >
                    {question}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.button
            key="toggle-button"
            variants={toggleButtonVariants}
            onClick={() => setIsOpen(true)}
            className="p-3 text-white rounded-full shadow-lg transition-colors bg-primary hover:bg-primary-dark"
            aria-label="Open chat"
          >
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </motion.svg>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LegaleChatbot;