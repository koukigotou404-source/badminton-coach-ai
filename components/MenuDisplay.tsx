
import React, { useState } from 'react';
import { PracticeMenu, Drill, Friend } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  menu: PracticeMenu;
  onSave?: () => void;
  onShareToFriend?: (friendId: string) => void;
  friends?: Friend[];
  isSaved?: boolean;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export const MenuDisplay: React.FC<Props> = ({ menu, onSave, onShareToFriend, friends = [], isSaved }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  const handleShare = (friendId: string) => {
    if (onShareToFriend) {
      onShareToFriend(friendId);
      setShowShareModal(false);
      setToastMessage('フレンドに共有しました！');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const getMenuCode = () => {
    const jsonStr = JSON.stringify(menu);
    return btoa(unescape(encodeURIComponent(jsonStr)));
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?m=${getMenuCode()}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setToastMessage('共有用URLをコピーしました！');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    });
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {showToast && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 flex items-center gap-4 animate-in slide-in-from-bottom-8 duration-500 border border-slate-700">
          <div className="bg-emerald-500 p-1.5 rounded-full">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="font-black text-sm tracking-tight">{toastMessage}</span>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl border border-slate-100" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-black text-slate-800 text-xl tracking-tight">フレンドを選択</h3>
              <button onClick={() => setShowShareModal(false)} className="text-slate-300 hover:text-slate-600 transition-colors">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-4 bg-slate-50/50">
              {friends.length === 0 ? (
                <p className="p-12 text-center text-slate-400 text-sm font-bold leading-relaxed">フレンドが見つかりません。</p>
              ) : (
                friends.map(friend => (
                  <button key={friend.id} onClick={() => handleShare(friend.id)} className="w-full flex items-center gap-4 p-4 hover:bg-white rounded-3xl transition-all mb-2 border border-transparent hover:border-emerald-100 group hover:shadow-lg hover:shadow-emerald-600/5">
                    <img src={friend.avatar || `https://ui-avatars.com/api/?name=${friend.name}`} className="w-12 h-12 rounded-full border-2 border-slate-100 shadow-sm" alt="" />
                    <div className="text-left">
                      <div className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">{friend.name}</div>
                      <div className="text-xs text-slate-400">{friend.email}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100">
        <div className="bg-slate-900 px-8 py-10 md:px-12 md:py-14 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tighter">{menu.title}</h2>
              <div className="flex flex-wrap gap-6 text-slate-400 font-bold text-sm md:text-base">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  合計 {menu.totalDuration} 分
                </span>
                <span className="flex items-center gap-2">
                   <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  強度: <span className="text-white font-black">{menu.intensityScore}/10</span>
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setShowShareModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black transition-all flex items-center gap-3 shadow-2xl shadow-emerald-600/30 active:scale-95"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                フレンドに送る
              </button>
              {onSave && (
                <button 
                  onClick={onSave}
                  disabled={isSaved}
                  className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black transition-all active:scale-95 ${
                    isSaved ? 'bg-slate-800 text-slate-500 border border-slate-700' : 'bg-white text-slate-900 hover:bg-slate-100 shadow-xl'
                  }`}
                >
                  {isSaved ? '保存済み' : 'ライブラリ保存'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-2xl font-black text-slate-900 border-l-8 border-slate-900 pl-8 leading-none tracking-tight">練習プラン詳細</h3>
            <div className="space-y-6">
              {menu.drills.map((drill, index) => (
                <div key={index} className="flex gap-6 md:gap-8 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 transition-all hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 group">
                  <div className="flex-shrink-0 w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl group-hover:scale-110 transition-transform">{index + 1}</div>
                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <h4 className="font-black text-slate-900 text-xl md:text-2xl tracking-tight">{drill.name}</h4>
                        {drill.videoUrl && (
                          <a 
                            href={drill.videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="bg-emerald-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20"
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                            </svg>
                            WATCH
                          </a>
                        )}
                      </div>
                      <span className="text-xs font-black text-slate-500 bg-slate-200/50 px-4 py-1.5 rounded-full self-start sm:self-center">{drill.duration}分</span>
                    </div>
                    <p className="text-base text-slate-600 leading-relaxed mb-6 font-medium">{drill.description}</p>
                    {drill.keyPoints && drill.keyPoints.length > 0 && (
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Focus Key Points</p>
                        <ul className="text-sm text-slate-800 space-y-2 font-bold">
                          {drill.keyPoints.map((p, i) => (
                            <li key={i} className="flex gap-3 items-start">
                              <span className="mt-1.5 w-2 h-2 bg-emerald-500 rounded-full shrink-0 shadow-sm shadow-emerald-500/30"></span>
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-10">
             <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 text-xl mb-6 tracking-tight flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-slate-900 rounded-full"></div>
                   カテゴリー分析
                </h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={menu.intensityDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="percentage" nameKey="category" stroke="none">
                        {menu.intensityDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 space-y-3">
                   {menu.intensityDistribution.map((entry, index) => (
                     <div key={index} className="flex items-center justify-between text-xs font-bold text-slate-500">
                       <span className="flex items-center gap-2">
                         <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                         {entry.category}
                       </span>
                       <span className="text-slate-900 font-black">{entry.percentage}%</span>
                     </div>
                   ))}
                </div>
             </div>
             <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 text-white relative overflow-hidden group">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -mr-16 -mb-16 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                <h3 className="font-black text-emerald-400 text-xl mb-6 flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  コーチの助言
                </h3>
                <p className="text-lg text-slate-200 italic leading-relaxed font-bold">“ {menu.coachingAdvice} ”</p>
             </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center pb-8">
        <button onClick={handleCopyLink} className="bg-slate-900 text-white px-10 py-5 rounded-full font-black shadow-2xl hover:bg-black transition-all flex items-center gap-3 active:scale-95 group">
          <svg className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          共有用メニューURLをコピー
        </button>
      </div>
    </div>
  );
};
