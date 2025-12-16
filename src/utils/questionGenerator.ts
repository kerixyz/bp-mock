import { FormField, UserRole } from '../types';

export function generateQuestionForField(
  field: FormField,
  userRole: UserRole
): string {
  // Role-specific pronoun adjustment
  const pronoun = userRole === 'self' ? 'your' : 'their';
  const subject = userRole === 'self' ? 'you' : 'they';
  const possessive = userRole === 'self' ? 'yourself' : 'themselves';

  let question = '';

  switch (field.type) {
    case 'text':
      question = generateTextQuestion(field, pronoun);
      break;
    case 'number':
      question = generateNumberQuestion(field, pronoun, possessive);
      break;
    case 'date':
      question = generateDateQuestion(field, pronoun);
      break;
    case 'select':
    case 'radio':
      question = generateSelectQuestion(field, pronoun, subject);
      break;
    case 'checkbox':
      question = generateCheckboxQuestion(field, pronoun, subject);
      break;
    default:
      question = field.label + '?';
  }

  return question;
}

function generateTextQuestion(field: FormField, pronoun: string): string {
  switch (field.id) {
    case 'first-name':
      return `What is ${pronoun} first name?`;
    case 'last-name':
      return `What is ${pronoun} last name?`;
    default:
      return `${field.label}?`;
  }
}

function generateNumberQuestion(field: FormField, pronoun: string, possessive: string): string {
  switch (field.id) {
    case 'household-size':
      return `How many people live in ${pronoun} household, including ${possessive}?`;
    case 'monthly-income':
      return `What is the total monthly household income? Please include all sources such as wages, social security, disability benefits, unemployment, and other income.`;
    default:
      return `${field.label}?`;
  }
}

function generateDateQuestion(field: FormField, pronoun: string): string {
  if (field.id === 'date-of-birth') {
    return `What is ${pronoun} date of birth? (You can use formats like 01/15/1980 or January 15, 1980)`;
  }
  return `${field.label}?`;
}

function generateSelectQuestion(field: FormField, pronoun: string, subject: string): string {
  const optionsText = field.options?.join(', ') || '';

  switch (field.id) {
    case 'marital-status':
      return `What is ${pronoun} marital status? Available options: ${optionsText}`;
    case 'employment-status':
      return `What is ${pronoun} current employment status? You can choose from: ${optionsText}`;
    case 'housing-status':
      return `What is ${pronoun} current housing status? Options: ${optionsText}`;
    case 'has-dependents':
      return `Do ${subject} have any dependents? (Yes or No)`;
    case 'has-disability':
      return `Do ${subject} or anyone in the household have a disability? (Yes or No)`;
    case 'pregnant':
      return `Is anyone in the household currently pregnant? (Yes or No)`;
    default:
      if (field.options && field.options.length > 0) {
        return `${field.label}? Options: ${optionsText}`;
      }
      return `${field.label}?`;
  }
}

function generateCheckboxQuestion(
  field: FormField,
  pronoun: string,
  subject: string
): string {
  const optionsText = field.options?.join(', ') || '';

  switch (field.id) {
    case 'income-sources':
      return `What are ${pronoun} sources of income? You can list multiple, separated by commas. Available options: ${optionsText}`;
    case 'benefit-types':
      return `Which benefits would ${subject} like to apply for? You can select multiple by separating them with commas. Available: ${optionsText}`;
    default:
      return `${field.label}? You can select multiple by separating them with commas: ${optionsText}`;
  }
}

// Generate confirmation message after successful input
export function generateConfirmationMessage(
  field: FormField,
  value: string | number | boolean | string[]
): string {
  let displayValue: string;

  if (Array.isArray(value)) {
    displayValue = value.join(', ');
  } else if (typeof value === 'boolean') {
    displayValue = value ? 'Yes' : 'No';
  } else if (field.id === 'date-of-birth' && typeof value === 'string') {
    // Format date nicely
    const date = new Date(value);
    displayValue = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } else {
    displayValue = String(value);
  }

  return `Got it! ${field.label}: ${displayValue}`;
}
