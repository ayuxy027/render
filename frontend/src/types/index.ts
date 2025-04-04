export interface TranslationData {
  navbar: {
    diseaseDetection: string;
    cropAdvisory: string;
    marketInsights: string;
    chatbot: string;
  };
  common: {
    uploadImage: string;
    contactExpert: string;
    loading: string;
  };
  diseaseDetection: {
    dragDropText: string;
    uploadInstructions: string;
    chemical: string;
    organic: string;
    preventive: string;
  };
  cropAdvisory: {
    plantingSchedule: string;
    soilReadiness: string;
    seasonalAdvice: string;
    weatherUpdates: string;
  };
  marketInsights: {
    priceAlerts: string;
    buyerDirectory: string;
    trends: string;
  };
  chatbot: {
    placeholder: string;
    sendMessage: string;
    voiceInput: string;
  };
}

export type Language = 'en' | 'hi' | 'mr';