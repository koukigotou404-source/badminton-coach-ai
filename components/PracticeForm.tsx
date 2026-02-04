
import React, { useState, useEffect } from 'react';
import { FocusArea, PracticeSettings, Drill, SkillLevel } from '../types';

interface Props {
  onAiSubmit: (settings: PracticeSettings) => void;
  savedDrills: Drill[];
  onSaveDrill: (drill: Drill) => void;
  onUpdateDrill: (index: number, drill: Drill) => void;
  onDeleteSavedDrill: (index: number) => void;
  isLoading?: boolean;
}

export const PracticeForm: React.FC<Props> = ({ 
  onAiSubmit,
  savedDrills, 
  onSaveDrill, 
  onUpdateDrill,
  onDeleteSavedDrill,
  isLoading = false
}) => {
  const [mode, setMode] = useState<'ai' | 'library'>('ai');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  const [tempPlayers, setTempPlayers] = useState<string>('4');
  const [tempDuration, setTempDuration] = useState<string>('10');

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
    if (editingIndex !== null) {
      setTempDuration(savedDrills[editingIndex].duration.toString());
    }
  }, [editingIndex, savedDrills]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (savedDrills.length === 0) {
      alert('ライブラリにドリルがありません。まず「ドリル管理」から登録してください。');
      return;
    }
    if (settings.levels.length === 0) {
      alert('対象レベルを少なくとも1つ選択してください。');
      return;
    }
    if (settings.focusAreas.length === 0) {
      alert('重点項目を少なくとも1つ選択してください。');
      return;
    }
    
    const finalPlayers = parseInt(tempPlayers) || 0;
    onAiSubmit({ ...settings, players: finalPlayers });
  };

  const toggleLevel = (level: string) => {
    setSettings(prev => ({
      ...prev,
      levels: prev.levels.includes(level) 
        ? prev.levels.filter(l => l !== level)
        : [...prev.levels, level]
    }));
  };

  const toggleFocusArea = (area: FocusArea) => {
    setSettings(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }));
  };

  const handleSaveToLibrary = () => {
    if (!newDrill.name) {
      alert('ドリル名を入力してください。');
      return;
    }
    
    const finalDuration = parseInt(tempDuration) || 0;
    const formattedDrill = { 
      ...newDrill, 
      duration: finalDuration,
      keyPoints: newDrill.keyPoints.filter(p => p.trim() !== '') 
    };

    if (editingIndex !== null) {
      onUpdateDrill(editingIndex, formattedDrill);
      setEditingIndex(null);
      alert('ドリルを更新しました。');
    } else {
      onSaveDrill(formattedDrill);
      alert('ライブラリに保存しました。');
    }

    setNewDrill({ 
      name: '', 
      duration: 10, 
      description: '', 
      keyPoints: [''], 
      level: SkillLevel.INTERMEDIATE, 
      category: FocusArea.ALL_ROUND,
      videoUrl: '' 
    });
    setTempDuration('10');
  };

  const handleEditClick = (index: number) => {
    const drillToEdit = savedDrills[index];
    setNewDrill({ ...drillToEdit, keyPoints: drillToEdit.keyPoints.length > 0 ? drillToEdit.keyPoints : [''] });
    setTempDuration(drillToEdit.duration.toString());
    setEditingIndex(index);
    // 編集時はそのカテゴリを自動的に展開する
    if (drillToEdit.category) {
      const newExpanded = new Set(expandedCategories);
      newExpanded.add(drillToEdit.category);
      setExpandedCategories(newExpanded);
    }
    const formElement = document.getElementById('drill-form-header');
    formElement?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setNewDrill({ 
      name: '', 
      duration: 10, 
      description: '', 
      keyPoints: [''], 
      level: SkillLevel.INTERMEDIATE, 
      category: FocusArea.ALL_ROUND,
      videoUrl: '' 
    });
    setTempDuration('10');
  };

  const getTabStyles = (id: string) => {
    const isActive = mode === id;
    if (id === 'ai') {
      return isActive 
        ? 'bg-emerald-600 text-white shadow-inner' 
        : 'bg-white text-black hover:bg-emerald-50';
    }
    return isActive 
      ? 'bg-slate-800 text-white shadow-inner' 
      : 'bg-white text-black hover:bg-slate-50';
  };

  // グループ化ロジック
  const groupedDrills = Object.values(FocusArea).map(area => {
    const categoryDrills = savedDrills
      .map((drill, originalIndex) => ({ drill, originalIndex }))
      .filter(item => item.drill.category === area);
    
    if (categoryDrills.length === 0) return null;

    const levelsGrouped = Object.values(SkillLevel).map(level => {
      const levelDrills = categoryDrills.filter(item => item.drill.level === level);
      return { level, drills: levelDrills };
    }).filter(l => l.drills.length > 0);

    return { area, levels: levelsGrouped, count: categoryDrills.length };
  }).filter(g => g !== null);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
      <div className="flex border-b text-sm md:text-base">
        {[
          { id: 'ai', label: 'AIにおまかせ', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
          { id: 'library', label: 'ドリル管理', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setMode(tab.id as any);
              if (tab.id === 'ai') handleCancelEdit();
            }}
            className={`flex-1 py-4 font-bold transition-all flex items-center justify-center gap-2 ${getTabStyles(tab.id)}`}
          >
            <svg className="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-8">
        {mode === 'ai' && (
          <form onSubmit={handleAiSubmit} className="space-y-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-black flex items-center gap-2">
                AIによるメニュー自動構成
              </h2>
              {savedDrills.length > 0 ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                  ライブラリのドリルのみを活用します ({savedDrills.length}件)
                </span>
              ) : (
                <span className="text-[10px] bg-red-100 text-red-800 px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                  ドリルを登録してください
                </span>
              )}
            </div>

            {savedDrills.length === 0 && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm">
                <p className="font-bold mb-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  ドリルが不足しています
                </p>
                「ドリル管理」タブから、普段行っている練習メニューを保存してください。AIはそのリストの中から最適なメニューを組み立てます。
              </div>
            )}
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-black mb-3">対象レベル (複数選択可)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.values(SkillLevel).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => toggleLevel(level)}
                        className={`py-2 px-3 rounded-lg text-sm font-bold border transition-all ${
                          settings.levels.includes(level)
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-3">練習時間 ({settings.duration}分)</label>
                  <div className="pt-2">
                    <input
                      type="range"
                      min="30" max="240" step="15"
                      value={settings.duration}
                      onChange={(e) => setSettings({ ...settings, duration: parseInt(e.target.value) })}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-1">
                      <span>30分</span>
                      <span>120分</span>
                      <span>240分</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-3">重点項目 (複数選択可)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.values(FocusArea).map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleFocusArea(area)}
                      className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center text-center leading-tight ${
                        settings.focusAreas.includes(area)
                          ? 'bg-slate-800 border-slate-800 text-white shadow-md'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">参加人数 (目安)</label>
                <div className="flex items-center gap-2 relative max-w-[150px]">
                  <input
                    type="number"
                    min="0"
                    value={tempPlayers}
                    onChange={(e) => setTempPlayers(e.target.value)}
                    placeholder="0"
                    className="w-full p-2.5 pr-8 rounded-lg border border-slate-200 bg-white text-black font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button 
                    type="button"
                    onClick={() => setTempPlayers('')}
                    className="absolute right-10 text-slate-400 hover:text-slate-600 p-1"
                    title="クリア"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <span className="text-slate-500 text-sm flex-shrink-0">人</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || savedDrills.length === 0}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-3 ${
                (isLoading || savedDrills.length === 0) ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-emerald-500/20 active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  AIコーチがライブラリを解析中...
                </>
              ) : 'ライブラリからメニューを自動生成'}
            </button>
          </form>
        )}

        {mode === 'library' && (
          <div className="space-y-8">
            <div id="drill-form-header" className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-inner transition-all duration-300">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingIndex !== null ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" : "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"} />
                </svg>
                {editingIndex !== null ? 'ドリルを編集' : '新しいドリルを登録'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-white uppercase mb-1 tracking-wide">ドリル名</label>
                  <input
                    type="text"
                    placeholder="例: フットワーク（V字）"
                    value={newDrill.name}
                    onChange={(e) => setNewDrill({ ...newDrill, name: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-600 bg-slate-900 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white uppercase mb-1 tracking-wide">推奨スキルレベル</label>
                  <select
                    value={newDrill.level}
                    onChange={(e) => setNewDrill({ ...newDrill, level: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-600 bg-slate-900 text-white outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    {Object.values(SkillLevel).map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white uppercase mb-1 tracking-wide">標準時間（分）</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={tempDuration}
                      onChange={(e) => setTempDuration(e.target.value)}
                      placeholder="0"
                      className="w-full p-2.5 pr-10 rounded-lg border border-slate-600 bg-slate-900 text-white outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                    <button 
                      type="button"
                      onClick={() => setTempDuration('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                      title="クリア"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white uppercase mb-1 tracking-wide">カテゴリ</label>
                  <select
                    value={newDrill.category}
                    onChange={(e) => setNewDrill({ ...newDrill, category: e.target.value as FocusArea })}
                    className="w-full p-2.5 rounded-lg border border-slate-600 bg-slate-900 text-white outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    {Object.values(FocusArea).map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-white uppercase mb-1 tracking-wide">動画URL (YouTubeなど)</label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={newDrill.videoUrl}
                    onChange={(e) => setNewDrill({ ...newDrill, videoUrl: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-600 bg-slate-900 text-emerald-400 font-mono text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-xs font-bold text-white uppercase mb-1 tracking-wide">説明・内容</label>
                <textarea
                  placeholder="ドリルの具体的な内容やルールを入力..."
                  value={newDrill.description}
                  onChange={(e) => setNewDrill({ ...newDrill, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-600 bg-slate-900 text-white placeholder-slate-500 outline-none h-24 focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleSaveToLibrary}
                  className={`flex-1 py-3 ${editingIndex !== null ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2 shadow-lg`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  {editingIndex !== null ? '変更を保存' : 'ライブラリに保存'}
                </button>
                {editingIndex !== null && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 py-3 bg-slate-600 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors shadow-lg"
                  >
                    キャンセル
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800 p-4 rounded-xl flex items-center justify-between shadow-lg">
                <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  保存済みドリルの管理 ({savedDrills.length}件)
                </h3>
              </div>
              {savedDrills.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400 font-medium">
                  ライブラリは空です。上のフォームから普段の練習を登録してください。
                </div>
              ) : (
                <div className="space-y-3">
                  {groupedDrills.map((group, gIdx) => {
                    const isOpen = expandedCategories.has(group.area);
                    return (
                      <div key={gIdx} className="overflow-hidden border border-slate-200 rounded-xl transition-all duration-200">
                        <button 
                          onClick={() => toggleCategory(group.area)}
                          className={`w-full flex items-center justify-between p-4 text-left transition-colors ${isOpen ? 'bg-emerald-50' : 'bg-white hover:bg-slate-50'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg transition-colors ${isOpen ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                               </svg>
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-slate-800 leading-none">{group.area}</h4>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{group.count}個のドリル</span>
                            </div>
                          </div>
                          <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {isOpen && (
                          <div className="p-4 pt-0 border-t border-slate-100 bg-white space-y-8 animate-in slide-in-from-top-2 duration-300">
                            {group.levels.map((levelGroup, lIdx) => (
                              <div key={lIdx} className="space-y-4 pt-4 first:pt-4">
                                <h5 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                  {levelGroup.level}
                                </h5>
                                <div className="grid grid-cols-1 gap-4">
                                  {levelGroup.drills.map((item, dIdx) => (
                                    <div key={dIdx} className={`p-4 bg-slate-50 border ${editingIndex === item.originalIndex ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-100'} rounded-xl flex items-start justify-between transition-all group hover:bg-white hover:border-slate-200 hover:shadow-sm`}>
                                      <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <h6 className="font-bold text-black text-lg">{item.drill.name}</h6>
                                        </div>
                                        <p className="text-sm text-slate-600 line-clamp-2 max-w-2xl">{item.drill.description}</p>
                                        <div className="flex flex-wrap items-center gap-4 mt-2">
                                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            標準 {item.drill.duration}分
                                          </span>
                                          {item.drill.videoUrl && (
                                            <a href={item.drill.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-red-600 font-bold flex items-center gap-1 hover:underline">
                                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                              </svg>
                                              動画を確認
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                          onClick={() => handleEditClick(item.originalIndex)}
                                          className="p-2 text-slate-400 hover:text-amber-500 transition-colors flex-shrink-0"
                                          title="編集"
                                        >
                                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                          </svg>
                                        </button>
                                        <button 
                                          onClick={() => onDeleteSavedDrill(item.originalIndex)}
                                          className="p-2 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                                          title="削除"
                                        >
                                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
