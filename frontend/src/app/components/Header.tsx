'use client';
import { Shield, Code, History, BookOpen, Settings } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-[#0d1117] border-b border-[#1e2a3a] px-6 py-3 flex items-center gap-8">
      <div className="flex items-center gap-2">
        <Shield className="text-white w-6 h-6" />
        <span className="text-white font-medium">Guest</span>
      </div>
      <nav className="flex items-center gap-6">
        {[
          { icon: <Code className="w-4 h-4" />, label: 'Code', active: true },
          { icon: <History className="w-4 h-4" />, label: 'History' },
          { icon: <BookOpen className="w-4 h-4" />, label: 'User Guide' },
          { icon: <Settings className="w-4 h-4" />, label: 'Settings' },
        ].map(({ icon, label, active }) => (
          <button
            key={label}
            className={`flex items-center gap-1.5 text-sm pb-1 ${
              active
                ? 'text-white border-b-2 border-orange-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>
    </header>
  );
}