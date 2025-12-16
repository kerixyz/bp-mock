import { useState } from 'react';
import { ChatAgent } from './components/ChatAgent';
import { ProgressTracker } from './components/ProgressTracker';
import { RoleSelection } from './components/RoleSelection';
import { Header } from './components/Header';
import { Message, FormData, UserRole, EligibilityInfo } from './types';
import { delawareAssistSections } from './data/formSections';
import { processUserInput, initializeFlow } from './utils/flowEngine';

function App() {
  const [formData, setFormData] = useState<FormData>({
    userRole: null,
    currentSectionId: 'basic-info',
    currentFieldIndex: 0,
    currentFieldId: null,
    conversationState: 'awaiting_input',
    lastValidationError: null,
    sections: delawareAssistSections,
    eligibility: [],
  });

  const [messages, setMessages] = useState<Message[]>([]);

  const handleRoleSelection = (role: UserRole) => {
    const updatedFormData = { ...formData, userRole: role };
    setFormData(updatedFormData);

    // Get initial question using flow engine
    const initialQuestion = initializeFlow(updatedFormData);

    // Add welcome message based on role
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: role === 'self'
        ? `Hi! I'm here to help you apply for Delaware benefits. I'll guide you through the application step by step.\n\n${initialQuestion}`
        : `Hi! I'm here to help you apply for Delaware benefits on behalf of your parent. I'll guide you through the application step by step.\n\n${initialQuestion}`,
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

    // Process with flow engine
    setTimeout(() => {
      const result = processUserInput(content, formData);

      // Update form data
      setFormData(result.updatedFormData);

      // Create assistant response
      let responseContent = result.responseMessage;
      if (result.nextQuestion) {
        responseContent += `\n\n${result.nextQuestion}`;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update eligibility if on benefits section
      if (result.updatedFormData.currentSectionId === 'benefits-needed' ||
          result.updatedFormData.currentFieldId === 'benefit-types') {
        updateEligibility(result.updatedFormData);
      }
    }, 500);
  };

  const updateEligibility = (currentFormData: FormData) => {
    const benefitsSection = currentFormData.sections.find(s => s.id === 'benefits-needed');
    const benefitTypesField = benefitsSection?.fields.find(f => f.id === 'benefit-types');

    if (!benefitTypesField?.value) return;

    const selectedBenefits = Array.isArray(benefitTypesField.value)
      ? benefitTypesField.value
      : [benefitTypesField.value];

    const newEligibility: EligibilityInfo[] = selectedBenefits.map(benefit => ({
      program: benefit as string,
      eligible: null,
      reason: 'Processing eligibility based on your information...'
    }));

    setFormData(prev => ({
      ...prev,
      eligibility: newEligibility
    }));
  };

  // Show role selection if role not chosen yet
  if (!formData.userRole) {
    return <RoleSelection onSelectRole={handleRoleSelection} />;
  }

  // Main application layout
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header />

      <div className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* Left Panel - Chat */}
        <div className="w-1/2 rounded-lg shadow-lg overflow-hidden border border-gray-300 flex flex-col bg-white">
          <ChatAgent
            messages={messages}
            onSendMessage={handleSendMessage}
            disabled={false}
          />
        </div>

        {/* Right Panel - Progress */}
        <div className="w-1/2 rounded-lg shadow-lg overflow-hidden border border-gray-300 flex flex-col bg-white">
          <ProgressTracker
            sections={formData.sections}
            currentSectionId={formData.currentSectionId}
            eligibility={formData.eligibility}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
