import axios from "axios"
import { generateModernFarmingPrompt } from "./modernFarmingPrompt"

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const API_URL = import.meta.env.VITE_GEMINI_API_URL

export interface ModernFarmingRequest {
  technique: string
  farmSize: string
  budget: "low" | "medium" | "high"
}

export interface ModernFarmingResponse {
  techniqueAnalysis: {
    overview: {
      name: string
      estimatedCost: number
      roi: number
      successRate: number
      timeToRoi: string
      sustainabilityScore: number
    }
  }
  implementation: {
    phases: Array<{
      name: string
      duration: string
      description: string
      keyMilestones: string[]
      estimatedCost: number
    }>
  }
  metrics: {
    resourceEfficiency: {
      water: number
      labor: number
      energy: number
      yield: number
      sustainability: number
    }
    environmentalImpact: {
      carbonFootprint: number
      waterConservation: number
      soilHealth: number
    }
  }
}

interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string
    }>
  }>
  generationConfig: {
    temperature: number
    topK: number
    topP: number
    maxOutputTokens: number
  }
  safetySettings: Array<{
    category: string
    threshold: string
  }>
}

const DEFAULT_RESPONSE: ModernFarmingResponse = {
  techniqueAnalysis: {
    overview: {
      name: "N/A",
      estimatedCost: 0,
      roi: 0,
      successRate: 0,
      timeToRoi: "",
      sustainabilityScore: 0,
    },
  },
  implementation: {
    phases: [],
  },
  metrics: {
    resourceEfficiency: {
      water: 0,
      labor: 0,
      energy: 0,
      yield: 0,
      sustainability: 0,
    },
    environmentalImpact: {
      carbonFootprint: 0,
      waterConservation: 0,
      soilHealth: 0,
    },
  },
}

export const getModernFarmingAnalysis = async (request: ModernFarmingRequest): Promise<ModernFarmingResponse> => {
  if (!API_KEY || !API_URL) {
    throw new Error("Missing required environment variables")
  }

  const requestData: GeminiRequest = {
    contents: [
      {
        parts: [
          {
            text: generateModernFarmingPrompt(request),
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
    ],
  }

  try {
    const response = await axios.post(`${API_URL}?key=${API_KEY}`, requestData, {
      headers: { "Content-Type": "application/json" },
    })

    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("Invalid API response structure")
      return DEFAULT_RESPONSE
    }

    let responseText = response.data.candidates[0].content.parts[0].text.trim()

    try {
      if (responseText.includes("```")) {
        responseText = responseText
          .replace(/```json\n?/, "")
          .replace(/\n?```$/, "")
          .trim()
      }

      const parsedResponse = JSON.parse(responseText) as Partial<ModernFarmingResponse>

      // Deep merge with default response to ensure type safety
      return {
        techniqueAnalysis: {
          ...DEFAULT_RESPONSE.techniqueAnalysis,
          ...parsedResponse.techniqueAnalysis,
          overview: {
            ...DEFAULT_RESPONSE.techniqueAnalysis.overview,
            ...parsedResponse.techniqueAnalysis?.overview,
          },
        },
        implementation: {
          ...DEFAULT_RESPONSE.implementation,
          ...parsedResponse.implementation,
        },
        metrics: {
          ...DEFAULT_RESPONSE.metrics,
          ...parsedResponse.metrics,
          resourceEfficiency: {
            ...DEFAULT_RESPONSE.metrics.resourceEfficiency,
            ...parsedResponse.metrics?.resourceEfficiency,
          },
          environmentalImpact: {
            ...DEFAULT_RESPONSE.metrics.environmentalImpact,
            ...parsedResponse.metrics?.environmentalImpact,
          },
        },
      }
    } catch (parseError) {
      console.error("JSON Parse Error:", responseText)
      return DEFAULT_RESPONSE
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API Error:", {
        status: error.response?.status,
        data: error.response?.data,
      })
    }
    throw error
  }
}

export default { getModernFarmingAnalysis }

