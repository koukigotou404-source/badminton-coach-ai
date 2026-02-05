
import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  isSyncing: boolean;
  onOpenLibrary: () => void;
  onOpenSocial: () => void;
  savedMenusCount: number;
  unreadMessagesCount: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, 
  onLogin, 
  onLogout, 
  onOpenProfile,
  isSyncing, 
  onOpenLibrary, 
  onOpenSocial,
  savedMenusCount,
  unreadMessagesCount
}) => (
  <header className="bg-slate-900 text-white py-6 md:py-8 shadow-[0_20px_50px_rgba(0,0,0,0.2)] sticky top-0 z-40 border-b border-white/5 backdrop-blur-md bg-slate-900/95">
    <div className="container mx-auto px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="bg-emerald-500 p-2.5 rounded-2xl shadow-lg shadow-emerald-500/20 hidden sm:block">
          <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2zm0 13.5l-3.3 1.4 4.5-11 3.3 11-4.5-1.4z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase leading-none">Badminton Coach AI</h1>
          <p className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mt-1 hidden sm:block opacity-60">Sync Professional Training</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 md:gap-4">
        {/* Social Button */}
        <button 
          onClick={onOpenSocial}
          className="relative bg-white/5 hover:bg-white/10 px-4 py-2.5 md:px-6 md:py-3.5 rounded-2xl transition-all border border-white/10 flex items-center gap-4 group shadow-xl active:scale-95"
        >
          <div className="bg-slate-700 p-2 rounded-xl group-hover:bg-slate-600 transition-colors">
            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="text-left leading-tight hidden lg:block">
            <div className="font-black text-sm tracking-tight">ソーシャル</div>
            <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Community</div>
          </div>
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-xl animate-bounce border-2 border-slate-900">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        {/* Library Button */}
        <button 
          onClick={onOpenLibrary}
          className="relative bg-white/5 hover:bg-white/10 px-4 py-2.5 md:px-6 md:py-3.5 rounded-2xl transition-all border border-white/10 flex items-center gap-4 group shadow-xl active:scale-95"
        >
          <div className="bg-slate-700 p-2 rounded-xl group-hover:bg-slate-600 transition-colors">
            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <div className="text-left leading-tight hidden lg:block">
            <div className="font-black text-sm tracking-tight">ライブラリ</div>
            <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Saved Plans</div>
          </div>
          {savedMenusCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-white text-slate-900 text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-xl animate-in zoom-in duration-300 border-2 border-slate-900">
              {savedMenusCount}
            </span>
          )}
        </button>

        <div className="h-10 w-px bg-white/10 mx-2 hidden md:block"></div>

        {user ? (
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={onOpenProfile}
              className="w-12 h-12 bg-slate-800 rounded-2xl border-2 border-slate-700 overflow-hidden shadow-2xl hover:border-emerald-500 transition-all group relative active:scale-95"
            >
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=334155&color=fff`} 
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </button>
            <button 
              onClick={onLogout}
              className="p-3 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-2xl border border-white/10 shadow-lg active:scale-95"
              title="ログアウト"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        ) : (
          <button 
            onClick={onLogin}
            className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-2xl shadow-emerald-600/30 hover:bg-emerald-500 transition-all active:scale-95 uppercase tracking-widest"
          >
            ログイン
          </button>
        )}
      </div>
    </div>
  </header>
);

export const Footer: React.FC = () => (
  <footer className="bg-slate-900 text-slate-500 py-16 mt-20 border-t border-white/5">
    <div className="container mx-auto px-6 text-center space-y-4">
      <div className="font-black text-white text-xl tracking-tighter uppercase">Badminton Coach AI</div>
      <p className="text-xs font-black uppercase tracking-[0.3em] opacity-50">Empowering your training with intelligence.</p>
      <div className="pt-8 text-[10px] font-bold opacity-30">© 2024 BC AI. ALL RIGHTS RESERVED.</div>
    </div>
  </footer>
);
