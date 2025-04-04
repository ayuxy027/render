"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { Trash2Icon, X, Minimize2, Maximize2, Send } from "lucide-react"
import { FaRocketchat } from "react-icons/fa"
import aiService from "../ai/aiService"
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface Message {
  text: string
  sender: "user" | "ai"
  animate?: boolean
  timestamp: number
  status?: "sending" | "sent" | "error"
}

interface AgriTechChatbotProps {
  darkMode: boolean
  characterLimit?: number
  cooldownDuration?: number
  language?: "en" | "es" | "fr"
  showTimer?: boolean
  showCharacterCount?: boolean
  userLocation?: string
}

const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { darkMode: boolean; variant?: "primary" | "secondary" }
> = ({ className = "", darkMode, variant = "primary", children, ...props }) => {
  const baseStyle =
    "inline-flex items-center justify-center text-sm font-medium transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:pointer-events-none rounded-full"
  const variantStyles = {
    primary: darkMode
      ? "bg-primary-700 hover:bg-primary-600 text-white"
      : "bg-primary-600 hover:bg-primary-500 text-white",
    secondary: darkMode
      ? "bg-gray-800 hover:bg-gray-700 text-primary-300"
      : "bg-gray-100 hover:bg-gray-200 text-primary-700",
  }

  return (
    <button className={`${baseStyle} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { darkMode: boolean }> = ({
  className = "",
  darkMode,
  ...props
}) => {
  return (
    <input
      className={`flex px-4 py-2 w-full h-12 text-sm rounded-full border transition-all duration-300 backdrop-blur-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:border-transparent ${darkMode
        ? "bg-gray-900/80 border-primary-700 focus:ring-primary-600 text-primary-200"
        : "bg-gray-50/80 border-primary-500 focus:ring-primary-600 text-primary-800"
        } ${className}`}
      {...props}
    />
  )
}

const ThinkingIndicator: React.FC<{ darkMode: boolean }> = ({ darkMode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
    className="flex justify-start"
  >
    <div
      className={`p-3 rounded-2xl max-w-[70%] ${darkMode ? "bg-gray-800/80 text-primary-300" : "bg-gray-100/80 text-primary-700"
        }`}
    >
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut" }}
        className="flex items-center text-sm font-medium"
      >
        <span className="mr-2">Thinking</span>
        <span className="flex space-x-1">
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, repeatDelay: 0.5 }}
          >
            .
          </motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, delay: 0.5, repeatDelay: 0.5 }}
          >
            .
          </motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, delay: 1, repeatDelay: 0.5 }}
          >
            .
          </motion.span>
        </span>
      </motion.div>
    </div>
  </motion.div>
)

const translations = {
  en: {
    placeholder: "How can I help you?",
    remainingChars: "characters remaining",
    cooldownMessage: "You can send another message in",
    seconds: "seconds",
    errorEmpty: "Message cannot be empty",
    errorLimit: "Character limit exceeded",
    errorCooldown: "Please wait before sending another message",
  },
  es: {
    placeholder: "Pregunta sobre tus necesidades agrícolas...",
    remainingChars: "caracteres restantes",
    cooldownMessage: "Puedes enviar otro mensaje en",
    seconds: "segundos",
    errorEmpty: "El mensaje no puede estar vacío",
    errorLimit: "Límite de caracteres excedido",
    errorCooldown: "Por favor espera antes de enviar otro mensaje",
  },
  fr: {
    placeholder: "Comment puis-je aider avec vos besoins agricoles ?",
    remainingChars: "caractères restants",
    cooldownMessage: "Vous pouvez envoyer un autre message dans",
    seconds: "secondes",
    errorEmpty: "Le message ne peut pas être vide",
    errorLimit: "Limite de caractères dépassée",
    errorCooldown: "Veuillez patienter avant d'envoyer un autre message",
  },
}

const CustomLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => {
  const navigate = useNavigate()
  const isInternalLink = href.startsWith('/')

  const handleClick = (e: React.MouseEvent) => {
    if (isInternalLink) {
      e.preventDefault()
      navigate(href)
    }
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className="underline text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 decoration-dotted underline-offset-4"
      target={isInternalLink ? undefined : "_blank"}
      rel={isInternalLink ? undefined : "noopener noreferrer"}
    >
      {children}
    </a>
  )
}

const MarkdownMessage: React.FC<{ content: string; darkMode: boolean }> = ({ content, darkMode }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      code({ node, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '')
        return match ? (
          <SyntaxHighlighter
            // @ts-ignore 
            style={darkMode ? vscDarkPlus : vs}
            language={match[1]}
            PreTag="div"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        ) : (
          <code className={className} {...props}>
            {children}
          </code>
        )
      },
      // @ts-ignore 
      a: ({ node, ...props }) => <CustomLink href={props.href || ''} {...props} />,
      h1: ({ children }) => <h1 className="mb-2 text-xl font-bold">{children}</h1>,
      h2: ({ children }) => <h2 className="mb-2 text-lg font-bold">{children}</h2>,
      ul: ({ children }) => <ul className="mb-2 list-disc list-inside">{children}</ul>,
      ol: ({ children }) => <ol className="mb-2 list-decimal list-inside">{children}</ol>,
      blockquote: ({ children }) => (
        <blockquote className="pl-4 my-2 italic border-l-4 border-primary-500">{children}</blockquote>
      ),
    }}
  >
    {content}
  </ReactMarkdown>
)

const MessageComponent: React.FC<{ message: Message; darkMode: boolean }> = ({ message, darkMode }) => (
  <motion.div
    initial={message.animate ? { opacity: 0, y: 10 } : false}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
  >
    <div
      className={`max-w-[90%] sm:max-w-[80%] p-2 sm:p-3 md:p-4 rounded-2xl backdrop-blur-sm shadow-lg 
      ${message.sender === "user"
          ? darkMode
            ? "bg-gradient-to-br from-primary-700 to-primary-900 text-white"
            : "bg-gradient-to-br from-primary-600 to-primary-800 text-white"
          : darkMode
            ? "bg-gray-800/80 text-primary-300 border border-primary-900/20"
            : "bg-gray-100/80 text-primary-700 border border-primary-200/20"
        }`}
    >
      {message.sender === "ai" ? (
        <MarkdownMessage content={message.text} darkMode={darkMode} />
      ) : (
        <div className="whitespace-pre-wrap">{message.text}</div>
      )}
    </div>
  </motion.div>
)

const QuickActions: React.FC<{ darkMode: boolean; onSelect: (action: string) => void }> = ({ darkMode, onSelect }) => {
  const actions = [
    { icon: "🚜", label: "Precision Farming", action: "What is precision agriculture and how can it benefit my farm?" },
    { icon: "🌱", label: "Smart Solutions", action: "Tell me about smart farming technologies for small farms" },
    { icon: "🤖", label: "Agri-Robotics", action: "How can I start using agricultural robots on my farm?" },
    { icon: "📱", label: "Digital Tools", action: "What are the essential digital farming tools for beginners?" },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      {actions.map(({ icon, label, action }) => (
        <button
          key={label}
          onClick={() => onSelect(action)}
          className={`flex items-center p-3 rounded-lg transition-all duration-300 ${darkMode
            ? "border bg-gray-800/50 hover:bg-gray-700/50 border-primary-800/30"
            : "border bg-gray-100/50 hover:bg-gray-200/50 border-primary-200/30"
            }`}
        >
          <span className="mr-2 text-xl">{icon}</span>
          <span className="text-sm">{label}</span>
        </button>
      ))}
    </div>
  )
}

const AgriTechChatbot: React.FC<AgriTechChatbotProps> = ({
  darkMode,
  characterLimit = 100,
  cooldownDuration = 15,
  language = "en",
  showTimer = true,
  showCharacterCount = true,
  userLocation,
}) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState<number>(0)
  const [lastMessageTime, setLastMessageTime] = useState<number>(0)
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const t = translations[language]

  const predefinedQuestions: string[] = [
    "Cost of precision farming",
    "Beginner automation tools",
    "Smart irrigation systems",
    "Drone technology benefits",
    "Digital farming basics",
    "ROI of modern farming",
  ]

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom])

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => Math.max(0, prev - 1))
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [cooldown])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = e.target.value
    if (newInput.length <= characterLimit) {
      setInput(newInput)
      setError(null)
    } else {
      setError(t.errorLimit)
    }
  }

  const getInputColor = () => {
    const ratio = input.length / characterLimit
    if (ratio < 0.8) return darkMode ? "text-primary-300" : "text-primary-700"
    if (ratio < 1) return "text-yellow-500"
    return "text-red-500"
  }

  const handleSendMessage = useCallback(async () => {
    if (input.trim() === "") {
      setError(t.errorEmpty)
      return
    }

    if (input.length > characterLimit) {
      setError(t.errorLimit)
      return
    }

    const currentTime = Date.now()
    if (currentTime - lastMessageTime < cooldownDuration * 1000) {
      setError(t.errorCooldown)
      return
    }

    setIsLoading(true)
    setError(null)
    const userMessage = input
    setMessages((prev) => [...prev, { text: userMessage, sender: "user", timestamp: currentTime, status: "sending" }])
    setInput("")
    setLastMessageTime(currentTime)
    setCooldown(cooldownDuration)

    try {
      let accumulatedResponse = ""

      await aiService.getAIResponse(
        userMessage,
        {
          userLanguage: language,
          userLocation,
          previousMessages: messages.map(msg => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text
          }))
        },
        ({ text, done }) => {
          if (!done) {
            accumulatedResponse += text
            setCurrentStreamingMessage(accumulatedResponse)
          } else {
            setMessages(prev => [
              ...prev.slice(0, -1),
              { text: userMessage, sender: "user", timestamp: currentTime, status: "sent" },
              { text: accumulatedResponse, sender: "ai", timestamp: Date.now() }
            ])
            setCurrentStreamingMessage("")
          }
        }
      )
    } catch (error) {
      console.error("Error getting AI response:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { text: userMessage, sender: "user", timestamp: currentTime, status: "error" },
        {
          text: "I apologize, but I'm having trouble responding right now. Please try again.",
          sender: "ai",
          timestamp: Date.now()
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [input, characterLimit, cooldownDuration, lastMessageTime, t, language, userLocation, messages])

  const handleClearChat = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  const containerVariants: Variants = {
    open: (isExpanded) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      width: isExpanded ? "min(90vw, 800px)" : "min(90vw, 400px)",
      height: isExpanded ? "min(90vh, 800px)" : "min(90vh, 600px)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    }),
    closed: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  }

  const handleQuickAction = (action: string) => {
    setInput(action)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className="fixed right-2 bottom-2 z-50 sm:right-4 sm:bottom-4 md:right-8 md:bottom-8">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={containerVariants}
            custom={isExpanded}
            className={`flex flex-col overflow-hidden shadow-2xl rounded-3xl backdrop-blur-sm ${darkMode ? "bg-gray-900/95" : "bg-white/95"
              }`}
            style={{
              boxShadow: darkMode
                ? "0 10px 25px -5px rgba(16,185,129,0.3), 0 8px 10px -6px rgba(16,185,129,0.2)"
                : "0 10px 25px -5px rgba(5,150,105,0.3), 0 8px 10px -6px rgba(5,150,105,0.2)",
            }}
          >
            <motion.div
              drag
              dragConstraints={{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
              dragElastic={0.1}
              className={`flex justify-between items-center p-4 text-white rounded-t-3xl cursor-move sm:p-6 ${darkMode
                ? "bg-gradient-to-r from-primary-700 to-primary-900"
                : "bg-gradient-to-r from-primary-600 to-primary-800"
                }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`flex justify-center items-center w-10 h-10 text-base font-bold rounded-full shadow-inner sm:w-12 sm:h-12 sm:text-lg backdrop-blur-sm ${darkMode ? "bg-gray-800/80 text-primary-300" : "bg-gray-100/80 text-primary-700"
                    }`}
                >
                  AI
                </div>
                <div>
                  <h3 className="text-sm font-semibold sm:text-md">Kisan AI</h3>
                  <p className="text-xs opacity-90 sm:text-sm">Your Agriculture Innovation Guide</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  darkMode={darkMode}
                  variant="secondary"
                  onClick={handleClearChat}
                  className="p-2 hover:bg-opacity-80"
                >
                  <Trash2Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <Button
                  darkMode={darkMode}
                  variant="secondary"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 hover:bg-opacity-80"
                >
                  {isExpanded ? (
                    <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </Button>
                <Button
                  darkMode={darkMode}
                  variant="secondary"
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-opacity-80"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </motion.div>

            <div className="overflow-hidden relative flex-1">
              <div className="absolute inset-0 bg-noise opacity-85" />
              <div
                className={`absolute inset-0 ${darkMode
                  ? "bg-gradient-to-br via-gray-900 from-primary-900/90 to-primary-950/90"
                  : "bg-gradient-to-br via-white from-primary-100/90 to-primary-200/90"
                  }`}
              />
              <div
                ref={chatContainerRef}
                className="overflow-y-auto relative p-4 space-y-4 h-full sm:p-6"
              >
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-2 text-sm rounded-md ${darkMode ? "text-red-300 bg-red-900/20" : "text-red-600 bg-red-100/20"}`}
                  >
                    {error}
                  </motion.div>
                )}
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <QuickActions darkMode={darkMode} onSelect={handleQuickAction} />
                  </motion.div>
                )}
                {messages.map((message, index) => (
                  <MessageComponent
                    key={index}
                    message={message}
                    darkMode={darkMode}
                  />
                ))}
                {currentStreamingMessage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div
                      className={`p-3 rounded-2xl max-w-[70%] ${darkMode ? "bg-gray-800/80 text-primary-300" : "bg-gray-100/80 text-primary-700"
                        }`}
                    >
                      <MarkdownMessage content={currentStreamingMessage} darkMode={darkMode} />
                    </div>
                  </motion.div>
                )}
                {isLoading && !currentStreamingMessage && <ThinkingIndicator darkMode={darkMode} />}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div
              className={`relative p-4 sm:p-6 ${darkMode
                ? "bg-gradient-to-t from-gray-900 via-gray-900 to-transparent"
                : "bg-gradient-to-t from-white via-white to-transparent"
                }`}
            >
              {showCharacterCount && (
                <div className={`mb-2 text-xs ${getInputColor()}`}>
                  {characterLimit - input.length} {t.remainingChars}
                </div>
              )}
              <div className="flex mb-4 space-x-2">
                <Input
                  // @ts-ignore
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  placeholder={t.placeholder}
                  className="flex-grow text-sm shadow-lg sm:text-base"
                  darkMode={darkMode}
                  disabled={cooldown > 0}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || cooldown > 0 || input.length > characterLimit}
                  className={`p-2 sm:p-3 shadow-lg transition-all duration-300 ${darkMode
                    ? "bg-gradient-to-r from-primary-700 to-primary-900 hover:from-primary-800 hover:to-primary-700"
                    : "bg-gradient-to-r from-primary-600 to-primary-800 hover:from-primary-700 hover:to-primary-600"
                    }`}
                  darkMode={darkMode}
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
              {showTimer && cooldown > 0 && (
                <div className={`text-xs text-center ${darkMode ? "text-primary-300" : "text-primary-700"}`}>
                  {t.cooldownMessage} {cooldown} {t.seconds}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {predefinedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    onClick={() => setInput(question)}
                    className={`px-3 py-1 text-xs rounded-full border transition-all duration-300 backdrop-blur-sm ${darkMode
                      ? "border-primary-700/20 hover:bg-gray-800/50 hover:border-primary-700"
                      : "border-primary-600/20 hover:bg-gray-100/50 hover:border-primary-600"
                      }`}
                    darkMode={darkMode}
                    variant="secondary"
                    disabled={cooldown > 0}
                  >
                    {question}
                  </Button>
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
          className={`p-4 text-white rounded-full shadow-lg transition-colors duration-500 ease-in-out ${darkMode
            ? "bg-gradient-to-r from-primary-700 to-primary-900 hover:from-primary-800 hover:to-primary-700"
            : "bg-gradient-to-r from-primary-600 to-primary-800 hover:from-primary-700 hover:to-primary-600"
            }`}
        >
          <FaRocketchat className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  )
}

export default AgriTechChatbot