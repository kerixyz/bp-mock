import { FileText } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-blue-700 text-white py-4 px-6 shadow-md">
      <div className="flex items-center gap-3">
        <FileText size={32} />
        <div>
          <h1 className="text-2xl font-bold">Delaware Benefits Assistance</h1>
          <p className="text-sm text-blue-100">SNAP & WIC Application Helper</p>
        </div>
      </div>
    </header>
  );
};
