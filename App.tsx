
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { PlusCircle, Search, User as UserIcon, Settings, Sun, Moon, Menu, X, Check, XCircle, Trash2, MapPin, Key, Mail, ShieldAlert, Users, Layers, Edit3, Save, ArrowLeft, LayoutDashboard, Database, Loader2, Share2, Copy, ExternalLink, Phone, Flag, AlertTriangle, Bell, Send, Facebook, Twitter, Instagram, Globe, BookOpen, PenTool, Eye, TrendingUp, History } from 'lucide-react';
import { subscribeToAuth, signInWithGoogle, logout, fetchServices, addService, updateServiceStatus, deleteService, loginWithEmail, registerWithEmail, fetchAllUsers, toggleUserBan, fetchCategories, saveCategory, fetchUserServices, getServiceById, updateServiceData, deleteCategory, seedDatabase, submitReport, fetchReports, deleteReport, fetchNotifications, markNotificationRead, sendNotification, addBlog, fetchBlogs, deleteBlog, getBlogById, incrementViewCount, fetchPopularServices, fetchAllNotifications } from './services/firebase';
import { User } from 'firebase/auth';
import { LocationSelector } from './components/LocationSelector';
import { Button, Card, Input, Select, Badge } from './components/ui';
import { CATEGORY_ICONS, BANGLADESH_LOCATIONS } from './constants';
import { Category, LocationHierarchy, ServiceEntry, ServiceStatus, UserDocument, CategoryDefinition, CategoryField, ReportDocument, NotificationDocument, BlogDocument } from './types';
import { askAI } from './services/geminiService';

// --- Contexts ---
const ThemeContext = createContext({ isDark: false, toggleTheme: () => {} });
const AuthContext = createContext<{ user: User | null; loading: boolean; isAdmin: boolean }>({ user: null, loading: true, isAdmin: false });

// --- Components ---

const NotificationBell = () => {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState<NotificationDocument[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if(user) {
            fetchNotifications(user.uid).then(notifs => {
                setNotifications(notifs);
                setUnreadCount(notifs.filter(n => !n.isRead).length);
            });
        }
    }, [user, isOpen]);

    const handleMarkRead = async (id: string) => {
        await markNotificationRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    }

    if (!user) return null;

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-dark-900"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-fade-in">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-700 font-bold flex justify-between items-center">
                        <span>Notifications</span>
                        <button onClick={() => setIsOpen(false)}><X className="w-4 h-4"/></button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">No notifications yet.</div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                {notifications.map(notif => (
                                    <div key={notif.id} className={`p-3 hover:bg-slate-50 dark:hover:bg-dark-900/50 transition-colors ${!notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`} onClick={() => handleMarkRead(notif.id)}>
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`text-sm ${!notif.isRead ? 'font-bold text-primary-600' : 'font-medium'}`}>{notif.title}</h4>
                                            <span className="text-[10px] text-slate-400">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{notif.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

const Navbar = () => {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { user, isAdmin } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 dark:bg-dark-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
           <img src="/assets/DeshiSheba.png" alt="DeshiSheba" className="w-9 h-9 rounded-lg shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform" />
           <span className="font-bold text-xl text-slate-800 dark:text-white tracking-tight">Deshi<span className="text-primary-600">Sheba</span></span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1"><Search className="w-4 h-4"/> Browse</Link>
          <Link to="/add" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1"><PlusCircle className="w-4 h-4"/> Add Place</Link>
          {isAdmin && (
            <Link to="/admin" className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full"><ShieldAlert className="w-4 h-4"/> Admin</Link>
          )}
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
          <NotificationBell />
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          {user ? (
            <div className="flex items-center gap-3 pl-2">
                <Link to="/profile" className="flex flex-col items-end cursor-pointer group">
                    <span className="text-xs font-semibold group-hover:text-primary-500">{user.displayName || 'User'}</span>
                    <span className="text-[10px] text-slate-500">{isAdmin ? 'Administrator' : 'Contributor'}</span>
                </Link>
                <Link to="/profile">
                   <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'U'}`} className="w-9 h-9 rounded-full border-2 border-primary-100 dark:border-primary-900 hover:border-primary-500 transition-colors" alt="User" />
                </Link>
                <Button variant="ghost" className="text-xs h-8 px-2" onClick={() => logout()}>Log Out</Button>
            </div>
          ) : (
            <Link to="/auth">
                <Button variant="primary" className="text-sm py-2 shadow-lg shadow-primary-500/20">Sign In / Join</Button>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-4">
            <NotificationBell />
            <button className="p-2 text-slate-700 dark:text-slate-200" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X /> : <Menu />}
            </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden absolute w-full bg-white dark:bg-dark-900 border-b border-slate-200 dark:border-slate-800 shadow-xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
           <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
             <Search className="w-5 h-5 text-primary-500" /> Browse Services
           </Link>
           <Link to="/add" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
             <PlusCircle className="w-5 h-5 text-primary-500" /> Add New Place
           </Link>
           {user && (
             <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
               <LayoutDashboard className="w-5 h-5 text-primary-500" /> My Dashboard
             </Link>
           )}
           {isAdmin && (
             <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600">
               <ShieldAlert className="w-5 h-5" /> Admin Panel
             </Link>
           )}
           <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
             <span className="text-sm text-slate-500">Theme</span>
             <button onClick={toggleTheme} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
             </button>
           </div>
           {user ? (
             <Button variant="secondary" onClick={() => { logout(); setMenuOpen(false); }}>Sign Out ({user.displayName})</Button>
           ) : (
             <Link to="/auth" onClick={() => setMenuOpen(false)}>
                <Button variant="primary" className="w-full justify-center">Sign In / Join</Button>
             </Link>
           )}
        </div>
      )}
    </nav>
  );
};

const Footer = () => {
    const [popularServices, setPopularServices] = useState<ServiceEntry[]>([]);

    useEffect(() => {
        fetchPopularServices().then(setPopularServices);
    }, []);

    return (
        <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <img src="/assets/DeshiSheba.png" alt="DeshiSheba" className="w-8 h-8 rounded-lg" />
                        <span className="font-bold text-xl text-white">Deshi<span className="text-primary-500">Sheba</span></span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Connecting Bangladesh communities with essential local services. 
                        Find hospitals, police, schools, and more in your village or town instantly.
                    </p>
                    <div className="flex gap-4">
                        <a href="https://facebook.com" target="_blank" rel="noreferrer" className="p-2 bg-slate-800 rounded-full hover:bg-primary-600 transition-colors"><Facebook className="w-4 h-4"/></a>
                        <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 bg-slate-800 rounded-full hover:bg-primary-600 transition-colors"><Twitter className="w-4 h-4"/></a>
                        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-2 bg-slate-800 rounded-full hover:bg-primary-600 transition-colors"><Instagram className="w-4 h-4"/></a>
                    </div>
                </div>

                <div>
                    <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Quick Links</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/" className="hover:text-primary-400 transition-colors">Home</Link></li>
                        <li><Link to="/add" className="hover:text-primary-400 transition-colors">Add Listing</Link></li>
                        <li><Link to="/auth" className="hover:text-primary-400 transition-colors">Login / Register</Link></li>
                        <li><Link to="/terms" className="hover:text-primary-400 transition-colors">Terms of Service</Link></li>
                        <li><Link to="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Popular Services</h3>
                    <ul className="space-y-2 text-sm">
                        {popularServices.length === 0 ? (
                            <>
                                <li><Link to="/" state={{ category: Category.HOSPITAL }} className="hover:text-primary-400 transition-colors">Emergency Hospital</Link></li>
                                <li><Link to="/" state={{ category: Category.POLICE }} className="hover:text-primary-400 transition-colors">Police Station</Link></li>
                                <li><Link to="/" state={{ category: Category.BLOOD_DONATION }} className="hover:text-primary-400 transition-colors">Blood Banks</Link></li>
                            </>
                        ) : (
                            popularServices.map(service => (
                                <li key={service.id}>
                                    <Link to={`/service/${service.id}`} className="hover:text-primary-400 transition-colors truncate block">
                                        {service.name}
                                    </Link>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Contact</h3>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2"><Mail className="w-4 h-4"/> support@deshisheba.com</li>
                        <li className="flex items-center gap-2"><Phone className="w-4 h-4"/> +880 1700 000000</li>
                        <li className="flex items-center gap-2"><MapPin className="w-4 h-4"/> Dhaka, Bangladesh</li>
                    </ul>
                </div>
            </div>
            
            <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
                <p>&copy; {new Date().getFullYear()} DeshiSheba. Built for Bangladesh 🇧🇩</p>
            </div>
        </footer>
    );
};

// --- Helper Components ---

const ShareModal = ({ url, title, onClose }: { url: string; title: string; onClose: () => void }) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(`Check out ${title} on DeshiSheba!`);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-2xl p-6 w-full max-w-sm border border-slate-100 dark:border-slate-700 transform transition-all scale-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Share Content</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"><X className="w-5 h-5"/></button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 transition-colors">
                        <Share2 className="w-6 h-6 mb-1" />
                        <span className="text-xs font-semibold">Facebook</span>
                    </a>
                    <a href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 transition-colors">
                        <Phone className="w-6 h-6 mb-1" />
                        <span className="text-xs font-semibold">WhatsApp</span>
                    </a>
                     <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-3 rounded-lg bg-sky-50 dark:bg-sky-900/20 text-sky-500 hover:bg-sky-100 transition-colors">
                        <Share2 className="w-6 h-6 mb-1" />
                        <span className="text-xs font-semibold">Twitter / X</span>
                    </a>
                    <button onClick={handleCopy} className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                        <Copy className="w-6 h-6 mb-1" />
                        <span className="text-xs font-semibold">Copy Link</span>
                    </button>
                </div>
                <div className="bg-slate-100 dark:bg-dark-900 p-3 rounded text-xs text-slate-500 break-all border border-slate-200 dark:border-slate-700">
                    {url}
                </div>
            </div>
        </div>
    );
};

const ReportModal = ({ service, onClose }: { service: ServiceEntry; onClose: () => void }) => {
    const [reason, setReason] = useState('Incorrect Information');
    const [details, setDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { user } = useContext(AuthContext);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await submitReport({
                serviceId: service.id,
                serviceName: service.name,
                reason,
                details,
                reportedBy: user?.uid || 'Anonymous',
                reportedAt: Date.now()
            });
            alert("Report submitted. An admin will review this service.");
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to submit report.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
             <div className="bg-white dark:bg-dark-800 rounded-xl shadow-2xl p-6 w-full max-w-sm border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2"><Flag className="w-5 h-5 text-red-500" /> Report Service</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"><X className="w-5 h-5"/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1">Reason</label>
                        <Select value={reason} onChange={e => setReason(e.target.value)}>
                            <option value="Incorrect Information">Incorrect Information</option>
                            <option value="Spam or Fake">Spam or Fake</option>
                            <option value="Duplicate Listing">Duplicate Listing</option>
                            <option value="Inappropriate Content">Inappropriate Content</option>
                            <option value="Other">Other</option>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1">Additional Details</label>
                        <textarea 
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-900 focus:ring-2 focus:ring-primary-500 focus:outline-none min-h-[80px]"
                            placeholder="Please provide more info..."
                            value={details}
                            onChange={e => setDetails(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="danger" loading={submitting}>Submit Report</Button>
                    </div>
                </form>
             </div>
        </div>
    )
};

// --- Pages ---

const TermsPage = () => (
    <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <div className="prose dark:prose-invert">
            <p>Welcome to DeshiSheba. By using our service, you agree to these terms.</p>
            <h3>1. Use of Service</h3>
            <p>You agree to use this platform only for lawful purposes. Do not post false or misleading information.</p>
            <h3>2. User Accounts</h3>
            <p>You are responsible for maintaining the security of your account credentials.</p>
            <h3>3. Content</h3>
            <p>Users are responsible for the content they post. We reserve the right to remove inappropriate content.</p>
            <h3>4. Disclaimer</h3>
            <p>DeshiSheba is a directory service. We do not guarantee the accuracy of information provided by users.</p>
        </div>
    </div>
);

const PrivacyPage = () => (
    <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <div className="prose dark:prose-invert">
            <p>Your privacy is important to us. This policy explains how we handle your data.</p>
            <h3>1. Data Collection</h3>
            <p>We collect information you provide, such as name, email, and service details.</p>
            <h3>2. Data Usage</h3>
            <p>We use your data to provide and improve our services. We do not sell your personal data to third parties.</p>
            <h3>3. Cookies</h3>
            <p>We use cookies to enhance your browsing experience and for analytics.</p>
        </div>
    </div>
);

const BlogDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState<BlogDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [showShare, setShowShare] = useState(false);

    useEffect(() => {
        if(id) {
            getBlogById(id).then(b => {
                setBlog(b);
                setLoading(false);
                // Increment view count
                incrementViewCount('blogs', id);
            })
        }
    }, [id]);

    const handleShare = () => {
        if(!blog) return;
        const url = `${window.location.origin}${window.location.pathname}#/blog/${blog.id}`;
        if (navigator.share) {
             navigator.share({
                title: blog.title,
                text: blog.excerpt,
                url: url,
            }).catch(console.error);
        } else {
            setShowShare(true);
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-600"/></div>;
    if (!blog) return <div className="p-8 text-center text-slate-500">Blog post not found.</div>;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <button onClick={() => navigate(-1)} className="inline-flex items-center text-slate-500 hover:text-primary-500 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
            <article className="prose dark:prose-invert lg:prose-xl mx-auto">
                <div className="mb-6">
                     <div className="w-full h-64 bg-slate-100 dark:bg-dark-800 rounded-2xl overflow-hidden mb-6 flex items-center justify-center">
                         {blog.imageUrl ? 
                            <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" /> :
                            <PenTool className="w-20 h-20 text-slate-300" />
                         }
                     </div>
                    <span className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-2 block">Latest Update</span>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">{blog.title}</h1>
                    <div className="flex items-center justify-between text-sm text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-4">
                        <div className="flex items-center gap-2">
                             <UserIcon className="w-4 h-4"/>
                             <span>{blog.authorName}</span>
                             <span>•</span>
                             <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                             <span>•</span>
                             <span className="flex items-center gap-1"><Eye className="w-3 h-3"/> {blog.views || 0} views</span>
                        </div>
                        <Button variant="ghost" onClick={handleShare}><Share2 className="w-4 h-4 mr-2"/> Share</Button>
                    </div>
                </div>
                <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {blog.content}
                </div>
            </article>
            {showShare && <ShareModal url={`${window.location.origin}${window.location.pathname}#/blog/${blog.id}`} title={blog.title} onClose={() => setShowShare(false)} />}
        </div>
    )
}

const ServiceDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const locationState = useLocation().state; 
    
    const [service, setService] = useState<ServiceEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [showShare, setShowShare] = useState(false);
    const [showReport, setShowReport] = useState(false);

    useEffect(() => {
        if(id) {
            getServiceById(id).then(s => {
                setService(s);
                setLoading(false);
                incrementViewCount('services', id);
            });
        }
    }, [id]);

    const handleShare = () => {
        if (navigator.share && service) {
            const url = `${window.location.origin}${window.location.pathname}#/service/${service.id}`;
            navigator.share({
                title: service.name,
                text: `Check out ${service.name} on DeshiSheba`,
                url: url,
            }).catch(console.error);
        } else {
            setShowShare(true);
        }
    };

    const handleBack = () => {
        if (locationState) {
            navigate('/', { state: locationState });
        } else {
            navigate('/');
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-600"/></div>;
    if (!service) return <div className="p-8 text-center text-slate-500">Service not found or has been removed. <br/><Link to="/" className="text-primary-500 underline mt-2 block">Go Back Home</Link></div>;

    const catIcon = CATEGORY_ICONS[service.category] || '🔧';

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <button 
                onClick={handleBack} 
                className="inline-flex items-center text-slate-500 hover:text-primary-500 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
            
            <Card className="p-0 overflow-hidden shadow-2xl border-0">
                <div className="bg-primary-600 h-32 relative">
                    <div className="absolute -bottom-8 left-6 w-20 h-20 bg-white dark:bg-dark-800 rounded-xl shadow-lg flex items-center justify-center text-4xl border-4 border-white dark:border-dark-800">
                        {catIcon}
                    </div>
                    <div className="absolute bottom-4 right-6 text-white/80 text-xs font-semibold flex items-center gap-1">
                        <Eye className="w-4 h-4"/> {service.views || 0} Views
                    </div>
                </div>
                <div className="pt-12 px-6 pb-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge color="blue">{service.category}</Badge>
                                <span className="text-xs text-slate-500">Added {new Date(service.submittedAt).toLocaleDateString()}</span>
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{service.name}</h1>
                            <p className="text-slate-500 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> 
                                {service.address.village ? `${service.address.village}, ` : ''}{service.address.upazila}, {service.address.district}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => setShowReport(true)} className="h-10 w-10 p-0 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50" title="Report Issue">
                                <Flag className="w-5 h-5" />
                            </Button>
                            <Button variant="secondary" onClick={handleShare} className="h-10 w-10 p-0 rounded-full flex items-center justify-center">
                                <Share2 className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mt-8">
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-slate-50 dark:bg-dark-900/50 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                                <h3 className="font-bold text-lg mb-3">About this service</h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{service.description}</p>
                            </div>
                            
                            {/* Dynamic Fields */}
                            {service.dynamicData && Object.keys(service.dynamicData).length > 0 && (
                                <div className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                     <h3 className="bg-slate-50 dark:bg-dark-900 px-5 py-3 font-bold text-sm border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase">Additional Info</h3>
                                     <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {Object.entries(service.dynamicData).map(([key, val]) => (
                                            <div key={key} className="flex justify-between px-5 py-3">
                                                <span className="text-slate-500 capitalize font-medium">{key.replace(/_/g, ' ')}</span>
                                                <span className="text-slate-900 dark:text-slate-100 font-semibold">{val}</span>
                                            </div>
                                        ))}
                                     </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <Card className="p-5 border-t-4 border-t-primary-500 bg-white dark:bg-dark-800 shadow-lg">
                                <h3 className="font-bold mb-4">Contact Information</h3>
                                <a href={`tel:${service.phone}`} className="block w-full">
                                    <Button className="w-full text-lg py-4 shadow-xl shadow-primary-500/20 mb-3">
                                        <Phone className="w-5 h-5 mr-2" /> Call Now
                                    </Button>
                                </a>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-slate-800 dark:text-white">{service.phone}</p>
                                    <p className="text-xs text-slate-400 mt-1">Available for service</p>
                                </div>
                            </Card>
                            
                            <div className="flex flex-wrap gap-2">
                                {service.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-dark-900 rounded-full text-xs text-slate-500 border border-slate-200 dark:border-slate-700">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
            {showShare && <ShareModal url={`${window.location.origin}${window.location.pathname}#/service/${service.id}`} title={service.name} onClose={() => setShowShare(false)} />}
            {showReport && <ReportModal service={service} onClose={() => setShowReport(false)} />}
        </div>
    );
};

const HomePage = () => {
  const [location, setLocation] = useState<LocationHierarchy>({ division: '', district: '', upazila: '', village: '' });
  const [services, setServices] = useState<ServiceEntry[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryDefinition[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showScrollFab, setShowScrollFab] = useState(false);
  const [blogs, setBlogs] = useState<BlogDocument[]>([]);
  const locationState = useLocation().state as any;
  const [shareService, setShareService] = useState<ServiceEntry | null>(null);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAi, setShowAi] = useState(false);

  useEffect(() => {
    const init = async () => {
        const [svcs, cats, blogData] = await Promise.all([
            fetchServices(ServiceStatus.APPROVED),
            fetchCategories(),
            fetchBlogs()
        ]);
        setServices(svcs);
        setCategories(cats);
        setBlogs(blogData.slice(0, 3)); 
        setLoading(false);
        
        if (locationState) {
            if(locationState.category) setSelectedCategory(locationState.category);
            if(locationState.search) setSearchTerm(locationState.search);
            if(locationState.loc) setLocation(locationState.loc);
            if(locationState.showResults || locationState.category) setShowResults(true);
        }
    }
    init();
    
    const handleScroll = () => {
        setShowScrollFab(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if(searchTerm.trim().length > 0) setShowResults(true);
  }, [searchTerm]);

  useEffect(() => {
    let result = services;
    if (location.division) result = result.filter(s => s.address.division === location.division);
    if (location.district) result = result.filter(s => s.address.district === location.district);
    if (location.upazila) result = result.filter(s => s.address.upazila === location.upazila);
    if (location.village) result = result.filter(s => s.address.village?.toLowerCase().includes(location.village.toLowerCase()));
    if (selectedCategory) result = result.filter(s => s.category === selectedCategory);
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(lower) || 
        s.category.toLowerCase().includes(lower) ||
        s.address.district.toLowerCase().includes(lower) ||
        s.address.upazila.toLowerCase().includes(lower) ||
        s.tags.some(t => t.toLowerCase().includes(lower))
      );
    }
    setFilteredServices(result);
  }, [services, location, selectedCategory, searchTerm]);

  const handleCategoryClick = (catId: string) => {
      setSelectedCategory(catId);
      setShowResults(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handleBackToCategories = () => {
      setSelectedCategory(null);
      setSearchTerm('');
      setShowResults(false);
  }

  const handleAiAsk = async () => {
      if(!aiQuery.trim()) return;
      setAiLoading(true);
      setAiResponse('');
      
      const keywords = aiQuery.toLowerCase().split(' ').filter(k => k.length > 2);
      const scoredServices = services.map(s => {
          let score = 0;
          const text = `${s.name} ${s.category} ${s.address.district} ${s.address.upazila} ${s.description} ${s.tags.join(' ')}`.toLowerCase();
          keywords.forEach(k => { if(text.includes(k)) score += 1; });
          return { s, score };
      });
  
      const topMatches = scoredServices.filter(item => item.score > 0).sort((a,b) => b.score - a.score).slice(0, 20).map(item => item.s);
      const context = topMatches.length > 0 ? JSON.stringify(topMatches.map(s => ({
          name: s.name, category: s.category, location: `${s.address.upazila}, ${s.address.district}`, phone: s.phone, desc: s.description
      }))) : "No specific services found.";
  
      const response = await askAI(aiQuery, context);
      setAiResponse(response);
      setAiLoading(false);
  }

  const handleShareClick = (service: ServiceEntry) => {
    if (navigator.share) {
        const url = `${window.location.origin}${window.location.pathname}#/service/${service.id}`;
        navigator.share({ title: service.name, text: `Check out ${service.name} on DeshiSheba`, url: url }).catch(console.error);
    } else {
        setShareService(service);
    }
  };

  return (
      <div className="min-h-screen pb-0 bg-slate-50 dark:bg-dark-900 relative flex flex-col">
           {/* Hero */}
           <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 dark:from-black dark:via-slate-900 dark:to-black pt-16 pb-28 px-4 text-center rounded-b-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-slate-900/50 pointer-events-none"></div>
                <div className="relative z-10 max-w-5xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-sm font-medium mb-6 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                        Connecting You to Essential Services
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
                        Bangladesh's <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Service Hub</span>
                    </h1>
                    <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        From rural villages to city centers, find police stations, hospitals, hotels, and more instantly.
                    </p>
                    <div className="bg-white/95 dark:bg-dark-800/95 rounded-2xl shadow-2xl p-6 text-left border border-white/20 backdrop-blur-md transform transition-all hover:scale-[1.01]">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"><MapPin className="w-3 h-3 text-primary-500"/> Select Area</label>
                                <LocationSelector value={location} onChange={setLocation} />
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"><Search className="w-3 h-3 text-primary-500"/> Search Service</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <Input placeholder="Search hospitals, names..." className="pl-10 h-11" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
           </div>

           {/* FABs */}
           {showScrollFab && (
               <Link to="/add" className="fixed bottom-6 left-6 z-50 animate-fade-in" title="Add Service">
                   <Button className="rounded-full w-14 h-14 shadow-xl flex items-center justify-center bg-primary-600 text-white hover:scale-110 transition-transform shadow-primary-500/40">
                        <PlusCircle className="w-8 h-8" />
                   </Button>
               </Link>
           )}

           {/* AI Assistant */}
           <div className="fixed bottom-6 right-6 z-40">
               {showAi ? (
                   <div className="mb-4 w-80 md:w-96 bg-white dark:bg-dark-800 rounded-xl shadow-2xl border border-primary-200 dark:border-primary-900 overflow-hidden flex flex-col animate-slide-up ring-1 ring-black/5">
                       <div className="bg-gradient-to-r from-primary-600 to-blue-600 text-white p-3 flex justify-between items-center">
                           <span className="font-bold flex items-center gap-2 text-sm">🤖 DeshiSheba AI</span>
                           <button onClick={() => setShowAi(false)}><X className="w-4 h-4"/></button>
                       </div>
                       <div className="p-4 max-h-80 overflow-y-auto bg-slate-50 dark:bg-dark-900/50 min-h-[150px]">
                           {aiResponse ? (
                               <div className="prose prose-sm dark:prose-invert">
                                   <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">{aiResponse}</p>
                               </div>
                           ) : (
                               <div className="text-center py-6 text-slate-500">
                                   <p className="text-sm italic mb-2">I'm site-aware! I can find specific services listed here.</p>
                                   <p className="text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded inline-block">Try: "Find a hospital in Mirpur"</p>
                               </div>
                           )}
                       </div>
                       <div className="p-3 border-t dark:border-slate-700 flex gap-2 bg-white dark:bg-dark-800">
                           <Input placeholder="Ask about local services..." value={aiQuery} onChange={e => setAiQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAiAsk()} className="text-sm h-10" />
                           <Button variant="primary" className="h-10 w-10 p-0 flex-shrink-0" onClick={handleAiAsk} loading={aiLoading}><Search className="w-4 h-4" /></Button>
                       </div>
                   </div>
               ) : (
                   <Button onClick={() => setShowAi(true)} className="rounded-full w-14 h-14 shadow-xl flex items-center justify-center bg-gradient-to-r from-blue-600 to-primary-600 hover:scale-110 transition-transform animate-bounce shadow-primary-500/30">
                       <span className="text-2xl">🤖</span>
                   </Button>
               )}
           </div>

           {/* Content */}
           <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20 flex-grow w-full">
               {!showResults && (
                   <div className="animate-fade-in pb-12">
                        <div className="flex items-center justify-between mb-6">
                           <h2 className="text-xl font-bold text-slate-800 dark:text-white">Browse Categories</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-16">
                           {categories.map(cat => (
                               <button key={cat.id} onClick={() => handleCategoryClick(cat.id)} className="bg-white dark:bg-dark-800 hover:bg-primary-50 dark:hover:bg-primary-900/10 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-800 transition-all hover:-translate-y-1 group text-center flex flex-col items-center justify-center gap-3 h-32">
                                   <span className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">{cat.icon}</span>
                                   <span className="font-semibold text-sm text-slate-700 dark:text-slate-200 group-hover:text-primary-700 dark:group-hover:text-primary-400">{cat.name}</span>
                               </button>
                           ))}
                        </div>

                        {/* Blog / Related Section */}
                        <div className="mb-12">
                           <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">
                               <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                   <BookOpen className="w-5 h-5 text-primary-600"/> Latest News & Updates
                               </h2>
                           </div>
                           {blogs.length === 0 ? (
                               <p className="text-slate-500 text-sm italic">No updates available at the moment.</p>
                           ) : (
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                   {blogs.map(blog => (
                                       <Link to={`/blog/${blog.id}`} key={blog.id} className="group bg-white dark:bg-dark-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700">
                                           <div className="h-40 bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                                               {blog.imageUrl ? 
                                                 <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" /> :
                                                 <PenTool className="w-10 h-10 text-slate-300"/>
                                               }
                                           </div>
                                           <div className="p-5">
                                               <div className="text-xs text-primary-600 font-bold mb-2 uppercase tracking-wide">Update</div>
                                               <h3 className="font-bold text-lg mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">{blog.title}</h3>
                                               <p className="text-slate-500 text-sm line-clamp-2 mb-4">{blog.excerpt}</p>
                                               <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                                                   <span>Read Article →</span>
                                                   <span className="flex items-center gap-1"><Eye className="w-3 h-3"/> {blog.views || 0}</span>
                                               </div>
                                           </div>
                                       </Link>
                                   ))}
                               </div>
                           )}
                        </div>
                   </div>
               )}

               {showResults && (
                   <div className="animate-fade-in pb-20">
                       <div className="bg-white dark:bg-dark-800 rounded-xl p-4 shadow-md border border-slate-100 dark:border-slate-700 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-20 z-30">
                          <div className="flex items-center gap-4 w-full sm:w-auto">
                             <Button variant="secondary" onClick={handleBackToCategories} className="h-10 w-10 p-0 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                                <ArrowLeft className="w-5 h-5"/>
                             </Button>
                             <div className="flex flex-col">
                                 <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 leading-none">
                                    {selectedCategory ? (
                                       <><span className="text-2xl">{categories.find(c => c.id === selectedCategory)?.icon}</span>{categories.find(c => c.id === selectedCategory)?.name}</>
                                    ) : 'Search Results'}
                                 </h2>
                                 <p className="text-xs text-slate-500 mt-1">Found {filteredServices.length} result{filteredServices.length !== 1 ? 's' : ''}</p>
                             </div>
                          </div>
                       </div>
                       {loading ? (
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                               {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>)}
                           </div>
                       ) : filteredServices.length === 0 ? (
                           <div className="text-center py-20 bg-white dark:bg-dark-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                               <div className="w-16 h-16 bg-slate-100 dark:bg-dark-900 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="w-8 h-8 text-slate-400" /></div>
                               <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No services found</h3>
                               <p className="text-slate-500 mb-6 max-w-sm mx-auto">We couldn't find any {selectedCategory || ''} services in this area.</p>
                               <div className="inline-block"><Link to="/add"><Button className="px-6 py-3 text-base shadow-xl shadow-primary-500/20 animate-pulse"><PlusCircle className="w-5 h-5 mr-2"/> Add the First {selectedCategory} Here</Button></Link></div>
                           </div>
                       ) : (
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                               {filteredServices.map(service => {
                                   const catDef = categories.find(c => c.id === service.category) || { icon: '🔧', name: service.category };
                                   return (
                                       <Card key={service.id} className="hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full border-t-4 border-t-primary-500 group overflow-hidden">
                                           <div className="flex justify-between items-start mb-3">
                                               <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-xl shadow-inner">{catDef.icon}</div>
                                               <div className="flex gap-2">
                                                   <div className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{catDef.name}</div>
                                               </div>
                                           </div>
                                           <Link to={`/service/${service.id}`} state={{ category: selectedCategory, search: searchTerm, loc: location, showResults: true }} className="block mb-1">
                                               <h3 className="font-bold text-lg group-hover:text-primary-600 transition-colors line-clamp-1">{service.name}</h3>
                                           </Link>
                                           <p className="text-xs text-slate-500 mb-3 flex items-center gap-1 uppercase tracking-wide font-semibold"><MapPin className="w-3 h-3 text-primary-400" />{service.address.upazila}, {service.address.district}</p>
                                           <div className="flex-grow">
                                               <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2 leading-relaxed">{service.description}</p>
                                               <div className="flex flex-wrap gap-1 mb-4">
                                                   {service.tags.slice(0,3).map(tag => <span key={tag} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-medium border border-slate-200 dark:border-slate-700">#{tag}</span>)}
                                               </div>
                                           </div>
                                           <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                                               <a href={`tel:${service.phone}`} className="flex-1 flex items-center justify-center py-2.5 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-primary-700 dark:text-primary-400 font-bold hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors gap-2 text-sm">📞 Call</a>
                                               <Button variant="secondary" onClick={() => handleShareClick(service)} className="px-3" title="Share"><Share2 className="w-4 h-4" /></Button>
                                           </div>
                                       </Card>
                                   )
                               })}
                           </div>
                       )}
                   </div>
               )}
           </div>

           <Footer />
           {shareService && <ShareModal url={`${window.location.origin}${window.location.pathname}#/service/${shareService.id}`} title={shareService.name} onClose={() => setShareService(null)} />}
      </div>
  );
};

// --- Admin & New Components ---

const UserManagement = () => {
    const [users, setUsers] = useState<UserDocument[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllUsers().then(u => {
            setUsers(u);
            setLoading(false);
        });
    }, []);

    const handleBanToggle = async (uid: string, currentStatus: boolean) => {
        if(confirm(`Are you sure you want to ${currentStatus ? 'unban' : 'ban'} this user?`)) {
            await toggleUserBan(uid, currentStatus);
            setUsers(users.map(u => u.uid === uid ? { ...u, isBanned: !currentStatus } : u));
        }
    }

    if(loading) return <div>Loading users...</div>;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-500">
                        <th className="p-3">User</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Joined</th>
                        <th className="p-3 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {users.map(u => (
                        <tr key={u.uid} className="hover:bg-slate-50 dark:hover:bg-dark-900/50">
                            <td className="p-3">
                                <div className="font-bold">{u.displayName || 'No Name'}</div>
                                <div className="text-xs text-slate-500">{u.email}</div>
                            </td>
                            <td className="p-3"><Badge color={u.role === 'admin' ? 'red' : 'blue'}>{u.role}</Badge></td>
                            <td className="p-3"><Badge color={u.isBanned ? 'red' : 'green'}>{u.isBanned ? 'Banned' : 'Active'}</Badge></td>
                            <td className="p-3 text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                            <td className="p-3 text-right">
                                {u.role !== 'admin' && (
                                    <Button variant={u.isBanned ? 'primary' : 'danger'} onClick={() => handleBanToggle(u.uid, u.isBanned)} className="py-1 px-3 text-xs">
                                        {u.isBanned ? 'Unban' : 'Ban'}
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

const CategoryManagement = () => {
    const [categories, setCategories] = useState<CategoryDefinition[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCat, setCurrentCat] = useState<Partial<CategoryDefinition>>({});

    useEffect(() => {
        fetchCategories().then(setCategories);
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!currentCat.id || !currentCat.name) return;
        const newCat = { 
            id: currentCat.id.toLowerCase().replace(/\s+/g, '_'),
            name: currentCat.name, 
            icon: currentCat.icon || '🔧',
            fields: currentCat.fields || [],
            isSystem: false
        } as CategoryDefinition;
        
        await saveCategory(newCat);
        setCategories(prev => {
            const idx = prev.findIndex(c => c.id === newCat.id);
            if(idx >= 0) {
                const updated = [...prev];
                updated[idx] = newCat;
                return updated;
            }
            return [...prev, newCat];
        });
        setIsEditing(false);
        setCurrentCat({});
    }

    const handleDelete = async (id: string) => {
        if(confirm("Delete category?")) {
            await deleteCategory(id);
            setCategories(prev => prev.filter(c => c.id !== id));
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <Card className="p-4 sticky top-4">
                    <h3 className="font-bold mb-4">{isEditing ? 'Edit Category' : 'Add New Category'}</h3>
                    <form onSubmit={handleSave} className="space-y-3">
                        <Input placeholder="ID (e.g. gym)" value={currentCat.id || ''} onChange={e => setCurrentCat({...currentCat, id: e.target.value})} disabled={isEditing} required />
                        <Input placeholder="Name (e.g. Fitness Center)" value={currentCat.name || ''} onChange={e => setCurrentCat({...currentCat, name: e.target.value})} required />
                        <Input placeholder="Icon (e.g. 💪)" value={currentCat.icon || ''} onChange={e => setCurrentCat({...currentCat, icon: e.target.value})} required />
                        <div className="flex gap-2">
                             <Button type="submit" className="flex-1">{isEditing ? 'Update' : 'Add'}</Button>
                             {isEditing && <Button type="button" variant="ghost" onClick={() => { setIsEditing(false); setCurrentCat({}); }}>Cancel</Button>}
                        </div>
                    </form>
                </Card>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map(cat => (
                    <div key={cat.id} className="bg-white dark:bg-dark-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{cat.icon}</span>
                            <div>
                                <h4 className="font-bold">{cat.name}</h4>
                                <p className="text-xs text-slate-500">ID: {cat.id}</p>
                            </div>
                        </div>
                        {!cat.isSystem && (
                            <div className="flex gap-2">
                                <button onClick={() => { setIsEditing(true); setCurrentCat(cat); }} className="text-blue-500"><Edit3 className="w-4 h-4"/></button>
                                <button onClick={() => handleDelete(cat.id)} className="text-red-500"><Trash2 className="w-4 h-4"/></button>
                            </div>
                        )}
                        {cat.isSystem && <Badge color="gray">System</Badge>}
                    </div>
                ))}
            </div>
        </div>
    )
}

const ReportsManagement = () => {
    const [reports, setReports] = useState<ReportDocument[]>([]);
    
    useEffect(() => {
        fetchReports().then(setReports);
    }, []);

    const handleDelete = async (id: string) => {
        if(confirm("Dismiss report?")) {
            await deleteReport(id);
            setReports(prev => prev.filter(r => r.id !== id));
        }
    }

    return (
        <div className="space-y-4">
            {reports.length === 0 ? <p className="text-slate-500">No active reports.</p> : reports.map(report => (
                <div key={report.id} className="bg-white dark:bg-dark-800 p-4 rounded-lg border border-red-100 dark:border-red-900/30 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge color="red">Reported</Badge>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{report.serviceName}</span>
                            <span className="text-xs text-slate-400">({new Date(report.reportedAt).toLocaleDateString()})</span>
                        </div>
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400">Reason: {report.reason}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{report.details}</p>
                        <p className="text-xs text-slate-400 mt-2">Reported by: {report.reportedBy}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link to={`/service/${report.serviceId}`} target="_blank">
                             <Button variant="secondary" className="text-xs">View Service</Button>
                        </Link>
                        <Button variant="ghost" onClick={() => handleDelete(report.id)} className="text-slate-500">Dismiss</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

const BlogManagement = () => {
    const { user } = useContext(AuthContext);
    const [blogs, setBlogs] = useState<BlogDocument[]>([]);
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBlogs().then(setBlogs);
    }, [loading]);

    const handlePublish = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!user) return;
        setLoading(true);
        try {
            await addBlog({
                title, excerpt, content, imageUrl: imageUrl || '/assets/Blog Thumbnail.jpg',
                authorName: user.displayName || 'Admin',
                createdAt: Date.now()
            });
            alert("Blog published!");
            setTitle(''); setExcerpt(''); setContent(''); setImageUrl('');
        } catch (e) {
            alert("Failed to publish");
        }
        setLoading(false);
    }

    const handleDelete = async (id: string) => {
        if(confirm("Delete this post?")) {
            await deleteBlog(id);
            setBlogs(prev => prev.filter(b => b.id !== id));
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Write New Article</h3>
                <form onSubmit={handlePublish} className="space-y-4">
                    <Input placeholder="Article Title" value={title} onChange={e => setTitle(e.target.value)} required />
                    <Input placeholder="Image URL (Optional)" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                    <textarea 
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-900 min-h-[80px]"
                        placeholder="Short Excerpt (shows in list)" value={excerpt} onChange={e => setExcerpt(e.target.value)} required 
                    />
                    <textarea 
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-900 min-h-[200px]"
                        placeholder="Full Content (Markdown supported)" value={content} onChange={e => setContent(e.target.value)} required 
                    />
                    <Button type="submit" loading={loading} className="w-full">Publish Article</Button>
                </form>
            </Card>
            <div className="space-y-4">
                <h3 className="font-bold text-lg">Recent Articles</h3>
                {blogs.map(blog => (
                    <div key={blog.id} className="flex gap-4 p-4 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="w-20 h-20 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                            {blog.imageUrl ? <img src={blog.imageUrl} className="w-full h-full object-cover" /> : <PenTool className="w-full h-full p-4 text-slate-300"/>}
                        </div>
                        <div className="flex-grow">
                            <h4 className="font-bold line-clamp-1">{blog.title}</h4>
                            <p className="text-xs text-slate-500 mb-2">{new Date(blog.createdAt).toLocaleDateString()} • {blog.views || 0} views</p>
                            <div className="flex gap-2">
                                <Link to={`/blog/${blog.id}`}><Button variant="secondary" className="px-2 py-1 text-xs">View</Button></Link>
                                <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => handleDelete(blog.id)}>Delete</Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const NotificationsManagement = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [userId, setUserId] = useState('ALL');
    const [sending, setSending] = useState(false);
    const [history, setHistory] = useState<NotificationDocument[]>([]);

    useEffect(() => {
        fetchAllNotifications().then(setHistory);
    }, [sending]); 

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            await sendNotification({
                title,
                message,
                userId,
                isRead: false,
                createdAt: Date.now()
            });
            alert("Notification Sent!");
            setTitle('');
            setMessage('');
        } catch (e) {
            alert("Error sending notification");
        }
        setSending(false);
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Send System Notification</h3>
                <form onSubmit={handleSend} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1">Recipient</label>
                        <Select value={userId} onChange={e => setUserId(e.target.value)}>
                            <option value="ALL">All Users</option>
                            <option value="ADMIN">Admins Only (Demo)</option>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1">Title</label>
                        <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Update Alert" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1">Message</label>
                        <textarea 
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-900"
                            value={message} onChange={e => setMessage(e.target.value)} required placeholder="Message content..." 
                        />
                    </div>
                    <Button type="submit" loading={sending} className="w-full">
                        <Send className="w-4 h-4 mr-2" /> Send Notification
                    </Button>
                </form>
            </Card>

            <div className="space-y-4">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><History className="w-5 h-5"/> History</h3>
                {history.length === 0 ? <p className="text-slate-500 text-sm">No notifications sent.</p> : 
                 history.map(n => (
                     <div key={n.id} className="p-3 bg-white dark:bg-dark-800 border rounded-lg text-sm">
                         <div className="flex justify-between font-bold mb-1">
                             <span>{n.title}</span>
                             <span className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                         </div>
                         <p className="text-slate-600 dark:text-slate-300">{n.message}</p>
                         <p className="text-xs text-primary-500 mt-1">To: {n.userId}</p>
                     </div>
                 ))
                }
            </div>
        </div>
    )
}

const AdminDashboard = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<'submissions' | 'users' | 'categories' | 'all_services' | 'reports' | 'notifications' | 'blogs'>('submissions');
  const [pendingServices, setPendingServices] = useState<ServiceEntry[]>([]);
  const [allServices, setAllServices] = useState<ServiceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const loadPending = () => {
    fetchServices(ServiceStatus.PENDING).then(data => { setPendingServices(data); setLoading(false); });
  }

  const loadAllApproved = () => {
      setLoading(true);
      fetchServices(ServiceStatus.APPROVED).then(data => { setAllServices(data); setLoading(false); });
  }

  useEffect(() => { 
      if(activeTab === 'submissions') loadPending();
      if(activeTab === 'all_services') loadAllApproved();
  }, [activeTab]);

  const handleAction = async (id: string, status: ServiceStatus) => {
    if (status === ServiceStatus.REJECTED) {
        if(!confirm("Are you sure you want to reject/delete this?")) return;
        await deleteService(id);
    } else {
        await updateServiceStatus(id, status);
    }
    setPendingServices(prev => prev.filter(s => s.id !== id));
  };

  const handleDeleteApproved = async (id: string) => {
      if(confirm("Permanently delete this approved service?")) {
          await deleteService(id);
          setAllServices(prev => prev.filter(s => s.id !== id));
      }
  }

  const handleSeedDatabase = async () => {
      if(confirm("This will Restore Default Services (mock data) to the database. Missing default entries will be recreated. Continue?")) {
          setSeeding(true);
          try {
            await seedDatabase();
            alert("Default services restored successfully! Please refresh.");
            if(activeTab === 'all_services') loadAllApproved();
          } catch(e) {
            console.error(e);
            alert("Error seeding database.");
          }
          setSeeding(false);
      }
  }

  if (!user || !isAdmin) {
      return (
          <div className="h-[60vh] flex flex-col items-center justify-center p-8 text-center">
            <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-slate-500">You must be an administrator to view this page.</p>
            <Link to="/" className="mt-6"><Button variant="ghost">Go Home</Button></Link>
          </div>
      )
  };

  const groupedServices = allServices.reduce((acc: any, service) => {
      if (!acc[service.category]) acc[service.category] = [];
      acc[service.category].push(service);
      return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <Settings className="w-6 h-6 text-primary-600" /> Admin Console
            </h1>
            <p className="text-sm text-slate-500">Manage submissions, users, and content.</p>
        </div>
        <div className="flex gap-2">
             <Button variant="secondary" onClick={handleSeedDatabase} loading={seeding} className="text-xs">
                Restore Default Services
             </Button>
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg text-sm font-medium">
                Admin: {user.email}
            </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto pb-1">
          {['submissions', 'all_services', 'users', 'categories', 'reports', 'notifications', 'blogs'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap capitalize ${activeTab === tab ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                  {tab.replace('_', ' ')}
              </button>
          ))}
      </div>

      <div className="min-h-[400px]">
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'categories' && <CategoryManagement />}
          {activeTab === 'reports' && <ReportsManagement />}
          {activeTab === 'notifications' && <NotificationsManagement />}
          {activeTab === 'blogs' && <BlogManagement />}
          
          {activeTab === 'all_services' && (
              <div>
                  {loading ? <p>Loading all services...</p> : (
                      Object.keys(groupedServices).length === 0 ? <p className="text-slate-500">No approved services found.</p> :
                      Object.keys(groupedServices).sort().map(category => (
                          <div key={category} className="mb-8">
                              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700 dark:text-slate-200 border-b pb-2 border-slate-200 dark:border-slate-700">
                                  <span>{CATEGORY_ICONS[category] || '🔧'}</span> {category}
                                  <Badge color="blue">{groupedServices[category].length}</Badge>
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {groupedServices[category].map((service: ServiceEntry) => (
                                      <div key={service.id} className="bg-white dark:bg-dark-800 p-4 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-start">
                                          <div className="flex-1 min-w-0 pr-2">
                                              <h4 className="font-bold text-sm truncate">{service.name}</h4>
                                              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate"><MapPin className="w-3 h-3 flex-shrink-0"/> {service.address.upazila}, {service.address.district}</p>
                                              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Eye className="w-3 h-3"/> {service.views || 0} Views</p>
                                          </div>
                                          <div className="flex items-center gap-2 flex-shrink-0">
                                              <Link to={`/edit/${service.id}`}><button className="text-blue-500 hover:bg-blue-50 p-1.5 rounded"><Edit3 className="w-4 h-4"/></button></Link>
                                              <button onClick={() => handleDeleteApproved(service.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 className="w-4 h-4"/></button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      ))
                  )}
              </div>
          )}
          {activeTab === 'submissions' && (
              loading ? <p>Loading pending submissions...</p> : pendingServices.length === 0 ? <div className="p-16 text-center bg-white dark:bg-dark-800 rounded-xl border border-dashed dark:border-slate-700"><Check className="w-12 h-12 text-green-500 mx-auto mb-4" /><h3 className="text-xl font-medium">All caught up!</h3><p className="text-slate-500 mt-2">No pending services to review at the moment.</p></div> : 
              <div className="space-y-4">{pendingServices.map(service => (
                <Card key={service.id} className="flex flex-col md:flex-row gap-6 items-start justify-between p-6">
                  <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                           <Badge color="blue">{service.category}</Badge>
                           <span className="text-xs text-slate-500 flex items-center gap-1" title={`ID: ${service.submittedBy}`}><UserIcon className="w-3 h-3"/> {service.submitterName || 'Unknown'}</span>
                           <span className="text-xs text-slate-400">• {new Date(service.submittedAt).toLocaleDateString()}</span>
                        </div>
                        <h3 className="font-bold text-xl mb-1">{service.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1 mb-2"><MapPin className="w-4 h-4 text-slate-400" />{service.address.village ? `${service.address.village}, ` : ''}{service.address.upazila}, {service.address.district}, {service.address.division}</p>
                        <div className="bg-slate-50 dark:bg-dark-900 p-3 rounded-lg border border-slate-100 dark:border-slate-700"><p className="text-sm font-mono text-slate-600 dark:text-slate-400">{service.description || 'No description provided.'}</p>
                            {service.dynamicData && Object.keys(service.dynamicData).length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2">{Object.entries(service.dynamicData).map(([key, val]) => (<div key={key} className="text-xs"><span className="font-bold text-slate-500 capitalize">{key.replace(/_/g, ' ')}:</span> <span className="text-slate-800 dark:text-slate-300">{val}</span></div>))}</div>
                            )}
                        </div>
                        <p className="text-sm mt-3 font-bold text-primary-600">📞 {service.phone}</p>
                  </div>
                  <div className="flex flex-row md:flex-col gap-3 min-w-[120px]">
                     <Button variant="primary" className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleAction(service.id, ServiceStatus.APPROVED)}><Check className="w-4 h-4" /> Approve</Button>
                     <Button variant="danger" className="w-full" onClick={() => handleAction(service.id, ServiceStatus.REJECTED)}><XCircle className="w-4 h-4" /> Reject</Button>
                  </div>
                </Card>
              ))}</div>
          )}
      </div>
    </div>
  );
};

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                await loginWithEmail(email, password);
            } else {
                await registerWithEmail(email, password, name);
            }
            navigate('/profile');
        } catch (error) {
            console.error(error);
            alert("Authentication failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    }

    const handleGoogle = async () => {
        try {
            await signInWithGoogle();
            navigate('/profile');
        } catch (error) {
            console.error(error);
            alert("Google Sign In failed");
        }
    }

    return (
        <div className="min-h-screen pt-20 pb-12 px-4 flex items-center justify-center">
            <div className="w-full max-w-md bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-center mb-6">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Full Name</label>
                            <Input value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium mb-1">Email Address</label>
                        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full py-3" loading={loading}>{isLogin ? 'Sign In' : 'Sign Up'}</Button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-dark-800 text-slate-500">Or continue with</span></div>
                </div>

                <Button variant="secondary" type="button" onClick={handleGoogle} className="w-full">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="currentColor"/></svg>
                    Google
                </Button>

                <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => setIsLogin(!isLogin)} className="text-primary-600 font-bold hover:underline">{isLogin ? 'Sign Up' : 'Log In'}</button>
                </p>
            </div>
        </div>
    )
}

const AddServicePage = () => {
    const { id } = useParams(); // For edit mode
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState<Partial<ServiceEntry>>({
        name: '',
        category: '',
        phone: '',
        description: '',
        address: { division: '', district: '', upazila: '', village: '' },
        tags: [],
        dynamicData: {}
    });
    
    const [categories, setCategories] = useState<CategoryDefinition[]>([]);
    const [loading, setLoading] = useState(false);
    const [tagInput, setTagInput] = useState('');
    
    useEffect(() => {
        fetchCategories().then(setCategories);
        if(id) {
            getServiceById(id).then(data => {
                if(data) setFormData(data);
            });
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!user) { alert("Please login first"); navigate('/auth'); return; }
        if(!formData.name || !formData.category || !formData.phone || !formData.address?.upazila) {
            alert("Please fill all required fields");
            return;
        }

        setLoading(true);
        try {
            if(id) {
                await updateServiceData(id, formData);
                alert("Service updated! Pending approval.");
            } else {
                await addService({
                    ...formData as any,
                    submittedBy: user.uid,
                    submitterName: user.displayName || 'User',
                    status: ServiceStatus.PENDING
                });
                alert("Service submitted successfully! It will be listed after approval.");
            }
            navigate('/profile');
        } catch (e) {
            console.error(e);
            alert("Error saving service.");
        }
        setLoading(false);
    }

    const handleDynamicChange = (key: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            dynamicData: { ...prev.dynamicData, [key]: value }
        }));
    }

    const addTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags?.includes(tagInput.trim())) {
                setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
            }
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tag) }));
    };

    const currentCategoryDef = categories.find(c => c.id === formData.category);

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">{id ? 'Edit Service' : 'Add New Service'}</h1>
            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2">Service Category</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                             {categories.map(cat => (
                                 <button 
                                    key={cat.id} 
                                    type="button"
                                    onClick={() => setFormData({...formData, category: cat.id, dynamicData: {}})}
                                    className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all ${formData.category === cat.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-dark-900'}`}
                                 >
                                     <span className="text-xl">{cat.icon}</span>
                                     <span className="text-xs font-semibold">{cat.name}</span>
                                 </button>
                             ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Service Name</label>
                            <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Popular Hospital" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Phone Number</label>
                            <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="e.g. 017..." required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Location</label>
                        <div className="bg-slate-50 dark:bg-dark-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                             <LocationSelector 
                                value={formData.address as LocationHierarchy} 
                                onChange={loc => setFormData({...formData, address: loc})} 
                             />
                        </div>
                    </div>

                    {currentCategoryDef && currentCategoryDef.fields.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                            <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-3 uppercase tracking-wider">Additional Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentCategoryDef.fields.map(field => (
                                    <div key={field.id}>
                                        <label className="block text-xs font-bold mb-1 capitalize">{field.label}</label>
                                        <Input 
                                            type={field.type} 
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            value={formData.dynamicData?.[field.id] || ''}
                                            onChange={e => handleDynamicChange(field.id, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold mb-1">Description</label>
                        <textarea 
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-900 h-32"
                            placeholder="Describe services, hours, facilities..." 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">Tags</label>
                        <div className="flex flex-wrap gap-2 mb-2 p-2 bg-slate-50 dark:bg-dark-900 rounded-lg border border-slate-200 dark:border-slate-700 min-h-[42px]">
                            {formData.tags?.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-white dark:bg-dark-800 rounded text-xs flex items-center gap-1 shadow-sm">
                                    #{tag} <button type="button" onClick={() => removeTag(tag)}><X className="w-3 h-3"/></button>
                                </span>
                            ))}
                            <input 
                                className="bg-transparent text-sm outline-none flex-grow min-w-[100px]" 
                                placeholder="Type & Enter..." 
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={addTag}
                            />
                        </div>
                    </div>

                    <Button type="submit" loading={loading} className="w-full py-3 text-lg font-bold shadow-xl shadow-primary-500/20">
                        {id ? 'Update Service' : 'Submit Service'}
                    </Button>
                </form>
            </Card>
        </div>
    )
}

const UserProfilePage = () => {
    const { user } = useContext(AuthContext);
    const [myServices, setMyServices] = useState<ServiceEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(user) {
            fetchUserServices(user.uid).then(s => {
                setMyServices(s);
                setLoading(false);
            });
        }
    }, [user]);

    const handleDelete = async (id: string) => {
        if(confirm("Are you sure you want to delete this listing?")) {
            await deleteService(id);
            setMyServices(prev => prev.filter(s => s.id !== id));
        }
    }

    if (!user) return <div className="p-8 text-center">Please login to view profile.</div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 mb-8 flex flex-col md:flex-row items-center gap-6">
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-700" alt="Profile" />
                <div className="text-center md:text-left flex-grow">
                    <h1 className="text-2xl font-bold">{user.displayName}</h1>
                    <p className="text-slate-500">{user.email}</p>
                    <div className="mt-2 flex gap-2 justify-center md:justify-start">
                         <Badge color="blue">{user.email === 'admin@deshisheba.com' ? 'Administrator' : 'Contributor'}</Badge>
                         <Badge color="gray">{myServices.length} Contributions</Badge>
                    </div>
                </div>
                <Link to="/add"><Button>+ Add New Service</Button></Link>
            </div>

            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Layers className="w-5 h-5 text-primary-600"/> My Submissions</h2>
            
            {loading ? <p>Loading...</p> : myServices.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-dark-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-500 mb-4">You haven't submitted any services yet.</p>
                    <Link to="/add"><Button variant="secondary">Add Your First Service</Button></Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myServices.map(service => (
                        <div key={service.id} className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge color={service.status === 'APPROVED' ? 'green' : service.status === 'REJECTED' ? 'red' : 'gray'}>{service.status}</Badge>
                                    <span className="text-xs text-slate-400">{new Date(service.submittedAt).toLocaleDateString()}</span>
                                </div>
                                <h3 className="font-bold text-lg mb-1 truncate">{service.name}</h3>
                                <p className="text-sm text-slate-500 mb-4 truncate">{service.category} • {service.address.district}</p>
                                <div className="flex gap-2">
                                    <Link to={`/edit/${service.id}`} className="flex-1"><Button variant="secondary" className="w-full text-xs h-8">Edit</Button></Link>
                                    <Button variant="danger" className="w-full text-xs h-8" onClick={() => handleDelete(service.id)}>Delete</Button>
                                </div>
                            </div>
                            {service.status === 'APPROVED' && (
                                <Link to={`/service/${service.id}`} className="block bg-slate-50 dark:bg-dark-900 p-2 text-center text-xs text-primary-600 font-bold hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors">
                                    View Live Page &rarr;
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

const AppContent = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-slate-100 transition-colors font-sans selection:bg-primary-500/30 flex flex-col">
          <Navbar />
          <div className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/add" element={<AddServicePage />} />
                <Route path="/edit/:id" element={<AddServicePage />} />
                <Route path="/service/:id" element={<ServiceDetailsPage />} />
                <Route path="/profile" element={<UserProfilePage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/blog/:id" element={<BlogDetailsPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
              </Routes>
          </div>
        </div>
    );
}

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const isAdmin = user?.email === 'admin@deshisheba.com';

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    }
    const unsub = subscribeToAuth((u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  if (authLoading) {
      return <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-dark-900"><Loader2 className="w-10 h-10 animate-spin text-primary-600" /></div>;
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <AuthContext.Provider value={{ user, loading: authLoading, isAdmin }}>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}
