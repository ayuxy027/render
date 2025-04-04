import type { ModernFarmingRequest } from "./modernFarmingService"

export const generateModernFarmingPrompt = ({ technique, farmSize, budget }: ModernFarmingRequest): string => {
  return `You are an AI agricultural technology expert. Generate a comprehensive modern farming analysis report in JSON format for:

Technique: ${technique}
Farm Size: ${farmSize} acres
Budget Range: ${budget}

Return your analysis as a JSON object with this expanded structure:
{
  "techniqueAnalysis": {
    "overview": {
      "name": string,
      "estimatedCost": number,
      "roi": number,
      "successRate": number,
      "timeToRoi": string,
      "sustainabilityScore": number
    }
  },
  "implementation": {
    "phases": [
      {
        "name": string,
        "duration": string,
        "description": string,
        "keyMilestones": string[],
        "estimatedCost": number
      }
    ]
  },
  "metrics": {
    "resourceEfficiency": {
      "water": number,
      "labor": number,
      "energy": number,
      "yield": number,
      "sustainability": number
    },
    "environmentalImpact": {
      "carbonFootprint": number,
      "waterConservation": number,
      "soilHealth": number
    }
  }
}

Guidelines:
1. Ensure realistic cost estimates based on budget range
2. ROI should be random value between 10-30%
3. Include 5 detailed and super relevent implementation phases
4. All numeric metrics should be on a scale of 0-100
5. Consider local agricultural conditions and seasonal variations
6. Provide practical and actionable implementation steps
7. Focus on sustainable practices and environmental impact
8. Include specific timeframes for ROI and implementation phases
9. Consider technology integration and modern farming practices
10. Account for resource optimization and efficiency metrics
11. Do not treat waste queries simply return "No data available" or "Not Applicable"
12. Do not reply to wrong queries which might be sensitive in nature or malicious in nature
13. Do not reply to queries which are not related to modern farming or agriculture practices
`.trim()
}