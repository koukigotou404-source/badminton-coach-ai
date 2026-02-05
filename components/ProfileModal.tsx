
import React, { useState, useRef } from 'react';
import { User } from '../types';

interface ProfileModalProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
  onClose: () => void;
}

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Lilly',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Toby',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Coco',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Buster',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Shadow',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onUpdate, onClose }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [showCustomUrl, setShowCustomUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...user,
      name: name.trim() || user.name,
      avatar: avatar.trim() || undefined
    });
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('画像サイズは2MB以下にしてください。');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${name || 'User'}&background=334155&color=fff`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white hover:text-slate-300 transition-colors z-10 drop-shadow-md"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="bg-slate-900 p-8 text-white text-center shrink-0">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <img 
              src={avatar || defaultAvatar} 
              alt="Profile Preview"
              className="w-full h-full object-cover rounded-full border-4 border-slate-800 shadow-xl transition-all bg-slate-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultAvatar;
              }}
            />
          </div>
          <h2 className="text-2xl font-black tracking-tight">プロフィール設定</h2>
          <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Personalize Your Identity</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto flex-grow">
          <div className="space-y-4">
            <label className="block text-sm font-black text-slate-800 flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              お名前
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="練習用ニックネーム"
              className="w-full p-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 font-bold transition-all"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-black text-slate-800 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                アイコンを選択
              </label>
              <button 
                type="button"
                onClick={() => setShowCustomUrl(!showCustomUrl)}
                className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
              >
                {showCustomUrl ? 'プリセットに戻る' : 'カスタムURL入力'}
              </button>
            </div>

            {!showCustomUrl ? (
              <div className="grid grid-cols-5 gap-3">
                <button
                  type="button"
                  onClick={triggerFilePicker}
                  className="aspect-square rounded-2xl border-2 border-dashed border-emerald-500 bg-emerald-50 text-emerald-600 flex flex-col items-center justify-center transition-all hover:bg-emerald-100 active:scale-95 group"
                >
                  <svg className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-[8px] font-black uppercase tracking-tighter">Upload</span>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />

                {AVATAR_PRESETS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatar(url)}
                    className={`aspect-square rounded-2xl border-2 overflow-hidden transition-all hover:scale-105 active:scale-95 ${
                      avatar === url 
                        ? 'border-emerald-500 ring-4 ring-emerald-500/10' 
                        : 'border-slate-100 grayscale-[0.2] opacity-70 hover:opacity-100 hover:grayscale-0'
                    }`}
                  >
                    <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
                
                <button
                  type="button"
                  onClick={() => setAvatar('')}
                  className={`aspect-square rounded-2xl border-2 border-dashed flex items-center justify-center transition-all hover:bg-slate-50 ${
                    avatar === '' 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-600' 
                      : 'border-slate-200 text-slate-400'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full p-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 text-sm transition-all"
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all active:scale-95"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all active:scale-95"
            >
              保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
