
import React, { useState, useEffect } from 'react';
import { Header, Footer } from './components/Layout';
import { PracticeForm } from './components/PracticeForm';
import { MenuDisplay } from './components/MenuDisplay';
import { PracticeMenu, Drill, PracticeSettings } from './types';
import { generatePracticeMenu } from './services/geminiService';

const App: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [menu, setMenu] = useState<PracticeMenu | null>(null);
  const [savedDrills, setSavedDrills] = useState<Drill[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved drills from local storage
  useEffect(() => {
    const saved = localStorage.getItem('badminton_coach_drills');
    if (saved) {
      try {
        setSavedDrills(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved drills', e);
      }
    }
  }, []);

  const handleSaveDrill = (drill: Drill) => {
    const newDrills = [...savedDrills, drill];
    setSavedDrills(newDrills);
    localStorage.setItem('badminton_coach_drills', JSON.stringify(newDrills));
  };

  const handleUpdateDrill = (index: number, updatedDrill: Drill) => {
    const newDrills = [...savedDrills];
    newDrills[index] = updatedDrill;
    setSavedDrills(newDrills);
    localStorage.setItem('badminton_coach_drills', JSON.stringify(newDrills));
  };

  const handleDeleteSavedDrill = (index: number) => {
    const newDrills = savedDrills.filter((_, i) => i !== index);
    setSavedDrills(newDrills);
    localStorage.setItem('badminton_coach_drills', JSON.stringify(newDrills));
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
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-black">
              バドミントン練習プラン作成ツール
            </h2>
            <p className="text-lg text-black max-w-2xl mx-auto font-medium">
              自分だけのドリルライブラリを構築し、
              AIがあなたのライブラリから最適な練習プランを自動構成します。
            </p>
          </div>

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
              <div className="max-w-2xl mx-auto w-full bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
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
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-black mb-2">ドリルライブラリ</h3>
                  <p className="text-black text-sm">よく行う練習を保存。AIはここから最適なドリルを抽出し、時間配分を考えてメニューを組みます。</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-black mb-2">AI自動構成</h3>
                  <p className="text-black text-sm">「AIにおまかせ」機能を使えば、あなたのライブラリを解析して練習メニューを数秒で作成します。</p>
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
