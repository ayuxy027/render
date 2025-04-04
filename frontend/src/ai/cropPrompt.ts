/**
 * cropExpert Configuration
 * Defines the behavior and capabilities of the cropExpert
 */

export interface CropAnalyticsInput {
    city: string;
    state: string;
    cropName: string;
    options?: {
        logErrors?: boolean;
        includeHistorical?: boolean;
        dateRange?: string;
    };
}

const getCropAnalyticsPrompt = ({ city, state, cropName, options }: CropAnalyticsInput): string => {
    return `You are an AI crop market analyst. Generate a market analysis report in JSON format for the following parameters:

City: ${city}
State: ${state}
Crop: ${cropName}
${options?.dateRange ? `Date Range: ${options.dateRange}` : ''}
${options?.includeHistorical ? 'Include historical data in analysis' : ''}

Return your analysis as a JSON object with this exact structure:
{
    "marketAnalysis": {
        "summary": {
            "currentPrice": number,
            "priceChange": number,
            "tradingVolume": number,
            "marketSentiment": string
        },
        "visualizations": [],
        "insights": []
    },
    "qualityMetrics": {
        "gradeDistribution": {
            "premium": number,
            "standard": number,
            "substandard": number
        },
        "qualityParameters": []
    },
    "forecastMetrics": {
        "priceProjection": {
            "nextWeek": number,
            "nextMonth": number,
            "confidence": number
        },
        "supplyOutlook": {
            "trend": string,
            "factors": []
        }
    }
}

Important:
1. Use realistic values based on current market conditions
2. All number values should be positive
3. Ensure currentPrice is between 1000 and 10000
4. priceChange should be between -10 and +10
5. Ensure the response is valid JSON
6. Do not include any additional text or markdown formatting
7. Give the AI Confidence always between 80-100% range only
`;
};

export default getCropAnalyticsPrompt;