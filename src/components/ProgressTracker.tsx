import React from 'react';
import { FormSection, EligibilityInfo } from '../types';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface ProgressTrackerProps {
  sections: FormSection[];
  currentSectionId: string;
  eligibility: EligibilityInfo[];
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  sections,
  currentSectionId,
  eligibility,
}) => {
  const completedCount = sections.filter((s) => s.completed).length;
  const progressPercentage = (completedCount / sections.length) * 100;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-800">Application Progress</h2>
        <div className="mt-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Overall Progress</span>
            <span>{completedCount} of {sections.length} sections</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Form Sections</h3>
          {sections.map((section) => {
            const isCurrent = section.id === currentSectionId;
            return (
              <div
                key={section.id}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50'
                    : section.completed
                    ? 'border-green-200 bg-white'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    {section.completed ? (
                      <CheckCircle2 size={20} className="text-green-600" />
                    ) : isCurrent ? (
                      <Circle size={20} className="text-blue-600 fill-blue-600" />
                    ) : (
                      <Circle size={20} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium text-sm ${
                      isCurrent ? 'text-blue-900' : 'text-gray-800'
                    }`}>
                      {section.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">{section.description}</p>
                    {isCurrent && (
                      <div className="mt-2 text-xs text-blue-600 font-medium">
                        Currently filling...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Eligibility Status */}
        {eligibility.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Potential Eligibility</h3>
            <div className="space-y-2">
              {eligibility.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    item.eligible === true
                      ? 'bg-green-50 border-green-200'
                      : item.eligible === false
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle
                      size={16}
                      className={`mt-0.5 ${
                        item.eligible === true
                          ? 'text-green-600'
                          : item.eligible === false
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.program}</p>
                      {item.reason && (
                        <p className="text-xs text-gray-600 mt-1">{item.reason}</p>
                      )}
                      {item.eligible === null && (
                        <p className="text-xs text-gray-600 mt-1">
                          Need more information to determine eligibility
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
