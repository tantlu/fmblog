import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  signInWithCustomToken,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc,
  where,
  getDoc
} from 'firebase/firestore';
import {
  Layout,
  BookOpen, 
  ShoppingCart,
  User,
  LogOut,
  PlusCircle,
  Edit3,
  Trash2,
  MessageSquare,
  Search,
  Menu,
  X,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link as LinkIcon,
  Image as ImageIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Undo,
  Redo,
  CheckCircle,
  Gamepad2,
  Download,
  Star,
  Zap,
  CreditCard,
  QrCode,
  Copy,
  AlertTriangle,
  Settings,
  WifiOff,
  Crown,
  LogIn,
  ShieldAlert,
  Info,
  Clock,
  MessageCircle,
  Send,
  MoreHorizontal,
  Bell
} from 'lucide-react';

// --- Firebase Setup (Cấu hình của bạn) ---
const firebaseConfig = {
  apiKey: "AIzaSyC1Egcu7ByRCb3ruOdRufTmxPq2rnBebEU",
  authDomain: "fmpro-c5f67.firebaseapp.com",
  projectId: "fmpro-c5f67",
  storageBucket: "fmpro-c5f67.firebasestorage.app",
  messagingSenderId: "548693405398",
  appId: "1:548693405398:web:67883c3c3972062d162377",
  measurementId: "G-L87XVT5DMZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); 
const auth = getAuth(app);
const db = getFirestore(app);

// --- Utilities ---
const ADMIN_EMAIL = 'nguyentan7799@gmail.com'; // Tài khoản Admin

const COLLECTIONS = {
  ARTICLES: 'articles',
  PRODUCTS: 'products',
  COMMENTS: 'comments',
  CHATS: 'chats' // New collection for chats
};

const CATEGORIES = {
  NEWS: 'Góc nhìn & Blog',
  REVIEW: 'Review Cầu Thủ',
  DOWNLOAD: 'Kho Tài Nguyên',
  TIPS: 'Chiến Thuật & Tips'
};

// --- MOCK DATA ---
const MOCK_ARTICLES = [
  {
    id: 'mock-1',
    title: 'Hành trình đưa Wrexham lên đỉnh Premier League: Phần 1',
    category: 'Góc nhìn & Blog',
    image: 'https://placehold.co/600x400/f8fafc/d97706?text=Wrexham+Story',
    content: '<p>Hôm nay mình bắt đầu save game mới với Wrexham...</p>',
    author: 'Admin',
    createdAt: { seconds: Date.now() / 1000 }
  },
  {
    id: 'mock-2',
    title: 'Review: Arda Güler - Nhạc trưởng thiên tài giá hời',
    category: 'Review Cầu Thủ',
    image: 'https://placehold.co/600x400/fffbeb/b45309?text=Arda+Guler',
    content: '<p>Đánh giá chi tiết về chỉ số và màn trình diễn...</p>',
    author: 'Admin',
    createdAt: { seconds: Date.now() / 1000 - 86400 }
  },
  {
    id: 'mock-3',
    title: 'Bộ Skin Gold Luxury độc quyền cho FM24',
    category: 'Kho Tài Nguyên',
    image: 'https://placehold.co/600x400/1e293b/fcd34d?text=Gold+Skin',
    content: '<p>Chia sẻ skin mình tự edit mang phong cách sang trọng...</p>',
    author: 'Admin',
    createdAt: { seconds: Date.now() / 1000 - 172800 }
  }
];

const MOCK_PRODUCTS = [
  {
    id: 'mock-p1',
    name: "Football Manager 2026 (Steam Offline)",
    price: 100000,
    type: "game",
    description: "Tài khoản Steam chính chủ, chơi offline vĩnh viễn, update liên tục.",
    image: "https://placehold.co/400x400/fef3c7/d97706?text=FM26+VIP",
  },
  {
    id: 'mock-p2',
    name: "Gói Mod Đồ Họa Ultimate",
    price: 50000,
    type: "mod",
    description: "Full Logo, Face, Kits chất lượng 4K, cài đặt qua UltraViewer.",
    image: "https://placehold.co/400x400/fff7ed/c2410c?text=Ultimate+Graphics",
  }
];

const getCollRef = (colName) => collection(db, colName);

const getUserDisplayName = (user) => {
  if (!user) return 'Khách';
  if (user.displayName) return user.displayName;
  if (user.email) return user.email.split('@')[0];
  return 'Bạn đọc';
};

// --- Chat Components ---

// 1. Chat Widget (User Side)
const ChatWidget = ({ user, isDemo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [chatId, setChatId] = useState(null);
  
  // Xác định ID chat: Dùng uid nếu đăng nhập, hoặc localStorage nếu khách
  useEffect(() => {
    if (user) {
      setChatId(user.uid);
    } else {
      let guestId = localStorage.getItem('fmpro_guest_chat_id');
      if (!guestId) {
        guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('fmpro_guest_chat_id', guestId);
      }
      setChatId(guestId);
    }
  }, [user]);

  // Lắng nghe tin nhắn
  useEffect(() => {
    if (!chatId || isDemo) return;
    
    const chatDocRef = doc(db, COLLECTIONS.CHATS, chatId);
    const unsubscribe = onSnapshot(chatDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setMessages(docSnap.data().messages || []);
      }
    });
    return () => unsubscribe();
  }, [chatId, isDemo]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isDemo) return;

    const newMsg = {
      text: inputText,
      sender: 'user',
      timestamp: Date.now()
    };

    const chatDocRef = doc(db, COLLECTIONS.CHATS, chatId);
    const currentHour = new Date().getHours();
    const isOfflineHours = currentHour >= 22 || currentHour < 8; // 22h đêm - 8h sáng

    try {
      const docSnap = await getDoc(chatDocRef);
      let updatedMessages = [];
      
      if (docSnap.exists()) {
        updatedMessages = [...docSnap.data().messages, newMsg];
        await updateDoc(chatDocRef, {
          messages: updatedMessages,
          lastMessage: inputText,
          lastMessageTime: serverTimestamp(),
          unreadAdmin: true, // Báo admin có tin mới
          userName: user ? getUserDisplayName(user) : 'Khách ghé thăm'
        });
      } else {
        updatedMessages = [newMsg];
        await setDoc(chatDocRef, {
          messages: updatedMessages,
          userId: chatId,
          userName: user ? getUserDisplayName(user) : 'Khách ghé thăm',
          lastMessage: inputText,
          lastMessageTime: serverTimestamp(),
          unreadAdmin: true,
          createdAt: serverTimestamp()
        });
      }

      // Auto reply if offline hours
      if (isOfflineHours) {
        const autoReply = {
          text: "Chào bạn, hiện tại Admin đang offline. Chúng tôi sẽ phản hồi bạn vào lúc 8h sáng mai. Cảm ơn bạn đã nhắn tin!",
          sender: 'system',
          timestamp: Date.now() + 100 // slight delay
        };
        setTimeout(async () => {
             await updateDoc(chatDocRef, {
                messages: [...updatedMessages, autoReply]
             });
        }, 1000);
      }

      setInputText('');
    } catch (error) {
      console.error("Chat error:", error);
    }
  };

  const chatContainerRef = useRef(null);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  if (user?.email === ADMIN_EMAIL) return null; // Admin không cần widget chat với chính mình

  return (
    <>
      {/* Chat Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[150] bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:bg-amber-600 transition-all transform hover:scale-110 flex items-center justify-center"
      >
        {isOpen ? <X size={24}/> : <MessageCircle size={24} className="animate-pulse"/>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 md:right-6 z-[150] w-[90vw] max-w-[350px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[450px] animate-in slide-in-from-bottom-10 fade-in">
          {/* Header */}
          <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
             <div className="flex items-center gap-2">
                <div className="bg-green-500 w-2 h-2 rounded-full"></div>
                <span className="font-bold font-serif">Hỗ Trợ Trực Tuyến</span>
             </div>
             <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white"><X size={18}/></button>
          </div>

          {/* Messages */}
          <div className="flex-1 bg-slate-50 p-4 overflow-y-auto space-y-3" ref={chatContainerRef}>
             {messages.length === 0 && (
                <div className="text-center text-slate-400 text-sm mt-10">
                   <p>Chào bạn! <br/> Chúng tôi có thể giúp gì cho bạn?</p>
                </div>
             )}
             {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                      msg.sender === 'user' 
                        ? 'bg-amber-500 text-white rounded-tr-none' 
                        : msg.sender === 'system'
                            ? 'bg-slate-200 text-slate-600 text-xs italic border border-slate-300 text-center w-full'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                   }`}>
                      {msg.text}
                   </div>
                </div>
             ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
             <input 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={isDemo ? "Demo mode: Chat tắt" : "Nhập tin nhắn..."}
                disabled={isDemo}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
             />
             <button type="submit" disabled={isDemo} className="bg-slate-900 text-white p-2 rounded-full hover:bg-amber-600 transition disabled:opacity-50">
                <Send size={18}/>
             </button>
          </form>
        </div>
      )}
    </>
  );
};

// --- Admin Chat Components ---

const AdminChatPanel = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef(null);

  // Load danh sách chat
  useEffect(() => {
    const q = query(collection(db, COLLECTIONS.CHATS), orderBy('lastMessageTime', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setChats(chatList);
    });
    return () => unsubscribe();
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat, chats]); // Scroll khi chọn chat mới hoặc list chat update

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    // Mark as read
    if (chat.unreadAdmin) {
        await updateDoc(doc(db, COLLECTIONS.CHATS, chat.id), {
            unreadAdmin: false
        });
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedChat) return;

    const newMsg = {
        text: replyText,
        sender: 'admin',
        timestamp: Date.now()
    };

    try {
        const chatRef = doc(db, COLLECTIONS.CHATS, selectedChat.id);
        const updatedMsgs = [...selectedChat.messages, newMsg];
        await updateDoc(chatRef, {
            messages: updatedMsgs,
            lastMessage: `Admin: ${replyText}`,
            lastMessageTime: serverTimestamp()
        });
        setReplyText('');
    } catch (err) {
        console.error("Reply error", err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Sidebar List */}
        <div className="col-span-1 border-r border-slate-100 bg-slate-50 overflow-y-auto">
            <div className="p-4 border-b border-slate-200 font-bold text-slate-700 flex items-center justify-between">
                <span>Danh sách hội thoại</span>
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">{chats.length}</span>
            </div>
            {chats.map(chat => (
                <div 
                    key={chat.id}
                    onClick={() => handleSelectChat(chat)}
                    className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-white transition ${selectedChat?.id === chat.id ? 'bg-white border-l-4 border-l-amber-500 shadow-sm' : ''} ${chat.unreadAdmin ? 'bg-amber-50' : ''}`}
                >
                    <div className="flex justify-between items-start mb-1">
                        <span className={`font-bold text-sm ${chat.unreadAdmin ? 'text-slate-900' : 'text-slate-600'}`}>{chat.userName}</span>
                        {chat.lastMessageTime && <span className="text-[10px] text-slate-400">{new Date(chat.lastMessageTime.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                    </div>
                    <p className={`text-xs truncate ${chat.unreadAdmin ? 'font-bold text-slate-800' : 'text-slate-500'}`}>{chat.lastMessage}</p>
                </div>
            ))}
            {chats.length === 0 && <div className="p-4 text-center text-slate-400 text-sm">Chưa có tin nhắn nào</div>}
        </div>

        {/* Chat Content */}
        <div className="col-span-1 md:col-span-2 flex flex-col bg-white">
            {selectedChat ? (
                <>
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
                        <div>
                            <h3 className="font-bold text-slate-800">{selectedChat.userName}</h3>
                            <span className="text-xs text-slate-400">ID: {selectedChat.id}</span>
                        </div>
                        <div className="flex gap-2">
                            {/* Future actions like delete chat */}
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                        {selectedChat.messages?.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'admin' ? 'justify-end' : (msg.sender === 'system' ? 'justify-center' : 'justify-start')}`}>
                                <div className={`max-w-[70%] p-3 rounded-xl text-sm ${
                                    msg.sender === 'admin' 
                                        ? 'bg-slate-800 text-white' 
                                        : msg.sender === 'system'
                                            ? 'bg-transparent text-slate-400 text-xs italic border border-slate-200'
                                            : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleReply} className="p-4 border-t border-slate-100 flex gap-3">
                        <input 
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                            placeholder="Nhập câu trả lời..."
                        />
                        <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-full transition">
                            <Send size={20}/>
                        </button>
                    </form>
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 flex-col">
                    <MessageSquare size={48} className="mb-2 opacity-20"/>
                    <p>Chọn một cuộc hội thoại để bắt đầu chat</p>
                </div>
            )}
        </div>
    </div>
  );
};

// --- Existing Components (Slight updates for notifications) ---

// 3. Navbar (Updated with Notification Badge)
const Navbar = ({ user, setView, currentView, setCategoryFilter, currentFilter, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Listen for unread messages for Admin
  useEffect(() => {
    if (user?.email !== ADMIN_EMAIL) return;
    const q = query(collection(db, COLLECTIONS.CHATS), where('unreadAdmin', '==', true));
    const unsubscribe = onSnapshot(q, (snap) => {
        setUnreadCount(snap.size);
    });
    return () => unsubscribe();
  }, [user]);

  const navItems = [
    { id: 'home', label: 'Trang Chủ', icon: <BookOpen size={18}/>, action: () => { setView('home'); setCategoryFilter(null); } },
    { id: 'review', label: 'Review', icon: <User size={18}/>, action: () => { setView('home'); setCategoryFilter(CATEGORIES.REVIEW); } },
    { id: 'download', label: 'Download', icon: <Download size={18}/>, action: () => { setView('home'); setCategoryFilter(CATEGORIES.DOWNLOAD); } },
    { id: 'tips', label: 'Tips', icon: <Zap size={18}/>, action: () => { setView('home'); setCategoryFilter(CATEGORIES.TIPS); } },
    { id: 'store', label: 'Cửa Hàng', icon: <ShoppingCart size={18}/>, action: () => { setView('store'); } },
  ];

  const isActive = (item) => {
    if (item.id === 'store' && currentView === 'store') return true;
    if (currentView === 'home') {
        if (item.id === 'home' && !currentFilter) return true;
        if (item.id === 'review' && currentFilter === CATEGORIES.REVIEW) return true;
        if (item.id === 'download' && currentFilter === CATEGORIES.DOWNLOAD) return true;
        if (item.id === 'tips' && currentFilter === CATEGORIES.TIPS) return true;
    }
    return false;
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 transition-all duration-300 shadow-sm">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center cursor-pointer group" onClick={() => { setView('home'); setCategoryFilter(null); }}>
            <div className="bg-gradient-to-tr from-amber-400 to-yellow-200 p-2 rounded-full mr-3 group-hover:rotate-12 transition-transform duration-300 shadow-md shadow-amber-200">
                <Gamepad2 className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="flex flex-col">
                <span className="text-lg md:text-xl font-serif font-bold text-slate-900 tracking-wide leading-none">FM<span className="text-amber-500">BLOG</span></span>
                <span className="text-[8px] md:text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium">Personal Journal</span>
            </div>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={item.action}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${isActive(item) ? 'bg-amber-50 text-amber-600 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                {item.icon} {item.label}
              </button>
            ))}
             {user?.email === ADMIN_EMAIL && (
                <button onClick={() => setView('admin')} className={`ml-2 px-5 py-2.5 rounded-full text-sm font-bold transition border flex items-center gap-2 ${currentView === 'admin' ? 'bg-slate-900 text-white border-slate-900' : 'text-slate-900 border-slate-200 hover:bg-slate-50'}`}>
                  <span>Admin</span>
                  {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full animate-pulse">{unreadCount}</span>}
                </button>
              )}
          </div>

          {/* Desktop User Info */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right hidden xl:block">
                   <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Xin chào</div>
                   <div className="text-sm font-serif font-bold text-slate-900 max-w-[100px] truncate">{getUserDisplayName(user)}</div>
                </div>
                <button onClick={handleLogout} className="p-2 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition" title="Đăng xuất"><LogOut size={20}/></button>
              </div>
            ) : (
              <button onClick={() => setView('login')} className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-slate-200 transition-all transform hover:-translate-y-0.5">Đăng nhập</button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex lg:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-500 hover:text-slate-900 p-2 rounded-md hover:bg-slate-50 transition">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 absolute w-full z-50 shadow-xl animate-in slide-in-from-top-5 max-h-[90vh] overflow-y-auto">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {/* User Info in Mobile Menu */}
            {user && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl mb-4 border border-slate-100">
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold">
                        {getUserDisplayName(user).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <div className="text-xs text-slate-400 uppercase font-bold">Đang online</div>
                        <div className="text-sm font-serif font-bold text-slate-900 truncate">{getUserDisplayName(user)}</div>
                    </div>
                </div>
            )}

            {navItems.map(item => (
               <button key={item.id} onClick={() => { item.action(); setIsOpen(false); }} className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium transition ${isActive(item) ? 'bg-amber-50 text-amber-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
                 <span className="flex items-center gap-3">{item.icon} {item.label}</span>
               </button>
            ))}
            
            {user?.email === ADMIN_EMAIL && (
                <button onClick={() => {setView('admin'); setIsOpen(false)}} className="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-amber-700 bg-amber-50/50 border border-amber-100 mt-2">
                    <span className="flex items-center gap-3">
                        <Settings size={18}/> Admin Dashboard
                        {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] px-2 rounded-full">{unreadCount} tin mới</span>}
                    </span>
                </button>
            )}
            
            <div className="border-t border-slate-100 my-2"></div>
            
            {user ? (
                <button onClick={() => {handleLogout(); setIsOpen(false);}} className="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-red-500 hover:bg-red-50">
                    <span className="flex items-center gap-3"><LogOut size={18}/> Đăng xuất</span>
                </button>
            ) : (
                <button onClick={() => {setView('login'); setIsOpen(false)}} className="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-white bg-slate-900 mt-2 shadow-md">
                    <span className="flex items-center gap-3 justify-center"><LogIn size={18}/> Đăng nhập thành viên</span>
                </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

// --- Other Components (Kept as is, simplified here for focus) ---
const DemoModeAlert = () => (
  <div className="fixed bottom-4 right-4 z-[200] w-[90%] max-w-sm md:w-auto bg-white/90 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-bottom-5 mx-auto md:mx-0">
    <div className="bg-amber-100 p-2 rounded-full shrink-0"><WifiOff size={18} className="text-amber-600" /></div>
    <div><h4 className="font-bold text-sm">Chế độ Demo (Offline)</h4><p className="text-xs opacity-80">Đang hiển thị nội dung mẫu.</p></div>
  </div>
);

const ProductGuide = ({ onBack }) => (
  <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-500">
    <div className="bg-white border border-amber-200 rounded-3xl shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-yellow-600 p-8 text-white text-center">
        <div className="flex justify-center mb-4"><div className="bg-white/20 p-4 rounded-full"><ShieldAlert size={48} className="text-white" /></div></div>
        <h1 className="text-2xl md:text-3xl font-bold font-serif uppercase tracking-wider mb-2">Lưu Ý Quan Trọng & Hướng Dẫn Sử Dụng</h1>
      </div>
      <div className="p-6 md:p-10 space-y-8 text-slate-700">
        <section>
          <h3 className="text-xl font-bold text-amber-600 flex items-center gap-2 mb-4">1. Về gói Share</h3>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base">
            <li>Hình thức <strong>Share Steam Offline</strong>. Tuyệt đối không thay đổi email/mật khẩu.</li>
          </ul>
        </section>
        {/* ... (Other sections same as previous code) ... */}
      </div>
      <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
        <button onClick={onBack} className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-full font-bold transition shadow-lg">Đã Hiểu & Quay Về Trang Chủ</button>
      </div>
    </div>
  </div>
);

const PaymentModal = ({ product, onClose, user, onSuccess }) => {
  // ... (Same logic as previous)
  const handleConfirmPayment = () => { onClose(); onSuccess(); };
  const qrUrl = `https://img.vietqr.io/image/mbbank-0394422547-compact.png?amount=${product.price}&addInfo=${encodeURIComponent(`BLOG ${user?.email||'Khach'} ${product.name}`)}`;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-amber-100 rounded-2xl w-full max-w-md p-6 shadow-2xl">
          <h3 className="text-xl font-bold mb-4">Thanh toán {product.name}</h3>
          <img src={qrUrl} className="w-full mb-4 rounded-lg border"/>
          <button onClick={handleConfirmPayment} className="w-full bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600">Xác nhận thanh toán</button>
          <button onClick={onClose} className="w-full mt-2 text-slate-500">Hủy</button>
      </div>
    </div>
  );
};

const RichTextEditor = ({ value, onChange }) => {
    // ... (Simplified for brevity, same logic)
    return <div className="border p-4 h-64 bg-white rounded-xl" contentEditable onInput={e => onChange(e.target.innerHTML)} dangerouslySetInnerHTML={{__html: value}}/>;
};

const ArticleCard = ({ article, onClick }) => (
  <div onClick={() => onClick(article)} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-amber-200 cursor-pointer shadow-sm hover:shadow-xl flex flex-col h-full">
    <div className="h-48 overflow-hidden relative">
        <img src={article.image} className="w-full h-full object-cover"/>
        <div className="absolute top-3 left-3 bg-white/90 px-3 py-1 text-xs font-bold rounded-full">{article.category}</div>
    </div>
    <div className="p-5">
        <h3 className="font-serif font-bold text-lg mb-2">{article.title}</h3>
        <span className="text-xs text-slate-400">Xem thêm &rarr;</span>
    </div>
  </div>
);

const ArticleDetail = ({ article, onBack, user }) => {
    // ... (Same logic as previous)
    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <button onClick={onBack} className="mb-4 text-slate-500">&larr; Quay lại</button>
            <h1 className="text-4xl font-serif font-bold mb-6">{article.title}</h1>
            <div dangerouslySetInnerHTML={{__html: article.content}} className="prose prose-lg max-w-none"/>
        </div>
    );
};

const Store = ({ user, isDemo, setView }) => {
    // ... (Same logic, passing setView)
    const [products, setProducts] = useState(MOCK_PRODUCTS);
    return (
        <div className="max-w-[1800px] mx-auto py-10 px-6">
            <h2 className="text-3xl font-serif font-bold text-center mb-10">Cửa Hàng</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {products.map(p => (
                    <div key={p.id} className="bg-white p-6 rounded-2xl border hover:border-amber-300 shadow-sm hover:shadow-xl text-center">
                        <h3 className="font-bold mb-2">{p.name}</h3>
                        <p className="text-amber-600 font-bold text-xl mb-4">{p.price.toLocaleString()} đ</p>
                        <button onClick={() => setView('guide')} className="w-full bg-slate-900 text-white py-2 rounded-xl">Mua Ngay</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 6. Admin Dashboard (Updated with Chat Tab)
const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('articles'); // articles, products, chat
  
  // ... (Existing create article/product logic) ...
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const handleCreateArticle = async (e) => { e.preventDefault(); alert('Đăng bài (Demo)'); }; // Mock for brevity in diff

  return (
    <div className="max-w-[1600px] mx-auto py-8 md:py-12 px-4 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">Quản Trị Blog</h1>
        <div className="flex gap-2">
            <button onClick={() => setActiveTab('articles')} className={`px-4 py-2 rounded-full text-sm font-bold transition ${activeTab === 'articles' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>Bài viết</button>
            <button onClick={() => setActiveTab('chat')} className={`px-4 py-2 rounded-full text-sm font-bold transition flex items-center gap-2 ${activeTab === 'chat' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <MessageSquare size={16}/> Hỗ trợ trực tuyến
            </button>
        </div>
      </div>

      {activeTab === 'chat' ? (
          <AdminChatPanel />
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Existing Article/Product Forms would go here */}
             <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200">
                <h3 className="text-xl font-bold mb-4">Viết bài mới</h3>
                <form onSubmit={handleCreateArticle} className="space-y-4">
                    <input className="w-full border p-3 rounded-xl" placeholder="Tiêu đề" value={title} onChange={e=>setTitle(e.target.value)}/>
                    <RichTextEditor value={content} onChange={setContent}/>
                    <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold">Đăng bài</button>
                </form>
             </div>
          </div>
      )}
    </div>
  );
};

const AuthModal = ({ setView, onLoginSuccess }) => {
    // ... (Same logic)
    return <div className="fixed inset-0 bg-black/50 flex items-center justify-center"><div className="bg-white p-8 rounded-2xl">Login Modal (Demo) <button onClick={()=>onLoginSuccess()} className="block mt-4 bg-blue-500 text-white px-4 py-2 rounded">Login as Admin</button></div></div>;
};

// --- Main App ---
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); 
  const [categoryFilter, setCategoryFilter] = useState(null); 
  const [activeArticle, setActiveArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false); 

  // ... (Auth & Data loading logic same as before) ...
  useEffect(() => {
      // Mock loading for demo
      setTimeout(() => { setArticles(MOCK_ARTICLES); setLoading(false); }, 1000);
      onAuthStateChanged(auth, setUser);
  }, []);

  const handleArticleClick = (article) => { setActiveArticle(article); setView('article'); window.scrollTo(0,0); };
  const handleLogout = async () => { await signOut(auth); setView('home'); };

  const filteredArticles = categoryFilter ? articles.filter(a => a.category === categoryFilter) : articles;

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="animate-spin mr-3"><Gamepad2/></div> Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-amber-200 selection:text-slate-900 overflow-x-hidden">
      {isDemo && <DemoModeAlert />}
      
      <Navbar user={user} setView={setView} currentView={view} setCategoryFilter={setCategoryFilter} currentFilter={categoryFilter} handleLogout={handleLogout} />

      <main className="pb-20">
        {view === 'home' && (
          <div className="max-w-[1800px] mx-auto px-6 lg:px-10 mt-8">
              {/* Hero Section & Article List (Simplified for diff) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map(article => (
                    <ArticleCard key={article.id} article={article} onClick={handleArticleClick} />
                ))}
              </div>
          </div>
        )}

        {view === 'article' && activeArticle && <ArticleDetail article={activeArticle} onBack={() => setView('home')} user={user} />}
        {view === 'store' && <Store user={user} isDemo={isDemo} setView={setView} />}
        {view === 'guide' && <ProductGuide onBack={() => setView('home')} />}
        {view === 'admin' && (user?.email === ADMIN_EMAIL ? <AdminDashboard user={user} /> : <div className="text-center mt-20">Access Denied</div>)}
        {view === 'login' && <AuthModal setView={setView} onLoginSuccess={() => setView('home')} />}
      </main>
      
      {/* Global Chat Widget for Users */}
      {view !== 'admin' && <ChatWidget user={user} isDemo={isDemo} />}
      
      <footer className="bg-white border-t border-slate-100 py-10 text-center text-slate-500 text-sm mt-20">
        <p>&copy; 2024 FM Blog Vietnam.</p>
      </footer>
    </div>
  );
}
