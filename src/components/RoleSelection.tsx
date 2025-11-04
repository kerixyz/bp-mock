import React from 'react';
import { UserRole } from '../types';
import { User, Users } from 'lucide-react';

interface RoleSelectionProps {
  onSelectRole: (role: UserRole) => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Delaware ASSIST Form Helper
          </h1>
          <p className="text-gray-600">
            Let's get started! First, tell us who you're applying for.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Self Application */}
          <button
            onClick={() => onSelectRole('self')}
            className="group p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
              <User size={32} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              I'm applying for myself
            </h3>
            <p className="text-gray-600 text-sm">
              Select this if you are applying for benefits for yourself or your immediate family.
            </p>
          </button>

          {/* Parent Application */}
          <button
            onClick={() => onSelectRole('child-for-parent')}
            className="group p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 group-hover:bg-green-200 transition-colors">
              <Users size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              I'm applying for a parent
            </h3>
            <p className="text-gray-600 text-sm">
              Select this if you are helping a parent or guardian apply for benefits.
            </p>
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> This information helps us tailor the questions and guidance to your specific situation. You can change this later if needed.
          </p>
        </div>
      </div>
    </div>
  );
};
