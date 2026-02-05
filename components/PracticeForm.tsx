
import React, { useState, useEffect } from 'react';
import { FocusArea, PracticeSettings, Drill, SkillLevel } from '../types';

interface Props {
  onAiSubmit: (settings: PracticeSettings) => void;
  savedDrills: Drill[];
  onSaveDrill: (drill: Drill) => void;
  onUpdateDrill: (index: number, drill: Drill) => void;
  onDeleteSavedDrill: (index: number) => void;
  onShareDrill?: (drill: Drill) => void;
  isLoading?: boolean;
}

export const PracticeForm: React.FC<Props> = ({ 
  onAiSubmit,
  savedDrills, 
  onSaveDrill, 
  onUpdateDrill,
  onDeleteSavedDrill,
  onShareDrill,
  isLoading = false
}) => {
  const [mode, setMode] = useState<'ai' | 'library'>('ai');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [tempDuration, setTempDuration] = useState<string>('10');
  const [copyFeedback, setCopyFeedback] = useState<number | null>(null);

  const [settings, setSettings] = useState<PracticeSettings>({
    levels: [SkillLevel.INTERMEDIATE],
    players: 4,
    duration: 120,
    focusAreas: [FocusArea.ALL_ROUND],
    courts: 1,
  });

  const [newDrill, setNewDrill] = useState<Drill>({
    name: '', 
    duration: 10, 
    description: '', 
    keyPoints: [''], 
    category: FocusArea.ALL_ROUND, 
    level: SkillLevel.INTERMEDIATE, 
    videoUrl: ''
  });

  useEffect(() => {
    if (editingIndex !== null) setTempDuration(savedDrills[editingIndex].duration.toString());
  }, [editingIndex, savedDrills]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) newExpanded.delete(category);
    else newExpanded.add(category);
    setExpandedCategories(newExpanded);
  };

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (savedDrills.length === 0) {
      alert('ライブラリにドリルがありません。まず「ドリル管理」から登録してください。');
      return;
    }
    onAiSubmit(settings);
  };

  const handleSaveToLibrary = () => {
    if (!newDrill.name) return alert('ドリル名を入力してください。');
    const finalDuration = parseInt(tempDuration) || 0;
    const filteredPoints = newDrill.keyPoints.filter(p => p.trim() !== '');
    const formattedDrill = { ...newDrill, duration: finalDuration, keyPoints: filteredPoints.length > 0 ? filteredPoints : [''] };
    
    if (editingIndex !== null) {
      onUpdateDrill(editingIndex, formattedDrill);
      setEditingIndex(null);
    } else {
      onSaveDrill(formattedDrill);
    }
    
    // Reset form
    setNewDrill({ name: '', duration: 10, description: '', keyPoints: [''], level: SkillLevel.INTERMEDIATE, category: FocusArea.ALL_ROUND, videoUrl: '' });
    setTempDuration('10');
  };

  const handleAddKeyPoint = () => {
    setNewDrill({ ...newDrill, keyPoints: [...newDrill.keyPoints, ''] });
  };

  const handleUpdateKeyPoint = (idx: number, val: string) => {
    const updated = [...newDrill.keyPoints];
    updated[idx] = val;
    setNewDrill({ ...newDrill, keyPoints: updated });
  };

  const handleRemoveKeyPoint = (idx: number) => {
    if (newDrill.keyPoints.length <= 1) return;
    setNewDrill({ ...newDrill, keyPoints: newDrill.keyPoints.filter((_, i) => i !== idx) });
  };

  const handleEditClick = (index: number) => {
    const drillToEdit = savedDrills[index];
    setNewDrill({ ...drillToEdit, keyPoints: drillToEdit.keyPoints.length > 0 ? drillToEdit.keyPoints : [''] });
    setTempDuration(drillToEdit.duration.toString());
    setEditingIndex(index);
    setMode('library');
    document.getElementById('drill-form-header')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCopyToClipboard = (drill: Drill, index: number) => {
    const points = drill.keyPoints.length > 0 ? `\n意識ポイント:\n- ${drill.keyPoints.join('\n- ')}` : '';
    const videoText = drill.videoUrl ? `\n参考動画: ${drill.videoUrl}` : '';
    const text = `【練習ドリル】${drill.name}\n所要時間: ${drill.duration}分\n内容: ${drill.description}${points}${videoText}`;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(index);
      setTimeout(() => setCopyFeedback(null), 2000);
    });
  };

  const groupedDrills = Object.values(FocusArea).map(area => {
    const categoryDrills = savedDrills
      .map((drill, originalIndex) => ({ drill, originalIndex }))
      .filter(item => item.drill.category === area);
    return categoryDrills.length > 0 ? { area, drills: categoryDrills } : null;
  }).filter(g => g !== null);

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col h-full">
      <div className="flex border-b border-slate-100 bg-slate-50">
        <button 
          onClick={() => setMode('ai')} 
          className={`flex-1 py-7 font-black text-sm tracking-widest flex items-center justify-center gap-3 transition-all relative ${
            mode === 'ai' 
              ? 'bg-slate-900 text-white shadow-lg' 
              : 'bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          メニュー作成
          {mode === 'ai' && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-emerald-500 animate-in fade-in duration-300"></div>}
        </button>
        <button 
          onClick={() => setMode('library')} 
          className={`flex-1 py-7 font-black text-sm tracking-widest flex items-center justify-center gap-3 transition-all relative ${
            mode === 'library' 
              ? 'bg-slate-900 text-white shadow-lg' 
              : 'bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          ドリル管理
          {mode === 'library' && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-emerald-500 animate-in fade-in duration-300"></div>}
        </button>
      </div>

      <div className="p-8 md:p-12 flex-grow">
        {mode === 'ai' && (
          <form onSubmit={handleAiSubmit} className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black text-slate-900 leading-none">条件を設定</h2>
              <div className="flex-grow h-px bg-slate-100"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em]">対象レベル</label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.values(SkillLevel).map(level => (
                    <button 
                      key={level} 
                      type="button" 
                      onClick={() => setSettings({...settings, levels: settings.levels.includes(level) ? settings.levels.filter(l => l !== level) : [...settings.levels, level]})} 
                      className={`py-3.5 rounded-2xl text-xs font-black transition-all border-2 ${
                        settings.levels.includes(level) 
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-600/20 active:scale-95' 
                          : 'bg-slate-50 border-slate-50 text-slate-400 hover:border-slate-200 hover:bg-white'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex justify-between">
                  <span>合計練習時間</span>
                  <span className="text-emerald-600 font-black">{settings.duration}分</span>
                </label>
                <div className="pt-2">
                  <input 
                    type="range" 
                    min="30" 
                    max="240" 
                    step="15" 
                    value={settings.duration} 
                    onChange={(e) => setSettings({ ...settings, duration: parseInt(e.target.value) })} 
                    className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-emerald-600 shadow-inner" 
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  <span>30m</span>
                  <span>120m</span>
                  <span>240m</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em]">重点項目</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.values(FocusArea).map(area => (
                  <button 
                    key={area} 
                    type="button" 
                    onClick={() => setSettings({...settings, focusAreas: settings.focusAreas.includes(area) ? settings.focusAreas.filter(a => a !== area) : [...settings.focusAreas, area]})} 
                    className={`py-4 px-5 rounded-[1.25rem] text-xs font-black border-2 transition-all ${
                      settings.focusAreas.includes(area) 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-2xl active:scale-95' 
                        : 'bg-slate-50 border-slate-50 text-slate-500 hover:bg-white hover:border-slate-200'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-6">
              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full py-6 rounded-3xl font-black text-white bg-emerald-600 hover:bg-emerald-500 shadow-[0_20px_40px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-4 text-xl tracking-tight"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    作成中...
                  </div>
                ) : '練習プランを作成する'}
              </button>
            </div>
          </form>
        )}

        {mode === 'library' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div id="drill-form-header" className="bg-slate-900 p-8 md:p-10 rounded-[2.5rem] border border-slate-800 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[80px] -mr-24 -mt-24 rounded-full pointer-events-none"></div>
              
              <h3 className="text-xl font-black text-white mb-10 flex items-center gap-4">
                <div className="bg-emerald-500 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                ドリルを新規登録
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-2.5 ml-1">ドリル名</label>
                    <input type="text" value={newDrill.name} onChange={(e) => setNewDrill({...newDrill, name: e.target.value})} placeholder="例: クロスヘアピン" className="w-full p-4.5 rounded-2xl bg-slate-800/50 text-white border border-slate-700/50 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/40 transition-all font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-2.5 ml-1">カテゴリー</label>
                      <select value={newDrill.category} onChange={(e) => setNewDrill({...newDrill, category: e.target.value as FocusArea})} className="w-full p-4.5 rounded-2xl bg-slate-800/50 text-white border border-slate-700/50 outline-none cursor-pointer font-bold appearance-none">
                        {Object.values(FocusArea).map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-2.5 ml-1">所要時間(分)</label>
                      <input type="number" value={tempDuration} onChange={(e) => setTempDuration(e.target.value)} placeholder="10" className="w-full p-4.5 rounded-2xl bg-slate-800/50 text-white border border-slate-700/50 outline-none font-black" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-2.5 ml-1">内容説明</label>
                    <textarea value={newDrill.description} onChange={(e) => setNewDrill({...newDrill, description: e.target.value})} placeholder="練習の進め方や人数配置、配球のルールなど..." className="w-full h-40 p-4.5 rounded-2xl bg-slate-800/50 text-white border border-slate-700/50 outline-none resize-none font-bold" />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-2.5 ml-1">参考動画URL (YouTubeなど)</label>
                    <input type="url" value={newDrill.videoUrl} onChange={(e) => setNewDrill({...newDrill, videoUrl: e.target.value})} placeholder="https://www.youtube.com/..." className="w-full p-4.5 rounded-2xl bg-slate-800/50 text-white border border-slate-700/50 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/40 transition-all font-medium text-xs" />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-2.5 ml-1 flex justify-between items-center">
                      意識ポイント
                      <button onClick={handleAddKeyPoint} className="text-emerald-400 hover:text-emerald-300 font-black tracking-widest text-[9px] bg-emerald-400/10 px-3 py-1 rounded-full">+ 追加</button>
                    </label>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-3 custom-scrollbar">
                      {newDrill.keyPoints.map((point, idx) => (
                        <div key={idx} className="flex gap-3 animate-in slide-in-from-left-2 duration-300">
                          <input 
                            type="text" 
                            value={point} 
                            onChange={(e) => handleUpdateKeyPoint(idx, e.target.value)} 
                            placeholder={`ポイント ${idx + 1}`} 
                            className="flex-grow p-4 rounded-xl bg-slate-800/50 text-white border border-slate-700/50 text-sm outline-none focus:border-emerald-500/50 font-bold" 
                          />
                          {newDrill.keyPoints.length > 1 && (
                            <button onClick={() => handleRemoveKeyPoint(idx)} className="text-slate-500 hover:text-red-400 p-2 transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <button onClick={handleSaveToLibrary} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black shadow-2xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all active:scale-[0.99] tracking-widest uppercase flex items-center justify-center gap-3">
                {editingIndex !== null ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    変更を保存する
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    ライブラリへ保存
                  </>
                )}
              </button>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <h3 className="text-2xl font-black text-slate-900 leading-none">マイ・ドリル</h3>
                <div className="flex-grow h-px bg-slate-100"></div>
              </div>
              
              {groupedDrills.length === 0 ? (
                <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  <p className="text-slate-400 font-black text-xl">ドリルが登録されていません</p>
                  <p className="text-slate-300 text-sm mt-2 font-bold uppercase tracking-widest">Register your first training drill above</p>
                </div>
              ) : groupedDrills.map((group, gIdx) => (
                <div key={gIdx} className="border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm bg-white animate-in fade-in duration-500">
                  <button onClick={() => toggleCategory(group!.area)} className="w-full px-10 py-6 bg-slate-50 flex justify-between items-center font-black text-slate-800 hover:bg-slate-100 transition-all">
                    <span className="flex items-center gap-4">
                      <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/40"></span>
                      <span className="text-lg">{group!.area}</span>
                      <span className="text-slate-400 font-black text-sm ml-2 bg-slate-200/50 px-3 py-1 rounded-full">
                        {group!.drills.length}
                      </span>
                    </span>
                    <div className={`p-2 rounded-xl transition-all ${expandedCategories.has(group!.area) ? 'bg-slate-200 rotate-180' : 'bg-white shadow-sm'}`}>
                      <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </button>
                  {expandedCategories.has(group!.area) && (
                    <div className="p-8 space-y-6 bg-white animate-in slide-in-from-top-4 duration-300">
                      {group!.drills.map(({ drill, originalIndex }) => (
                        <div key={originalIndex} className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-slate-800 group relative transition-all hover:translate-y-[-4px]">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-6">
                            <div className="flex flex-wrap items-center gap-4">
                              <h4 className="font-black text-white text-2xl tracking-tight">{drill.name}</h4>
                              <div className="flex gap-2">
                                {drill.videoUrl && (
                                  <a href={drill.videoUrl} target="_blank" rel="noopener noreferrer" className="bg-emerald-500/20 text-emerald-400 p-2 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/10">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                                  </a>
                                )}
                                <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 shadow-inner">
                                  {drill.duration}分
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-3 ml-auto sm:ml-0">
                              <button onClick={() => handleCopyToClipboard(drill, originalIndex)} className={`p-3 rounded-2xl transition-all ${copyFeedback === originalIndex ? 'bg-emerald-500 text-white shadow-xl scale-110' : 'text-slate-500 hover:bg-white/10'}`}>
                                {copyFeedback === originalIndex ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                              </button>
                              <button onClick={() => onShareDrill?.(drill)} className="p-3 text-slate-500 hover:bg-white/10 rounded-2xl transition-all">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-base text-slate-400 mb-8 leading-relaxed font-bold border-l-4 border-slate-800 pl-6">{drill.description}</p>
                          
                          {drill.keyPoints.length > 0 && (
                            <div className="mb-8 bg-black/20 p-6 rounded-3xl border border-white/5 shadow-inner">
                              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] mb-4">Focus Key Points</p>
                              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {drill.keyPoints.map((p, i) => (
                                  <li key={i} className="flex gap-3 items-center text-sm text-emerald-400 font-black">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                    {p}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <div className="flex gap-4">
                            <button onClick={() => handleEditClick(originalIndex)} className="flex-1 py-4 text-sm font-black text-white bg-slate-800 hover:bg-emerald-600 transition-all rounded-2xl border border-slate-700 shadow-xl group">
                              編集する
                            </button>
                            <button onClick={() => onDeleteSavedDrill(originalIndex)} className="flex-1 py-4 text-sm font-black text-red-400 bg-red-400/5 hover:bg-red-400/10 rounded-2xl transition-all border border-red-400/20">
                              削除
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.4); }
      `}</style>
    </div>
  );
};
