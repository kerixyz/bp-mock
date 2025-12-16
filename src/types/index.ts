export type UserRole = 'self' | 'child-for-parent';

export type ConversationState = 'awaiting_input' | 'validating' | 'processing';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface FormSection {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  completed: boolean;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'radio' | 'checkbox' | 'date';
  value: string | number | boolean | string[] | null;
  options?: string[];
  required: boolean;
}

export interface EligibilityInfo {
  program: string;
  eligible: boolean | null; // null = unknown
  reason?: string;
}

export interface FormData {
  userRole: UserRole | null;
  currentSectionId: string;
  currentFieldIndex: number;
  currentFieldId: string | null;
  conversationState: ConversationState;
  lastValidationError: string | null;
  sections: FormSection[];
  eligibility: EligibilityInfo[];
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  parsedValue?: string | number | boolean | string[] | null;
}
