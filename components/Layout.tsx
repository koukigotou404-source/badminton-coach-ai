
import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogin, onLogout, isSyncing }) => (
  <header className="bg-emerald-600 text-white py-4 md:py-6 shadow-lg sticky top-0 z-40">
    <div className="container mx-auto px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-white p-2 rounded-full hidden sm:block">
          <svg className="w-6 h-6 md:w-8 md:h-8 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2zm0 13.5l-3.3 1.4 4.5-11 3.3 11-4.5-1.4z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Badminton Coach AI</h1>
          <p className="text-emerald-100 text-[10px] md:text-xs font-medium hidden sm:block">Professional Training & Sync Library</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold leading-none">{user.name}さん</span>
              <div className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-300'}`}></span>
                <span className="text-[10px] text-emerald-100 font-medium">{isSyncing ? '同期中...' : 'クラウド同期済み'}</span>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="group relative flex items-center gap-2"
            >
              <div className="w-10 h-10 bg-emerald-500 rounded-full border-2 border-emerald-400 overflow-hidden shadow-md group-hover:border-white transition-all">
                <img 
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=10b981&color=fff`} 
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute right-0 top-12 bg-white text-slate-800 text-xs px-3 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-bold">
                ログアウト
              </div>
            </button>
          </div>
        ) : (
          <button 
            onClick={onLogin}
            className="bg-white text-emerald-600 px-5 py-2 rounded-full font-bold text-sm shadow-md hover:bg-emerald-50 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            アカウント作成・ログイン
          </button>
        )}
      </div>
    </div>
  </header>
);

export const Footer: React.FC = () => (
  <footer className="bg-slate-900 text-slate-400 py-8 mt-12">
    <div className="container mx-auto px-4 text-center">
      <p className="text-sm">© 2024 Badminton Coach AI. アカウント連携でデータをどこでも管理。</p>
    </div>
  </footer>
);
