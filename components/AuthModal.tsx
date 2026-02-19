
import React, { useState } from 'react';
import { X, Cloud, LogOut, RefreshCcw, Github, Mail, Lock, Settings } from 'lucide-react';
import * as db from '../db';

interface AuthModalProps {
  user: any | null;
  onLogin: (user: any) => void;
  onLogout: () => void;
  onSync: () => void;
  onClose: () => void;
  isSyncing: boolean;
  categories: any[];
  products: any[];
  onImport: (data: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ user, onLogin, onLogout, onSync, onClose, isSyncing }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginView, setIsLoginView] = useState(true);
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  
  const config = db.getSupabaseConfig();
  const [sUrl, setSUrl] = useState(config.url);
  const [sKey, setSKey] = useState(config.key);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLoginView) {
        const { data, error } = await db.supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) onLogin(data.user);
      } else {
        const { data, error } = await db.supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('تم إنشاء الحساب بنجاح! يرجى مراجعة بريدك الإلكتروني.');
        setIsLoginView(true);
      }
    } catch (err: any) {
      alert(err.message || 'حدث خطأ في المصادقة');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setGithubLoading(true);
    try {
      await db.signInWithGithub();
    } catch (err: any) {
      alert(err.message || 'فشل تسجيل الدخول عبر GitHub. تأكد من تفعيل GitHub في Supabase Dashboard.');
      setGithubLoading(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    db.saveSupabaseConfig(sUrl, sKey);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-6 left-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-800 transition shadow-sm"><X className="w-6 h-6" /></button>

        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-2xl"><Cloud className="w-6 h-6 text-blue-600" /></div>
              <div>
                <h2 className="text-2xl font-black text-gray-800 leading-tight">بوابة NABIL Cloud</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-tight">مشروعك متصل وجاهز</p>
              </div>
            </div>
            <button 
              onClick={() => setShowConfig(!showConfig)}
              className={`p-3 rounded-2xl transition ${showConfig ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}
              title="إعدادات Supabase المتقدمة"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {showConfig ? (
            <form onSubmit={handleSaveConfig} className="space-y-4 animate-in slide-in-from-top-4 duration-300">
              <p className="text-[10px] text-gray-400 font-bold uppercase text-center mb-2">تعديل إعدادات الربط (متقدم)</p>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase mr-1">URL</label>
                <input 
                  type="text" 
                  value={sUrl}
                  onChange={(e) => setSUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[10px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase mr-1">Key</label>
                <textarea 
                  value={sKey}
                  onChange={(e) => setSKey(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[10px] h-20 resize-none"
                />
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg">حفظ وإعادة تشغيل</button>
            </form>
          ) : user ? (
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4">
                <img src={user.picture} className="w-16 h-16 rounded-full border-4 border-white shadow-sm" alt={user.name} />
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-black text-gray-800 truncate">{user.name}</h3>
                  <p className="text-[10px] text-gray-400 font-bold truncate tracking-tight">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={onSync}
                  disabled={isSyncing}
                  className="flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition shadow-xl shadow-blue-100 disabled:opacity-50"
                >
                  <RefreshCcw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                  مزامنة البيانات الآن
                </button>
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition"
                >
                  <LogOut className="w-5 h-5" /> تسجيل الخروج النهائي
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <button 
                onClick={handleGithubLogin}
                disabled={githubLoading}
                className="w-full flex items-center justify-center gap-3 py-5 bg-[#24292e] text-white rounded-2xl font-black hover:bg-black transition shadow-xl active:scale-95 disabled:opacity-70"
              >
                {githubLoading ? <RefreshCcw className="w-6 h-6 animate-spin" /> : <Github className="w-6 h-6" />}
                الدخول عبر GitHub
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-3 text-gray-400 font-bold tracking-widest">أو عبر الحساب</span></div>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" placeholder="البريد الإلكتروني" required />
                </div>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" placeholder="كلمة المرور" required />
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 active:scale-95">
                  {loading ? <RefreshCcw className="w-6 h-6 animate-spin mx-auto" /> : (isLoginView ? 'تسجيل الدخول' : 'إنشاء حساب')}
                </button>
                <p className="text-center text-xs font-bold text-slate-400">
                  {isLoginView ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
                  <button type="button" onClick={() => setIsLoginView(!isLoginView)} className="text-blue-600 mr-1 hover:underline">{isLoginView ? 'سجل الآن' : 'دخول'}</button>
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
