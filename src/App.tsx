import React, { useState } from 'react';
import { ChatAgent } from './components/ChatAgent';
import { ProgressTracker } from './components/ProgressTracker';
import { RoleSelection } from './components/RoleSelection';
import { Message, FormData, UserRole, EligibilityInfo } from './types';
import { delawareAssistSections } from './data/formSections';

function App() {
  const [formData, setFormData] = useState<FormData>({
    userRole: null,
    currentSectionId: 'basic-info',
    sections: delawareAssistSections,
    eligibility: [],
  });

  const [messages, setMessages] = useState<Message[]>([]);

  const handleRoleSelection = (role: UserRole) => {
    setFormData((prev) => ({ ...prev, userRole: role }));

    // Add welcome message based on role
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: role === 'self'
        ? "Hi! I'm here to help you apply for Delaware ASSIST benefits. I'll guide you through the application process step by step. Let's start with some basic information. What's your first name?"
        : "Hi! I'm here to help you apply for Delaware ASSIST benefits on behalf of your parent. I'll guide you through the application process step by step. Let's start with some basic information about the person you're applying for. What's their first name?",
      timestamp: new Date(),
    };

    setMessages([welcomeMessage]);
  };

  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simple AI response logic (in a real app, this would be more sophisticated)
    setTimeout(() => {
      const assistantMessage = generateAssistantResponse(content, formData);
      setMessages((prev) => [...prev, assistantMessage]);

      // Update eligibility based on conversation
      updateEligibility(content);
    }, 500);
  };

  const generateAssistantResponse = (userInput: string, currentFormData: FormData): Message => {
    const input = userInput.toLowerCase();

    // Simple pattern matching for demo purposes
    let response = '';

    // Check for income-related questions
    if (input.includes('income') || input.includes('money') || input.includes('earn')) {
      response = "For income information, I'll need to know your total monthly household income. This includes wages, social security, disability benefits, unemployment, child support, and any other sources of income. What is your total monthly household income?";
    }
    // Check for household questions
    else if (input.includes('household') || input.includes('family') || input.includes('people')) {
      response = "I'll need to know about your household composition. How many people live in your household, including yourself?";
    }
    // Check for benefits questions
    else if (input.includes('benefit') || input.includes('assistance') || input.includes('help')) {
      response = "Delaware ASSIST offers several types of benefits:\n\n• Food Assistance (SNAP)\n• Cash Assistance (TANF)\n• Medical Assistance (Medicaid)\n• Child Care Assistance\n• Energy Assistance (LIHEAP)\n• General Assistance\n\nWhich type of assistance are you interested in?";
    }
    // Check for eligibility questions
    else if (input.includes('eligible') || input.includes('qualify')) {
      response = "Eligibility depends on several factors including household size, income, and the specific benefits you're applying for. Let me help you gather the information needed to determine your eligibility. Can you tell me about your current employment status?";
    }
    // Default response
    else {
      response = "Thank you for that information. Let me help you with the next section of the application. ";

      const currentSection = currentFormData.sections.find(s => s.id === currentFormData.currentSectionId);
      if (currentSection) {
        response += `We're currently working on the "${currentSection.title}" section. ${currentSection.description}.`;
      }
    }

    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };
  };

  const updateEligibility = (userInput: string) => {
    const input = userInput.toLowerCase();
    const newEligibility: EligibilityInfo[] = [];

    // Simple eligibility logic based on keywords
    if (input.includes('unemployed') || input.includes('no job')) {
      newEligibility.push({
        program: 'Cash Assistance (TANF)',
        eligible: null,
        reason: 'May be eligible - unemployment mentioned. Need income details.',
      });
      newEligibility.push({
        program: 'Food Assistance (SNAP)',
        eligible: null,
        reason: 'Likely eligible - low income situation indicated.',
      });
    }

    if (input.includes('child') || input.includes('kid')) {
      newEligibility.push({
        program: 'Child Care Assistance',
        eligible: null,
        reason: 'May be eligible - household includes children.',
      });
    }

    if (input.includes('medical') || input.includes('health') || input.includes('doctor')) {
      newEligibility.push({
        program: 'Medical Assistance (Medicaid)',
        eligible: null,
        reason: 'May be eligible - need income and household size info.',
      });
    }

    if (newEligibility.length > 0) {
      setFormData((prev) => ({
        ...prev,
        eligibility: [...prev.eligibility, ...newEligibility.filter(
          ne => !prev.eligibility.some(e => e.program === ne.program)
        )],
      }));
    }
  };

  // Show role selection if role not chosen yet
  if (!formData.userRole) {
    return <RoleSelection onSelectRole={handleRoleSelection} />;
  }

  // Main application layout
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Chat */}
      <div className="w-1/2 border-r border-gray-300 flex flex-col">
        <ChatAgent
          messages={messages}
          onSendMessage={handleSendMessage}
          disabled={false}
        />
      </div>

      {/* Right Sidebar - Progress */}
      <div className="w-1/2 flex flex-col">
        <ProgressTracker
          sections={formData.sections}
          currentSectionId={formData.currentSectionId}
          eligibility={formData.eligibility}
        />
      </div>
    </div>
  );
}

export default App;
