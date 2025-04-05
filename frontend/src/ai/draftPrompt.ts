// Legal document reference types with more comprehensive attributes
export interface LegalActReference {
  name: string;
  sections: string[];
  description?: string;
  year?: string;
  importance?: 'critical' | 'high' | 'medium' | 'low';
  isUnionLaw?: boolean;
  amendments?: string[];
}

export interface LegalReference {
  acts: LegalActReference[];
  stampDuty?: string;
  courtCases?: string[];
  additionalNotes?: string[];
  validityPeriod?: string;
  registrationRequirements?: string;
  relevantForms?: string[];
  enforcementConsiderations?: string[];
}

export type DocumentReferenceMap = Record<string, LegalReference>;

// Registry of document types with categorization
export enum DocumentCategory {
  PROPERTY = 'PROPERTY',
  BUSINESS = 'BUSINESS',
  PERSONAL = 'PERSONAL',
  EMPLOYMENT = 'EMPLOYMENT',
  OTHER = 'OTHER'
}

export interface DocumentTypeInfo {
  name: string;
  category: DocumentCategory;
  description: string;
  commonUses: string[];
  requiresNotarization: boolean;
  requiresRegistration: boolean;
  validityPeriod?: string;
  complexity: 'low' | 'medium' | 'high';
}

// Registry of document types with metadata
export const DOCUMENT_TYPES: Record<string, DocumentTypeInfo> = {
  'Rent Agreement': {
    name: 'Rent Agreement',
    category: DocumentCategory.PROPERTY,
    description: 'A legal agreement between landlord and tenant for property rental',
    commonUses: [
      'Residential property rental',
      'Commercial space leasing',
      'Short-term vacation rentals'
    ],
    requiresNotarization: false,
    requiresRegistration: true,
    validityPeriod: 'Typically 11 months',
    complexity: 'medium'
  },
  'Employment Contract': {
    name: 'Employment Contract',
    category: DocumentCategory.EMPLOYMENT,
    description: 'A formal agreement between employer and employee defining employment terms',
    commonUses: [
      'Full-time employment',
      'Contractual work',
      'Consulting arrangements'
    ],
    requiresNotarization: false,
    requiresRegistration: false,
    complexity: 'medium'
  },
  'Non-Disclosure Agreement': {
    name: 'Non-Disclosure Agreement',
    category: DocumentCategory.BUSINESS,
    description: 'A contract establishing confidentiality of shared information',
    commonUses: [
      'Business partnerships',
      'Employee confidentiality',
      'Before business negotiations'
    ],
    requiresNotarization: false,
    requiresRegistration: false,
    complexity: 'medium'
  },
  'Will': {
    name: 'Will',
    category: DocumentCategory.PERSONAL,
    description: 'A legal document expressing a person\'s wishes regarding asset distribution after death',
    commonUses: [
      'Estate planning',
      'Asset distribution',
      'Appointing guardians for minors'
    ],
    requiresNotarization: true,
    requiresRegistration: false,
    complexity: 'high'
  },
  'Other': {
    name: 'Other',
    category: DocumentCategory.OTHER,
    description: 'Other customized legal document',
    commonUses: [
      'Custom agreements',
      'Special arrangements',
      'Unique circumstances'
    ],
    requiresNotarization: false,
    requiresRegistration: false,
    complexity: 'medium'
  }
};

// Expanded legal references with more detailed information
export const INDIAN_LEGAL_REFERENCES: DocumentReferenceMap = {
  'Rent Agreement': {
    acts: [
      { 
        name: 'Rent Control Act', 
        sections: ['Section 5: Fair Rent', 'Section 7: Landlord Obligations'],
        description: 'Governs rent determination and landlord responsibilities toward tenants',
        importance: 'high',
        isUnionLaw: false,
        amendments: ['Varies by state', 'Subject to state legislation']
      },
      { 
        name: 'Registration Act, 1908', 
        sections: ['Section 17: Mandatory Registration'],
        description: 'Requires registration of rental agreements exceeding 11 months',
        year: '1908',
        importance: 'critical',
        isUnionLaw: true
      },
      { 
        name: 'Transfer of Property Act, 1882', 
        sections: ['Section 105-106: Lease Definitions', 'Section 108: Rights and Liabilities'],
        description: 'Defines the legal relationship between landlord and tenant',
        year: '1882',
        importance: 'critical',
        isUnionLaw: true
      },
      {
        name: 'Indian Stamp Act, 1899',
        sections: ['Stamp Duty Requirements'],
        description: 'Governs stamp duty requirements for rental agreements',
        year: '1899',
        importance: 'high',
        isUnionLaw: true,
        amendments: ['Multiple state amendments with varying rates']
      }
    ],
    stampDuty: 'As per Indian Stamp Act, 1899, varies by state from 0.5% to 5% of annual rent',
    courtCases: [
      'Saraswati Devi v. Delhi Development Authority (2010) - Established tenant rights',
      'Municipal Corporation of Delhi v. Tek Chand Bhatia - About reasonable rent increases',
      'Bhavya Garg v. Prateek Infraprojects - Regarding security deposit limits'
    ],
    additionalNotes: [
      'Required e-stamping in metropolitan cities',
      'Police verification requirements for rental agreements',
      'Digital signature validity in rental agreements as per IT Act, 2000',
      'Maximum security deposit limitations in certain states'
    ],
    registrationRequirements: 'Mandatory registration at Sub-Registrar\'s office for agreements exceeding 11 months',
    relevantForms: ['Form 49A for PAN verification', 'Form 60/61 if PAN not available'],
    enforcementConsiderations: [
      'Eviction procedures under state-specific rent control acts',
      'Maintenance responsibilities under Section 108 of Transfer of Property Act',
      'Notice period requirements for termination'
    ]
  },
  'Employment Contract': {
    acts: [
      { 
        name: 'Industrial Employment (Standing Orders) Act, 1946', 
        sections: ['Working Hours', 'Leave Rules'],
        description: 'Covers the essential terms of employment and employee conduct',
        year: '1946',
        importance: 'high',
        isUnionLaw: true,
        amendments: ['Industrial Employment (Standing Orders) Amendment Act, 2018']
      },
      { 
        name: 'Minimum Wages Act, 1948', 
        sections: ['Section 12: Payment of Minimum Wages'],
        description: 'Ensures payment of minimum wages to employees',
        year: '1948',
        importance: 'critical',
        isUnionLaw: true,
        amendments: ['Code on Wages, 2019 (not yet implemented)']
      },
      { 
        name: 'Shops and Establishments Act', 
        sections: ['Working Conditions', 'Employee Benefits'],
        description: 'State-specific regulations for commercial establishments',
        importance: 'high',
        isUnionLaw: false
      },
      {
        name: 'Employees Provident Fund Act, 1952',
        sections: ['Section 6: Contributions', 'Section 36: Penalties'],
        description: 'Mandatory provident fund requirements for eligible employees',
        year: '1952',
        importance: 'high',
        isUnionLaw: true,
        amendments: ['EPF Amendment Act, 2019']
      },
      {
        name: 'Maternity Benefit Act, 1961',
        sections: ['Section 5: Maternity Leave Duration', 'Section 8: Medical Bonus'],
        description: 'Maternity benefits for female employees',
        year: '1961', 
        importance: 'medium',
        isUnionLaw: true,
        amendments: ['Maternity Benefit (Amendment) Act, 2017']
      },
      {
        name: 'Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013',
        sections: ['Section 4: Internal Committee', 'Section 19: Employer Duties'],
        description: 'Prevention of sexual harassment at workplace',
        year: '2013',
        importance: 'high',
        isUnionLaw: true
      }
    ],
    courtCases: [
      'Workmen v. Hindustan Motors (1967) - Defined fair termination practices',
      'TK Rangarajan v. Government of Tamil Nadu (2003) - Regarding right to strike',
      'Vishaka v. State of Rajasthan (1997) - Sexual harassment guidelines pre-legislation',
      'Balmer Lawrie & Co. Ltd v. Partha Sarathi Sen Roy (2013) - On contractual employment'
    ],
    additionalNotes: [
      'Requirements for non-compete and non-solicitation clauses',
      'Maternity Benefit Act compliance for female employees',
      'Sexual Harassment of Women at Workplace Act compliance requirements',
      'Specific industry-based regulations may apply (IT/ITES, Manufacturing, etc.)',
      'Gratuity eligibility after 5 years of continuous service'
    ],
    registrationRequirements: 'Registration may be required under certain state-specific Shops and Establishments Acts',
    relevantForms: [
      'Form 5 for EPF registration',
      'Form 1 for ESI registration if applicable',
      'Professional Tax registration forms (state-specific)'
    ],
    enforcementConsiderations: [
      'Termination notice periods as per Industrial Disputes Act',
      'Overtime calculation as per Factories Act or Shops and Establishments Act',
      'Employee state insurance obligations',
      'Bonus payment requirements under Payment of Bonus Act'
    ]
  },
  'Non-Disclosure Agreement': {
    acts: [
      { 
        name: 'Indian Contract Act, 1872', 
        sections: ['Section 27: Restraint of Trade'],
        description: 'Governs the enforceability of restrictive covenants',
        year: '1872',
        importance: 'critical',
        isUnionLaw: true
      },
      { 
        name: 'Information Technology Act, 2000', 
        sections: ['Section 43A: Data Protection', 'Section 72: Breach of Confidentiality'],
        description: 'Covers penalties for disclosure of confidential information',
        year: '2000',
        importance: 'high',
        isUnionLaw: true,
        amendments: ['IT (Amendment) Act, 2008']
      },
      { 
        name: 'Indian Penal Code, 1860', 
        sections: ['Section 408: Criminal Breach of Trust'],
        description: 'Criminal penalties for violation of trust relationships',
        year: '1860',
        importance: 'medium',
        isUnionLaw: true
      },
      {
        name: 'Copyright Act, 1957',
        sections: ['Section 51: Infringement of Copyright'],
        description: 'Protection of confidential information that qualifies as copyrighted material',
        year: '1957',
        importance: 'medium',
        isUnionLaw: true,
        amendments: ['Copyright (Amendment) Act, 2012']
      },
      {
        name: 'Patents Act, 1970',
        sections: ['Section 118: Disclosure of Information'],
        description: 'Protection of patent-related confidential information',
        year: '1970',
        importance: 'medium',
        isUnionLaw: true,
        amendments: ['Patents (Amendment) Act, 2005']
      }
    ],
    courtCases: [
      'Taprogge Gesellschaft v. IAEC India Ltd (1988) - Set precedent for enforcement of confidentiality',
      'Niranjan Shankar Golikari v. The Century Spinning and Mfg. Co. Ltd. - On reasonable restrictions',
      'Mr. Diljeet Titus, Advocate v. Mr. Alfred A. Adebare and Others (2006) - Regarding client data',
      'American Express Bank Ltd. v. Priya Puri (2006) - About employee confidentiality obligations'
    ],
    additionalNotes: [
      'Requirements for digital information protection',
      'Trade secret protection under common law',
      'Jurisdiction clauses for international parties',
      'Data localization requirements for certain types of data',
      'Time limitations on confidentiality obligations',
      'Return or destruction of confidential information clauses'
    ],
    registrationRequirements: 'No mandatory registration requirements',
    relevantForms: [],
    enforcementConsiderations: [
      'Injunctive relief availability',
      'Liquidated damages clauses enforceability',
      'Reasonable temporal and geographic limitations',
      'Burden of proof for breach of confidentiality',
      'Cross-border enforceability issues'
    ]
  },
  'Will': {
    acts: [
      { 
        name: 'Indian Succession Act, 1925', 
        sections: [
          'Section 63: Execution of Will', 
          'Section 59: Person Capable of Making Will',
          'Section 67: Privileged Will',
          'Section 74: Revocation of Will',
          'Section 118: Power of Appointment by Will'
        ],
        description: 'Covers execution requirements and testamentary capacity',
        year: '1925',
        importance: 'critical',
        isUnionLaw: true,
        amendments: ['Indian Succession (Amendment) Act, 2002']
      },
      { 
        name: 'Registration Act, 1908', 
        sections: ['Section 18: Registration of Will'],
        description: 'Optional registration of wills for added validity',
        year: '1908',
        importance: 'medium',
        isUnionLaw: true
      },
      { 
        name: 'Hindu Succession Act, 1956', 
        sections: [
          'Section 30: Testamentary Succession',
          'Section 3: Definitions',
          'Section 6: Devolution of Interest'
        ],
        description: 'Governs succession for Hindus, Buddhists, Jains, and Sikhs',
        year: '1956',
        importance: 'high',
        isUnionLaw: true,
        amendments: ['Hindu Succession (Amendment) Act, 2005']
      },
      {
        name: 'Muslim Personal Law (Shariat) Application Act, 1937',
        sections: ['Sections 2 & 3: Application of Personal Law'],
        description: 'Applicable for Muslim testators',
        year: '1937',
        importance: 'high',
        isUnionLaw: true
      },
      {
        name: 'Indian Stamp Act, 1899',
        sections: ['Schedule I: Stamp Duty for Wills'],
        description: 'Stamp duty requirements for wills',
        year: '1899',
        importance: 'low',
        isUnionLaw: true,
        amendments: ['State-specific amendments with varying rates']
      }
    ],
    courtCases: [
      'Bharpur Singh v. Shamsher Singh (2009) - On testamentary capacity',
      'Mahesh Kumar v. Vinod Kumar (2012) - Regarding undue influence',
      'Kunwarjit Singh Panwar v. Karnail Singh (2007) - On execution requirements',
      'Mathai Samuel v. Eapen Eapen (2012) - Regarding interpretation of Will',
      'Rabindra Nath Mukherjee v. Panchanan Banerjee (1995) - On handwritten wills'
    ],
    additionalNotes: [
      'Requirements for attesting witnesses',
      'Probate process for high-value estates',
      'Exclusion of coparcenary property in Hindu Undivided Family',
      'Special considerations for agricultural land',
      'Limitations on bequest for Muslim testators (up to 1/3rd of estate)',
      'Video recording of will execution recommended for additional validity',
      'Concurrent wills in different jurisdictions for international assets'
    ],
    registrationRequirements: 'Registration optional but recommended at Sub-Registrar\'s office for enhanced validity',
    relevantForms: [
      'Form 287/149 for Probate (jurisdiction specific)',
      'Form II for Succession Certificate if applicable'
    ],
    enforcementConsiderations: [
      'Validity challenges on grounds of testamentary capacity',
      'Undue influence defenses',
      'Probate requirements for certain categories of assets',
      'Succession certificate requirements for debt collection',
      'Estate duty implications (though currently not enforced)'
    ]
  }
} as const;

// Enhanced fallback references with more comprehensive information
const FALLBACK_REFERENCES: LegalReference = {
  acts: [
    { 
      name: 'Indian Contract Act, 1872', 
      sections: ['Section 10: Valid Contracts', 'Section 23: Lawful Consideration', 'Section 28: Agreement in Restraint of Legal Proceedings'],
      description: 'Foundation for all contractual agreements in India',
      year: '1872',
      importance: 'critical',
      isUnionLaw: true
    },
    {
      name: 'General Clauses Act, 1897',
      sections: ['Section 3: Definitions', 'Section 6: Effect of Repeal', 'Section 27: Meaning of Service by Post'],
      description: 'Provides definitions and interpretation rules for legal documents',
      year: '1897',
      importance: 'medium',
      isUnionLaw: true
    },
    {
      name: 'Specific Relief Act, 1963',
      sections: ['Section 10: Specific Performance', 'Section 34: Declaratory Decrees', 'Section 38: Perpetual Injunction'],
      description: 'Covers remedies for breach of contracts and agreements',
      year: '1963',
      importance: 'high',
      isUnionLaw: true,
      amendments: ['Specific Relief (Amendment) Act, 2018']
    },
    {
      name: 'Limitation Act, 1963',
      sections: ['Section 3: Bar of Limitation', 'Schedule: Limitation Periods'],
      description: 'Prescribes time limits for legal actions',
      year: '1963',
      importance: 'medium',
      isUnionLaw: true
    }
  ],
  additionalNotes: [
    'Include standard force majeure clause',
    'Add jurisdiction clause for dispute resolution',
    'Include severability clause for document validity',
    'Add notices clause with communication methods',
    'Include waiver clause to prevent implied waivers',
    'Add amendment procedure clause',
    'Include entire agreement clause'
  ],
  enforcementConsiderations: [
    'Specific performance availability under Specific Relief Act',
    'Limitation periods for legal actions',
    'Alternative dispute resolution mechanisms',
    'Court jurisdiction selection considerations',
    'Liquidated damages vs. penalty considerations'
  ]
};

/**
 * Enhanced system prompt that provides comprehensive instructions
 * for generating legally sound documents with appropriate references.
 */
export const SYSTEM_PROMPT = `You are an expert Indian legal document generator with comprehensive knowledge of Indian law, legal frameworks, and document types. Your task is to generate precise, legally sound documents based on the provided parameters while incorporating relevant Indian legal references and citations.

Key Responsibilities:
1. Generate legally compliant documents following Indian law
2. Include relevant sections from Indian Acts and legal codes with proper citations
3. Maintain professional legal language while being understandable to ordinary citizens
4. Include all required legal disclaimers and notices as per Indian law
5. Format output in clean, well-structured markdown with proper citations
6. Adapt to state-specific laws when state information is provided

Document Type Expertise and Legal References:

For Rent Agreements:
- Reference Transfer of Property Act, 1882 for lease terms (essential)
- Include Registration Act requirements for properties over 11 months (mandatory)
- Cite relevant Rent Control Act sections for rent determination and security deposit terms
- Add stamp duty requirements as per state laws (varying by state)
- Include maintenance terms under Section 108 of Transfer of Property Act
- Add specific clauses for lock-in period, renewal terms, and eviction process
- Include electricity and water bill responsibility clauses
- Add property condition documentation and inventory requirements
- Reference relevant local municipal laws if applicable

For Employment Contracts:
- Reference Industrial Employment Act for working conditions (essential)
- Include Minimum Wages Act compliance statements
- Cite relevant labor laws and state-specific regulations
- Add PF/ESI requirements under respective acts (mandatory for eligible employees)
- Reference Shops and Establishment Act for working hours
- Add clear termination clauses with notice periods
- Include intellectual property and confidentiality clauses
- Reference specific industry regulations if applicable
- Add sexual harassment policy compliance statement
- Include leave policy and paid time off details

For Non-Disclosure Agreements:
- Reference Indian Contract Act, Section 27 for enforceability (essential)
- Include IT Act provisions for data protection and penalties
- Cite IPC sections for breach consequences
- Add jurisdiction clauses as per CPC
- Include specific definition of confidential information
- Add term and termination provisions
- Include provisions for return of confidential information
- Reference Copyright Act for intellectual property protection
- Add remedies clause for breach scenarios
- Include survival clauses for post-termination obligations

For Wills:
- Reference Indian Succession Act requirements (essential)
- Include Registration Act provisions for registration
- Cite relevant personal laws (Hindu/Muslim/Christian) based on religion
- Add witness requirements under Section 63 of Indian Succession Act
- Include clear distribution of assets with specific descriptions
- Add executor appointment and powers
- Include revocation clause for previous wills
- Reference taxation implications
- Add provisions for funeral wishes if requested
- Include residuary clause for unmentioned assets

Output Format Requirements:
1. Use proper Indian legal document structure with numbered sections and clauses
2. Include all necessary party information with proper Indian address format
3. Number all clauses and sub-clauses systematically (1.1, 1.2, etc.)
4. Add signature blocks with witness requirements 
5. Use markdown formatting for clean presentation with appropriate headers
6. Include relevant act citations in each section in proper legal citation format
7. Add date and place of execution

Special Considerations:
- Add state-specific legal requirements where state information is provided
- Include jurisdiction-specific stamp duty requirements
- Reference relevant Supreme Court judgments where applicable
- Add explanatory notes in brackets for complex legal terms
- Maintain bilingual terms where necessary (local language terms)
- Include alternative dispute resolution clauses as per Arbitration and Conciliation Act
- Add digital signature provisions where relevant
- Include schedules or annexures for additional information when needed
- Add disclaimers about seeking legal advice

Formatting Guidelines:
- Use markdown headers (# for title, ## for main sections, ### for subsections)
- Use bold (**text**) for important terms and defined terms
- Use lists for enumerated items
- Add horizontal rules (---) to separate major sections
- Use italics for citations and legal references
- Add placeholders in [BRACKETS] for items to be filled in later

IMPORTANT: If the request is for an "Other" document type or contains ambiguous instructions, generate a comprehensive general agreement covering basic elements common to most legal documents, with appropriate disclaimers.`;

/**
 * Enhanced contextual prompt generation with better error handling,
 * more detailed legal references, and fallback mechanisms.
 */
export const getContextualPrompt = (
  documentType: string,
  partyA: string,
  partyB: string,
  additionalDetails: string,
  specificDetails: string
): string => {
  try {
    // Validate inputs to prevent malformed prompts
    if (!validateInputs(documentType, partyA, partyB)) {
      console.warn("Warning: One or more inputs failed validation, using fallback mode");
      return generateFallbackPrompt(documentType, partyA, partyB, additionalDetails, specificDetails);
    }
    
    // Get document type info for better guidance
    const docTypeInfo = getDocumentTypeInfo(documentType);
    
    // Get legal references or fallback to basic references if not found
    const legalRefs = getLegalReferences(documentType);
    
    // Generate comprehensive legal references text
    const refsText = generateLegalReferencesText(legalRefs);

    // State detection for state-specific requirements
    const stateInfo = extractStateInformation(additionalDetails);
    const stateSpecificText = stateInfo ? `\nState-Specific Requirements for ${stateInfo}:\nPlease incorporate relevant laws and regulations specific to ${stateInfo}, including local stamp duty requirements and registration procedures.` : '';

    // Add document type specific guidance
    const docTypeGuidance = generateDocTypeGuidance(docTypeInfo);

    return `Based on the system context, generate a detailed and legally valid ${documentType} with the following specifications:

Primary Parties:
- Party A (First Party): ${formatPartyName(partyA)}
- Party B (Second Party): ${formatPartyName(partyB)}

${docTypeGuidance}

Additional Terms and Conditions:
${additionalDetails}${stateSpecificText}

Specific Requirements for this ${documentType}:
${specificDetails}

${refsText}

Please generate a comprehensive legal document that:
1. Follows all standard Indian legal formatting conventions
2. Includes all necessary clauses and sections with relevant Indian law citations
3. Incorporates all provided details and requirements
4. Uses clear and enforceable legal language with proper Indian legal terminology
5. Is formatted in markdown for clean presentation
6. Includes relevant sections from Indian legal codes and acts
7. Adds appropriate jurisdiction and stamp duty clauses
8. Provides clear definitions for all technical terms
9. Includes all mandatory clauses required by law
10. Adds explanatory notes where helpful for complex provisions

The document should be immediately usable with appropriate placeholders for dates, stamps, and signatures as per Indian law.

Make sure to incorporate specialized clauses based on the specific details provided, and add any necessary warnings or disclaimers relevant to this type of legal document.`;
  } catch (error) {
    console.error("Error generating contextual prompt:", error);
    // Fallback to a simplified prompt that can still generate a decent document
    return generateFallbackPrompt(documentType, partyA, partyB, additionalDetails, specificDetails);
  }
};

/**
 * Enhanced validation with more thorough checking.
 */
export const validateDocumentType = (type: string): boolean => {
  if (!type) return false;
  
  const validTypes = [...Object.keys(INDIAN_LEGAL_REFERENCES), 'Other'];
  return validTypes.includes(type);
};

/**
 * Validates all required inputs for prompt generation.
 */
function validateInputs(documentType: string, partyA: string, partyB: string): boolean {
  if (!validateDocumentType(documentType)) {
    return false;
  }
  
  // Basic validation of party names
  if (!partyA || partyA.trim() === '' || !partyB || partyB.trim() === '') {
    return false;
  }
  
  return true;
}

/**
 * Gets document type information or returns a default.
 */
function getDocumentTypeInfo(documentType: string): DocumentTypeInfo {
  return DOCUMENT_TYPES[documentType] || DOCUMENT_TYPES['Other'];
}

/**
 * Generates document type specific guidance based on document characteristics.
 */
function generateDocTypeGuidance(docTypeInfo: DocumentTypeInfo): string {
  let guidance = `Document Type: ${docTypeInfo.name} (${docTypeInfo.category})\n`;
  guidance += `Description: ${docTypeInfo.description}\n\n`;
  
  if (docTypeInfo.requiresNotarization) {
    guidance += "This document requires notarization for full legal effect.\n";
  }
  
  if (docTypeInfo.requiresRegistration) {
    guidance += "This document requires registration with appropriate authorities.\n";
  }
  
  if (docTypeInfo.validityPeriod) {
    guidance += `Typical validity period: ${docTypeInfo.validityPeriod}\n`;
  }
  
  return guidance;
}

/**
 * Gets legal references for a document type or returns fallback references.
 */
function getLegalReferences(documentType: string): LegalReference {
  try {
    const references = INDIAN_LEGAL_REFERENCES[documentType as keyof typeof INDIAN_LEGAL_REFERENCES];
    return references || FALLBACK_REFERENCES;
  } catch (error) {
    console.error("Error retrieving legal references:", error);
    return FALLBACK_REFERENCES;
  }
}

/**
 * Generates formatted legal references text from a LegalReference object with enhanced formatting.
 */
function generateLegalReferencesText(references: LegalReference): string {
  try {
    let text = "## Relevant Legal References:\n";
    
    // Add acts and sections
    if (references.acts && references.acts.length > 0) {
      text += "### Key Legislative Acts:\n";
      text += references.acts.map(act => {
        let actText = `- **${act.name}${act.year ? ` (${act.year})` : ''}**`;
        
        if (act.importance === 'critical') {
          actText += ' [ESSENTIAL]';
        }
        
        actText += `:\n  - ${act.sections.join('\n  - ')}`;
        
        if (act.description) {
          actText += `\n  - *${act.description}*`;
        }
        
        if (act.amendments && act.amendments.length > 0) {
          actText += `\n  - Amendments: ${act.amendments.join(', ')}`;
        }
        
        return actText;
      }).join('\n\n');
    }
    
    // Add stamp duty if available
    if (references.stampDuty) {
      text += `\n\n### Stamp Duty Requirements:\n- ${references.stampDuty}`;
    }
    
    // Add registration requirements if available
    if (references.registrationRequirements) {
      text += `\n\n### Registration Requirements:\n- ${references.registrationRequirements}`;
    }
    
    // Add court cases if available
    if (references.courtCases && references.courtCases.length > 0) {
      text += "\n\n### Relevant Court Cases:\n";
      text += references.courtCases.map(caseRef => `- ${caseRef}`).join('\n');
    }
    
    // Add enforcement considerations if available
    if (references.enforcementConsiderations && references.enforcementConsiderations.length > 0) {
      text += "\n\n### Enforcement Considerations:\n";
      text += references.enforcementConsiderations.map(consideration => `- ${consideration}`).join('\n');
    }
    
    // Add additional notes if available
    if (references.additionalNotes && references.additionalNotes.length > 0) {
      text += "\n\n### Additional Legal Considerations:\n";
      text += references.additionalNotes.map(note => `- ${note}`).join('\n');
    }
    
    // Add relevant forms if available
    if (references.relevantForms && references.relevantForms.length > 0) {
      text += "\n\n### Relevant Forms/Documentation:\n";
      text += references.relevantForms.map(form => `- ${form}`).join('\n');
    }
    
    return text;
  } catch (error) {
    console.error("Error generating legal references text:", error);
    // Return simplified fallback format
    return "Relevant Legal References: Including Indian Contract Act and other applicable legislation.";
  }
}

/**
 * Enhanced party name formatting with better entity detection.
 */
function formatPartyName(name: string): string {
  if (!name) return '[PARTY NAME]';
  
  try {
    // Remove extra spaces and normalize
    const cleanName = name.trim().replace(/\s+/g, ' ');
    
    // Check if likely a company or other entity
    const companyIndicators = [
      'Ltd', 'Limited', 'Pvt', 'Private', 'Inc', 'Incorporated', 
      'LLP', 'Corporation', 'Corp', 'Co.', 'Company', 'Trust', 
      'Foundation', 'Association', 'Society', 'Council', 'Organization'
    ];
    
    const isLikelyCompany = companyIndicators.some(indicator => 
      cleanName.includes(indicator) || 
      cleanName.toLowerCase().includes(indicator.toLowerCase())
    );
    
    if (isLikelyCompany) {
      return cleanName; // Preserve company name as is
    } else {
      // Capitalize each word for individual names
      return cleanName.split(' ').map(part => 
        part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      ).join(' ');
    }
  } catch (error) {
    console.error("Error formatting party name:", error);
    return name; // Return original name in case of error
  }
}

/**
 * Enhanced state information extraction with fuzzy matching
 * and support for abbreviations and variations.
 */
function extractStateInformation(details: string): string | null {
  try {
    if (!details) return null;
    
    const INDIAN_STATES = [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
      'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
      'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
      'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
      'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry'
    ];
    
    // Common abbreviations and alternative names
    const STATE_VARIATIONS: Record<string, string[]> = {
      'Delhi': ['NCT', 'New Delhi', 'NCR', 'Delhi NCR'],
      'Maharashtra': ['MH', 'Maha'],
      'Uttar Pradesh': ['UP'],
      'Madhya Pradesh': ['MP'],
      'Tamil Nadu': ['TN', 'Tamilnadu'],
      'West Bengal': ['WB'],
      'Jammu and Kashmir': ['J&K', 'JK'],
      'Karnataka': ['KA', 'Bangalore State'],
      'Rajasthan': ['RJ']
    };
    
    // First try direct state match
    const stateMatch = details.match(new RegExp(`\\b(${INDIAN_STATES.join('|')})\\b`, 'i'));
    if (stateMatch) return stateMatch[0];
    
    // Then try variations and abbreviations
    for (const [state, variations] of Object.entries(STATE_VARIATIONS)) {
      const variationMatch = details.match(new RegExp(`\\b(${variations.join('|')})\\b`, 'i'));
      if (variationMatch) return state;
    }
    
    // Check for "State:" or "State of" patterns
    const stateOfMatch = details.match(/state(?:\s+of|\s*:)\s+([A-Za-z\s]+)/i);
    if (stateOfMatch) {
      const potentialState = stateOfMatch[1].trim();
      // Find closest matching state
      for (const state of INDIAN_STATES) {
        if (state.toLowerCase().includes(potentialState.toLowerCase()) || 
            potentialState.toLowerCase().includes(state.toLowerCase())) {
          return state;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error extracting state information:", error);
    return null;
  }
}

/**
 * Enhanced fallback prompt generation that still provides solid document structure.
 */
function generateFallbackPrompt(
  documentType: string,
  partyA: string,
  partyB: string,
  additionalDetails: string,
  specificDetails: string
): string {
  try {
    const docType = documentType || 'Legal Agreement';
    const party1 = formatPartyName(partyA) || 'First Party';
    const party2 = formatPartyName(partyB) || 'Second Party';
    const details = additionalDetails || 'Standard terms and conditions to be included in the document.';
    const specifics = specificDetails || 'The document should follow standard legal formats and include all necessary clauses.';
    
    // State detection
    const stateInfo = extractStateInformation(additionalDetails);
    const stateSpecificText = stateInfo ? `\nThis document will be executed in ${stateInfo}. Please include relevant state-specific requirements and regulations.` : '';
    
    return `Generate a comprehensive legal ${docType} between ${party1} and ${party2}.

The document should be formatted in professional legal style using markdown and include the following elements:
- Title, date, and parties section
- Recitals/background section explaining the purpose
- Definitions of key terms
- Main obligations of each party
- Term and termination provisions
- Representations and warranties
- Governing law and jurisdiction
- Dispute resolution mechanisms
- Severability and entire agreement clauses
- Signature blocks with witness provisions

Include the following specific details:
- ${details}${stateSpecificText}
- ${specifics}

The document should incorporate standard legal clauses, proper formatting, and be valid under Indian law with appropriate references to relevant legislation like the Indian Contract Act, 1872 and other applicable laws.

Please add a disclaimer advising the parties to seek proper legal advice before signing.`;
  } catch (error) {
    console.error("Error generating fallback prompt:", error);
    // Ultimate fallback if everything else fails
    return `Generate a standard ${documentType || 'legal document'} between the parties with proper legal formatting and standard clauses.`;
  }
}

// Enhanced configuration for token management and temperature settings (GROQ-compatible)
export const GENERATION_CONFIG = {
  temperature: 0.7,      // Controls randomness: 0 = deterministic, 1 = creative
  top_p: 0.95,           // Nucleus sampling: consider tokens with top_p probability mass
  max_tokens: 4096,      // Maximum number of tokens to generate
  frequency_penalty: 0,  // Reduces repetition of token sequences
  presence_penalty: 0    // Reduces repetition of topics
} as const;

// Available GROQ models with detailed configurations
export const GROQ_MODELS = {
  PRIMARY: 'llama3-70b-8192',    // Llama 3 70B - more powerful model
  FALLBACK: 'llama3-8b-8192',    // Llama 3 8B - smaller, faster fallback
  BACKUP: 'mixtral-8x7b-32768'   // Mixtral 8x7B - alternative fallback
} as const;