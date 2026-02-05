
import React, { useState } from 'react';
import { PracticeMenu, SavedMenu } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  savedMenus: SavedMenu[];
  onDeleteMenu: (id: string) => void;
  onLoadMenu: (menu: PracticeMenu) => void;
}

export const LibraryPanel: React.FC<Props> = ({ isOpen, onClose, savedMenus, onDeleteMenu, onLoadMenu }) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'import'>('saved');
  const [importCode, setImportCode] = useState('');

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importCode.trim()) return;
    try {
      const decoded = decodeURIComponent(escape(atob(importCode.trim())));
      const parsedMenu = JSON.parse(decoded);
      if (parsedMenu && parsedMenu.drills) {
        onLoadMenu(parsedMenu);
        setImportCode('');
        onClose();
        alert('メニューを読み込みました！');
      }
    } catch (e) {
      alert('無効なメニューコードです。');
    }
  };

  const getMenuCode = (menu: PracticeMenu) => {
    const jsonStr = JSON.stringify(menu);
    return btoa(unescape(encodeURIComponent(jsonStr)));
  };

  const handleCopyCode = (menu: PracticeMenu) => {
    navigator.clipboard.writeText(getMenuCode(menu)).then(() => {
      alert('メニューコードをコピーしました！');
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* 背景オーバーレイ */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* サイドパネル */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
        <div className="p-6 border-b flex flex-col bg-slate-50">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              練習ライブラリ
            </h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-[11px] font-bold text-slate-400 ml-8">お気に入りメニューの管理と外部メニューの読込</p>
        </div>

        <div className="flex border-b bg-white">
          <button 
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-4 font-bold text-sm transition-all border-b-2 flex flex-col items-center justify-center ${activeTab === 'saved' ? 'border-emerald-500 text-emerald-600 bg-emerald-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
          >
            <span>保存済み</span>
            <span className="text-[9px] opacity-60 font-medium">マイメニュー {savedMenus.length}</span>
          </button>
          <button 
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-4 font-bold text-sm transition-all border-b-2 flex flex-col items-center justify-center ${activeTab === 'import' ? 'border-emerald-500 text-emerald-600 bg-emerald-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
          >
            <span>コード読込</span>
            <span className="text-[9px] opacity-60 font-medium">共有された練習を復元</span>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 sm:p-6 bg-slate-50">
          {activeTab === 'saved' ? (
            <div className="space-y-4">
              <div className="px-2 pb-2">
                <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 leading-relaxed">
                  <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" />
                  </svg>
                  作成したメニューの「保存する」ボタンを押すとここに追加されます。
                </p>
              </div>
              {savedMenus.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-slate-400 text-sm font-bold leading-relaxed">
                    保存されたメニューは<br/>まだありません。
                  </p>
                </div>
              ) : (
                savedMenus.map((menu) => (
                  <div key={menu.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900">{menu.title}</h4>
                        <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">
                          {new Date(menu.savedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-full border border-emerald-100">
                        強度 {menu.intensityScore}
                      </span>
                    </div>
                    <div className="flex gap-2 text-[10px] text-slate-500 mb-4">
                      <span className="bg-slate-50 px-2 py-1 rounded">合計 {menu.totalDuration}分</span>
                      <span className="bg-slate-50 px-2 py-1 rounded">{menu.drills.length}ドリル</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => { onLoadMenu(menu); onClose(); }}
                        className="py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
                      >
                        メニューを表示
                      </button>
                      <button 
                        onClick={() => handleCopyCode(menu)}
                        className="py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all border border-slate-200"
                      >
                        コードをコピー
                      </button>
                    </div>
                    <button 
                      onClick={() => onDeleteMenu(menu.id)}
                      className="w-full mt-2 py-1 text-[10px] font-bold text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      このメニューを削除する
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center">
                <div className="mb-4 text-left">
                  <h4 className="text-xs font-black text-blue-900 mb-1">SNS等の共有コードを利用する</h4>
                  <p className="text-[10px] font-bold text-blue-700 leading-relaxed">
                    他人が作成した「メニューコード」を貼り付けて、その練習プランをあなたの画面に復元できます。
                  </p>
                </div>
                <textarea 
                  value={importCode} 
                  onChange={(e) => setImportCode(e.target.value)} 
                  placeholder="ここにメニューコードを貼り付け..." 
                  className="w-full h-48 p-4 rounded-xl border border-blue-200 font-mono text-[10px] text-slate-600 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none shadow-inner"
                />
                <button 
                  onClick={handleImport}
                  disabled={!importCode.trim()}
                  className="w-full mt-4 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg disabled:bg-slate-300 disabled:shadow-none transition-all active:scale-[0.98]"
                >
                  メニューを読み込む
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 bg-white border-t text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Badminton Coach AI Library</p>
        </div>
      </div>
    </div>
  );
};
