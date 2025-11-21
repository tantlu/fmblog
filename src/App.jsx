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
  updateProfile,
  sendPasswordResetEmail
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
  AlignJustify,
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
  Bell,
  Camera,
  Mail,
  Lock,
  Save,
  Quote,
  Indent,
  Outdent,
  Superscript,
  Subscript,
  Minus,
  Eraser,
  Type,
  Highlighter,
  Palette,
  Facebook,
  Phone
} from 'lucide-react';

// --- 1. CONFIGURATION & UTILS ---

const firebaseConfig = {
  apiKey: "AIzaSyC1Egcu7ByRCb3ruOdRufTmxPq2rnBebEU",
  authDomain: "fmpro-c5f67.firebaseapp.com",
  projectId: "fmpro-c5f67",
  storageBucket: "fmpro-c5f67.firebasestorage.app",
  messagingSenderId: "548693405398",
  appId: "1:548693405398:web:67883c3c3972062d162377",
  measurementId: "G-L87XVT5DMZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = 'nguyentan7799@gmail.com';

const COLLECTIONS = {
  ARTICLES: 'articles',
  PRODUCTS: 'products',
  COMMENTS: 'comments',
  CHATS: 'chats'
};

const CATEGORIES = {
  NEWS: 'News',
  REVIEW: 'Review Cầu Thủ',
  DOWNLOAD: 'Kho Tài Nguyên',
  TIPS: 'Chiến Thuật & Tips'
};

const MOCK_ARTICLES = [
  {
    id: 'mock-1',
    title: 'Hành trình đưa Wrexham lên đỉnh Premier League: Phần 1',
    category: 'News',
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
  }
];

const getCollRef = (colName) => collection(db, colName);

const getUserDisplayName = (user) => {
  if (!user) return 'Khách';
  if (user.displayName) return user.displayName;
  if (user.email) return user.email.split('@')[0];
  return 'Bạn đọc';
};

const formatDateSafe = (timestamp) => {
  if (!timestamp || !timestamp.seconds) return 'Vừa xong';
  try {
    return new Date(timestamp.seconds * 1000).toLocaleDateString('vi-VN');
  } catch (e) {
    return '...';
  }
};

const getFriendlyErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/invalid-email': return 'Email không hợp lệ.';
    case 'auth/user-not-found': return 'Tài khoản không tồn tại.';
    case 'auth/wrong-password': return 'Sai mật khẩu.';
    case 'auth/email-already-in-use': return 'Email này đã được đăng ký.';
    case 'auth/weak-password': return 'Mật khẩu quá yếu (cần ít nhất 6 ký tự).';
    case 'auth/too-many-requests': return 'Quá nhiều lần thử. Vui lòng thử lại sau.';
    case 'auth/operation-not-allowed': return 'Chưa bật đăng nhập Email/Pass trong Firebase Console.';
    default: return errorCode;
  }
};

// --- 2. COMPONENTS (Using Function Declarations for Hoisting) ---

function DemoModeAlert() {
  return (
    <div className="fixed bottom-4 right-4 z-[200] w-[90%] max-w-sm md:w-auto bg-white/90 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-bottom-5 mx-auto md:mx-0">
      <div className="bg-amber-100 p-2 rounded-full shrink-0">
        <WifiOff size={18} className="text-amber-600" />
      </div>
      <div>
        <h4 className="font-bold text-sm">Chế độ Demo (Offline)</h4>
        <p className="text-xs opacity-80">Không kết nối được Firebase. Dữ liệu là mẫu.</p>
      </div>
    </div>
  );
}

function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">Về Chúng Tôi</h2>
        <div className="h-1 w-24 bg-amber-500 mx-auto rounded-full"></div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/2 p-8 md:p-12 bg-slate-50 flex flex-col justify-center">
          <h3 className="text-2xl font-serif font-bold text-slate-800 mb-4">Chúng tôi là ai?</h3>
          <p className="text-slate-600 leading-relaxed mb-6">
            FM PRO BLOG là điểm đến tin cậy cho cộng đồng Football Manager tại Việt Nam. Chúng tôi cung cấp các giải pháp chơi game bản quyền giá rẻ, chia sẻ kiến thức, chiến thuật và các bản mod chất lượng cao.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Với đội ngũ admin nhiệt huyết và giàu kinh nghiệm, chúng tôi cam kết mang lại trải nghiệm tốt nhất cho các HLV online.
          </p>
        </div>
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center bg-gradient-to-br from-slate-900 to-slate-800 text-white text-center">
          <div className="bg-white/10 p-4 rounded-full mb-6">
            <Mail size={32} className="text-amber-400" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Liên Hệ Hỗ Trợ</h3>
          <p className="text-slate-400 mb-8 text-sm">Gặp vấn đề? Inbox ngay cho Admin.</p>

          <a
            href="https://www.facebook.com/tanlan.2001"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/50"
          >
            <Facebook size={20} /> Chat qua Facebook
          </a>
        </div>
      </div>
    </div>
  );
}

function ProductGuide({ onBack }) {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-500">
      <div className="bg-white border border-amber-200 rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-yellow-600 p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-4 rounded-full">
              <ShieldAlert size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif uppercase tracking-wider mb-2">Lưu Ý Quan Trọng & Hướng Dẫn Sử Dụng</h1>
          <p className="opacity-90 text-sm md:text-base">Để đảm bảo quyền lợi và trải nghiệm, bạn vui lòng ĐỌC KỸ các thông tin sau</p>
        </div>

        <div className="p-6 md:p-10 space-y-8 text-slate-700">
          <section>
            <h3 className="text-xl font-bold text-amber-600 flex items-center gap-2 mb-4">
              <span className="bg-amber-100 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
              Về gói Share
            </h3>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-4 text-blue-800 font-medium">
              👉 Khi thanh toán xong, hãy nhắn tin cho <strong>ADMIN</strong> bằng cách chat trong web hoặc liên hệ FB ở mục "Liên hệ".
            </div>
            <ul className="list-disc pl-5 space-y-2 text-sm md:text-base leading-relaxed">
              <li>Bạn sẽ nhận được một <strong>Tài khoản Steam có sẵn Football Manager 2026 PC</strong>.</li>
              <li>Đây là hình thức <strong>Share Steam Offline</strong> (chơi ở chế độ ngoại tuyến).</li>
              <li>File save game được lưu riêng trên máy tính của bạn, hoàn toàn bảo mật.</li>
              <li className="text-red-600 font-bold bg-red-50 p-2 rounded-lg">Tuyệt đối không thay đổi email hay mật khẩu của tài khoản được cấp.</li>
              <li className="italic text-slate-500">Lưu ý: Gói này không hỗ trợ chơi tại tiệm nét hoặc qua các dịch vụ Cloud PC.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-amber-600 flex items-center gap-2 mb-4">
              <span className="bg-amber-100 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              Sau khi đã cài đặt xong
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 text-sm md:text-base">
              <p className="flex items-start gap-2"><AlertTriangle className="text-amber-500 shrink-0 mt-1" size={18} /> <strong>KHÔNG nhấn "Go Online"</strong> hoặc thay đổi nick khác trên Steam.</p>
              <p>Khi Steam Client hiện thông báo yêu cầu "Update / Cancel", hãy nhấn <strong>CANCEL</strong>.</p>
              <p>Khi game có bản vá (patch) mới, vui lòng <strong>Inbox cho Page</strong> để được hỗ trợ cập nhật.</p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-amber-600 flex items-center gap-2 mb-4">
              <span className="bg-amber-100 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
              Khi Steam yêu cầu "Go Online" để chơi tiếp
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-slate-200 p-4 rounded-xl">
                <h4 className="font-bold mb-2 text-slate-900">Bước 1:</h4>
                <p className="text-sm text-slate-600">Vui lòng tự kiểm tra và Update Windows, driver card màn hình và các driver khác trong máy tính của bạn lên bản mới nhất.</p>
              </div>
              <div className="border border-slate-200 p-4 rounded-xl">
                <h4 className="font-bold mb-2 text-slate-900">Bước 2:</h4>
                <p className="text-sm text-slate-600">Hãy <strong>Inbox cho Admin</strong> để được hỗ trợ sửa lỗi.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-amber-600 flex items-center gap-2 mb-4">
              <span className="bg-amber-100 w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
              Một vài lưu ý khác
            </h3>
            <div className="space-y-4 text-sm md:text-base">
              <div>
                <strong className="block text-slate-900 mb-1">Bạn đã có nick Steam khác?</strong>
                <p>Bạn vẫn share offline được, nhưng cần tuân thủ đúng các bước hướng dẫn. Page sẵn sàng hỗ trợ nếu bị văng nick hoặc lỗi "Go Online", nhưng sẽ <strong>hạn chế hỗ trợ</strong> nếu bạn tự ý đổi nick qua lại để chơi game khác.</p>
              </div>
              <div>
                <strong className="block text-slate-900 mb-1 flex items-center gap-2"><Info size={16} /> Phạm vi hỗ trợ:</strong>
                <p>Page chỉ hỗ trợ các vấn đề liên quan đến cài đặt và kích hoạt game. Các vấn đề về gameplay, chiến thuật... vui lòng tham gia group cộng đồng: <a href="https://www.facebook.com/groups/fmvnofficial" target="_blank" rel="noreferrer" className="text-blue-600 underline">FMVN Official</a></p>
              </div>
              <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-slate-100">
                <div className="flex-1 bg-amber-50 p-3 rounded-lg flex gap-3 items-start">
                  <Clock className="text-amber-600 shrink-0" size={20} />
                  <div>
                    <strong className="block text-amber-800 text-sm">Giờ hỗ trợ</strong>
                    <p className="text-xs text-amber-700 mt-1">Tránh nhắn tin sau 11h đêm.</p>
                  </div>
                </div>
                <div className="flex-1 bg-blue-50 p-3 rounded-lg flex gap-3 items-start">
                  <Clock className="text-blue-600 shrink-0" size={20} />
                  <div>
                    <strong className="block text-blue-800 text-sm">Thời gian chờ</strong>
                    <p className="text-xs text-blue-700 mt-1">Nếu quá tải, vui lòng đợi 12 - 48 giờ.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <button onClick={onBack} className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-full font-bold transition shadow-lg">
            Đã Hiểu & Quay Về Trang Chủ
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentModal({ product, onClose, user, onSuccess }) {
  const bankInfo = {
    bankId: 'mbbank',
    accountNo: '0394422547',
    accountName: 'NGUYEN DUY TAN',
    template: 'compact'
  };

  const userName = getUserDisplayName(user);
  const memo = `BLOG ${userName} mua ${product.name}`.replace(/[^a-zA-Z0-9 ]/g, "");
  const qrUrl = `https://img.vietqr.io/image/${bankInfo.bankId}-${bankInfo.accountNo}-${bankInfo.template}.png?amount=${product.price}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(bankInfo.accountName)}`;

  const handleConfirmPayment = () => {
    onClose();
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-amber-100 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 bg-gradient-to-br from-amber-50 to-white">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800 font-serif">Thanh toán</h3>
              <p className="text-amber-600 text-sm mt-1 font-medium line-clamp-1">{product.name}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-800 p-1"><X size={24} /></button>
          </div>

          <div className="bg-white p-4 rounded-xl mb-6 flex justify-center border border-slate-100 shadow-inner">
            <img src={qrUrl} alt="QR Code Payment" className="w-full max-w-[280px] object-contain rounded-lg" />
          </div>

          <div className="space-y-3 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between">
              <span>Ngân hàng:</span>
              <span className="font-bold text-slate-800">MB Bank</span>
            </div>
            <div className="flex justify-between">
              <span>Số tiền:</span>
              <span className="font-bold text-slate-900 text-lg">{product.price.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="shrink-0">Nội dung:</span>
              <span className="font-mono text-xs text-right text-slate-500 break-all">{memo}</span>
            </div>
          </div>

          <button onClick={handleConfirmPayment} className="w-full mt-6 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-amber-200 flex items-center justify-center gap-2 active:scale-95">
            <CheckCircle size={20} /> Xác nhận thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatWidget({ user, isDemo }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [chatId, setChatId] = useState(null);
  const chatContainerRef = useRef(null);

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

  useEffect(() => {
    if (!chatId || isDemo) return;

    const chatsColRef = getCollRef(COLLECTIONS.CHATS);
    const chatDocRef = doc(chatsColRef, chatId);

    const unsubscribe = onSnapshot(chatDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setMessages(docSnap.data().messages || []);
      }
    });
    return () => unsubscribe();
  }, [chatId, isDemo]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isDemo) return;

    const newMsg = {
      text: inputText,
      sender: 'user',
      timestamp: Date.now()
    };

    const chatsColRef = getCollRef(COLLECTIONS.CHATS);
    const chatDocRef = doc(chatsColRef, chatId);
    const currentHour = new Date().getHours();
    const isOfflineHours = currentHour >= 22 || currentHour < 8;

    try {
      const docSnap = await getDoc(chatDocRef);
      let updatedMessages = [];

      if (docSnap.exists()) {
        updatedMessages = [...docSnap.data().messages, newMsg];
        await updateDoc(chatDocRef, {
          messages: updatedMessages,
          lastMessage: inputText,
          lastMessageTime: serverTimestamp(),
          unreadAdmin: true,
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

      if (isOfflineHours) {
        const autoReply = {
          text: "Chào bạn, hiện tại Admin đang offline. Chúng tôi sẽ phản hồi bạn vào lúc 8h sáng mai. Cảm ơn bạn đã nhắn tin!",
          sender: 'system',
          timestamp: Date.now() + 100
        };
        setTimeout(async () => {
          const snap = await getDoc(chatDocRef);
          if (snap.exists()) {
            const currentMsgs = snap.data().messages;
            await updateDoc(chatDocRef, {
              messages: [...currentMsgs, autoReply]
            });
          }
        }, 1000);
      }

      setInputText('');
    } catch (error) {
      console.error("Chat error:", error);
    }
  };

  if (user?.email === ADMIN_EMAIL) return null;

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[150] bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:bg-amber-600 transition-all transform hover:scale-110 flex items-center justify-center">
        {isOpen ? <X size={24} /> : <MessageCircle size={24} className="animate-pulse" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 md:right-6 z-[150] w-[90vw] max-w-[350px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[450px] animate-in slide-in-from-bottom-10 fade-in">
          <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-green-500 w-2 h-2 rounded-full"></div>
              <span className="font-bold font-serif">Hỗ Trợ Trực Tuyến</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
          </div>

          <div className="flex-1 bg-slate-50 p-4 overflow-y-auto space-y-3" ref={chatContainerRef}>
            {messages.length === 0 && (
              <div className="text-center text-slate-400 text-sm mt-10">
                <p>Chào bạn! <br /> Chúng tôi có thể giúp gì cho bạn?</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.sender === 'user' ? 'bg-amber-500 text-white rounded-tr-none' : msg.sender === 'system' ? 'bg-slate-200 text-slate-600 text-xs italic border border-slate-300 text-center w-full' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={isDemo ? "Demo mode: Chat tắt" : "Nhập tin nhắn..."}
              disabled={isDemo}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
            />
            <button type="submit" disabled={isDemo} className="bg-slate-900 text-white p-2 rounded-full hover:bg-amber-600 transition disabled:opacity-50">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function AdminChatPanel() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const q = query(getCollRef(COLLECTIONS.CHATS), orderBy('lastMessageTime', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setChats(chatList);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat, chats]);

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    if (chat.unreadAdmin) {
      const chatsCollection = getCollRef(COLLECTIONS.CHATS);
      await updateDoc(doc(chatsCollection, chat.id), {
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
      const chatsCollection = getCollRef(COLLECTIONS.CHATS);
      const chatRef = doc(chatsCollection, selectedChat.id);
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
              {chat.lastMessageTime && <span className="text-[10px] text-slate-400">{formatDateSafe(chat.lastMessageTime)}</span>}
            </div>
            <p className={`text-xs truncate ${chat.unreadAdmin ? 'font-bold text-slate-800' : 'text-slate-500'}`}>{chat.lastMessage}</p>
          </div>
        ))}
        {chats.length === 0 && <div className="p-4 text-center text-slate-400 text-sm">Chưa có tin nhắn nào</div>}
      </div>

      <div className="col-span-1 md:col-span-2 flex flex-col bg-white">
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h3 className="font-bold text-slate-800">{selectedChat.userName}</h3>
                <span className="text-xs text-slate-400">ID: {selectedChat.id}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {selectedChat.messages?.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'admin' ? 'justify-end' : (msg.sender === 'system' ? 'justify-center' : 'justify-start')}`}>
                  <div className={`max-w-[70%] p-3 rounded-xl text-sm ${msg.sender === 'admin' ? 'bg-slate-800 text-white' : msg.sender === 'system' ? 'bg-transparent text-slate-400 text-xs italic border border-slate-200' : 'bg-white border border-slate-200 text-slate-800 shadow-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleReply} className="p-4 border-t border-slate-100 flex gap-3">
              <input value={replyText} onChange={e => setReplyText(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-amber-500" placeholder="Nhập câu trả lời..." />
              <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-full transition"><Send size={20} /></button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 flex-col">
            <MessageSquare size={48} className="mb-2 opacity-20" />
            <p>Chọn một cuộc hội thoại để bắt đầu chat</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfilePage({ user, onBack }) {
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await updateProfile(user, { displayName, photoURL });
      setMessage('Cập nhật thông tin thành công!');
    } catch (err) { setError(getFriendlyErrorMessage(err.code)); }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      setMessage(`Đã gửi email đặt lại mật khẩu tới ${user.email}`);
    } catch (err) { setError(getFriendlyErrorMessage(err.code)); }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in duration-500">
      <div className="mb-8 flex items-center gap-2">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-sm font-bold">&larr; Quay lại</button>
      </div>
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white text-center relative">
          <div className="relative z-10">
            <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 p-1 flex items-center justify-center overflow-hidden shadow-lg">
              {photoURL ? <img src={photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" /> : <User size={48} className="text-slate-300" />}
            </div>
            <h1 className="text-2xl font-serif font-bold">{user?.displayName || 'Chưa đặt tên'}</h1>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            {user?.email === ADMIN_EMAIL && <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded ml-2">ADMIN</span>}
          </div>
        </div>
        <div className="p-8">
          {message && <div className="mb-6 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2"><CheckCircle size={16} /> {message}</div>}
          {error && <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2"><AlertTriangle size={16} /> {error}</div>}
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tên hiển thị</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400" size={18} />
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition" placeholder="Nhập tên của bạn" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Avatar (Link ảnh)</label>
              <div className="relative">
                <Camera className="absolute left-3 top-3 text-slate-400" size={18} />
                <input type="text" value={photoURL} onChange={(e) => setPhotoURL(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition" placeholder="https://example.com/avatar.jpg" />
              </div>
            </div>
            <div className="pt-4 flex flex-col gap-4">
              <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-amber-600 transition shadow-lg flex items-center justify-center gap-2"><Save size={18} /> Lưu Thay Đổi</button>
              <div className="border-t border-slate-100 pt-4 mt-2">
                <h4 className="text-sm font-bold text-slate-700 mb-3">Bảo mật</h4>
                <button type="button" onClick={handleResetPassword} className="w-full border border-slate-200 text-slate-600 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition flex items-center justify-center gap-2"><Lock size={16} /> Đổi mật khẩu (Gửi Email)</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCmd = (command, val = null) => {
    document.execCommand(command, false, val);
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const addImage = () => {
    const url = prompt("Nhập đường dẫn ảnh (URL):");
    if (url) execCmd('insertImage', url);
  };

  const addLink = () => {
    const url = prompt("Nhập đường dẫn liên kết:");
    if (url) execCmd('createLink', url);
  };

  const ToolBtn = ({ onClick, icon: Icon, title }) => (
    <button type="button" onClick={onClick} className="p-2 hover:bg-slate-200 rounded text-slate-600 transition hover:text-amber-600 shrink-0" title={title}><Icon size={18} /></button>
  );

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col h-[400px] md:h-[500px]">
      <div className="flex flex-wrap gap-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto items-center">
        <div className="flex gap-0.5 border-r border-slate-200 pr-2 mr-2 mb-1">
          <ToolBtn onClick={() => execCmd('undo')} icon={Undo} title="Hoàn tác" />
          <ToolBtn onClick={() => execCmd('redo')} icon={Redo} title="Làm lại" />
        </div>
        <div className="flex gap-0.5 border-r border-slate-200 pr-2 mr-2 mb-1">
          <ToolBtn onClick={() => execCmd('formatBlock', 'H2')} icon={Heading1} title="Tiêu đề lớn" />
          <ToolBtn onClick={() => execCmd('formatBlock', 'H3')} icon={Heading2} title="Tiêu đề nhỏ" />
          <ToolBtn onClick={() => execCmd('formatBlock', 'P')} icon={Type} title="Văn bản thường" />
          <ToolBtn onClick={() => execCmd('formatBlock', 'BLOCKQUOTE')} icon={Quote} title="Trích dẫn" />
        </div>
        <div className="flex gap-0.5 border-r border-slate-200 pr-2 mr-2 mb-1">
          <ToolBtn onClick={() => execCmd('bold')} icon={Bold} title="In đậm" />
          <ToolBtn onClick={() => execCmd('italic')} icon={Italic} title="In nghiêng" />
          <ToolBtn onClick={() => execCmd('underline')} icon={Underline} title="Gạch chân" />
          <ToolBtn onClick={() => execCmd('strikethrough')} icon={Strikethrough} title="Gạch ngang" />
          <ToolBtn onClick={() => execCmd('superscript')} icon={Superscript} title="Chỉ số trên" />
          <ToolBtn onClick={() => execCmd('subscript')} icon={Subscript} title="Chỉ số dưới" />
        </div>
        <div className="flex gap-0.5 border-r border-slate-200 pr-2 mr-2 mb-1">
          <ToolBtn onClick={() => execCmd('foreColor', prompt('Nhập mã màu (ví dụ #ff0000):', '#000000'))} icon={Palette} title="Màu chữ" />
          <ToolBtn onClick={() => execCmd('hiliteColor', prompt('Nhập màu nền (ví dụ yellow):', 'yellow'))} icon={Highlighter} title="Màu nền" />
        </div>
        <div className="flex gap-0.5 border-r border-slate-200 pr-2 mr-2 mb-1">
          <ToolBtn onClick={() => execCmd('justifyLeft')} icon={AlignLeft} title="Căn trái" />
          <ToolBtn onClick={() => execCmd('justifyCenter')} icon={AlignCenter} title="Căn giữa" />
          <ToolBtn onClick={() => execCmd('justifyRight')} icon={AlignRight} title="Căn phải" />
          <ToolBtn onClick={() => execCmd('justifyFull')} icon={AlignJustify} title="Căn đều" />
        </div>
        <div className="flex gap-0.5 border-r border-slate-200 pr-2 mr-2 mb-1">
          <ToolBtn onClick={() => execCmd('insertUnorderedList')} icon={List} title="Danh sách chấm" />
          <ToolBtn onClick={() => execCmd('insertOrderedList')} icon={ListOrdered} title="Danh sách số" />
          <ToolBtn onClick={() => execCmd('indent')} icon={Indent} title="Thụt lề" />
          <ToolBtn onClick={() => execCmd('outdent')} icon={Outdent} title="Giảm lề" />
        </div>
        <div className="flex gap-0.5 mb-1">
          <ToolBtn onClick={addLink} icon={LinkIcon} title="Chèn Link" />
          <ToolBtn onClick={addImage} icon={ImageIcon} title="Chèn Ảnh" />
          <ToolBtn onClick={() => execCmd('insertHorizontalRule')} icon={Minus} title="Đường kẻ ngang" />
          <ToolBtn onClick={() => execCmd('removeFormat')} icon={Eraser} title="Xóa định dạng" />
        </div>
      </div>
      <div
        ref={editorRef}
        className="flex-1 p-6 overflow-y-auto text-slate-800 focus:outline-none prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-slate-900 prose-a:text-amber-600 prose-img:rounded-xl prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:italic"
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning={true}
        style={{ whiteSpace: 'pre-wrap' }}
      />
    </div>
  );
}

function AdminDashboard({ user, articles, products }) {
  const [activeTab, setActiveTab] = useState('articles');

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES.NEWS);
  const [image, setImage] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  const [editingProdId, setEditingProdId] = useState(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodType, setProdType] = useState('mod');
  const [prodDesc, setProdDesc] = useState('');

  const handleEditArticle = (article) => {
    setEditingId(article.id);
    setTitle(article.title);
    setCategory(article.category);
    setImage(article.image);
    setContent(article.content || '');
    window.scrollTo(0, 0);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setImage('');
    setContent('');
    setCategory(CATEGORIES.NEWS);
  };

  const handleSubmitArticle = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(getCollRef(COLLECTIONS.ARTICLES), editingId), {
          title, category, image, content, updatedAt: serverTimestamp()
        });
        setMessage('Đã cập nhật bài viết!');
      } else {
        await addDoc(getCollRef(COLLECTIONS.ARTICLES), {
          title, category, image, content, author: getUserDisplayName(user), authorId: user.uid, createdAt: serverTimestamp()
        });
        setMessage('Đã đăng bài mới!');
      }
      handleCancelEdit();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Lỗi: ' + err.message);
    }
  };

  const handleDeleteArticle = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài này?")) {
      try { await deleteDoc(doc(getCollRef(COLLECTIONS.ARTICLES), id)); } catch (err) { console.error(err); }
    }
  };

  const handleEditProduct = (prod) => {
    setEditingProdId(prod.id);
    setProdName(prod.name);
    setProdPrice(prod.price);
    setProdType(prod.type);
    setProdDesc(prod.description);
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProdId) {
        await updateDoc(doc(getCollRef(COLLECTIONS.PRODUCTS), editingProdId), {
          name: prodName, price: Number(prodPrice), type: prodType, description: prodDesc
        });
        setMessage("Đã cập nhật sản phẩm!");
      } else {
        await addDoc(getCollRef(COLLECTIONS.PRODUCTS), {
          name: prodName, price: Number(prodPrice), type: prodType, description: prodDesc, createdAt: serverTimestamp()
        });
        setMessage("Đã thêm sản phẩm!");
      }
      setEditingProdId(null);
      setProdName(''); setProdPrice(''); setProdDesc('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage('Lỗi thêm sp'); }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Xóa sản phẩm này?")) {
      await deleteDoc(doc(getCollRef(COLLECTIONS.PRODUCTS), id));
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto py-8 md:py-12 px-4 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">Quản Trị Blog</h1>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setActiveTab('articles')} className={`px-4 py-2 rounded-full text-sm font-bold transition ${activeTab === 'articles' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Bài viết & SP</button>
          <button onClick={() => setActiveTab('chat')} className={`px-4 py-2 rounded-full text-sm font-bold transition flex items-center gap-2 ${activeTab === 'chat' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            <MessageSquare size={16} /> Hỗ trợ
          </button>
        </div>
      </div>

      {activeTab === 'chat' ? (
        <AdminChatPanel />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Edit3 className="text-amber-500" /> {editingId ? 'Sửa Bài Viết' : 'Viết Bài Mới'}
                </h3>
                {editingId && <button onClick={handleCancelEdit} className="text-xs bg-slate-200 px-2 py-1 rounded hover:bg-slate-300">Hủy sửa</button>}
              </div>

              <form onSubmit={handleSubmitArticle} className="space-y-5 md:space-y-6">
                <div>
                  <label className="block text-slate-500 text-xs font-bold uppercase mb-2 tracking-wider">Tiêu đề</label>
                  <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition font-serif text-base" placeholder="Tiêu đề bài viết..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <div>
                    <label className="block text-slate-500 text-xs font-bold uppercase mb-2 tracking-wider">Chuyên mục</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none focus:border-amber-500">
                      {Object.values(CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs font-bold uppercase mb-2 tracking-wider">Ảnh Cover (URL)</label>
                    <input value={image} onChange={e => setImage(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none focus:border-amber-500" placeholder="https://..." />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-500 text-xs font-bold uppercase mb-2 tracking-wider">Nội dung</label>
                  <RichTextEditor value={content} onChange={setContent} />
                </div>
                <button type="submit" className={`w-full text-white py-3 rounded-xl font-bold shadow-lg transition-all ${editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900 hover:bg-amber-600'}`}>
                  {editingId ? 'Cập Nhật Bài Viết' : 'Xuất Bản Bài Viết'}
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-700 mb-4">Danh sách bài viết ({articles.length})</h4>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {articles.map(art => (
                  <div key={art.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img src={art.image || "https://placehold.co/100"} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <div className="truncate">
                        <div className="font-bold text-sm text-slate-900 truncate">{art.title}</div>
                        <div className="text-xs text-slate-500">{art.category}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleEditArticle(art)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Sửa"><Edit3 size={16} /></button>
                      <button onClick={() => handleDeleteArticle(art.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Xóa"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:sticky lg:top-24">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100"><PlusCircle className="text-amber-500" /> {editingProdId ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm'}</h3>
              <form onSubmit={handleSubmitProduct} className="space-y-4">
                <input required value={prodName} onChange={e => setProdName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-amber-500" placeholder="Tên sản phẩm..." />
                <div className="flex gap-2">
                  <input required type="number" value={prodPrice} onChange={e => setProdPrice(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-amber-500" placeholder="Giá VNĐ" />
                  <select value={prodType} onChange={e => setProdType(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-amber-500">
                    <option value="mod">Mod</option><option value="game">Game</option>
                  </select>
                </div>
                <textarea value={prodDesc} onChange={e => setProdDesc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-amber-500 h-20 resize-none" placeholder="Mô tả..." />
                <div className="flex gap-2">
                  {editingProdId && <button type="button" onClick={() => { setEditingProdId(null); setProdName(''); setProdPrice(''); setProdDesc('') }} className="px-4 py-2 bg-slate-200 rounded-lg text-sm font-bold">Hủy</button>}
                  <button type="submit" className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-sm font-bold hover:bg-amber-600">{editingProdId ? 'Cập Nhật' : 'Thêm Mới'}</button>
                </div>
              </form>
              {message && <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{message}</div>}
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-700 mb-4">Danh sách sản phẩm ({products.length})</h4>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {products.map(prod => (
                  <div key={prod.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50">
                    <div className="truncate pr-2">
                      <div className="font-bold text-sm text-slate-900 truncate">{prod.name}</div>
                      <div className="text-xs text-amber-600 font-bold">{parseInt(prod.price).toLocaleString()} đ</div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => handleEditProduct(prod)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Sửa"><Edit3 size={14} /></button>
                      <button onClick={() => handleDeleteProduct(prod.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Xóa"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Navbar({ user, setView, currentView, setCategoryFilter, currentFilter, handleLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.email !== ADMIN_EMAIL) return;
    const q = query(getCollRef(COLLECTIONS.CHATS), where('unreadAdmin', '==', true));
    return onSnapshot(q, (snap) => setUnreadCount(snap.size));
  }, [user]);

  const navItems = [
    { id: 'home', label: 'Trang Chủ', icon: <BookOpen size={18} />, action: () => { setView('home'); setCategoryFilter(null); } },
    { id: 'news', label: 'News', icon: <BookOpen size={18} />, action: () => { setView('home'); setCategoryFilter(CATEGORIES.NEWS); } },
    { id: 'review', label: 'Review', icon: <User size={18} />, action: () => { setView('home'); setCategoryFilter(CATEGORIES.REVIEW); } },
    { id: 'download', label: 'Download', icon: <Download size={18} />, action: () => { setView('home'); setCategoryFilter(CATEGORIES.DOWNLOAD); } },
    { id: 'tips', label: 'Tips', icon: <Zap size={18} />, action: () => { setView('home'); setCategoryFilter(CATEGORIES.TIPS); } },
    { id: 'store', label: 'Cửa Hàng', icon: <ShoppingCart size={18} />, action: () => { setView('store'); } },
    { id: 'contact', label: 'Liên Hệ', icon: <Phone size={18} />, action: () => { setView('contact'); } },
  ];

  const isActive = (item) => {
    if (item.id === 'store' && currentView === 'store') return true;
    if (item.id === 'contact' && currentView === 'contact') return true;
    if (currentView === 'home') {
      if (item.id === 'home' && !currentFilter) return true;
      if (item.id === 'news' && currentFilter === CATEGORIES.NEWS) return true;
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
          <div className="flex items-center cursor-pointer group" onClick={() => { setView('home'); setCategoryFilter(null); }}>
            <div className="bg-gradient-to-tr from-amber-400 to-yellow-200 p-2 rounded-full mr-3 group-hover:rotate-12 transition-transform duration-300 shadow-md shadow-amber-200">
              <Gamepad2 className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-serif font-bold text-slate-900 tracking-wide leading-none">FM<span className="text-amber-500">VPRO</span></span>
              <span className="text-[8px] md:text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium">FM VN TEAM</span>
            </div>
          </div>

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

          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right hidden xl:block cursor-pointer" onClick={() => setView('profile')}>
                  <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Xin chào</div>
                  <div className="text-sm font-serif font-bold text-slate-900 max-w-[100px] truncate hover:text-amber-600 transition">{getUserDisplayName(user)}</div>
                </div>
                <div className="relative group">
                  <button className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"><User size={20} /></button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 hidden group-hover:block animate-in fade-in slide-in-from-top-2">
                    <button onClick={() => setView('profile')} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-amber-600 rounded-t-xl">Cài đặt tài khoản</button>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-b-xl">Đăng xuất</button>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={() => setView('login')} className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-slate-200 transition-all transform hover:-translate-y-0.5">Đăng nhập</button>
            )}
          </div>

          <div className="-mr-2 flex lg:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-500 hover:text-slate-900 p-2 rounded-md hover:bg-slate-50 transition">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 absolute w-full z-50 shadow-xl animate-in slide-in-from-top-5 max-h-[90vh] overflow-y-auto">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {user && (
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl mb-4 border border-slate-100" onClick={() => { setView('profile'); setIsOpen(false) }}>
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold overflow-hidden">
                  {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : getUserDisplayName(user).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-xs text-slate-400 uppercase font-bold">Cài đặt tài khoản</div>
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
              <button onClick={() => { setView('admin'); setIsOpen(false) }} className="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-amber-700 bg-amber-50/50 border border-amber-100 mt-2">
                <span className="flex items-center gap-3">
                  <Settings size={18} /> Admin Dashboard
                  {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] px-2 rounded-full">{unreadCount} tin mới</span>}
                </span>
              </button>
            )}

            <div className="border-t border-slate-100 my-2"></div>

            {user ? (
              <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-red-500 hover:bg-red-50">
                <span className="flex items-center gap-3"><LogOut size={18} /> Đăng xuất</span>
              </button>
            ) : (
              <button onClick={() => { setView('login'); setIsOpen(false) }} className="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-white bg-slate-900 mt-2 shadow-md">
                <span className="flex items-center gap-3 justify-center"><LogIn size={18} /> Đăng nhập thành viên</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function ArticleCard({ article, onClick }) {
  return (
    <div onClick={() => onClick(article)} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-amber-200 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-amber-50/50 flex flex-col h-full">
      <div className="h-48 md:h-56 lg:h-60 overflow-hidden relative">
        <img src={article.image || "https://placehold.co/600x400/f1f5f9/94a3b8?text=Blog+Image"} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 saturate-50 group-hover:saturate-100" />
        <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-white/95 backdrop-blur text-slate-900 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider border border-slate-100">
          {article.category || 'Journal'}
        </div>
      </div>
      <div className="p-5 md:p-6 flex flex-col flex-1">
        <div className="mb-2 md:mb-3 flex items-center text-[10px] md:text-xs text-amber-600 font-medium uppercase tracking-widest">
          {formatDateSafe(article.createdAt)}
        </div>
        <h3 className="text-lg md:text-xl font-serif font-bold text-slate-900 mb-3 leading-snug group-hover:text-amber-600 transition-colors line-clamp-2">{article.title}</h3>
        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
          <span className="text-slate-500 text-xs font-medium flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center"><User size={12} /></div>
            <span className="truncate max-w-[100px]">{article.author || 'Admin'}</span>
          </span>
          <span className="text-slate-400 hover:text-amber-600 text-xs font-bold flex items-center gap-1 transition-colors">Xem thêm &rarr;</span>
        </div>
      </div>
    </div>
  );
}

function ArticleDetail({ article, onBack, user }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (!article?.id || !user) return;
    const q = query(getCollRef(COLLECTIONS.COMMENTS), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allComments = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setComments(allComments.filter(c => c.articleId === article.id));
    }, () => { });
    return () => unsubscribe();
  }, [article, user]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const userName = getUserDisplayName(user);
      await addDoc(getCollRef(COLLECTIONS.COMMENTS), {
        articleId: article.id, text: newComment, userId: user.uid,
        userName: userName, createdAt: serverTimestamp()
      });
      setNewComment('');
    } catch (error) { alert("Vui lòng đăng nhập để bình luận."); }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-12 px-4 animate-in fade-in duration-700">
      <button onClick={onBack} className="mb-6 md:mb-8 px-4 md:px-5 py-2 rounded-full border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-900 transition flex items-center gap-2 text-sm font-bold group">
        &larr; Quay lại <span className="hidden sm:inline group-hover:translate-x-1 transition-transform">Trang chủ</span>
      </button>

      <article className="mb-10 md:mb-16">
        <div className="text-center mb-8 md:mb-10">
          <span className="text-amber-600 font-bold tracking-widest text-[10px] md:text-xs uppercase mb-3 md:mb-4 block">{article.category}</span>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-serif font-bold text-slate-900 leading-tight mb-4 md:mb-6">{article.title}</h1>
          <div className="flex items-center justify-center gap-4 text-slate-400 text-xs md:text-sm">
            <span className="font-medium text-slate-600">Bởi {article.author || 'Admin'}</span>
            <span>&bull;</span>
            <span>{formatDateSafe(article.createdAt)}</span>
          </div>
        </div>

        <div className="rounded-xl md:rounded-2xl overflow-hidden shadow-xl shadow-slate-200 mb-8 md:mb-12">
          <img src={article.image || "https://placehold.co/800x400"} alt={article.title} className="w-full h-auto object-cover" />
        </div>

        <div className="prose prose-base md:prose-lg prose-slate max-w-none prose-headings:font-serif prose-a:text-amber-600 prose-img:rounded-xl text-slate-600 leading-relaxed px-1" dangerouslySetInnerHTML={{ __html: article.content }} />
      </article>

      <div className="border-t border-slate-100 pt-8 md:pt-12">
        <h3 className="text-xl md:text-2xl font-serif font-bold text-slate-900 mb-6 md:mb-8">Thảo luận ({comments.length})</h3>

        {user ? (
          <form onSubmit={handlePostComment} className="mb-8 md:mb-12">
            <textarea
              value={newComment} onChange={(e) => setNewComment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-none transition min-h-[100px] md:min-h-[120px] resize-none placeholder:text-slate-400"
              placeholder="Chia sẻ suy nghĩ của bạn..."
            />
            <div className="flex justify-end mt-3">
              <button type="submit" className="bg-slate-900 hover:bg-amber-600 text-white px-5 md:px-6 py-2 rounded-full font-bold text-sm transition active:scale-95">Gửi bình luận</button>
            </div>
          </form>
        ) : (
          <div className="bg-slate-50 p-6 md:p-8 rounded-2xl text-center mb-8 md:mb-12 border border-slate-100">
            <p className="text-slate-500 mb-4 text-sm md:text-base">Bạn cần đăng nhập để tham gia thảo luận.</p>
            <button className="text-amber-600 font-bold underline">Đăng nhập ngay</button>
          </div>
        )}

        <div className="space-y-6 md:space-y-8">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3 md:gap-4">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-serif font-bold border border-slate-200 shrink-0 text-sm md:text-base">
                {comment.userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-slate-900 text-sm md:text-base">{comment.userName}</span>
                  <span className="text-[10px] md:text-xs text-slate-400">{formatDateSafe(comment.createdAt)}</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Store({ user, isDemo, setView }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [storeLoading, setStoreLoading] = useState(false);

  useEffect(() => {
    setStoreLoading(true);
    if (isDemo) { setProducts(MOCK_PRODUCTS); setStoreLoading(false); return; }

    const q = query(getCollRef(COLLECTIONS.PRODUCTS));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const prods = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(prods);
      setStoreLoading(false);
      if (prods.length === 0 && user && user.uid) {
        // Seeding logic omitted
      }
    }, (err) => {
      setProducts(MOCK_PRODUCTS);
      setStoreLoading(false);
    });
    return () => unsubscribe();
  }, [user, isDemo]);

  return (
    <div className="max-w-[1800px] mx-auto py-10 md:py-16 px-6 lg:px-10">
      {selectedProduct && (
        <PaymentModal
          product={selectedProduct}
          user={user}
          onClose={() => setSelectedProduct(null)}
          onSuccess={() => setView('guide')}
        />
      )}

      <div className="text-center mb-12 md:mb-20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-amber-100 blur-[60px] rounded-full -z-10 opacity-50"></div>
        <span className="text-amber-600 font-bold tracking-[0.3em] text-xs uppercase mb-3 block">Premium Store</span>
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 mb-4 md:mb-6">Cửa Hàng Độc Quyền</h2>
        <p className="text-slate-500 max-w-xl mx-auto text-base md:text-lg font-light px-2">Nâng cấp trải nghiệm quản lý bóng đá của bạn với các công cụ và dữ liệu được chọn lọc kỹ càng.</p>
      </div>

      {storeLoading ? (
        <div className="text-center text-amber-500 font-serif italic">Đang tải bộ sưu tập...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-amber-300 transition-all duration-500 group hover:-translate-y-2 shadow-sm hover:shadow-2xl hover:shadow-amber-100/50 flex flex-col">
              <div className="h-48 md:h-56 p-6 md:p-8 bg-slate-50 flex items-center justify-center relative group-hover:bg-white transition-colors">
                <div className="absolute inset-0 border-b border-slate-100"></div>
                {product.image && product.image.startsWith('http') ? (
                  <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain drop-shadow-md transform group-hover:scale-110 transition-transform duration-500 z-10" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200?text=Product' }} />
                ) : (
                  <Crown className="text-amber-400 w-16 h-16 md:w-20 md:h-20 group-hover:text-amber-500 transition-colors z-10" />
                )}
                <div className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider z-20 bg-white shadow-sm border border-slate-100 text-slate-500`}>
                  {product.type === 'game' ? 'KEY' : 'MOD'}
                </div>
              </div>
              <div className="p-5 md:p-6 flex-1 flex flex-col text-center">
                <h3 className="text-base md:text-lg font-serif font-bold text-slate-900 mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-slate-500 text-xs md:text-sm mb-4 md:mb-6 flex-1 line-clamp-2 font-light">{product.description}</p>
                <div className="mt-auto">
                  <div className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">{parseInt(product.price).toLocaleString('vi-VN')} <span className="text-sm text-slate-400 font-normal align-top">đ</span></div>
                  <button onClick={() => setSelectedProduct(product)} className="w-full bg-slate-900 hover:bg-amber-600 text-white py-2.5 md:py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-slate-200 group-hover:shadow-amber-200 flex items-center justify-center gap-2 active:scale-95">
                    <CreditCard size={16} /> Mua Ngay
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AuthModal({ setView, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      let userCred;
      if (isRegister) {
        userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName: name });
      } else {
        userCred = await signInWithEmailAndPassword(auth, email, password);
      }
      onLoginSuccess();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <div className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 w-full max-w-md relative">
        <button onClick={() => setView('home')} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-2"><X size={20} /></button>
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-block p-3 bg-amber-50 rounded-full mb-4"><User size={28} className="text-amber-600" /></div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-900">{isRegister ? 'Đăng Ký Thành Viên' : 'Chào Mừng Trở Lại'}</h2>
          <p className="text-slate-500 text-xs md:text-sm mt-2">Tham gia cộng đồng FM Blog Việt Nam</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          {isRegister && (
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 md:p-4 text-slate-900 focus:bg-white focus:border-amber-500 outline-none transition placeholder:text-slate-400" placeholder="Tên hiển thị của bạn" />
          )}
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 md:p-4 text-slate-900 focus:bg-white focus:border-amber-500 outline-none transition placeholder:text-slate-400" placeholder="Email" />
          <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 md:p-4 text-slate-900 focus:bg-white focus:border-amber-500 outline-none transition placeholder:text-slate-400" placeholder="Mật khẩu" />

          {error && <p className="text-red-500 text-xs md:text-sm text-center bg-red-50 p-2 rounded-lg">{error}</p>}

          <button type="submit" className="w-full bg-slate-900 hover:bg-amber-600 text-white py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all shadow-lg shadow-slate-200 active:scale-95">
            {isRegister ? 'Tạo Tài Khoản' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="mt-6 md:mt-8 text-center">
          <button onClick={() => setIsRegister(!isRegister)} className="text-slate-500 hover:text-amber-600 text-sm font-medium transition">
            {isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký ngay'}
          </button>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
          <p className="text-[10px] md:text-xs text-slate-400">Tài khoản Admin Demo: {ADMIN_EMAIL}</p>
        </div>
      </div>
    </div>
  );
}

// --- 6. MAIN APP COMPONENT (The Router) ---
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [activeArticle, setActiveArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [products, setProducts] = useState([]); // Pass products to admin
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try { await signInAnonymously(auth); } catch (err) { console.warn("Anonymous auth failed", err); }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setArticles(MOCK_ARTICLES);
        setProducts(MOCK_PRODUCTS);
        setLoading(false);
        setIsDemo(true);
      }
    }, 4000);

    const qArt = query(getCollRef(COLLECTIONS.ARTICLES), orderBy('createdAt', 'desc'));
    const unsubArt = onSnapshot(qArt, (snapshot) => {
      setArticles(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
      setIsDemo(false);
      clearTimeout(timer);
    }, (err) => {
      setArticles(MOCK_ARTICLES);
      setLoading(false);
      setIsDemo(true);
      clearTimeout(timer);
    });

    const qProd = query(getCollRef(COLLECTIONS.PRODUCTS));
    const unsubProd = onSnapshot(qProd, (snapshot) => {
      setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => setProducts(MOCK_PRODUCTS));

    return () => {
      unsubArt();
      unsubProd();
      clearTimeout(timer);
    }
  }, [user]);

  const handleArticleClick = (article) => { setActiveArticle(article); setView('article'); window.scrollTo(0, 0); };
  const handleLogout = async () => { await signOut(auth); setView('home'); };

  const filteredArticles = categoryFilter
    ? articles.filter(a => a.category === categoryFilter)
    : articles;

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center text-slate-900 flex-col gap-4"><div className="animate-spin mr-3 text-amber-500"><Gamepad2 size={48} /></div> <span className="font-serif text-xl tracking-widest font-bold">FM BLOG VN</span></div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-amber-200 selection:text-slate-900 overflow-x-hidden">
      {isDemo && <DemoModeAlert />}

      <Navbar user={user} setView={setView} currentView={view} setCategoryFilter={setCategoryFilter} currentFilter={categoryFilter} handleLogout={handleLogout} />

      <main className="pb-20">
        {view === 'home' && (
          <>
            {!categoryFilter && (
              <div className="relative bg-white border-b border-slate-100 mb-12 md:mb-16 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-amber-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 opacity-60 pointer-events-none"></div>

                <div className="max-w-[1800px] mx-auto py-16 md:py-24 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center relative z-10">
                  <div className="md:w-1/2 mb-10 md:mb-0 animate-in slide-in-from-left-10 fade-in duration-700">
                    <div className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-500 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 md:mb-8 shadow-sm">
                      <Star size={12} className="text-amber-500" /> Nhật ký quản lý bóng đá
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-slate-900 tracking-tight mb-4 md:mb-6 leading-[1.1]">
                      Chia sẻ đam mê <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-600">Football Manager</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 mb-8 md:mb-10 max-w-lg leading-relaxed font-light">
                      Nơi lưu giữ những câu chuyện, chiến thuật độc đáo và kho tài nguyên chất lượng cho cộng đồng FM Việt Nam.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button onClick={() => setView('store')} className="bg-slate-900 hover:bg-amber-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold transition-all shadow-xl shadow-slate-200 hover:shadow-amber-100 transform hover:-translate-y-1 flex items-center justify-center gap-2">
                        <ShoppingCart size={18} /> Ghé Cửa Hàng
                      </button>
                      <button
                        onClick={() => document.getElementById('articles-grid')?.scrollIntoView({ behavior: 'smooth' })}
                        className="bg-white hover:bg-slate-50 text-slate-900 px-6 md:px-8 py-3 md:py-4 rounded-full font-bold transition border border-slate-200 flex items-center justify-center gap-2"
                      >
                        <BookOpen size={18} /> Đọc Blog
                      </button>
                    </div>
                  </div>
                  <div className="md:w-1/2 flex justify-center relative animate-in zoom-in duration-1000 mt-8 md:mt-0">
                    <div className="relative z-10 max-w-[80%] md:max-w-full">
                      <div className="absolute inset-0 bg-gradient-to-tr from-amber-200 to-transparent rounded-[2rem] rotate-6 transform translate-x-4 translate-y-4 -z-10"></div>
                      <img src="https://scontent.fhan7-1.fna.fbcdn.net/v/t39.30808-6/548246122_1853079962258578_6581071402068987802_n.png?stp=dst-jpg_tt6&_nc_cat=111&ccb=1-7&_nc_sid=2285d6&_nc_eui2=AeF9exUDdtuyIzMoN5Ic4_JqP3O2I-DjXOI_c7Yj4ONc4vQ1QaerIlZc4Gp82DdPbpQg_9ZWUMGauzQSWkrjI5ZN&_nc_ohc=tfLG_RKvv2oQ7kNvwFbkM6Y&_nc_oc=Admf0DQp6vrYg4cWbJBPRjaNOjoECcN-FRO1h11DdylESajXoTbgpOhHlvLDfoHtxGg&_nc_zt=23&_nc_ht=scontent.fhan7-1.fna&_nc_gid=dYJra7WTN5ibbULid29DDg&oh=00_Afh14xeCRzkB20cWoDozrTYx4u7C3W9OQvH2XG0Gbmt9sQ&oe=69262B24" alt="Hero" className="rounded-[2rem] shadow-2xl border-4 border-white" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div id="articles-grid" className="max-w-[1800px] mx-auto px-6 lg:px-10 mt-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-12 gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-8 md:h-12 w-1 bg-gradient-to-b from-amber-400 to-yellow-600 rounded-full"></div>
                  <h2 className="text-2xl md:text-4xl font-serif font-bold text-slate-900">{categoryFilter ? categoryFilter : "Bài Viết Mới Nhất"}</h2>
                </div>
                {!categoryFilter && (
                  <button
                    onClick={() => document.getElementById('articles-grid')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-amber-600 text-sm font-bold hover:text-amber-700 flex items-center gap-1 border-b-2 border-amber-100 hover:border-amber-600 pb-1 transition-all self-end sm:self-auto"
                  >
                    Xem toàn bộ <span className="text-lg">&rarr;</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
                {filteredArticles.length > 0 ? (
                  filteredArticles.map(article => (
                    <ArticleCard key={article.id} article={article} onClick={handleArticleClick} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-16 md:py-24 bg-white rounded-3xl border border-slate-100 border-dashed shadow-sm">
                    <div className="bg-slate-50 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                      <BookOpen size={24} md:size={32} className="text-slate-300" />
                    </div>
                    <p className="text-slate-400 text-base md:text-lg font-light">Chưa có bài viết nào trong mục này.</p>
                    {user?.email === ADMIN_EMAIL && <button onClick={() => setView('admin')} className="mt-6 text-white bg-slate-900 px-6 py-2 rounded-full font-bold hover:bg-amber-600 transition">Viết bài ngay</button>}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {view === 'article' && activeArticle && <ArticleDetail article={activeArticle} onBack={() => setView('home')} user={user} />}
        {view === 'store' && <Store user={user} isDemo={isDemo} setView={setView} />}
        {view === 'guide' && <ProductGuide onBack={() => setView('home')} />}
        {view === 'contact' && <ContactPage />}
        {view === 'profile' && <ProfilePage user={user} onBack={() => setView('home')} />}
        {view === 'admin' && (user?.email === ADMIN_EMAIL ? <AdminDashboard user={user} articles={articles} products={products} /> : <div className="flex items-center justify-center h-[60vh] text-slate-400 px-4 text-center">Bạn cần quyền Admin ({ADMIN_EMAIL}) để truy cập.</div>)}
        {view === 'login' && <AuthModal setView={setView} onLoginSuccess={() => setView('home')} />}
      </main>

      {/* Global Chat Widget for Users */}
      {view !== 'admin' && <ChatWidget user={user} isDemo={isDemo} />}

      <footer className="bg-white border-t border-slate-100 py-10 md:py-12 text-center text-slate-500 text-sm">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-10">
          <div className="flex justify-center items-center gap-3 mb-6 md:mb-8">
            <div className="bg-slate-900 p-2.5 rounded-lg text-white shadow-lg shadow-amber-100"><Gamepad2 size={24} /></div>
            <span className="font-serif font-bold text-xl md:text-2xl text-slate-900 tracking-widest">FM BLOG</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-6 md:mb-8 font-medium text-slate-600">
            <a href="#" className="hover:text-amber-600 transition">Về tác giả</a>
            <a href="#" className="hover:text-amber-600 transition">Liên hệ hợp tác</a>
            <a href="#" className="hover:text-amber-600 transition">Điều khoản sử dụng</a>
          </div>
          <p className="font-light text-slate-400 text-xs md:text-sm">&copy; 2024 FM Blog Vietnam. Built with passion.</p>
        </div>
      </footer>
    </div>
  );
}