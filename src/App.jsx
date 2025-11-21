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
  where
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
  Clock
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
const ADMIN_EMAIL = 'nguyentan7799@gmail.com'; // Tài khoản Admin mới

const COLLECTIONS = {
  ARTICLES: 'articles',
  PRODUCTS: 'products',
  COMMENTS: 'comments'
};

const CATEGORIES = {
  NEWS: 'Góc nhìn & Blog',
  REVIEW: 'Review Cầu Thủ',
  DOWNLOAD: 'Kho Tài Nguyên',
  TIPS: 'Chiến Thuật & Tips'
};

// --- MOCK DATA (Dữ liệu mẫu) ---
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

// --- Components ---

// 0. Demo Mode Notification
const DemoModeAlert = () => (
  <div className="fixed bottom-4 right-4 z-[200] w-[90%] max-w-sm md:w-auto bg-white/90 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-bottom-5 mx-auto md:mx-0">
    <div className="bg-amber-100 p-2 rounded-full shrink-0">
       <WifiOff size={18} className="text-amber-600" />
    </div>
    <div>
       <h4 className="font-bold text-sm">Chế độ Demo (Offline)</h4>
       <p className="text-xs opacity-80">Đang hiển thị nội dung mẫu.</p>
    </div>
  </div>
);

// NEW COMPONENT: Product Guide
const ProductGuide = ({ onBack }) => (
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
        {/* Section 1 */}
        <section>
          <h3 className="text-xl font-bold text-amber-600 flex items-center gap-2 mb-4">
            <span className="bg-amber-100 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
            Về gói Share
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base leading-relaxed">
            <li>Bạn sẽ nhận được một <strong>Tài khoản Steam có sẵn Football Manager 2026 PC</strong>.</li>
            <li>Đây là hình thức <strong>Share Steam Offline</strong> (chơi ở chế độ ngoại tuyến).</li>
            <li>File save game được lưu riêng trên máy tính của bạn, hoàn toàn bảo mật.</li>
            <li className="text-red-600 font-bold bg-red-50 p-2 rounded-lg">Tuyệt đối không thay đổi email hay mật khẩu của tài khoản được cấp.</li>
            <li className="italic text-slate-500">Lưu ý: Gói này không hỗ trợ chơi tại tiệm nét hoặc qua các dịch vụ Cloud PC.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section>
          <h3 className="text-xl font-bold text-amber-600 flex items-center gap-2 mb-4">
            <span className="bg-amber-100 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
            Sau khi đã cài đặt xong
          </h3>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 text-sm md:text-base">
            <p className="flex items-start gap-2"><AlertTriangle className="text-amber-500 shrink-0 mt-1" size={18}/> <strong>KHÔNG nhấn "Go Online"</strong> hoặc thay đổi nick khác trên Steam.</p>
            <p>Khi Steam Client hiện thông báo yêu cầu "Update / Cancel", hãy nhấn <strong>CANCEL</strong>. (Nếu bật Steam thấy chữ "Installing..." thì cứ để bình thường).</p>
            <p>Khi game có bản vá (patch) mới, vui lòng <strong>Inbox cho Page</strong> để được hỗ trợ cập nhật.</p>
          </div>
        </section>

        {/* Section 3 */}
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
              <p className="text-sm text-slate-600">Hãy <strong>Inbox cho Page</strong> để được hỗ trợ sửa lỗi.</p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
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
              <strong className="block text-slate-900 mb-1 flex items-center gap-2"><Info size={16}/> Phạm vi hỗ trợ:</strong>
              <p>Page chỉ hỗ trợ các vấn đề liên quan đến cài đặt và kích hoạt game. Các vấn đề về gameplay, chiến thuật... vui lòng tham gia group cộng đồng: <a href="https://www.facebook.com/groups/fmvnofficial" target="_blank" rel="noreferrer" className="text-blue-600 underline">FMVN Official</a></p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-slate-100">
               <div className="flex-1 bg-amber-50 p-3 rounded-lg flex gap-3 items-start">
                  <Clock className="text-amber-600 shrink-0" size={20}/>
                  <div>
                    <strong className="block text-amber-800 text-sm">Giờ hỗ trợ</strong>
                    <p className="text-xs text-amber-700 mt-1">Tránh nhắn tin sau 11h đêm.</p>
                  </div>
               </div>
               <div className="flex-1 bg-blue-50 p-3 rounded-lg flex gap-3 items-start">
                  <Clock className="text-blue-600 shrink-0" size={20}/>
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

// 1. Payment Modal (QR Code - Gold Theme)
const PaymentModal = ({ product, onClose, user, onSuccess }) => {
  const bankInfo = {
    bankId: 'mbbank',
    accountNo: '0394422547',
    accountName: 'FM PRO ADMIN',
    template: 'compact'
  };

  const userName = getUserDisplayName(user);
  const memo = `BLOG ${userName} mua ${product.name}`.replace(/[^a-zA-Z0-9 ]/g, "");
  const qrUrl = `https://img.vietqr.io/image/${bankInfo.bankId}-${bankInfo.accountNo}-${bankInfo.template}.png?amount=${product.price}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(bankInfo.accountName)}`;

  const handleConfirmPayment = () => {
    // Logic xử lý xác nhận (nếu có backend)
    onClose();
    onSuccess(); // Chuyển hướng sang trang Hướng dẫn
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
             <div className="flex justify-between flex-wrap gap-2">
                <span>Số tài khoản:</span>
                <div className="flex items-center gap-2">
                   <span className="font-bold text-amber-600 tracking-wider font-mono text-lg">0394422547</span>
                   <button onClick={() => navigator.clipboard.writeText('0394422547')} title="Copy" className="text-slate-400 hover:text-amber-600"><Copy size={14}/></button>
                </div>
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
};

// 2. Rich Text Editor (Pro Version - Responsive)
const RichTextEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, []); 

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

  // Button component
  const ToolBtn = ({ onClick, icon: Icon, title }) => (
    <button type="button" onClick={onClick} className="p-2 hover:bg-slate-200 rounded text-slate-600 transition hover:text-amber-600 shrink-0" title={title}>
      <Icon size={18} />
    </button>
  );

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col h-[400px] md:h-[500px]">
      {/* Responsive Toolbar: Flex wrap allows buttons to flow to next line on mobile */}
      <div className="flex flex-wrap gap-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto">
        <div className="flex gap-0.5 border-r border-slate-200 pr-2 mr-2 mb-1">
            <ToolBtn onClick={() => execCmd('bold')} icon={Bold} title="In đậm" />
            <ToolBtn onClick={() => execCmd('italic')} icon={Italic} title="In nghiêng" />
            <ToolBtn onClick={() => execCmd('underline')} icon={Underline} title="Gạch chân" />
        </div>
        <div className="flex gap-0.5 border-r border-slate-200 pr-2 mr-2 mb-1">
            <ToolBtn onClick={() => execCmd('formatBlock', 'H2')} icon={Heading1} title="Tiêu đề lớn" />
            <ToolBtn onClick={() => execCmd('formatBlock', 'H3')} icon={Heading2} title="Tiêu đề nhỏ" />
        </div>
        <div className="flex gap-0.5 border-r border-slate-200 pr-2 mr-2 mb-1">
            <ToolBtn onClick={() => execCmd('justifyLeft')} icon={AlignLeft} title="Căn trái" />
            <ToolBtn onClick={() => execCmd('justifyCenter')} icon={AlignCenter} title="Căn giữa" />
        </div>
        <div className="flex gap-0.5 border-r border-slate-200 pr-2 mr-2 mb-1">
            <ToolBtn onClick={() => execCmd('insertUnorderedList')} icon={List} title="Danh sách chấm" />
            <ToolBtn onClick={() => execCmd('insertOrderedList')} icon={ListOrdered} title="Danh sách số" />
        </div>
        <div className="flex gap-0.5 mb-1">
            <ToolBtn onClick={addLink} icon={LinkIcon} title="Chèn Link" />
            <ToolBtn onClick={addImage} icon={ImageIcon} title="Chèn Ảnh" />
            <ToolBtn onClick={() => execCmd('undo')} icon={Undo} title="Hoàn tác" />
        </div>
      </div>
      <div
        ref={editorRef}
        className="flex-1 p-4 md:p-6 overflow-y-auto text-slate-800 focus:outline-none prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-slate-900 prose-a:text-amber-600 prose-img:rounded-xl prose-p:my-2"
        contentEditable
        onInput={handleInput}
        style={{ whiteSpace: 'pre-wrap' }}
      />
    </div>
  );
};

// 3. Navbar (Full Width - Luxury)
const Navbar = ({ user, setView, currentView, setCategoryFilter, currentFilter, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

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
                <button onClick={() => setView('admin')} className={`ml-2 px-5 py-2.5 rounded-full text-sm font-bold transition border ${currentView === 'admin' ? 'bg-slate-900 text-white border-slate-900' : 'text-slate-900 border-slate-200 hover:bg-slate-50'}`}>
                  Admin
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
                    <span className="flex items-center gap-3"><Settings size={18}/> Admin Dashboard</span>
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

// 4. Article Card (Responsive)
const ArticleCard = ({ article, onClick }) => (
  <div onClick={() => onClick(article)} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-amber-200 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-amber-50/50 flex flex-col h-full">
    <div className="h-48 md:h-56 lg:h-60 overflow-hidden relative">
      <img src={article.image || "https://placehold.co/600x400/f1f5f9/94a3b8?text=Blog+Image"} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 saturate-50 group-hover:saturate-100" />
      <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-white/95 backdrop-blur text-slate-900 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider border border-slate-100">
        {article.category || 'Journal'}
      </div>
    </div>
    <div className="p-5 md:p-6 flex flex-col flex-1">
      <div className="mb-2 md:mb-3 flex items-center text-[10px] md:text-xs text-amber-600 font-medium uppercase tracking-widest">
         {new Date(article.createdAt?.seconds * 1000).toLocaleDateString('vi-VN')}
      </div>
      <h3 className="text-lg md:text-xl font-serif font-bold text-slate-900 mb-3 leading-snug group-hover:text-amber-600 transition-colors line-clamp-2">{article.title}</h3>
      <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
        <span className="text-slate-500 text-xs font-medium flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center"><User size={12}/></div>
            <span className="truncate max-w-[100px]">{article.author || 'Admin'}</span>
        </span>
        <span className="text-slate-400 hover:text-amber-600 text-xs font-bold flex items-center gap-1 transition-colors">Xem thêm &rarr;</span>
      </div>
    </div>
  </div>
);

// 5. Store Component (Full Width Layout)
const Store = ({ user, isDemo, setView }) => { // Added setView prop
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
            onSuccess={() => setView('guide')} // Go to Guide on success
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
                    {/* Product Image Placeholder */}
                    <div className="absolute inset-0 border-b border-slate-100"></div>
                    {product.image && product.image.startsWith('http') ? (
                        <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain drop-shadow-md transform group-hover:scale-110 transition-transform duration-500 z-10" onError={(e) => {e.target.onerror=null; e.target.src='https://placehold.co/200x200?text=Product'}} />
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
};

// 6. Admin Dashboard (Full Width Support)
const AdminDashboard = ({ user }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES.NEWS);
  const [image, setImage] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  // Product states
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodType, setProdType] = useState('mod');
  const [prodDesc, setProdDesc] = useState('');

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    try {
      await addDoc(getCollRef(COLLECTIONS.ARTICLES), {
        title,
        category,
        image,
        content,
        author: getUserDisplayName(user),
        authorId: user.uid,
        createdAt: serverTimestamp()
      });
      setMessage('Đã đăng bài lên Blog!');
      setTitle(''); setContent(''); setImage('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Lỗi khi đăng bài.');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await addDoc(getCollRef(COLLECTIONS.PRODUCTS), {
        name: prodName,
        price: Number(prodPrice),
        type: prodType,
        description: prodDesc || "Sản phẩm FM Blog",
        createdAt: serverTimestamp()
      });
      setProdName(''); setProdPrice(''); setProdDesc('');
      setMessage('Đã thêm sản phẩm!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
       setMessage('Lỗi khi thêm sản phẩm');
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto py-8 md:py-12 px-4 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">Quản Trị Blog</h1>
        <div className="bg-amber-50 text-amber-700 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-amber-100 text-xs md:text-sm font-bold flex items-center gap-2 truncate max-w-full">
          <Settings size={16}/> Admin: {user.email}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        {/* Left: Article Form */}
        <div className="lg:col-span-2 order-2 lg:order-1">
           <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100"><Edit3 className="text-amber-500"/> Viết Bài Mới</h3>
              <form onSubmit={handleCreateArticle} className="space-y-5 md:space-y-6">
                <div>
                  <label className="block text-slate-500 text-xs font-bold uppercase mb-2 tracking-wider">Tiêu đề</label>
                  <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 md:p-4 text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition font-serif text-base md:text-lg placeholder:text-slate-300" placeholder="Tiêu đề bài viết..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <div>
                    <label className="block text-slate-500 text-xs font-bold uppercase mb-2 tracking-wider">Chuyên mục</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 md:p-4 text-slate-900 outline-none focus:border-amber-500">
                      {Object.values(CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                     <label className="block text-slate-500 text-xs font-bold uppercase mb-2 tracking-wider">Ảnh Cover (URL)</label>
                     <input value={image} onChange={e => setImage(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 md:p-4 text-slate-900 outline-none focus:border-amber-500 placeholder:text-slate-300" placeholder="https://..." />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-500 text-xs font-bold uppercase mb-2 tracking-wider">Nội dung</label>
                  <RichTextEditor value={content} onChange={setContent} />
                </div>
                <button type="submit" className="w-full bg-slate-900 hover:bg-amber-600 text-white py-3 md:py-4 rounded-xl font-bold shadow-lg shadow-slate-200 transition-all active:scale-95">Xuất Bản Bài Viết</button>
              </form>
           </div>
        </div>

        {/* Right: Product Form */}
        <div className="order-1 lg:order-2">
           <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm lg:sticky lg:top-24">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100"><PlusCircle className="text-amber-500"/> Thêm Sản Phẩm</h3>
              <form onSubmit={handleAddProduct} className="space-y-4 md:space-y-5">
                <div>
                   <label className="block text-slate-500 text-xs font-bold uppercase mb-1">Tên sản phẩm</label>
                   <input required value={prodName} onChange={e => setProdName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 text-sm outline-none focus:border-amber-500" placeholder="Tên sản phẩm..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                     <label className="block text-slate-500 text-xs font-bold uppercase mb-1">Giá (VNĐ)</label>
                     <input required type="number" value={prodPrice} onChange={e => setProdPrice(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 text-sm outline-none focus:border-amber-500" placeholder="100000" />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs font-bold uppercase mb-1">Loại</label>
                    <select value={prodType} onChange={e => setProdType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 text-sm outline-none focus:border-amber-500">
                        <option value="mod">Mod/Data</option>
                        <option value="game">Game Key</option>
                    </select>
                  </div>
                </div>
                <div>
                   <label className="block text-slate-500 text-xs font-bold uppercase mb-1">Mô tả ngắn</label>
                   <textarea value={prodDesc} onChange={e => setProdDesc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 text-sm outline-none focus:border-amber-500 h-24 resize-none" placeholder="Mô tả..." />
                </div>
                <button type="submit" className="w-full bg-white border border-slate-200 hover:border-amber-500 text-slate-900 hover:text-amber-600 py-3 rounded-xl font-bold transition-all active:scale-95">Lưu Vào Kho</button>
              </form>

              {message && (
                <div className="mt-4 p-3 bg-green-50 border border-green-100 text-green-700 rounded-lg flex items-center gap-2 text-sm">
                    <CheckCircle size={16} /> {message}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

// 7. Article Detail (Responsive - Centered Reading)
const ArticleDetail = ({ article, onBack, user }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (!article?.id || !user) return;
    const q = query(getCollRef(COLLECTIONS.COMMENTS), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allComments = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setComments(allComments.filter(c => c.articleId === article.id));
    }, () => {}); 
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
                 <span>{new Date(article.createdAt?.seconds * 1000).toLocaleDateString('vi-VN')}</span>
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
                    <span className="text-[10px] md:text-xs text-slate-400">{comment.createdAt ? new Date(comment.createdAt.seconds * 1000).toLocaleDateString('vi-VN') : 'Vừa xong'}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base">{comment.text}</p>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 7. Auth Modal (Responsive)
const AuthModal = ({ setView, onLoginSuccess }) => {
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
        <button onClick={() => setView('home')} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-2"><X size={20}/></button>
        <div className="text-center mb-6 md:mb-8">
            <div className="inline-block p-3 bg-amber-50 rounded-full mb-4"><User size={28} className="text-amber-600"/></div>
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

  useEffect(() => {
    const initAuth = async () => {
        try {
            await signInAnonymously(auth);
        } catch (err) {
            console.warn("Anonymous auth failed", err);
        }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
        if (loading) {
            setArticles(MOCK_ARTICLES);
            setLoading(false);
            setIsDemo(true);
        }
    }, 4000);

    const q = query(getCollRef(COLLECTIONS.ARTICLES), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
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
    
    return () => {
        unsubscribe();
        clearTimeout(timer);
    }
  }, [user]);

  const handleArticleClick = (article) => { setActiveArticle(article); setView('article'); window.scrollTo(0,0); };
  const handleLogout = async () => { await signOut(auth); setView('home'); };

  const filteredArticles = categoryFilter 
    ? articles.filter(a => a.category === categoryFilter)
    : articles;

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center text-slate-900 flex-col gap-4"><div className="animate-spin mr-3 text-amber-500"><Gamepad2 size={48}/></div> <span className="font-serif text-xl tracking-widest font-bold">FM BLOG VN</span></div>;

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
                            Chia sẻ đam mê <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-600">Football Manager</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 mb-8 md:mb-10 max-w-lg leading-relaxed font-light">
                            Nơi lưu giữ những câu chuyện, chiến thuật độc đáo và kho tài nguyên chất lượng cho cộng đồng FM Việt Nam.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={() => setView('store')} className="bg-slate-900 hover:bg-amber-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold transition-all shadow-xl shadow-slate-200 hover:shadow-amber-100 transform hover:-translate-y-1 flex items-center justify-center gap-2">
                                <ShoppingCart size={18}/> Ghé Cửa Hàng
                            </button>
                            <button className="bg-white hover:bg-slate-50 text-slate-900 px-6 md:px-8 py-3 md:py-4 rounded-full font-bold transition border border-slate-200 flex items-center justify-center gap-2">
                                <BookOpen size={18}/> Đọc Blog
                            </button>
                        </div>
                    </div>
                    <div className="md:w-1/2 flex justify-center relative animate-in zoom-in duration-1000 mt-8 md:mt-0">
                         <div className="relative z-10 max-w-[80%] md:max-w-full">
                             <div className="absolute inset-0 bg-gradient-to-tr from-amber-200 to-transparent rounded-[2rem] rotate-6 transform translate-x-4 translate-y-4 -z-10"></div>
                             <img src="https://placehold.co/500x600/f8fafc/cbd5e1?text=FM+Tactics+Board" alt="Hero" className="rounded-[2rem] shadow-2xl border-4 border-white" />
                         </div>
                    </div>
                </div>
                </div>
            )}

            <div className="max-w-[1800px] mx-auto px-6 lg:px-10 mt-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-12 gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-8 md:h-12 w-1 bg-gradient-to-b from-amber-400 to-yellow-600 rounded-full"></div>
                    <h2 className="text-2xl md:text-4xl font-serif font-bold text-slate-900">{categoryFilter || "Bài Viết Mới Nhất"}</h2>
                </div>
                {!categoryFilter && <button className="text-amber-600 text-sm font-bold hover:text-amber-700 flex items-center gap-1 border-b-2 border-amber-100 hover:border-amber-600 pb-1 transition-all self-end sm:self-auto">Xem toàn bộ <span className="text-lg">&rarr;</span></button>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
                {filteredArticles.length > 0 ? (
                  filteredArticles.map(article => (
                    <ArticleCard key={article.id} article={article} onClick={handleArticleClick} />
                  ))
                ) : (
                   <div className="col-span-full text-center py-16 md:py-24 bg-white rounded-3xl border border-slate-100 border-dashed shadow-sm">
                      <div className="bg-slate-50 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                          <BookOpen size={24} md:size={32} className="text-slate-300"/>
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
        {view === 'admin' && (user?.email === ADMIN_EMAIL ? <AdminDashboard user={user} /> : <div className="flex items-center justify-center h-[60vh] text-slate-400 px-4 text-center">Bạn cần quyền Admin ({ADMIN_EMAIL}) để truy cập.</div>)}
        {view === 'login' && <AuthModal setView={setView} onLoginSuccess={() => setView('home')} />}
      </main>
      
      <footer className="bg-white border-t border-slate-100 py-10 md:py-12 text-center text-slate-500 text-sm">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-10">
            <div className="flex justify-center items-center gap-3 mb-6 md:mb-8">
                <div className="bg-slate-900 p-2.5 rounded-lg text-white shadow-lg shadow-amber-100"><Gamepad2 size={24}/></div>
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
