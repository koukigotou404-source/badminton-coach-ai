
import React, { useState, useEffect } from 'react';
import { Header, Footer } from './components/Layout';
import { PracticeForm } from './components/PracticeForm';
import { MenuDisplay } from './components/MenuDisplay';
import { AuthModal } from './components/AuthModal';
import { PracticeMenu, Drill, PracticeSettings, User } from './types';
import { generatePracticeMenu } from './services/geminiService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [menu, setMenu] = useState<PracticeMenu | null>(null);
  const [savedDrills, setSavedDrills] = useState<Drill[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. ユーザーのセッション復元
  useEffect(() => {
    const savedUser = localStorage.getItem('badminton_coach_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to restore user session', e);
      }
    }
  }, []);

  // 2. ユーザーに関連付いたドリルのロード
  useEffect(() => {
    const storageKey = user ? `badminton_drills_${user.id}` : 'badminton_coach_drills';
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      try {
        setSavedDrills(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load drills', e);
        setSavedDrills([]);
      }
    } else {
      setSavedDrills([]);
    }
  }, [user]);

  // アカウント同期のシミュレーション
  const syncData = (drills: Drill[]) => {
    if (!user) return;
    setIsSyncing(true);
    // クラウドへの保存をシミュレート
    setTimeout(() => {
      localStorage.setItem(`badminton_drills_${user.id}`, JSON.stringify(drills));
      setIsSyncing(false);
    }, 800);
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('badminton_coach_user', JSON.stringify(newUser));
    setShowAuth(false);
  };

  const handleLogout = () => {
    if (window.confirm('ログアウトしますか？保存されていないデータは失われる可能性があります。')) {
      setUser(null);
      localStorage.removeItem('badminton_coach_user');
      setMenu(null);
      setError(null);
    }
  };

  const handleSaveDrill = (drill: Drill) => {
    const newDrills = [...savedDrills, drill];
    setSavedDrills(newDrills);
    if (user) {
      syncData(newDrills);
    } else {
      localStorage.setItem('badminton_coach_drills', JSON.stringify(newDrills));
    }
  };

  const handleUpdateDrill = (index: number, updatedDrill: Drill) => {
    const newDrills = [...savedDrills];
    newDrills[index] = updatedDrill;
    setSavedDrills(newDrills);
    if (user) {
      syncData(newDrills);
    } else {
      localStorage.setItem('badminton_coach_drills', JSON.stringify(newDrills));
    }
  };

  const handleDeleteSavedDrill = (index: number) => {
    const newDrills = savedDrills.filter((_, i) => i !== index);
    setSavedDrills(newDrills);
    if (user) {
      syncData(newDrills);
    } else {
      localStorage.setItem('badminton_coach_drills', JSON.stringify(newDrills));
    }
  };

  const handleAiSubmit = async (settings: PracticeSettings) => {
    setIsLoading(true);
    setError(null);
    try {
      const generatedMenu = await generatePracticeMenu(settings, savedDrills);
      setMenu(generatedMenu);
      scrollToResult();
    } catch (err: any) {
      setError(err.message || 'メニューの生成中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToResult = () => {
    setTimeout(() => {
      const resultEl = document.getElementById('practice-result');
      resultEl?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col font-['Noto_Sans_JP']">
      <Header 
        user={user} 
        onLogin={() => setShowAuth(true)} 
        onLogout={handleLogout}
        isSyncing={isSyncing}
      />
      
      {showAuth && (
        <AuthModal 
          onLogin={handleLogin} 
          onClose={() => setShowAuth(false)} 
        />
      )}

      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
            <h2 className="text-3xl md:text-5xl font-extrabold text-black tracking-tighter">
              バドミントン練習メニュー<br className="sm:hidden" /><span className="text-emerald-600">自動作成</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
              {user ? `${user.name}さんのマイライブラリを同期中。` : '自分だけのドリルを登録して、'}
              AIが最適な練習プランを構成します。
            </p>
          </div>

          {!user && (
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900">アカウントを連携しませんか？</h4>
                  <p className="text-sm text-emerald-700">登録すると、異なるデバイスでも自分のライブラリを読み込めます。</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAuth(true)}
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md flex-shrink-0"
              >
                アカウント連携を始める
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-12">
            <div className="max-w-3xl mx-auto w-full">
              <PracticeForm 
                onAiSubmit={handleAiSubmit}
                savedDrills={savedDrills}
                onSaveDrill={handleSaveDrill}
                onUpdateDrill={handleUpdateDrill}
                onDeleteSavedDrill={handleDeleteSavedDrill}
                isLoading={isLoading}
              />
            </div>

            {error && (
              <div className="max-w-2xl mx-auto w-full bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 animate-in shake-in duration-300">
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {menu && (
              <div id="practice-result">
                <MenuDisplay menu={menu} />
              </div>
            )}

            {!menu && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 max-w-4xl mx-auto w-full">
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">ドリルライブラリ</h3>
                  <p className="text-slate-600 leading-relaxed">普段の練習メニューを記録。カテゴリ別に整理され、いつでも編集や追加が可能です。</p>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">AI自動構成</h3>
                  <p className="text-slate-600 leading-relaxed">AIがあなたのライブラリを学習し、その日の気分や条件に最適な練習計画を提示します。</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;
