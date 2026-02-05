
import React, { useState, useEffect, useRef } from 'react';
import { User, Friend, Message, PracticeMenu, Drill } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  friends: Friend[];
  messages: Message[];
  onSendMessage: (receiverId: string, text: string) => void;
  onAddFriend: (email: string) => void;
  onDeleteFriend: (id: string) => void;
  onImportMenu: (menu: PracticeMenu) => void;
  onImportDrill: (drill: Drill) => void;
  onMarkAsRead: (senderId: string) => void;
}

export const SocialPanel: React.FC<Props> = ({ 
  isOpen, onClose, currentUser, friends, messages, 
  onSendMessage, onAddFriend, onDeleteFriend, onImportMenu, onImportDrill, onMarkAsRead
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'chat'>('friends');
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedFriendId]);

  useEffect(() => {
    if (selectedFriendId) {
      onMarkAsRead(selectedFriendId);
    }
  }, [selectedFriendId, messages]);

  if (!isOpen) return null;

  const selectedFriend = friends.find(f => f.id === selectedFriendId);
  const currentChatMessages = messages.filter(m => 
    (m.senderId === currentUser?.id && m.receiverId === selectedFriendId) ||
    (m.senderId === selectedFriendId && m.receiverId === currentUser?.id)
  ).sort((a, b) => a.timestamp - b.timestamp);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedFriendId) return;
    onSendMessage(selectedFriendId, inputText);
    setInputText('');
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendEmail.trim()) return;
    onAddFriend(newFriendEmail);
    setNewFriendEmail('');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteFriend(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        
        {/* Header */}
        <div className="p-6 border-b bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              ソーシャル
            </h2>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Connect & Share Practice</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs or Back to list */}
        {selectedFriendId ? (
          <div className="px-4 py-3 bg-white border-b flex items-center gap-3">
            <button onClick={() => setSelectedFriendId(null)} className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <img src={selectedFriend?.avatar || `https://ui-avatars.com/api/?name=${selectedFriend?.name}`} className="w-8 h-8 rounded-full border border-slate-200" alt="" />
              <div className="leading-tight">
                <div className="font-bold text-sm text-slate-800">{selectedFriend?.name}</div>
                <div className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Online
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex border-b bg-white">
            <button onClick={() => setActiveTab('friends')} className={`flex-1 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'friends' ? 'border-emerald-500 text-emerald-600 bg-emerald-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>
              フレンド
            </button>
            <button onClick={() => setActiveTab('chat')} className={`flex-1 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'chat' ? 'border-emerald-500 text-emerald-600 bg-emerald-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>
              メッセージ
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-grow overflow-hidden flex flex-col bg-slate-50">
          {!selectedFriendId ? (
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {activeTab === 'friends' ? (
                <>
                  <form onSubmit={handleAddFriend} className="space-y-3">
                    <label className="text-xs font-bold text-slate-500">フレンドを追加</label>
                    <div className="flex gap-2">
                      <input type="email" value={newFriendEmail} onChange={(e) => setNewFriendEmail(e.target.value)} placeholder="Email address" className="flex-grow p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" required />
                      <button type="submit" className="bg-emerald-600 text-white px-4 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all">追加</button>
                    </div>
                  </form>
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">マイフレンド ({friends.length})</h3>
                    {friends.map(friend => (
                      <div key={friend.id} className="relative group">
                        <button 
                          onClick={() => { setSelectedFriendId(friend.id); setActiveTab('chat'); }} 
                          className="w-full bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <img src={friend.avatar || `https://ui-avatars.com/api/?name=${friend.name}`} className="w-10 h-10 rounded-full border border-slate-100" alt="" />
                            <div className="text-left">
                              <div className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{friend.name}</div>
                              <div className="text-[10px] text-slate-400">{friend.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <svg className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                        </button>
                        <button 
                          onClick={(e) => handleDelete(e, friend.id)}
                          className="absolute -right-2 -top-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 active:scale-95"
                          title="フレンドを削除"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                   <p className="text-center text-slate-400 text-sm font-bold py-10">フレンドを選択してチャットを開始してください。</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-grow flex flex-col h-full overflow-hidden">
              <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {currentChatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm border ${msg.senderId === currentUser?.id ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-white text-slate-800 border-slate-200'}`}>
                      {msg.text && <p className="text-sm font-medium leading-relaxed">{msg.text}</p>}
                      {msg.attachment && (
                        <div className={`mt-3 p-3 rounded-xl border ${msg.senderId === currentUser?.id ? 'bg-emerald-700/40 border-emerald-400/30' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${msg.senderId === currentUser?.id ? 'bg-emerald-500/30' : 'bg-emerald-100'}`}>
                              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </div>
                            <div className="leading-tight">
                              <div className={`text-[10px] font-black uppercase tracking-tighter ${msg.senderId === currentUser?.id ? 'text-emerald-200' : 'text-slate-400'}`}>
                                Shared {msg.attachment.type}
                              </div>
                              <div className="text-xs font-bold truncate max-w-[150px]">{msg.attachment.data.title || msg.attachment.data.name}</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => msg.attachment!.type === 'menu' ? onImportMenu(msg.attachment!.data) : onImportDrill(msg.attachment!.data)}
                            className={`w-full py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${msg.senderId === currentUser?.id ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'}`}
                          >
                            Import to Library
                          </button>
                        </div>
                      )}
                      <div className={`text-[9px] mt-1.5 font-bold ${msg.senderId === currentUser?.id ? 'text-emerald-200 text-right' : 'text-slate-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              
              <div className="p-4 bg-white border-t">
                <form onSubmit={handleSend} className="flex gap-2">
                  <input 
                    type="text" 
                    value={inputText} 
                    onChange={(e) => setInputText(e.target.value)} 
                    placeholder="Type a message..." 
                    className="flex-grow p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button 
                    type="submit" 
                    disabled={!inputText.trim()}
                    className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50"
                  >
                    <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
