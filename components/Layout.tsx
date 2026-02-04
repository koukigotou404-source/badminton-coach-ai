
import React from 'react';

export const Header: React.FC = () => (
  <header className="bg-emerald-600 text-white py-6 shadow-lg">
    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
      <div className="flex items-center gap-3 mb-4 md:mb-0">
        <div className="bg-white p-2 rounded-full">
          <svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2zm0 13.5l-3.3 1.4 4.5-11 3.3 11-4.5-1.4z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Badminton Coach AI</h1>
      </div>
      <p className="text-emerald-100 font-medium">プロフェッショナルな練習メニューをAIが提案</p>
    </div>
  </header>
);

export const Footer: React.FC = () => (
  <footer className="bg-slate-900 text-slate-400 py-8 mt-12">
    <div className="container mx-auto px-4 text-center">
      <p>© 2024 Badminton Coach AI. All rights reserved.</p>
    </div>
  </footer>
);
