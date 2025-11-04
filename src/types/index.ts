export type UserRole = 'self' | 'child-for-parent';

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
  value: string | number | boolean | null;
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
  sections: FormSection[];
  eligibility: EligibilityInfo[];
}
