
import React, { useState, useEffect } from 'react';
import { Header, Footer } from './components/Layout';
import { PracticeForm } from './components/PracticeForm';
import { MenuDisplay } from './components/MenuDisplay';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { LibraryPanel } from './components/LibraryPanel';
import { SocialPanel } from './components/SocialPanel';
import { PracticeMenu, Drill, PracticeSettings, User, SavedMenu, Friend, Message, ChatAttachment } from './types';
import { generatePracticeMenu } from './services/geminiService';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [menu, setMenu] = useState<PracticeMenu | null>(null);
  const [savedDrills, setSavedDrills] = useState<Drill[]>([]);
  const [savedMenus, setSavedMenus] = useState<SavedMenu[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sharing State
  const [drillToShare, setDrillToShare] = useState<Drill | null>(null);

  // Social State
  const [friends, setFriends] = useState<Friend[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('badminton_coach_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setUser(u);
      } catch (e) {
        console.error('Failed to restore user session', e);
      }
    } else {
      const mockUser = { id: 'user_1', name: 'Player 1', email: 'player1@example.com' };
      setUser(mockUser);
    }

    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('m');
    if (sharedData) {
      try {
        const decoded = decodeURIComponent(escape(atob(sharedData)));
        const parsedMenu = JSON.parse(decoded);
        setMenu(parsedMenu);
        window.history.replaceState({}, '', window.location.pathname);
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const drillKey = `badminton_drills_${user.id}`;
    const menuKey = `badminton_menus_${user.id}`;
    const friendsKey = `badminton_friends_${user.id}`;
    const messagesKey = `badminton_messages_${user.id}`;
    
    const savedD = localStorage.getItem(drillKey);
    const savedM = localStorage.getItem(menuKey);
    const savedF = localStorage.getItem(friendsKey);
    const savedMsg = localStorage.getItem(messagesKey);

    if (savedD) setSavedDrills(JSON.parse(savedD));
    if (savedM) setSavedMenus(JSON.parse(savedM));
    
    if (savedF) {
      setFriends(JSON.parse(savedF));
    } else {
      const defaultFriends: Friend[] = [];
      setFriends(defaultFriends);
      localStorage.setItem(friendsKey, JSON.stringify(defaultFriends));
    }

    if (savedMsg) setMessages(JSON.parse(savedMsg));
  }, [user?.id]);

  const saveToLocalStorage = (key: string, data: any) => {
    if (!user) return;
    localStorage.setItem(`${key}_${user.id}`, JSON.stringify(data));
  };

  const handleSendMessage = async (receiverId: string, text?: string, attachment?: ChatAttachment) => {
    if (!user) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      receiverId,
      text,
      attachment,
      timestamp: Date.now(),
      isRead: true
    };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    saveToLocalStorage('badminton_messages', updatedMessages);

    if (attachment || (text && text.length > 2)) {
      setTimeout(() => simulateFriendResponse(receiverId, attachment), 1500);
    }
  };

  const simulateFriendResponse = async (friendId: string, sharedContent?: ChatAttachment) => {
    if (!user) return;
    const friend = friends.find(f => f.id === friendId);
    if (!friend) return;

    let responseText = "了解しました！練習頑張りましょう！";
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const prompt = sharedContent 
        ? `あなたはバドミントン仲間の${friend.name}です。友達の${user.name}から「${sharedContent.data.title || sharedContent.data.name}」という練習内容がシェアされました。短く、熱意のある、20文字程度の日本語の返信を作成してください。絵文字も含めてください。`
        : `あなたはバドミントン仲間の${friend.name}です。友達の${user.name}からメッセージが届きました。短くフレンドリーな返信を作成してください。`;
      
      const res = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      responseText = res.text || responseText;
    } catch (e) {
      console.warn("AI response simulation failed", e);
    }

    const reply: Message = {
      id: (Date.now() + 1).toString(),
      senderId: friendId,
      receiverId: user.id,
      text: responseText,
      timestamp: Date.now(),
      isRead: false
    };
    setMessages(prev => {
      const updated = [...prev, reply];
      saveToLocalStorage('badminton_messages', updated);
      return updated;
    });
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('badminton_coach_user', JSON.stringify(updatedUser));
  };

  const handleAddFriend = (email: string) => {
    if (friends.some(f => f.email === email)) {
      alert('既にフレンドです！');
      return;
    }
    const name = email.split('@')[0];
    const newFriend: Friend = {
      id: `friend_${Date.now()}`,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email,
      status: 'online',
      avatar: `https://ui-avatars.com/api/?name=${name}`
    };
    const updated = [...friends, newFriend];
    setFriends(updated);
    saveToLocalStorage('badminton_friends', updated);
  };

  const handleDeleteFriend = (id: string) => {
    if (window.confirm('このフレンドを削除してもよろしいですか？')) {
      const updated = friends.filter(f => f.id !== id);
      setFriends(updated);
      saveToLocalStorage('badminton_friends', updated);
      const updatedMsgs = messages.filter(m => m.senderId !== id && m.receiverId !== id);
      setMessages(updatedMsgs);
      saveToLocalStorage('badminton_messages', updatedMsgs);
    }
  };

  const handleMarkAsRead = (senderId: string) => {
    const updated = messages.map(m => m.senderId === senderId ? { ...m, isRead: true } : m);
    setMessages(updated);
    saveToLocalStorage('badminton_messages', updated);
  };

  const handleSaveMenu = (menuToSave: PracticeMenu) => {
    const newSavedMenu: SavedMenu = { ...menuToSave, id: Date.now().toString(), savedAt: Date.now() };
    const newSavedMenus = [newSavedMenu, ...savedMenus];
    setSavedMenus(newSavedMenus);
    saveToLocalStorage('badminton_menus', newSavedMenus);
  };

  const handleSaveDrill = (drill: Drill) => {
    const newDrills = [...savedDrills, drill];
    setSavedDrills(newDrills);
    saveToLocalStorage('badminton_drills', newDrills);
  };

  const handleImportMenu = (menu: PracticeMenu) => {
    setMenu(menu);
    handleSaveMenu(menu);
    alert('メニューをライブラリに保存しました！');
  };

  const handleImportDrill = (drill: Drill) => {
    handleSaveDrill(drill);
    alert('ドリルをライブラリに保存しました！');
  };

  const handleAiSubmit = async (settings: PracticeSettings) => {
    setIsLoading(true);
    setError(null);
    try {
      const generatedMenu = await generatePracticeMenu(settings, savedDrills);
      setMenu(generatedMenu);
      setTimeout(() => document.getElementById('practice-result')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err: any) {
      setError(err.message || '生成エラー');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-['Noto_Sans_JP'] overflow-x-hidden bg-slate-50">
      <Header 
        user={user} 
        onLogin={() => setShowAuth(true)} 
        onLogout={() => { setUser(null); localStorage.removeItem('badminton_coach_user'); }}
        onOpenProfile={() => setShowProfile(true)}
        isSyncing={isSyncing} 
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenSocial={() => setIsSocialOpen(true)}
        savedMenusCount={savedMenus.length}
        unreadMessagesCount={messages.filter(m => m.receiverId === user?.id && !m.isRead).length}
      />
      
      {showAuth && <AuthModal onLogin={(u) => { setUser(u); localStorage.setItem('badminton_coach_user', JSON.stringify(u)); setShowAuth(false); }} onClose={() => setShowAuth(false)} />}
      
      {showProfile && user && (
        <ProfileModal 
          user={user} 
          onUpdate={handleUpdateProfile} 
          onClose={() => setShowProfile(false)} 
        />
      )}

      <LibraryPanel 
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        savedMenus={savedMenus}
        onDeleteMenu={(id) => { const updated = savedMenus.filter(m => m.id !== id); setSavedMenus(updated); saveToLocalStorage('badminton_menus', updated); }}
        onLoadMenu={setMenu}
      />

      <SocialPanel 
        isOpen={isSocialOpen}
        onClose={() => setIsSocialOpen(false)}
        currentUser={user}
        friends={friends}
        messages={messages}
        onSendMessage={handleSendMessage}
        onAddFriend={handleAddFriend}
        onDeleteFriend={handleDeleteFriend}
        onImportMenu={handleImportMenu}
        onImportDrill={handleImportDrill}
        onMarkAsRead={handleMarkAsRead}
      />

      {/* Drill Share Selection Modal */}
      {drillToShare && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDrillToShare(null)}>
          <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl border border-slate-100" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-800 text-lg">フレンドに送る</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{drillToShare.name}</p>
              </div>
              <button onClick={() => setDrillToShare(null)} className="text-slate-300 hover:text-slate-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-4 bg-slate-50/50">
              {friends.length === 0 ? (
                <p className="p-12 text-center text-slate-400 text-sm font-bold leading-relaxed">フレンドがまだいません。<br/>ソーシャルパネルから追加してください。</p>
              ) : (
                friends.map(friend => (
                  <button 
                    key={friend.id} 
                    onClick={() => {
                      handleSendMessage(friend.id, undefined, { type: 'drill', data: drillToShare });
                      setDrillToShare(null);
                      alert(`${friend.name}さんにドリルを送信しました！`);
                    }} 
                    className="w-full flex items-center gap-4 p-4 hover:bg-white rounded-3xl transition-all mb-2 border border-transparent hover:border-emerald-100 group hover:shadow-lg hover:shadow-emerald-600/5"
                  >
                    <img src={friend.avatar || `https://ui-avatars.com/api/?name=${friend.name}`} className="w-12 h-12 rounded-full border-2 border-slate-100 shadow-sm" alt="" />
                    <div className="text-left">
                      <div className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">{friend.name}</div>
                      <div className="text-xs text-slate-400">{friend.email}</div>
                    </div>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-3 mb-16 relative">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter drop-shadow-sm">
              バドミントン練習メニュー
            </h2>
            <div className="inline-block relative">
              <p className="text-xl md:text-2xl font-black text-emerald-600 tracking-[0.2em] uppercase bg-emerald-50 px-6 py-2 rounded-full shadow-sm">
                自動作成
              </p>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto w-full">
            <PracticeForm 
              onAiSubmit={handleAiSubmit}
              savedDrills={savedDrills}
              onSaveDrill={handleSaveDrill}
              onUpdateDrill={(idx, d) => { const updated = [...savedDrills]; updated[idx] = d; setSavedDrills(updated); saveToLocalStorage('badminton_drills', updated); }}
              onDeleteSavedDrill={(idx) => { const updated = savedDrills.filter((_, i) => i !== idx); setSavedDrills(updated); saveToLocalStorage('badminton_drills', updated); }}
              onShareDrill={setDrillToShare}
              isLoading={isLoading}
            />
          </div>

          {error && <div className="max-w-2xl mx-auto bg-white p-6 rounded-3xl text-red-600 border border-red-100 font-bold shadow-xl shadow-red-600/5 animate-in slide-in-from-top-4">{error}</div>}
          
          {menu && (
            <div id="practice-result">
              <MenuDisplay 
                menu={menu} 
                onSave={() => handleSaveMenu(menu)}
                onShareToFriend={(friendId) => handleSendMessage(friendId, undefined, { type: 'menu', data: menu })}
                friends={friends}
                isSaved={savedMenus.some(m => m.title === menu.title && m.totalDuration === menu.totalDuration)}
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
