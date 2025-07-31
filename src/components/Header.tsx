import React from 'react';
import { Shield, Eye } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="relative">
            <Shield className="h-10 w-10 text-blue-100" />
            <Eye className="h-5 w-5 text-yellow-300 absolute -top-1 -right-1" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              AccessAudit Pro
            </h1>
            <p className="text-blue-100 text-sm mt-1 font-medium">
              Making the web accessible for everyone
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;