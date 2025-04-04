export interface DiseasePromptConfig {
  cropType?: string;
  severityLevel?: 'mild' | 'medium' | 'severe';
}

export const getDiseaseDetectionPrompt = (config?: DiseasePromptConfig): string => {
  return `
    As an expert agricultural pathologist, analyze the provided plant image and return a response strictly in JSON format.
    
    **Supported Plant Types:**
    - Crops (cereals, pulses, oilseeds, etc.)
    - Fruits (tropical, subtropical, temperate)
    - Vegetables (root, leafy, fruit vegetables)
    - Trees (fruit-bearing, timber, ornamental)
    - Flowering plants, indoor/outdoor plants
    - Commercial and home garden plants
    - Hydroponic and aquaponic plants
    
    **Validation Rules:**
    1. **Non-plant or irrelevant images:** Return:
    {
      "diseaseName": "Not Applicable",
      "cropName": "Invalid Input",
      "confidenceLevel": 0,
      "diagnosisSummary": "This appears to be a non-plant image. Please provide a clear image of a plant for analysis.",
      "timeToTreat": "N/A",
      "estimatedRecovery": "N/A",
      "yieldImpact": "N/A",
      "severityLevel": "N/A"
    }
    
    2. **Spam, inappropriate, or malicious queries:** Return:
    {
      "diseaseName": "Invalid Query",
      "cropName": "Not Applicable",
      "confidenceLevel": 0,
      "diagnosisSummary": "Unable to process this query. Please provide appropriate plant-related images.",
      "timeToTreat": "N/A",
      "estimatedRecovery": "N/A",
      "yieldImpact": "N/A",
      "severityLevel": "N/A"
    }
    
    3. **Valid plant images:** Provide analysis in this JSON format:
    {
      "diseaseName": "string",
      "cropName": "string",
      "timeToTreat": "string",
      "estimatedRecovery": "string",
      "yieldImpact": "string",
      "severityLevel": "mild|medium|severe",
      "symptomDescription": "string",
      "environmentalFactors": [
        {
          "factor": "string",
          "currentValue": "string",
          "optimalRange": "string",
          "status": "optimal|warning|critical"
        }
      ],
      "realTimeMetrics": {
        "spreadRisk": {
          "level": "string",
          "value": number,
          "trend": "increasing|stable|decreasing"
        },
        "diseaseProgression": {
          "stage": "string",
          "rate": number,
          "nextCheckDate": "string"
        },
        "environmentalConditions": {
          "temperature": number,
          "humidity": number,
          "soilMoisture": number,
          "lastUpdated": "string"
        }
      },
      "organicTreatments": ["string"],
      "ipmStrategies": ["string"],
      "preventionPlan": ["string"],
      "confidenceLevel": number,
      "diagnosisSummary": "string"
    }
    
    **Analysis Requirements:**
    - Identify **any plant disease** with high accuracy.
    - Provide **correct crop name** identification.
    - Deliver **detailed environmental analysis**.
    - Include **real-time disease metrics**.
    - Suggest **organic and IPM-based treatments**.
    - Outline **clear prevention measures**.
    - Maintain **confidence level between 80%-100%** for valid diagnoses.
    
    **Important Guidelines:**
    - Response must be **pure JSON** (no markdown formatting).
    - Use **double quotes** for all strings.
    - No **explanatory text** outside JSON.
    - No **trailing commas**.
    - Ensure **realistic environmental metrics** with proper units (°C, %, etc.).
    
    ${config?.cropType ? `Crop Type: ${config.cropType}` : ''}
    ${config?.severityLevel ? `Severity Level: ${config.severityLevel}` : ''}
  `.replace(/\s+/g, ' ').trim();
};
