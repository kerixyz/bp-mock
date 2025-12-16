import { FormData, FormField, FormSection, ValidationResult } from '../types';
import { generateQuestionForField, generateConfirmationMessage } from './questionGenerator';
import { validateFieldInput } from './validators';

export interface FlowState {
  currentSection: FormSection | null;
  currentField: FormField | null;
  nextQuestion: string | null;
  isComplete: boolean;
}

export interface ProcessResult {
  validation: ValidationResult;
  updatedFormData: FormData;
  responseMessage: string;
  nextQuestion: string | null;
}

// Get current flow state
export function getCurrentFlowState(formData: FormData): FlowState {
  const section = formData.sections.find(s => s.id === formData.currentSectionId);

  if (!section) {
    return {
      currentSection: null,
      currentField: null,
      nextQuestion: null,
      isComplete: true
    };
  }

  const field = section.fields[formData.currentFieldIndex];

  if (!field) {
    // Section complete, check if more sections exist
    const currentSectionIdx = formData.sections.findIndex(s => s.id === formData.currentSectionId);
    const hasMoreSections = currentSectionIdx < formData.sections.length - 1;

    return {
      currentSection: section,
      currentField: null,
      nextQuestion: hasMoreSections ? null : "That's all! Application complete.",
      isComplete: !hasMoreSections
    };
  }

  const question = generateQuestionForField(field, formData.userRole!);

  return {
    currentSection: section,
    currentField: field,
    nextQuestion: question,
    isComplete: false
  };
}

// Process user input and advance flow
export function processUserInput(
  userInput: string,
  formData: FormData
): ProcessResult {
  const flowState = getCurrentFlowState(formData);

  if (!flowState.currentField) {
    return {
      validation: { isValid: false, errorMessage: "No active field" },
      updatedFormData: formData,
      responseMessage: "Application is complete or there's an error.",
      nextQuestion: null
    };
  }

  // Validate input
  const validation = validateFieldInput(flowState.currentField, userInput);

  if (!validation.isValid) {
    // Validation failed - ask again with error message
    return {
      validation,
      updatedFormData: {
        ...formData,
        lastValidationError: validation.errorMessage || null,
        conversationState: 'awaiting_input'
      },
      responseMessage: validation.errorMessage || "Invalid input. Please try again.",
      nextQuestion: flowState.nextQuestion
    };
  }

  // Validation succeeded - update field value
  const updatedSections = formData.sections.map(section => {
    if (section.id !== formData.currentSectionId) return section;

    return {
      ...section,
      fields: section.fields.map(field => {
        if (field.id !== flowState.currentField!.id) return field;
        return { ...field, value: validation.parsedValue ?? null };
      })
    };
  });

  // Advance to next field
  const nextFieldIndex = formData.currentFieldIndex + 1;
  const currentSection = updatedSections.find(s => s.id === formData.currentSectionId)!;

  let nextSectionId = formData.currentSectionId;
  let nextIndex = nextFieldIndex;
  let sectionCompleted = false;

  // Check if section is complete
  if (nextFieldIndex >= currentSection.fields.length) {
    sectionCompleted = true;
    const currentSectionIdx = formData.sections.findIndex(s => s.id === formData.currentSectionId);
    const nextSectionIdx = currentSectionIdx + 1;

    if (nextSectionIdx < formData.sections.length) {
      nextSectionId = formData.sections[nextSectionIdx].id;
      nextIndex = 0;
    }
  }

  // Mark section as completed
  const finalSections = sectionCompleted
    ? updatedSections.map(s =>
        s.id === formData.currentSectionId ? { ...s, completed: true } : s
      )
    : updatedSections;

  const updatedFormData: FormData = {
    ...formData,
    sections: finalSections,
    currentSectionId: nextSectionId,
    currentFieldIndex: nextIndex,
    currentFieldId: flowState.currentField.id,
    lastValidationError: null,
    conversationState: 'processing'
  };

  // Generate response
  const confirmationMsg = generateConfirmationMessage(
    flowState.currentField,
    validation.parsedValue!
  );

  // Get next question
  const nextFlowState = getCurrentFlowState(updatedFormData);
  let nextQuestion = nextFlowState.nextQuestion;

  // Build response message
  let responseMessage = confirmationMsg;

  // Add section transition message
  if (sectionCompleted && !nextFlowState.isComplete) {
    const nextSection = finalSections.find(s => s.id === nextSectionId);
    responseMessage += `\n\nGreat! We've completed the "${currentSection.title}" section. Let's move on to "${nextSection?.title}".`;
  }

  // Add completion message
  if (nextFlowState.isComplete) {
    responseMessage += "\n\nCongratulations! You've completed the entire application. All your information has been recorded.";
    nextQuestion = null;
  }

  return {
    validation,
    updatedFormData,
    responseMessage,
    nextQuestion
  };
}

// Initialize flow (ask first question)
export function initializeFlow(formData: FormData): string {
  const flowState = getCurrentFlowState(formData);
  return flowState.nextQuestion || "Ready to start!";
}

// Get progress percentage
export function getProgressPercentage(formData: FormData): number {
  const totalSections = formData.sections.length;
  const completedSections = formData.sections.filter(s => s.completed).length;

  if (totalSections === 0) return 0;

  return Math.round((completedSections / totalSections) * 100);
}

// Check if application is complete
export function isApplicationComplete(formData: FormData): boolean {
  return formData.sections.every(section => section.completed);
}
