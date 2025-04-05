import { INDIAN_LEGAL_REFERENCES } from '../ai/draftPrompt';

export type DocumentType = keyof typeof INDIAN_LEGAL_REFERENCES | 'Other';

export interface FormInputs {
  documentType: DocumentType;
  partyA: string;
  partyB: string;
  additionalDetails: string;
  specificDetails: string;
  state?: string;
} 