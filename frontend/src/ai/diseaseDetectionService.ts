import axios from 'axios';
import { getDiseaseDetectionPrompt, DiseasePromptConfig } from './diseasePrompt';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = import.meta.env.VITE_GEMINI_API_URL;

export interface DiseaseAnalysisResult {
  cropName: string;
  diseaseName: string;
  timeToTreat: string;
  estimatedRecovery: string;
  yieldImpact: string;
  severityLevel: string;
  symptomDescription: string;
  environmentalFactors: {
    factor: string;
    currentValue: string;
    optimalRange: string;
    status: 'optimal' | 'warning' | 'critical';
  }[];
  realTimeMetrics: {
    spreadRisk: {
      level: string;
      value: number;
      trend: 'increasing' | 'stable' | 'decreasing';
    };
    diseaseProgression: {
      stage: string;
      rate: number;
      nextCheckDate: string;
    };
    environmentalConditions: {
      temperature: number;
      humidity: number;
      soilMoisture: number;
      lastUpdated: string;
    };
  };
  organicTreatments: string[];
  ipmStrategies: string[];
  preventionPlan: string[];
  confidenceLevel: number;
  diagnosisSummary: string;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>;
}

export const analyzePlantImage = async (
  imageData: string,
  config?: DiseasePromptConfig
): Promise<DiseaseAnalysisResult> => {
  try {
    const { data } = await axios.post<GeminiResponse>(API_URL, {
      contents: [{
        parts: [
          { text: getDiseaseDetectionPrompt(config) },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: imageData.split(',')[1]
            }
          }
        ]
      }]
    }, {
      params: { key: API_KEY },
      headers: { 'Content-Type': 'application/json' }
    });

    const responseText = data.candidates[0]?.content?.parts[0]?.text;
    if (!responseText) throw new Error('No analysis content found');

    // Clean the response text before parsing
    const cleanedText = responseText
      .replace(/```json/g, '')  // Remove markdown code block markers
      .replace(/```/g, '')      // Remove any remaining code block markers
      .replace(/\n/g, ' ')      // Replace newlines with spaces
      .replace(/\r/g, '')       // Remove carriage returns
      .replace(/\t/g, ' ')      // Replace tabs with spaces
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .trim();

    try {
      const parsedResult = JSON.parse(cleanedText) as DiseaseAnalysisResult;
      
      // Validate the parsed result matches our interface
      const requiredFields: (keyof DiseaseAnalysisResult)[] = [
        'diseaseName',
        'cropName',
        'severityLevel',
        'symptomDescription',
        'environmentalFactors',
        'organicTreatments',
        'ipmStrategies',
        'preventionPlan',
        'confidenceLevel',
        'diagnosisSummary'
      ];

      const missingFields = requiredFields.filter(field => !(field in parsedResult));
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields in response: ${missingFields.join(', ')}`);
      }

      return parsedResult;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Cleaned Response Text:', cleanedText);
      throw new Error('Failed to parse AI response as valid JSON. Please try again.');
    }
  } catch (error) {
    console.error('Analysis error:', error);
    throw new Error(error instanceof Error ? error.message : 'Image analysis failed');
  }
};