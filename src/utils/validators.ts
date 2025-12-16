import { FormField } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  parsedValue?: string | number | boolean | string[];
}

// Main validation dispatcher
export function validateFieldInput(
  field: FormField,
  userInput: string
): ValidationResult {
  const trimmedInput = userInput.trim();

  if (!trimmedInput && field.required) {
    return { isValid: false, errorMessage: "This field is required. Please provide an answer." };
  }

  if (!trimmedInput && !field.required) {
    return { isValid: true, parsedValue: '' };
  }

  switch (field.type) {
    case 'text':
      return validateText(trimmedInput);
    case 'number':
      return validateNumber(trimmedInput, field);
    case 'date':
      return validateDate(trimmedInput, field);
    case 'select':
      return validateSelect(trimmedInput, field);
    case 'radio':
      return validateRadio(trimmedInput, field);
    case 'checkbox':
      return validateCheckbox(trimmedInput, field);
    default:
      return { isValid: false, errorMessage: "Unknown field type" };
  }
}

// Text validation (for first-name, last-name)
function validateText(input: string): ValidationResult {
  // Generic text validation
  if (input.length < 1) {
    return { isValid: false, errorMessage: "This field cannot be empty" };
  }

  if (input.length > 100) {
    return { isValid: false, errorMessage: "Please enter a shorter value (max 100 characters)" };
  }

  return { isValid: true, parsedValue: input };
}

// Number validation (for household-size, monthly-income)
function validateNumber(input: string, field: FormField): ValidationResult {
  const num = parseFloat(input);

  if (isNaN(num)) {
    return {
      isValid: false,
      errorMessage: "Please enter a valid number"
    };
  }

  if (field.id === 'household-size') {
    if (num < 1 || num > 20 || !Number.isInteger(num)) {
      return {
        isValid: false,
        errorMessage: "Household size must be a whole number between 1 and 20"
      };
    }
  }

  if (field.id === 'monthly-income') {
    if (num < 0) {
      return {
        isValid: false,
        errorMessage: "Income cannot be negative. Enter 0 if there is no income."
      };
    }
    if (num > 999999) {
      return {
        isValid: false,
        errorMessage: "Please enter a realistic income amount"
      };
    }
  }

  return { isValid: true, parsedValue: num };
}

// Date validation (for date-of-birth)
function validateDate(input: string, field: FormField): ValidationResult {
  const date = parseDate(input);

  if (!date) {
    return {
      isValid: false,
      errorMessage: "Please enter a valid date (e.g., 01/15/1980 or January 15, 1980)"
    };
  }

  if (field.id === 'date-of-birth') {
    const now = new Date();
    const age = now.getFullYear() - date.getFullYear();

    if (date > now) {
      return {
        isValid: false,
        errorMessage: "Birth date cannot be in the future"
      };
    }

    if (age < 0 || age > 120) {
      return {
        isValid: false,
        errorMessage: "Please enter a realistic birth date"
      };
    }
  }

  return { isValid: true, parsedValue: date.toISOString().split('T')[0] };
}

// Select/Radio validation with fuzzy matching
function validateSelect(input: string, field: FormField): ValidationResult {
  if (!field.options || field.options.length === 0) {
    return { isValid: false, errorMessage: "No options available" };
  }

  const match = fuzzyMatchOption(input, field.options);

  if (!match) {
    return {
      isValid: false,
      errorMessage: `I didn't recognize that option. Please choose from: ${field.options.join(', ')}`
    };
  }

  return { isValid: true, parsedValue: match };
}

function validateRadio(input: string, field: FormField): ValidationResult {
  return validateSelect(input, field);
}

// Checkbox validation (multiple selections)
function validateCheckbox(input: string, field: FormField): ValidationResult {
  if (!field.options || field.options.length === 0) {
    return { isValid: false, errorMessage: "No options available" };
  }

  // Split input by commas, "and", or line breaks
  const inputParts = input
    .split(/,|\band\b|\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (inputParts.length === 0) {
    return {
      isValid: false,
      errorMessage: "Please select at least one option"
    };
  }

  const matches: string[] = [];
  const unmatched: string[] = [];

  for (const part of inputParts) {
    const match = fuzzyMatchOption(part, field.options);
    if (match) {
      if (!matches.includes(match)) {
        matches.push(match);
      }
    } else {
      unmatched.push(part);
    }
  }

  if (matches.length === 0) {
    return {
      isValid: false,
      errorMessage: `Please choose from: ${field.options.join(', ')}`
    };
  }

  if (unmatched.length > 0) {
    return {
      isValid: false,
      errorMessage: `I didn't recognize: "${unmatched.join(', ')}". Available options: ${field.options.join(', ')}`
    };
  }

  return { isValid: true, parsedValue: matches };
}

// Fuzzy matching helper (case-insensitive, partial match)
export function fuzzyMatchOption(input: string, options: string[]): string | null {
  const lowerInput = input.toLowerCase().trim();

  if (!lowerInput) return null;

  // 1. Exact match
  for (const option of options) {
    if (option.toLowerCase() === lowerInput) {
      return option;
    }
  }

  // 2. Partial match (input is contained in option)
  for (const option of options) {
    const lowerOption = option.toLowerCase();
    if (lowerOption.includes(lowerInput)) {
      return option;
    }
  }

  // 3. Reverse partial match (option is contained in input)
  for (const option of options) {
    const lowerOption = option.toLowerCase();
    if (lowerInput.includes(lowerOption)) {
      return option;
    }
  }

  // 4. Keyword matching (for complex options like "Employed Full-time")
  for (const option of options) {
    const keywords = option.toLowerCase().split(/[\s\-()]+/).filter(k => k.length > 2);
    const inputWords = lowerInput.split(/[\s\-()]+/).filter(k => k.length > 2);

    // Check if any significant keyword matches
    for (const keyword of keywords) {
      for (const inputWord of inputWords) {
        if (keyword.includes(inputWord) || inputWord.includes(keyword)) {
          return option;
        }
      }
    }
  }

  return null;
}

// Date parsing helper
function parseDate(input: string): Date | null {
  // Try MM/DD/YYYY format first
  const slashMatch = input.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (slashMatch) {
    const month = parseInt(slashMatch[1]) - 1;
    const day = parseInt(slashMatch[2]);
    const year = parseInt(slashMatch[3]);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime()) && date.getMonth() === month) {
      return date;
    }
  }

  // Try YYYY-MM-DD format
  const dashMatch = input.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (dashMatch) {
    const year = parseInt(dashMatch[1]);
    const month = parseInt(dashMatch[2]) - 1;
    const day = parseInt(dashMatch[3]);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime()) && date.getMonth() === month) {
      return date;
    }
  }

  // Try standard Date parsing (handles natural language like "January 15, 1980")
  const date = new Date(input);
  if (!isNaN(date.getTime())) {
    return date;
  }

  return null;
}
