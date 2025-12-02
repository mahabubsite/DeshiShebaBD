
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useParams, useLocation, Navigate } from 'react-router-dom';
import { PlusCircle, Search, User as UserIcon, Settings, Sun, Moon, Menu, X, Check, XCircle, Trash2, MapPin, Key, Mail, ShieldAlert, Users, Layers, Edit3, Save, ArrowLeft, LayoutDashboard, Database, Loader2, Share2, Copy, ExternalLink, Phone, Flag, AlertTriangle, Bell, Send, Facebook, Twitter, Instagram, Globe, BookOpen, PenTool, Eye, TrendingUp, History, Plus, Heart } from 'lucide-react';
import { subscribeToAuth, signInWithGoogle, logout, fetchServices, addService, updateServiceStatus, deleteService, loginWithEmail, registerWithEmail, fetchAllUsers, toggleUserBan, fetchCategories, saveCategory, fetchUserServices, getServiceById, updateServiceData, deleteCategory, seedDatabase, submitReport, fetchReports, deleteReport, fetchNotifications, markNotificationRead, sendNotification, addBlog, fetchBlogs, deleteBlog, updateBlog, getBlogById, incrementViewCount, fetchPopularServices, fetchAllNotifications, fetchSiteSettings, saveSiteSettings, toggleFavorite, checkIsFavorite, fetchUserFavorites, updateNotification, deleteNotification } from './services/firebase';
import { User } from 'firebase/auth';
import { LocationSelector } from './components/LocationSelector';
import { Button, Card, Input, Select, Badge } from './components/ui';
import { CATEGORY_ICONS, BANGLADESH_LOCATIONS } from './constants';
import { Category, LocationHierarchy, ServiceEntry, ServiceStatus, UserDocument, CategoryDefinition, CategoryField, ReportDocument, NotificationDocument, BlogDocument, SiteSettings } from './types';
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
           {/* Custom Logo */}
           <img src="/DeshiSheba.png" className="w-9 h-9 object-contain" alt="DeshiSheba Logo" />
           <span className="font-bold text-xl text-slate-800 dark:text-white tracking-tight">Deshi<span className="text-primary-600">Sheba</span></span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1"><Search className="w-4 h-4"/> Browse</Link>
          <Link to="/add" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1"><PlusCircle className="w-4 h-4"/> Add Sheba</Link>
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
             <PlusCircle className="w-5 h-5 text-primary-500" /> Add New Sheba
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
    const [settings, setSettings] = useState<SiteSettings | null>(null);

    useEffect(() => {
        fetchPopularServices().then(setPopularServices);
        fetchSiteSettings().then(setSettings);
    }, []);

    return (
        <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        {/* Custom Logo */}
                        <img src="/DeshiSheba.png" className="w-8 h-8 object-contain bg-white rounded-lg p-1" alt="Logo" />
                        <span className="font-bold text-xl text-white">Deshi<span className="text-primary-500">Sheba</span></span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Connecting Bangladesh communities with essential local services. 
                    </p>
                    <div className="flex gap-4">
                        {settings?.facebookUrl && <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="p-2 bg-slate-800 rounded-full hover:bg-primary-600 transition-colors"><Facebook className="w-4 h-4"/></a>}
                        {settings?.twitterUrl && <a href={settings.twitterUrl} target="_blank" rel="noreferrer" className="p-2 bg-slate-800 rounded-full hover:bg-primary-600 transition-colors"><Twitter className="w-4 h-4"/></a>}
                        {settings?.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="p-2 bg-slate-800 rounded-full hover:bg-primary-600 transition-colors"><Instagram className="w-4 h-4"/></a>}
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
                        {settings?.contactEmail && <li className="flex items-center gap-2"><Mail className="w-4 h-4"/> {settings.contactEmail}</li>}
                        {settings?.contactPhone && <li className="flex items-center gap-2"><Phone className="w-4 h-4"/> {settings.contactPhone}</li>}
                        {settings?.contactAddress && <li className="flex items-center gap-2"><MapPin className="w-4 h-4"/> {settings.contactAddress}</li>}
                    </ul>
                </div>
            </div>
            
            <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
                <p>{settings?.footerText || `© ${new Date().getFullYear()} DeshiSheba. Built for Bangladesh 🇧🇩`}</p>
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

const TermsPage = () => {
    const [content, setContent] = useState('Loading terms...');
    useEffect(() => {
        fetchSiteSettings().then(s => setContent(s.termsContent));
    }, []);

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-8 md:p-12 border border-slate-100 dark:border-slate-700">
                <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-slate-900 dark:text-white">Terms of Service</h1>
                <p className="text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
                <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {content}
                </div>
            </div>
        </div>
    );
};

const PrivacyPage = () => {
    const [content, setContent] = useState('Loading privacy policy...');
    useEffect(() => {
        fetchSiteSettings().then(s => setContent(s.privacyContent));
    }, []);

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-8 md:p-12 border border-slate-100 dark:border-slate-700">
                <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-slate-900 dark:text-white">Privacy Policy</h1>
                <p className="text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
                <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {content}
                </div>
            </div>
        </div>
    );
};

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
    const { user } = useContext(AuthContext);
    
    const [service, setService] = useState<ServiceEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [showShare, setShowShare] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        if(id) {
            getServiceById(id).then(s => {
                setService(s);
                setLoading(false);
                incrementViewCount('services', id);
            });
            if(user) {
                checkIsFavorite(user.uid, id).then(setIsFavorite);
            }
        }
    }, [id, user]);

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

    const handleToggleFavorite = async () => {
        if(!user) {
            alert("Please login to save favorites.");
            return;
        }
        if(!service) return;

        const newState = await toggleFavorite(user.uid, service.id);
        setIsFavorite(newState);
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
                                {service.isWholeCountry 
                                    ? "Available All Over Bangladesh" 
                                    : `${service.address.village ? `${service.address.village}, ` : ''}${service.address.upazila}, ${service.address.district}`
                                }
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={handleToggleFavorite} className={`h-10 w-10 p-0 rounded-full flex items-center justify-center hover:bg-red-50 ${isFavorite ? 'text-red-500' : 'text-slate-400'}`} title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}>
                                <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                            </Button>
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
    // Filter logic updated to handle Whole Country services
    if (location.division) {
        result = result.filter(s => s.isWholeCountry || s.address.division === location.division);
    }
    if (location.district) {
        result = result.filter(s => s.isWholeCountry || s.address.district === location.district);
    }
    if (location.upazila) {
         result = result.filter(s => s.isWholeCountry || s.address.upazila === location.upazila);
    }
    
    if (location.village) result = result.filter(s => s.isWholeCountry || s.address.village?.toLowerCase().includes(location.village.toLowerCase()));
    if (selectedCategory) result = result.filter(s => s.category === selectedCategory);
    
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(lower) || 
        s.category.toLowerCase().includes(lower) ||
        (s.address.district || '').toLowerCase().includes(lower) ||
        (s.address.upazila || '').toLowerCase().includes(lower) ||
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
          name: s.name, category: s.category, location: s.isWholeCountry ? 'Whole Bangladesh' : `${s.address.upazila}, ${s.address.district}`, phone: s.phone, desc: s.description
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
                                           <p className="text-xs text-slate-500 mb-3 flex items-center gap-1 uppercase tracking-wide font-semibold">
                                              <MapPin className="w-3 h-3 text-primary-400" />
                                              {service.isWholeCountry ? 'Whole Bangladesh' : `${service.address.upazila}, ${service.address.district}`}
                                           </p>
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

const SettingsManagement = () => {
    const [settings, setSettings] = useState<SiteSettings>({
        id: 'general',
        termsContent: '', privacyContent: '',
        contactEmail: '', contactPhone: '', contactAddress: '',
        facebookUrl: '', twitterUrl: '', instagramUrl: '',
        footerText: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSiteSettings().then(setSettings);
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await saveSiteSettings(settings);
            alert("Settings updated!");
        } catch(e) {
            alert("Failed to save settings");
        }
        setLoading(false);
    }

    return (
        <Card className="p-6">
            <h3 className="font-bold text-lg mb-6">Site Settings & Content</h3>
            <form onSubmit={handleSave} className="grid grid-cols-1 gap-6">
                <div>
                    <h4 className="font-bold text-sm text-primary-600 mb-3 uppercase tracking-wide">Legal Pages Content</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold mb-1">Terms of Service Content (Markdown supported)</label>
                            <textarea className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-900 h-40" 
                                value={settings.termsContent} onChange={e => setSettings({...settings, termsContent: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1">Privacy Policy Content (Markdown supported)</label>
                            <textarea className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-900 h-40" 
                                value={settings.privacyContent} onChange={e => setSettings({...settings, privacyContent: e.target.value})} />
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-sm text-primary-600 mb-3 uppercase tracking-wide">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold mb-1">Email</label>
                            <Input value={settings.contactEmail} onChange={e => setSettings({...settings, contactEmail: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1">Phone</label>
                            <Input value={settings.contactPhone} onChange={e => setSettings({...settings, contactPhone: e.target.value})} />
                        </div>
                         <div>
                            <label className="block text-xs font-bold mb-1">Address</label>
                            <Input value={settings.contactAddress} onChange={e => setSettings({...settings, contactAddress: e.target.value})} />
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-sm text-primary-600 mb-3 uppercase tracking-wide">Social Links</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold mb-1">Facebook URL</label>
                            <Input value={settings.facebookUrl} onChange={e => setSettings({...settings, facebookUrl: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1">Twitter URL</label>
                            <Input value={settings.twitterUrl} onChange={e => setSettings({...settings, twitterUrl: e.target.value})} />
                        </div>
                         <div>
                            <label className="block text-xs font-bold mb-1">Instagram URL</label>
                            <Input value={settings.instagramUrl} onChange={e => setSettings({...settings, instagramUrl: e.target.value})} />
                        </div>
                    </div>
                </div>

                <div>
                     <label className="block text-xs font-bold mb-1">Footer Copyright Text</label>
                     <Input value={settings.footerText} onChange={e => setSettings({...settings, footerText: e.target.value})} />
                </div>

                <Button type="submit" loading={loading} className="mt-4">Save All Settings</Button>
            </form>
        </Card>
    );
}

const AddServicePage = () => {
    const { id } = useParams(); // For edit mode
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState<Partial<ServiceEntry>>({
        name: '',
        category: '',
        phone: '',
        description: '',
        address: { division: '', district: '', upazila: '', village: '' },
        tags: [],
        dynamicData: {},
        isWholeCountry: false
    });
    
    const [categories, setCategories] = useState<CategoryDefinition[]>([]);
    const [loading, setLoading] = useState(false);
    const [tagInput, setTagInput] = useState('');
    
    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/auth');
        }
    }, [user, authLoading, navigate]);

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
        if(!user) return;
        
        // Validation: Address not required if "Whole Country" is selected
        if(!formData.name || !formData.category || !formData.phone) {
             alert("Please fill name, category and phone.");
             return;
        }

        if (!formData.isWholeCountry && !formData.address?.upazila) {
            alert("Please select a location.");
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

    if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

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
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold">Location</label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={formData.isWholeCountry || false} 
                                    onChange={e => setFormData({...formData, isWholeCountry: e.target.checked})}
                                />
                                <span className="text-xs font-semibold text-primary-600">Available all over Bangladesh</span>
                            </label>
                        </div>
                        
                        {!formData.isWholeCountry ? (
                            <div className="bg-slate-50 dark:bg-dark-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                 <LocationSelector 
                                    value={formData.address as LocationHierarchy} 
                                    onChange={loc => setFormData({...formData, address: loc})} 
                                 />
                            </div>
                        ) : (
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 text-center text-sm text-green-700 dark:text-green-300">
                                This service will be listed for all locations in Bangladesh.
                            </div>
                        )}
                    </div>

                    {currentCategoryDef && currentCategoryDef.fields.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                            <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-3 uppercase tracking-wider">
                                {currentCategoryDef.name} Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentCategoryDef.fields.map(field => (
                                    <div key={field.id}>
                                        <label className="block text-xs font-bold mb-1 capitalize">
                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <Input 
                                            type={field.type} 
                                            placeholder={field.placeholder || `Enter ${field.label}`}
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

const UserManagement = () => {
    const [users, setUsers] = useState<UserDocument[]>([]);
    useEffect(() => { fetchAllUsers().then(setUsers); }, []);
    const handleBan = async (uid: string, current: boolean) => {
        await toggleUserBan(uid, current);
        setUsers(users.map(u => u.uid === uid ? {...u, isBanned: !current} : u));
    };
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold">Users ({users.length})</h3>
            <div className="bg-white dark:bg-dark-800 rounded-lg shadow overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-dark-900 text-slate-500 font-bold">
                        <tr>
                            <th className="p-3">User</th>
                            <th className="p-3">Role</th>
                            <th className="p-3">Joined</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {users.map(u => (
                            <tr key={u.uid}>
                                <td className="p-3">
                                    <div className="font-bold">{u.displayName}</div>
                                    <div className="text-xs text-slate-500">{u.email}</div>
                                </td>
                                <td className="p-3 uppercase text-xs font-bold">{u.role}</td>
                                <td className="p-3 text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                                <td className="p-3">
                                    {u.isBanned ? <Badge color="red">Banned</Badge> : <Badge color="green">Active</Badge>}
                                </td>
                                <td className="p-3">
                                    {u.role !== 'admin' && (
                                        <Button variant="secondary" onClick={() => handleBan(u.uid, u.isBanned)} className="text-xs h-8">
                                            {u.isBanned ? 'Unban' : 'Ban'}
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const CategoryManagement = () => {
    const [categories, setCategories] = useState<CategoryDefinition[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editCat, setEditCat] = useState<Partial<CategoryDefinition>>({});

    useEffect(() => { fetchCategories().then(setCategories); }, []);

    const handleSave = async () => {
        if(!editCat.id || !editCat.name) return;
        const newCat = {
            id: editCat.id,
            name: editCat.name,
            icon: editCat.icon || '🔧',
            fields: editCat.fields || [],
            isSystem: editCat.isSystem || false
        } as CategoryDefinition;
        
        await saveCategory(newCat);
        setIsEditing(false);
        fetchCategories().then(setCategories);
    };
    
    const handleDelete = async (id: string) => {
        if(confirm('Delete category?')) {
            await deleteCategory(id);
            setCategories(categories.filter(c => c.id !== id));
        }
    }

    const handleAddField = () => {
        const newFields = [...(editCat.fields || []), { id: `field_${Date.now()}`, label: 'New Field', type: 'text', required: false, placeholder: '' } as CategoryField];
        setEditCat({...editCat, fields: newFields});
    }

    const handleFieldChange = (index: number, key: keyof CategoryField, val: any) => {
        const fields = [...(editCat.fields || [])];
        fields[index] = { ...fields[index], [key]: val };
        // Auto-generate ID from label if ID hasn't been manually set differently
        if(key === 'label') {
             fields[index].id = val.toLowerCase().replace(/\s+/g, '_');
        }
        setEditCat({...editCat, fields});
    }

    const handleDeleteField = (index: number) => {
         const fields = (editCat.fields || []).filter((_, i) => i !== index);
         setEditCat({...editCat, fields});
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Categories</h3>
                <Button onClick={() => { setEditCat({ id: '', name: '', icon: '', fields: [] }); setIsEditing(true); }}>
                    <Plus className="w-4 h-4 mr-2"/> Add Category
                </Button>
            </div>
            {isEditing && (
                <Card className="mb-6 p-4 border border-primary-200">
                    <h4 className="font-bold mb-3">{editCat.isSystem ? 'System Category (Limited Edit)' : 'Edit Category'}</h4>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                        <Input placeholder="ID (e.g. restaurant)" value={editCat.id} onChange={e => setEditCat({...editCat, id: e.target.value})} disabled={!!categories.find(c => c.id === editCat.id)} />
                        <Input placeholder="Name" value={editCat.name} onChange={e => setEditCat({...editCat, name: e.target.value})} />
                        <Input placeholder="Icon (Emoji)" value={editCat.icon} onChange={e => setEditCat({...editCat, icon: e.target.value})} />
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-dark-900/50 p-3 rounded mb-3 border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                             <h5 className="font-bold text-xs uppercase text-slate-500">Custom Fields</h5>
                             <Button variant="secondary" onClick={handleAddField} className="h-6 text-xs px-2">Add Field</Button>
                        </div>
                        <div className="space-y-2">
                            {editCat.fields?.map((field, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <Input placeholder="Label" className="h-8 text-xs" value={field.label} onChange={e => handleFieldChange(idx, 'label', e.target.value)} />
                                    <select className="h-8 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-900" value={field.type} onChange={e => handleFieldChange(idx, 'type', e.target.value)}>
                                        <option value="text">Text</option>
                                        <option value="number">Number</option>
                                        <option value="email">Email</option>
                                        <option value="tel">Phone</option>
                                    </select>
                                    <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                                        <input type="checkbox" checked={field.required} onChange={e => handleFieldChange(idx, 'required', e.target.checked)} /> Req
                                    </label>
                                    <button onClick={() => handleDeleteField(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="w-3 h-3"/></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                         <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                         <Button onClick={handleSave}>Save</Button>
                    </div>
                </Card>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(c => (
                    <div key={c.id} className="p-3 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{c.icon}</span>
                            <div>
                                <div className="font-bold text-sm">{c.name}</div>
                                <div className="text-xs text-slate-500">{c.fields.length} custom fields</div>
                            </div>
                        </div>
                        <div className="flex gap-1">
                             <button onClick={() => { setEditCat(c); setIsEditing(true); }} className="p-1.5 hover:bg-slate-100 rounded text-blue-500"><Edit3 className="w-4 h-4"/></button>
                             {!c.isSystem && <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-slate-100 rounded text-red-500"><Trash2 className="w-4 h-4"/></button>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const ReportsManagement = () => {
    const [reports, setReports] = useState<ReportDocument[]>([]);
    useEffect(() => { fetchReports().then(setReports); }, []);

    const handleDelete = async (id: string) => {
        await deleteReport(id);
        setReports(prev => prev.filter(r => r.id !== id));
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold">Reports</h3>
            {reports.length === 0 && <p className="text-slate-500">No reports found.</p>}
            {reports.map(r => (
                <div key={r.id} className="bg-white dark:bg-dark-800 p-4 rounded-lg shadow-sm border border-red-100 dark:border-red-900/30">
                    <div className="flex justify-between items-start">
                        <div>
                             <h4 className="font-bold text-red-600 flex items-center gap-2"><Flag className="w-4 h-4"/> {r.reason}</h4>
                             <p className="text-sm font-semibold mt-1">Service: <Link to={`/service/${r.serviceId}`} className="underline">{r.serviceName}</Link></p>
                             <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-dark-900 p-2 rounded">{r.details}</p>
                             <div className="text-xs text-slate-400 mt-2">Reported by: {r.reportedBy} on {new Date(r.reportedAt).toLocaleDateString()}</div>
                        </div>
                        <Button variant="secondary" onClick={() => handleDelete(r.id)} className="text-xs">Dismiss</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

const NotificationsManagement = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [notifs, setNotifs] = useState<NotificationDocument[]>([]);
    const [editingNotif, setEditingNotif] = useState<NotificationDocument | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => { fetchAllNotifications().then(setNotifs); }, []);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await sendNotification({
                userId: 'ALL',
                title,
                message,
                isRead: false,
                createdAt: Date.now()
            });
            alert("Notification sent to all users");
            setTitle('');
            setMessage('');
            fetchAllNotifications().then(setNotifs);
        } catch(error) {
            console.error(error);
            alert("Failed to send notification");
        }
    }

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!editingNotif) return;
        try {
            await updateNotification(editingNotif.id, {
                title: editingNotif.title,
                message: editingNotif.message
            });
            setIsEditing(false);
            setEditingNotif(null);
            fetchAllNotifications().then(setNotifs);
            alert("Notification updated successfully!");
        } catch(error) {
            console.error(error);
            alert("Failed to update notification");
        }
    }

    const handleDelete = async (id: string) => {
        if(confirm("Delete this notification? This action cannot be undone.")) {
            try {
                await deleteNotification(id);
                setNotifs(notifs.filter(n => n.id !== id));
                alert("Notification deleted successfully!");
            } catch(error) {
                console.error(error);
                alert("Failed to delete notification");
            }
        }
    }

    const startEdit = (notif: NotificationDocument) => {
        setEditingNotif(notif);
        setIsEditing(true);
    }

    return (
        <div className="space-y-8">
            <Card>
                <h3 className="font-bold mb-4">{isEditing ? 'Edit Notification' : 'Send Broadcast Notification'}</h3>
                <form onSubmit={isEditing ? handleEdit : handleSend} className="space-y-4">
                    <Input 
                        placeholder="Title" 
                        value={isEditing ? editingNotif?.title || '' : title} 
                        onChange={e => isEditing ? setEditingNotif({...editingNotif as NotificationDocument, title: e.target.value}) : setTitle(e.target.value)} 
                        required 
                    />
                    <textarea 
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-900 h-24" 
                        placeholder="Message" 
                        value={isEditing ? editingNotif?.message || '' : message} 
                        onChange={e => isEditing ? setEditingNotif({...editingNotif as NotificationDocument, message: e.target.value}) : setMessage(e.target.value)} 
                        required 
                    />
                    <div className="flex gap-2">
                        <Button type="submit">{isEditing ? 'Update Notification' : 'Send to All'}</Button>
                        {isEditing && <Button type="button" variant="ghost" onClick={() => { setIsEditing(false); setEditingNotif(null); }}>Cancel</Button>}
                    </div>
                </form>
            </Card>

            <div>
                <h3 className="font-bold mb-4">All Notifications ({notifs.length})</h3>
                {notifs.length === 0 ? (
                    <p className="text-slate-500 text-sm italic">No notifications sent yet.</p>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {notifs.map(n => (
                            <div key={n.id} className="p-4 bg-white dark:bg-dark-800 rounded-lg border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-grow">
                                        <div className="font-bold text-slate-900 dark:text-slate-100">{n.title}</div>
                                        <div className="text-sm text-slate-600 dark:text-slate-300 mt-1 mb-2">{n.message}</div>
                                    </div>
                                    <Badge color={n.isRead ? 'slate' : 'blue'}>{n.isRead ? 'Read' : 'Unread'}</Badge>
                                </div>
                                <div className="flex justify-between items-center text-xs text-slate-500 mb-3">
                                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                                    <span className="text-primary-600 font-semibold">{n.userId === 'ALL' ? 'Sent to All Users' : `Sent to User: ${n.userId}`}</span>
                                </div>
                                <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                                    <Button variant="secondary" onClick={() => startEdit(n)} className="h-7 text-xs flex items-center gap-1">
                                        <Edit3 className="w-3 h-3"/> Edit
                                    </Button>
                                    <Button variant="danger" onClick={() => handleDelete(n.id)} className="h-7 text-xs flex items-center gap-1">
                                        <Trash2 className="w-3 h-3"/> Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

const BlogManagement = () => {
    const [blogs, setBlogs] = useState<BlogDocument[]>([]);
    const [newBlog, setNewBlog] = useState({ title: '', excerpt: '', content: '', imageUrl: '' });
    const [editingBlog, setEditingBlog] = useState<BlogDocument | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const { user } = useContext(AuthContext);

    useEffect(() => { fetchBlogs().then(setBlogs); }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addBlog({
                ...newBlog,
                authorName: user?.displayName || 'Admin',
                createdAt: Date.now()
            });
            setNewBlog({ title: '', excerpt: '', content: '', imageUrl: '' });
            fetchBlogs().then(setBlogs);
            alert("Blog post published successfully!");
        } catch(error) {
            console.error(error);
            alert("Failed to publish blog post");
        }
    }

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!editingBlog) return;
        try {
            await updateBlog(editingBlog.id, {
                title: editingBlog.title,
                excerpt: editingBlog.excerpt,
                content: editingBlog.content,
                imageUrl: editingBlog.imageUrl
            });
            setIsEditing(false);
            setEditingBlog(null);
            fetchBlogs().then(setBlogs);
            alert("Blog post updated successfully!");
        } catch(error) {
            console.error(error);
            alert("Failed to update blog post");
        }
    }

    const handleDelete = async (id: string) => {
        if(confirm("Delete this post? This action cannot be undone.")) {
            try {
                await deleteBlog(id);
                setBlogs(blogs.filter(b => b.id !== id));
                alert("Blog post deleted successfully!");
            } catch(error) {
                console.error(error);
                alert("Failed to delete blog post");
            }
        }
    }

    const startEdit = (blog: BlogDocument) => {
        setEditingBlog(blog);
        setIsEditing(true);
    }

    return (
        <div className="space-y-8">
            <Card>
                <h3 className="font-bold mb-4">{isEditing ? 'Edit Blog Post' : 'Add New Blog Post'}</h3>
                <form onSubmit={isEditing ? handleEdit : handleAdd} className="space-y-4">
                    <Input 
                        placeholder="Title" 
                        value={isEditing ? editingBlog?.title || '' : newBlog.title} 
                        onChange={e => isEditing ? setEditingBlog({...editingBlog as BlogDocument, title: e.target.value}) : setNewBlog({...newBlog, title: e.target.value})} 
                        required 
                    />
                    <Input 
                        placeholder="Image URL (Optional)" 
                        value={isEditing ? editingBlog?.imageUrl || '' : newBlog.imageUrl} 
                        onChange={e => isEditing ? setEditingBlog({...editingBlog as BlogDocument, imageUrl: e.target.value}) : setNewBlog({...newBlog, imageUrl: e.target.value})} 
                    />
                    <Input 
                        placeholder="Short Excerpt" 
                        value={isEditing ? editingBlog?.excerpt || '' : newBlog.excerpt} 
                        onChange={e => isEditing ? setEditingBlog({...editingBlog as BlogDocument, excerpt: e.target.value}) : setNewBlog({...newBlog, excerpt: e.target.value})} 
                        required 
                    />
                    <textarea 
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-900 h-32" 
                        placeholder="Full Content (Markdown supported)" 
                        value={isEditing ? editingBlog?.content || '' : newBlog.content} 
                        onChange={e => isEditing ? setEditingBlog({...editingBlog as BlogDocument, content: e.target.value}) : setNewBlog({...newBlog, content: e.target.value})} 
                        required 
                    />
                    <div className="flex gap-2">
                        <Button type="submit">{isEditing ? 'Update Post' : 'Publish'}</Button>
                        {isEditing && <Button type="button" variant="ghost" onClick={() => { setIsEditing(false); setEditingBlog(null); }}>Cancel</Button>}
                    </div>
                </form>
            </Card>

            <div className="space-y-4">
                <h3 className="font-bold">Existing Posts</h3>
                {blogs.length === 0 ? (
                    <p className="text-slate-500 text-sm italic">No blog posts yet.</p>
                ) : (
                    blogs.map(b => (
                        <div key={b.id} className="flex justify-between items-center p-4 bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                            <div className="flex-grow">
                                <div className="font-bold">{b.title}</div>
                                <div className="text-xs text-slate-500">{new Date(b.createdAt).toLocaleDateString()} • {b.views || 0} views</div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                <Button variant="secondary" onClick={() => startEdit(b)} className="h-8 text-xs flex items-center gap-1">
                                    <Edit3 className="w-3 h-3"/> Edit
                                </Button>
                                <Button variant="danger" onClick={() => handleDelete(b.id)} className="h-8 text-xs flex items-center gap-1">
                                    <Trash2 className="w-3 h-3"/> Delete
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

const AdminDashboard = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<'submissions' | 'users' | 'categories' | 'all_services' | 'reports' | 'notifications' | 'blogs' | 'settings'>('submissions');
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
          {['submissions', 'all_services', 'users', 'categories', 'reports', 'notifications', 'blogs', 'settings'].map(tab => (
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
          {activeTab === 'settings' && <SettingsManagement />}
          
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
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1 mb-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {service.isWholeCountry ? 'Whole Bangladesh' : `${service.address.village ? `${service.address.village}, ` : ''}${service.address.upazila}, ${service.address.district}`}
                        </p>
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
    const [acceptTerms, setAcceptTerms] = useState(false);
    const navigate = useNavigate();

    const handleGoogle = async () => {
        if(!isLogin && !acceptTerms) {
            alert("Please accept the Terms of Service to register.");
            return;
        }
        try { await signInWithGoogle(); navigate('/'); } catch(e) { alert("Login failed"); }
    }

    const handleEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if(isLogin) {
                await loginWithEmail(email, password);
            } else {
                if(!acceptTerms) {
                    alert("Please accept the Terms of Service to register.");
                    setLoading(false);
                    return;
                }
                await registerWithEmail(email, password, name);
            }
            navigate('/');
        } catch(e: any) { alert(e.message); }
        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-900 p-4">
            <Card className="w-full max-w-md p-8">
                <h1 className="text-2xl font-bold text-center mb-6">{isLogin ? 'Welcome Back' : 'Join DeshiSheba'}</h1>
                
                {/* Fixed Google Button Color Issue with Inline SVG */}
                <Button 
                    variant="secondary" 
                    onClick={handleGoogle} 
                    className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 dark:border-slate-700 dark:bg-white dark:text-slate-700 mb-4 flex items-center justify-center gap-3 font-medium relative"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                </Button>
                
                <div className="relative my-6 text-center text-sm text-slate-500">
                    <span className="bg-white dark:bg-dark-800 px-2 relative z-10">Or continue with email</span>
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
                </div>
                <form onSubmit={handleEmail} className="space-y-4">
                    {!isLogin && <Input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />}
                    <Input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
                    <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                    
                    {!isLogin && (
                        <div className="flex items-start gap-2">
                             <input type="checkbox" id="terms" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} className="mt-1" />
                             <label htmlFor="terms" className="text-xs text-slate-500">
                                 I agree to the <Link to="/terms" className="text-primary-600 underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary-600 underline">Privacy Policy</Link>.
                             </label>
                        </div>
                    )}

                    <Button type="submit" loading={loading} className="w-full">{isLogin ? 'Log In' : 'Sign Up'}</Button>
                </form>
                <p className="text-center mt-4 text-sm">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => setIsLogin(!isLogin)} className="text-primary-600 font-bold hover:underline">{isLogin ? 'Sign Up' : 'Log In'}</button>
                </p>
            </Card>
        </div>
    )
}

const UserProfilePage = () => {
    const { user, loading } = useContext(AuthContext);
    const [services, setServices] = useState<ServiceEntry[]>([]);
    const [favorites, setFavorites] = useState<ServiceEntry[]>([]);
    const [activeTab, setActiveTab] = useState<'submissions' | 'favorites'>('submissions');
    
    useEffect(() => {
        if(user) {
            fetchUserServices(user.uid).then(setServices);
            fetchUserFavorites(user.uid).then(setFavorites);
        }
    }, [user]);

    if(loading) return <div className="p-8">Loading...</div>;
    if(!user) return <Navigate to="/auth" />;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Card className="mb-8 p-6 flex items-center gap-6">
                 <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} className="w-20 h-20 rounded-full border-4 border-slate-100" />
                 <div>
                     <h1 className="text-2xl font-bold">{user.displayName}</h1>
                     <p className="text-slate-500">{user.email}</p>
                     <div className="mt-2 flex gap-2">
                         <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full font-bold">Contributor</span>
                     </div>
                 </div>
            </Card>
            
            <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700 mb-6">
                <button onClick={() => setActiveTab('submissions')} className={`pb-3 px-4 font-bold border-b-2 ${activeTab === 'submissions' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500'}`}>My Submissions</button>
                <button onClick={() => setActiveTab('favorites')} className={`pb-3 px-4 font-bold border-b-2 ${activeTab === 'favorites' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500'}`}>My Favorites</button>
            </div>

            {activeTab === 'submissions' && (
                <>
                {services.length === 0 ? (
                    <div className="text-center p-12 bg-white dark:bg-dark-800 rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500 mb-4">You haven't submitted any services yet.</p>
                        <Link to="/add"><Button>Add Your First Service</Button></Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {services.map(s => (
                            <div key={s.id} className="bg-white dark:bg-dark-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg">{s.name}</h3>
                                    <div className="flex gap-2 text-xs mt-1">
                                        <Badge color={s.status === 'APPROVED' ? 'green' : s.status === 'PENDING' ? 'blue' : 'red'}>{s.status}</Badge>
                                        <span className="text-slate-500">{new Date(s.submittedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link to={`/edit/${s.id}`}><Button variant="secondary" className="text-sm h-8">Edit</Button></Link>
                                    <Link to={`/service/${s.id}`}><Button variant="ghost" className="text-sm h-8">View</Button></Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                </>
            )}

            {activeTab === 'favorites' && (
                <>
                {favorites.length === 0 ? (
                    <div className="text-center p-12 bg-white dark:bg-dark-800 rounded-xl border border-dashed border-slate-300">
                        <Heart className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500">No favorite services yet.</p>
                        <p className="text-xs text-slate-400 mt-1">Click the heart icon on any service to save it here.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {favorites.map(s => (
                            <div key={s.id} className="bg-white dark:bg-dark-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg">{s.name}</h3>
                                    <p className="text-xs text-slate-500"><MapPin className="w-3 h-3 inline mr-1"/>{s.isWholeCountry ? 'Whole BD' : `${s.address.upazila}, ${s.address.district}`}</p>
                                </div>
                                <Link to={`/service/${s.id}`}><Button variant="primary" className="text-sm h-8">View</Button></Link>
                            </div>
                        ))}
                    </div>
                )}
                </>
            )}
        </div>
    )
}

function App() {
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuth(async (u) => {
        setUser(u);
        if(u) {
            // Check admin claim or email directly for demo
            setIsAdmin(u.email === 'admin@deshisheba.com'); 
        } else {
            setIsAdmin(false);
        }
        setLoading(false);
    });
    return () => unsub();
  }, []);

  const toggleTheme = () => {
      setIsDark(!isDark);
      document.documentElement.classList.toggle('dark');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <AuthContext.Provider value={{ user, loading, isAdmin }}>
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-dark-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
          <HashRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/service/:id" element={<ServiceDetailsPage />} />
              <Route path="/blog/:id" element={<BlogDetailsPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/add" element={<AddServicePage />} />
              <Route path="/edit/:id" element={<AddServicePage />} />
              <Route path="/profile" element={<UserProfilePage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </HashRouter>
        </div>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}

export default App;
