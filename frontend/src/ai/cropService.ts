import axios from "axios";
import getCropAnalyticsPrompt from "./cropPrompt";
import type { CropAnalyticsInput } from "./cropPrompt";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = import.meta.env.VITE_GEMINI_API_URL;

// Input types for the analytics service
export interface CropAnalyticsRequest {
    city: string;
    state: string;
    cropName: string;
    dateRange?: string;
    options?: {
        logErrors?: boolean;
        includeHistorical?: boolean;
    };
}

// Response types
export interface MarketAnalysis {
    summary: {
        currentPrice: number;
        priceChange: number;
        tradingVolume: number;
        marketSentiment: string;
    };
    visualizations: Array<{
        type: string;
        title: string;
        description: string;
        data: unknown[];
        annotations?: unknown[];
    }>;
    insights: Array<{
        category: string;
        key: string;
        description: string;
        impact: string;
        recommendation: string;
    }>;
}

export interface QualityMetrics {
    gradeDistribution: {
        premium: number;
        standard: number;
        substandard: number;
    };
    qualityParameters: Array<{
        parameter: string;
        value: number;
        unit: string;
        benchmark: number;
    }>;
}

export interface ForecastMetrics {
    priceProjection: {
        nextWeek: number;
        nextMonth: number;
        confidence: number;
    };
    supplyOutlook: {
        trend: string;
        factors: Array<{
            factor: string;
            impact: string;
        }>;
    };
}

export interface CropAnalyticsResponse {
    marketAnalysis: MarketAnalysis;
    qualityMetrics: QualityMetrics;
    forecastMetrics: ForecastMetrics;
}

interface GeminiRequest {
    contents: Array<{
        parts: Array<{
            text: string;
        }>;
    }>;
    generationConfig: {
        temperature: number;
        topK: number;
        topP: number;
        maxOutputTokens: number;
    };
    safetySettings: Array<{
        category: string;
        threshold: string;
    }>;
}

const DEFAULT_RESPONSE: CropAnalyticsResponse = {
    marketAnalysis: {
        summary: {
            currentPrice: 0,
            priceChange: 0,
            tradingVolume: 0,
            marketSentiment: "N/A"
        },
        visualizations: [],
        insights: []
    },
    qualityMetrics: {
        gradeDistribution: {
            premium: 0,
            standard: 0,
            substandard: 0
        },
        qualityParameters: []
    },
    forecastMetrics: {
        priceProjection: {
            nextWeek: 0,
            nextMonth: 0,
            confidence: 0
        },
        supplyOutlook: {
            trend: "N/A",
            factors: []
        }
    }
};

export const getCropAnalytics = async (
    request: CropAnalyticsRequest
): Promise<CropAnalyticsResponse> => {
    if (!API_KEY || !API_URL) {
        throw new Error("Missing required environment variables");
    }

    const promptInput: CropAnalyticsInput = {
        city: request.city,
        state: request.state,
        cropName: request.cropName,
        options: {
            logErrors: request.options?.logErrors,
            includeHistorical: request.options?.includeHistorical,
            dateRange: request.dateRange,
        },
    };

    const requestData: GeminiRequest = {
        contents: [{
            parts: [{
                text: getCropAnalyticsPrompt(promptInput)
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048
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

    try {
        const response = await axios.post(`${API_URL}?key=${API_KEY}`, requestData, {
            headers: { "Content-Type": "application/json" }
        });

        if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            console.error("Invalid API response structure");
            return DEFAULT_RESPONSE;
        }

        let responseText = response.data.candidates[0].content.parts[0].text.trim();

        try {
            if (responseText.includes('```')) {
                responseText = responseText
                    .replace(/```json\n?/, '')
                    .replace(/\n?```$/, '')
                    .trim();
            }

            const parsedResponse = JSON.parse(responseText) as Partial<CropAnalyticsResponse>;
            
            // Deep merge with default response to ensure type safety
            return {
                marketAnalysis: {
                    ...DEFAULT_RESPONSE.marketAnalysis,
                    ...parsedResponse.marketAnalysis,
                    summary: {
                        ...DEFAULT_RESPONSE.marketAnalysis.summary,
                        ...parsedResponse.marketAnalysis?.summary
                    }
                },
                qualityMetrics: {
                    ...DEFAULT_RESPONSE.qualityMetrics,
                    ...parsedResponse.qualityMetrics,
                    gradeDistribution: {
                        ...DEFAULT_RESPONSE.qualityMetrics.gradeDistribution,
                        ...parsedResponse.qualityMetrics?.gradeDistribution
                    }
                },
                forecastMetrics: {
                    ...DEFAULT_RESPONSE.forecastMetrics,
                    ...parsedResponse.forecastMetrics,
                    priceProjection: {
                        ...DEFAULT_RESPONSE.forecastMetrics.priceProjection,
                        ...parsedResponse.forecastMetrics?.priceProjection
                    },
                    supplyOutlook: {
                        ...DEFAULT_RESPONSE.forecastMetrics.supplyOutlook,
                        ...parsedResponse.forecastMetrics?.supplyOutlook
                    }
                }
            };
        } catch (parseError) {
            console.error("JSON Parse Error:", responseText);
            return DEFAULT_RESPONSE;
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("API Error:", {
                status: error.response?.status,
                data: error.response?.data
            });
        }
        throw error;
    }
};

export default { getCropAnalytics };
