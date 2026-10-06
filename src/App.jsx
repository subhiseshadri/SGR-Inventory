import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, MapPin, DollarSign, Layers, Search, Filter, Plus, 
  Eye, Edit, Trash2, FileText, CheckCircle2, AlertTriangle, 
  Clock, XCircle, Upload, Download, ExternalLink, ShieldCheck, 
  Map as MapIcon, Database, LayoutDashboard, FileSpreadsheet, 
  ChevronRight, Camera, Image as ImageIcon, Sparkles, IndianRupee,
  Compass, Share2, Printer, RefreshCw, BarChart3, TrendingUp, Check,
  Lock, User, LogOut, Menu, X, Shield, KeyRound, Smartphone, Sun, Moon
} from 'lucide-react';

const INITIAL_LAND_PARCELS = [
  {
    id: 'SGR-PARC-501',
    surveyNo: 'Sy. No. 214/4B',
    projectName: 'SGR Grand Emerald Meadows',
    location: 'Sarjapur-Attibele Corridor, Bengaluru, Karnataka - 562107',
    area: 4.2,
    areaUnit: 'Acres',
    dimensions: '320 x 570 ft',
    facing: 'East Facing',
    zoning: 'Residential',
    status: 'Available',
    acquisitionCost: 28000000, 
    price: 42500000, 
    legalStatus: 'Clear Title (DTCP & RERA Approved)',
    notes: 'Prime luxury villa plot layout with 60ft approach road, underground cabling, and immediate registration ready.',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85',
    documents: [
      { name: 'SGR_Grand_Title_Deed_Sy214.pdf', type: 'Deed', size: '3.4 MB', date: '2026-01-12' },
      { name: 'DTCP_Sanction_Order_2026.pdf', type: 'Approval', size: '5.2 MB', date: '2026-02-01' }
    ],
    updatedAt: '2026-03-15'
  },
  {
    id: 'SGR-PARC-502',
    surveyNo: 'Sy. No. 89/1',
    projectName: 'SGR TechPark Silicon Gateway',
    location: 'HITEC City Extension, Financial District, Hyderabad, Telangana - 500032',
    area: 8.5,
    areaUnit: 'Acres',
    dimensions: '600 x 615 ft',
    facing: 'North-East',
    zoning: 'Commercial',
    status: 'Reserved',
    acquisitionCost: 95000000, 
    price: 145000000, 
    legalStatus: 'HMDA Approved Clear Title',
    notes: 'Token advance of ₹5 Crores received from multinational IT infrastructure fund. Final escrow closing scheduled next month.',
    imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=85',
    documents: [
      { name: 'Escrow_Agreement_SGR_Tech.pdf', type: 'Agreement', size: '2.1 MB', date: '2026-03-02' }
    ],
    updatedAt: '2026-03-20'
  },
  {
    id: 'SGR-PARC-503',
    surveyNo: 'Sy. No. 12/2A',
    projectName: 'SGR Green Valley Agro Estates',
    location: 'Nandi Foothills, Chikkaballapur District, Karnataka - 562101',
    area: 15.0,
    areaUnit: 'Acres',
    dimensions: '900 x 725 ft',
    facing: 'East Facing',
    zoning: 'Agricultural',
    status: 'Available',
    acquisitionCost: 32000000, 
    price: 52000000, 
    legalStatus: 'Converted Plantation Land (Patta Clear)',
    notes: 'High fertility red soil with organic sandalwood plantation, 3 borewells with solar pumps, and farmhouse structure.',
    imageUrl: 'https://images.unsplash.com/photo-1628744448402-44d2d404d512?auto=format&fit=crop&w=1200&q=85',
    documents: [
      { name: 'SGR_Encumbrance_Cert_2026.pdf', type: 'EC', size: '1.2 MB', date: '2026-01-10' }
    ],
    updatedAt: '2026-02-28'
  }
];

const formatIndianCurrency = (num) => {
  if (num === undefined || num === null) return '₹0';
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} Lakhs`;
  } else {
    return `₹${num.toLocaleString('en-IN')}`;
  }
};

export default function App() {
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('sgr_theme_mode') || 'light'; // Default to 'light' (Glassmorphism Light UI)
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('sgr_auth_status') === 'true';
  });
  const [loginEmail, setLoginEmail] = useState('director@sgrrealty.in');
  const [loginPassword, setLoginPassword] = useState('SGR@2026');
  const [loginError, setLoginError] = useState('');

  const [parcels, setParcels] = useState(() => {
    const saved = localStorage.getItem('sgr_realty_land_parcels_v8');
    return saved ? JSON.parse(saved) : INITIAL_LAND_PARCELS;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParcel, setEditingParcel] = useState(null);
  const [viewingParcel, setViewingParcel] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedParcelForUpload, setSelectedParcelForUpload] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const [formImageUrl, setFormImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    localStorage.setItem('sgr_realty_land_parcels_v8', JSON.stringify(parcels));
  }, [parcels]);

  useEffect(() => {
    localStorage.setItem('sgr_theme_mode', themeMode);
  }, [themeMode]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
    showToast(`Switched to ${themeMode === 'light' ? 'Obsidian Dark' : 'Glassmorphism Light'} Theme.`);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginEmail.trim() && loginPassword.trim()) {
      setIsAuthenticated(true);
      localStorage.setItem('sgr_auth_status', 'true');
      showToast('Welcome to SGR Realty Executive Portal.');
    } else {
      setLoginError('Please enter valid enterprise credentials.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('sgr_auth_status');
    showToast('Logged out securely.');
  };

  const handleDirectImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setFormImageUrl(uploadEvent.target.result);
      setIsUploadingImage(false);
      showToast('Land photo uploaded successfully!');
    };
    reader.onerror = () => {
      setIsUploadingImage(false);
      showToast('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const metrics = useMemo(() => {
    const totalCount = parcels.length;
    const totalAreaAcres = parcels.reduce((acc, p) => {
      let val = Number(p.area) || 0;
      if (p.areaUnit === 'Sq. Ft.') val = val / 43560;
      else if (p.areaUnit === 'Sq. Meters') val = val / 4046.86;
      else if (p.areaUnit === 'Hectares') val = val * 2.47105;
      else if (p.areaUnit === 'Gunta' || p.areaUnit === 'Cents') val = val / 40;
      return acc + val;
    }, 0);

    const availableCount = parcels.filter(p => p.status === 'Available').length;
    const reservedCount = parcels.filter(p => p.status === 'Reserved').length;
    const soldCount = parcels.filter(p => p.status === 'Sold').length;
    const disputeCount = parcels.filter(p => p.status === 'Under Dispute').length;

    const totalPortfolioValue = parcels.reduce((acc, p) => acc + (Number(p.price) || 0), 0);
    const totalAcquisitionCost = parcels.reduce((acc, p) => acc + (Number(p.acquisitionCost) || 0), 0);
    const unrealizedProfit = totalPortfolioValue - totalAcquisitionCost;

    return {
      totalCount,
      totalAreaAcres: totalAreaAcres.toFixed(2),
      availableCount,
      reservedCount,
      soldCount,
      disputeCount,
      totalPortfolioValue,
      totalAcquisitionCost,
      unrealizedProfit
    };
  }, [parcels]);

  const projectNames = useMemo(() => {
    return ['All', ...new Set(parcels.map(p => p.projectName))];
  }, [parcels]);

  const filteredParcels = useMemo(() => {
    return parcels.filter(p => {
      const matchesSearch = 
        p.surveyNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchesType = typeFilter === 'All' || p.zoning === typeFilter;
      const matchesProject = projectFilter === 'All' || p.projectName === projectFilter;

      return matchesSearch && matchesStatus && matchesType && matchesProject;
    });
  }, [parcels, searchTerm, statusFilter, typeFilter, projectFilter]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this SGR Realty land parcel record?')) {
      setParcels(prev => prev.filter(p => p.id !== id));
      showToast('Land parcel deleted from inventory successfully.');
    }
  };

  const handleSaveParcel = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const parcelData = {
      id: editingParcel ? editingParcel.id : `SGR-PARC-${Math.floor(500 + Math.random() * 500)}`,
      surveyNo: formData.get('surveyNo'),
      projectName: formData.get('projectName'),
      location: formData.get('location'),
      area: parseFloat(formData.get('area')) || 0,
      areaUnit: formData.get('areaUnit'),
      dimensions: formData.get('dimensions'),
      facing: formData.get('facing'),
      zoning: formData.get('zoning'),
      status: formData.get('status'),
      acquisitionCost: parseFloat(formData.get('acquisitionCost')) || 0,
      price: parseFloat(formData.get('price')) || 0,
      legalStatus: formData.get('legalStatus'),
      notes: formData.get('notes'),
      imageUrl: formImageUrl || (editingParcel ? editingParcel.imageUrl : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85'),
      documents: editingParcel ? editingParcel.documents : [],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    if (editingParcel) {
      setParcels(prev => prev.map(p => p.id === editingParcel.id ? parcelData : p));
      showToast('Land parcel updated successfully.');
    } else {
      setParcels(prev => [parcelData, ...prev]);
      showToast('New land parcel added to SGR Realty portfolio.');
    }

    setIsModalOpen(false);
    setEditingParcel(null);
    setFormImageUrl('');
  };

  const handleUploadDocument = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const parcelId = formData.get('parcelId');
    const docFile = formData.get('docFile');
    const docType = formData.get('docType');

    const newDoc = {
      name: docFile && docFile.name ? docFile.name : `SGR_Official_Record_${Date.now()}.pdf`,
      type: docType,
      size: '3.1 MB',
      date: new Date().toISOString().split('T')[0]
    };

    setParcels(prev => prev.map(p => {
      if (p.id === parcelId) {
        return {
          ...p,
          documents: [newDoc, ...p.documents],
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return p;
    }));

    setIsUploadModalOpen(false);
    showToast('Document securely uploaded to SGR Vault.');
  };

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-[#050508] text-[#f3f4f6]' : 'bg-gradient-to-br from-slate-100 via-stone-50 to-amber-50/60 text-slate-900'} flex items-center justify-center p-4 font-sans selection:bg-[#d4af37] selection:text-slate-950 transition-colors duration-300`}>
        <div className={`absolute inset-0 ${themeMode === 'dark' ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#12141c] via-[#050508] to-[#050508]' : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-slate-100 to-amber-100/40'} pointer-events-none`}></div>
        
        <div className={`relative z-10 w-full max-w-md ${themeMode === 'dark' ? 'bg-[#0b0c10]/95 border-[#20222a] shadow-2xl shadow-[#d4af37]/10' : 'bg-white/70 backdrop-blur-3xl border-white/80 shadow-[0_20px_50px_rgba(8,112,184,0.07)]'} border rounded-[2.5rem] p-8 sm:p-10 transition-all`}>
          <div className="absolute top-6 right-6">
            <button 
              onClick={toggleTheme}
              className={`p-2.5 rounded-2xl border transition-all ${themeMode === 'dark' ? 'bg-[#12141c] border-[#374151] text-[#f3e5ab]' : 'bg-white/80 border-amber-200/60 text-amber-800 shadow-sm'} cursor-pointer`}
              title="Toggle Theme"
            >
              {themeMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-center mb-8">
            <div className={`inline-flex p-3 rounded-2xl shadow-xl border mb-4 ${themeMode === 'dark' ? 'bg-[#12141c] border-[#d4af37]/30' : 'bg-white/90 border-amber-200/80 shadow-amber-900/5'}`}>
              <img 
                src="https://ai-public.creativityapps.dev/img/chatgpt_image_sep_16_2026_at_09_11_53_pm_2_1740926442654.png" 
                alt="SGR Realty Logo" 
                className="w-14 h-14 object-contain rounded-xl"
              />
            </div>
            <h1 className={`text-2xl font-black tracking-tight font-serif ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>SGR REALTY</h1>
            <p className="text-xs text-[#b8860b] font-bold tracking-widest uppercase mt-1">Land Inventory Management System</p>
            <p className={`text-xs mt-2 ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-500'}`}>Sign in to securely access land titles and asset valuation</p>
          </div>

          {loginError && (
            <div className="mb-6 bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs p-3.5 rounded-2xl font-bold text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className={`block text-xs font-bold mb-2 ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Corporate Email</label>
              <div className="relative">
                <User className={`absolute left-4 top-3.5 w-4 h-4 ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-400'}`} />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={`w-full border rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] font-medium transition-all ${themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a] text-white' : 'bg-white/70 border-slate-200/80 text-slate-900 shadow-inner'}`}
                  placeholder="director@sgrrealty.in"
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-2 ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Security Passkey</label>
              <div className="relative">
                <Lock className={`absolute left-4 top-3.5 w-4 h-4 ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-400'}`} />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={`w-full border rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] font-medium transition-all ${themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a] text-white' : 'bg-white/70 border-slate-200/80 text-slate-900 shadow-inner'}`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#d4af37] to-[#aa7c11] hover:from-[#e5c158] hover:to-[#bc8b15] text-slate-950 py-3.5 rounded-2xl text-sm font-black shadow-lg shadow-[#d4af37]/20 transition-all cursor-pointer"
              >
                Secure Login
              </button>
            </div>
          </form>

          <div className={`mt-8 pt-6 border-t text-center ${themeMode === 'dark' ? 'border-[#20222a] text-[#6b7280]' : 'border-slate-200/60 text-slate-400'}`}>
            <p className="text-[11px]">
              Protected Enterprise Platform • Spaces for a Better Tomorrow
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-[#050508] text-[#f3f4f6]' : 'bg-gradient-to-br from-slate-100 via-stone-50 to-amber-50/40 text-slate-900'} flex flex-col font-sans selection:bg-[#d4af37] selection:text-slate-950 transition-colors duration-300`}>
      
      {/* Top Header */}
      <header className={`${themeMode === 'dark' ? 'bg-[#0b0c10]/95 border-[#20222a]' : 'bg-white/70 backdrop-blur-3xl border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'} border-b sticky top-0 z-40 transition-all`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between">
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className={`p-2 rounded-2xl shadow-md border flex items-center justify-center ${themeMode === 'dark' ? 'bg-[#12141c] border-[#d4af37]/30' : 'bg-white/90 border-amber-200/80'}`}>
              <img 
                src="/Sgr.jpg" 
                alt="SGR Realty Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className={`text-lg sm:text-2xl font-black tracking-tight font-serif ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>SGR REALTY</h1>
                <span className={`hidden sm:inline-block text-[10px] px-2.5 py-0.5 rounded-full font-bold tracking-widest border uppercase ${themeMode === 'dark' ? 'bg-[#d4af37]/15 text-[#f3e5ab] border-[#d4af37]/30' : 'bg-amber-100 text-amber-900 border-amber-300'}`}>Enterprise</span>
              </div>
              <p className={`text-[10px] sm:text-xs font-medium tracking-wide mt-0.5 ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-500'}`}>Spaces for a Better Tomorrow</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-2xl border transition-all ${themeMode === 'dark' ? 'bg-[#12141c] border-[#374151] text-[#f3e5ab] hover:bg-[#1f222e]' : 'bg-white/80 border-slate-200/80 text-amber-800 hover:bg-white shadow-sm'} cursor-pointer`}
              title="Toggle Theme"
            >
              {themeMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                setEditingParcel(null);
                setFormImageUrl('');
                setIsModalOpen(true);
              }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#d4af37] to-[#aa7c11] hover:from-[#e5c158] hover:to-[#bc8b15] text-slate-950 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black shadow-lg shadow-[#d4af37]/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Land Parcel</span>
            </button>
            <button
              onClick={handleLogout}
              className={`p-2.5 rounded-2xl transition-colors border cursor-pointer ${themeMode === 'dark' ? 'bg-[#12141c] hover:bg-[#1f222e] text-[#9ca3af] hover:text-white border-[#20222a]' : 'bg-white/80 hover:bg-white text-slate-600 border-slate-200/80 shadow-sm'}`}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Hamburger & Actions */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border ${themeMode === 'dark' ? 'bg-[#12141c] border-[#374151] text-[#f3e5ab]' : 'bg-white border-slate-200 text-amber-800 shadow-sm'}`}
            >
              {themeMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                setEditingParcel(null);
                setFormImageUrl('');
                setIsModalOpen(true);
              }}
              className="bg-[#d4af37] text-slate-950 p-2.5 rounded-xl font-black shadow-md"
              title="Add Land Parcel"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2.5 rounded-xl border ${themeMode === 'dark' ? 'bg-[#12141c] text-white border-[#20222a]' : 'bg-white text-slate-800 border-slate-200 shadow-sm'}`}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className={`md:hidden border-b p-4 space-y-2 sticky top-20 z-30 shadow-2xl animate-fadeIn ${themeMode === 'dark' ? 'bg-[#0b0c10] border-[#20222a]' : 'bg-white/95 border-slate-200 backdrop-blur-2xl'}`}>
          {[
            { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
            { id: 'inventory', label: 'Land Inventory Grid', icon: FileSpreadsheet },
            { id: 'map', label: 'Master Layout Map', icon: MapIcon },
            { id: 'documents', label: 'Cloud Document Vault', icon: Database },
            { id: 'analytics', label: 'Portfolio Analytics', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 py-3 px-4 rounded-2xl font-bold text-sm transition-all ${
                  isActive
                    ? themeMode === 'dark' ? 'bg-[#d4af37]/15 text-[#f3e5ab] border border-[#d4af37]/30' : 'bg-amber-100 text-amber-900 border border-amber-300'
                    : themeMode === 'dark' ? 'text-[#9ca3af] hover:bg-[#12141c] hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#d4af37]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
          <div className={`pt-3 border-t flex justify-between items-center px-2 ${themeMode === 'dark' ? 'border-[#20222a]' : 'border-slate-200'}`}>
            <span className={`text-xs ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-500'}`}>Secure Session Active</span>
            <button
              onClick={handleLogout}
              className="text-xs text-rose-500 font-bold flex items-center gap-1 px-3 py-2 bg-rose-500/10 rounded-xl"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Navigation Tabs */}
      <div className={`hidden md:block border-b backdrop-blur-xl ${themeMode === 'dark' ? 'bg-[#0b0c10]/80 border-[#20222a]' : 'bg-white/60 border-slate-200/80'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-8 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
            { id: 'inventory', label: 'Land Inventory Grid', icon: FileSpreadsheet },
            { id: 'map', label: 'Master Layout Map', icon: MapIcon },
            { id: 'documents', label: 'Cloud Document Vault', icon: Database },
            { id: 'analytics', label: 'Portfolio Analytics', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2.5 py-4 px-2 border-b-2 font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/5'
                    : themeMode === 'dark' ? 'border-transparent text-[#9ca3af] hover:text-white hover:border-[#374151]' : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#d4af37]' : themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#d4af37] text-slate-950 px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-[#f3e5ab] font-extrabold animate-bounce text-xs sm:text-sm">
          <CheckCircle2 className="w-5 h-5 text-slate-950 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <button 
              onClick={() => setFullscreenImage(null)}
              className="absolute -top-12 right-0 bg-[#12141c] hover:bg-[#1f222e] text-white p-2.5 rounded-full transition-colors cursor-pointer border border-[#374151]"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <img 
              src={fullscreenImage} 
              alt="Expanded Land Preview" 
              className="max-h-[80vh] w-auto object-contain rounded-3xl border-2 border-[#d4af37]/40 shadow-2xl shadow-[#d4af37]/10"
            />
            <p className="text-[#9ca3af] text-xs mt-4 font-bold tracking-widest uppercase">SGR Realty High-Resolution Aerial Preview</p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* ================= TAB 1: EXECUTIVE DASHBOARD ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 sm:space-y-8">
            
            {/* Hero Banner */}
            <div className={`border rounded-[2.5rem] p-6 sm:p-10 relative overflow-hidden shadow-xl ${
              themeMode === 'dark' 
                ? 'bg-gradient-to-r from-[#0b0c10] via-[#12141c] to-[#0b0c10] border-[#d4af37]/30 shadow-[#d4af37]/5' 
                : 'bg-white/70 backdrop-blur-3xl border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)]'
            }`}>
              <div className="absolute right-0 top-0 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-3 border ${
                    themeMode === 'dark' ? 'bg-[#d4af37]/15 text-[#f3e5ab] border-[#d4af37]/30' : 'bg-amber-100/80 text-amber-900 border-amber-300/60'
                  }`}>
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>SGR Realty Land Asset Portal</span>
                  </div>
                  <h2 className={`text-2xl sm:text-4xl font-black tracking-tight font-serif ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>Strategic Land Portfolio</h2>
                  <p className={`text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-600'}`}>
                    Managing <span className={`font-bold ${themeMode === 'dark' ? 'text-[#f3e5ab]' : 'text-amber-900'}`}>{metrics.totalCount} strategic land parcels</span> spanning <span className={`font-bold ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{metrics.totalAreaAcres} acres</span> across prime Indian corridors. Total estimated portfolio valuation stands at <span className={`font-extrabold ${themeMode === 'dark' ? 'text-[#f3e5ab]' : 'text-amber-900'}`}>{formatIndianCurrency(metrics.totalPortfolioValue)}</span>.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="w-full sm:w-auto bg-[#d4af37] hover:bg-[#e5c158] text-slate-950 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/20 transition-all cursor-pointer"
                  >
                    <span>Browse Inventory Grid</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Metrics Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              
              <div className={`border rounded-[2rem] p-5 sm:p-6 relative overflow-hidden group hover:border-[#d4af37]/50 transition-all shadow-lg ${
                themeMode === 'dark' ? 'bg-[#0b0c10]/90 border-[#20222a]' : 'bg-white/70 backdrop-blur-2xl border-white/80 shadow-[0_8px_25px_rgba(0,0,0,0.02)]'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-400'}`}>Total Parcels</p>
                    <h3 className={`text-2xl sm:text-3xl font-black mt-2 ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{metrics.totalCount}</h3>
                  </div>
                  <div className="bg-[#d4af37]/10 p-3 rounded-2xl text-[#d4af37] border border-[#d4af37]/20">
                    <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-amber-700 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>100% Legal Title Audited</span>
                </div>
              </div>

              <div className={`border rounded-[2rem] p-5 sm:p-6 relative overflow-hidden group hover:border-[#d4af37]/50 transition-all shadow-lg ${
                themeMode === 'dark' ? 'bg-[#0b0c10]/90 border-[#20222a]' : 'bg-white/70 backdrop-blur-2xl border-white/80 shadow-[0_8px_25px_rgba(0,0,0,0.02)]'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-400'}`}>Total Land Area</p>
                    <h3 className={`text-2xl sm:text-3xl font-black mt-2 ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{metrics.totalAreaAcres} <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-500'}`}>Acres</span></h3>
                  </div>
                  <div className="bg-[#d4af37]/10 p-3 rounded-2xl text-[#d4af37] border border-[#d4af37]/20">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-600">
                  <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md text-[10px]">Multi-Zone</span>
                  <span>Residential, Commercial, Agro</span>
                </div>
              </div>

              <div className={`border rounded-[2rem] p-5 sm:p-6 relative overflow-hidden group hover:border-[#d4af37]/50 transition-all shadow-lg ${
                themeMode === 'dark' ? 'bg-[#0b0c10]/90 border-[#20222a]' : 'bg-white/70 backdrop-blur-2xl border-white/80 shadow-[0_8px_25px_rgba(0,0,0,0.02)]'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-400'}`}>Available Inventory</p>
                    <h3 className="text-2xl sm:text-3xl font-black text-amber-800 mt-2">{metrics.availableCount} <span className={`text-xs font-normal ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-500'}`}>plots</span></h3>
                  </div>
                  <div className="bg-[#d4af37]/10 p-3 rounded-2xl text-[#d4af37] border border-[#d4af37]/20">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
                <div className={`mt-4 flex items-center gap-2 text-xs font-medium ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-600'}`}>
                  <span className="text-amber-800 font-bold">{metrics.reservedCount} reserved</span>
                  <span>• {metrics.soldCount} sold</span>
                </div>
              </div>

              <div className={`border rounded-[2rem] p-5 sm:p-6 relative overflow-hidden group hover:border-[#d4af37]/50 transition-all shadow-lg ${
                themeMode === 'dark' ? 'bg-[#0b0c10]/90 border-[#20222a]' : 'bg-white/70 backdrop-blur-2xl border-white/80 shadow-[0_8px_25px_rgba(0,0,0,0.02)]'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-400'}`}>Portfolio Valuation</p>
                    <h3 className={`text-xl sm:text-2xl font-black mt-2 ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{formatIndianCurrency(metrics.totalPortfolioValue)}</h3>
                  </div>
                  <div className="bg-[#d4af37]/10 p-3 rounded-2xl text-[#d4af37] border border-[#d4af37]/20">
                    <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-amber-800 font-bold">
                  <span>Est. Profit: {formatIndianCurrency(metrics.unrealizedProfit)}</span>
                </div>
              </div>

            </div>

            {/* Status Breakdown & Recent List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className={`border rounded-[2.5rem] p-6 shadow-xl ${themeMode === 'dark' ? 'bg-[#0b0c10]/90 border-[#20222a]' : 'bg-white/70 backdrop-blur-2xl border-white/80'}`}>
                <h3 className={`text-base font-black mb-6 flex items-center gap-2 font-serif ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  <Layers className="w-5 h-5 text-[#d4af37]" />
                  <span>Status Breakdown</span>
                </h3>
                <div className="space-y-5">
                  {[
                    { label: 'Available', count: metrics.availableCount, color: 'bg-emerald-500', textColor: 'text-emerald-600', filter: 'Available' },
                    { label: 'Reserved', count: metrics.reservedCount, color: 'bg-amber-500', textColor: 'text-amber-600', filter: 'Reserved' },
                    { label: 'Sold', count: metrics.soldCount, color: 'bg-rose-500', textColor: 'text-rose-600', filter: 'Sold' },
                    { label: 'Under Dispute', count: metrics.disputeCount, color: 'bg-purple-500', textColor: 'text-purple-600', filter: 'Under Dispute' }
                  ].map((item, idx) => {
                    const percentage = metrics.totalCount > 0 ? Math.round((item.count / metrics.totalCount) * 100) : 0;
                    return (
                      <div key={idx} className="cursor-pointer group" onClick={() => { setStatusFilter(item.filter); setActiveTab('inventory'); }}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className={`font-bold group-hover:text-[#d4af37] transition-colors ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-600'}`}>{item.label}</span>
                          <span className={`font-black ${item.textColor}`}>{item.count} ({percentage}%)</span>
                        </div>
                        <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 border ${themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a]' : 'bg-slate-100 border-slate-200 shadow-inner'}`}>
                          <div className={`${item.color} h-full rounded-full transition-all duration-700`} style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={`lg:col-span-2 border rounded-[2.5rem] p-6 shadow-xl ${themeMode === 'dark' ? 'bg-[#0b0c10]/90 border-[#20222a]' : 'bg-white/70 backdrop-blur-2xl border-white/80'}`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`text-base font-black flex items-center gap-2 font-serif ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    <Building2 className="w-5 h-5 text-[#d4af37]" />
                    <span>Recent Land Parcels</span>
                  </h3>
                  <button onClick={() => setActiveTab('inventory')} className="text-xs text-[#b8860b] hover:underline font-bold">
                    View All →
                  </button>
                </div>
                <div className="space-y-4">
                  {parcels.slice(0, 3).map(p => (
                    <div key={p.id} className={`border p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                      themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a]' : 'bg-white/80 border-slate-200/80 shadow-sm'
                    }`}>
                      <div className="flex items-center space-x-4 overflow-hidden">
                        <img 
                          src={p.imageUrl} 
                          alt={p.surveyNo} 
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-slate-200 shrink-0 cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                          onClick={() => setFullscreenImage(p.imageUrl)}
                        />
                        <div className="truncate">
                          <div className="flex items-center space-x-2">
                            <span className={`font-extrabold text-sm sm:text-base ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{p.surveyNo}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              p.status === 'Available' ? 'bg-emerald-500/15 text-emerald-700' :
                              p.status === 'Reserved' ? 'bg-amber-500/15 text-amber-700' :
                              p.status === 'Sold' ? 'bg-rose-500/15 text-rose-700' : 'bg-purple-500/15 text-purple-700'
                            }`}>{p.status}</span>
                          </div>
                          <p className={`text-xs truncate mt-0.5 ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-500'}`}>{p.projectName} • {p.location}</p>
                        </div>
                      </div>
                      <div className={`flex sm:flex-col justify-between items-center sm:items-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 ${themeMode === 'dark' ? 'border-[#20222a]' : 'border-slate-100'}`}>
                        <p className={`text-sm sm:text-base font-black ${themeMode === 'dark' ? 'text-[#f3e5ab]' : 'text-amber-900'}`}>{formatIndianCurrency(p.price)}</p>
                        <p className={`text-xs font-semibold ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-400'}`}>{p.area} {p.areaUnit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= TAB 2: LAND INVENTORY GRID ================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            
            {/* Filter Bar */}
            <div className={`border rounded-[2rem] p-5 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-xl ${
              themeMode === 'dark' ? 'bg-[#0b0c10]/90 border-[#20222a]' : 'bg-white/70 backdrop-blur-2xl border-white/80'
            }`}>
              
              <div className="relative w-full lg:w-80">
                <Search className={`absolute left-4 top-3.5 w-4 h-4 ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Search survey no, location, project..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full border rounded-2xl pl-11 pr-4 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:border-[#d4af37] font-medium transition-all ${
                    themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a] text-white' : 'bg-white/80 border-slate-200/80 text-slate-900 shadow-inner'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl border ${themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a]' : 'bg-white/80 border-slate-200/80 shadow-sm'}`}>
                  <span className={`text-xs font-bold ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-500'}`}>Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`bg-transparent text-xs font-bold focus:outline-none w-full ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                    <option value="Under Dispute">Under Dispute</option>
                  </select>
                </div>

                <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl border ${themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a]' : 'bg-white/80 border-slate-200/80 shadow-sm'}`}>
                  <span className={`text-xs font-bold ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-500'}`}>Zoning:</span>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className={`bg-transparent text-xs font-bold focus:outline-none w-full ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}
                  >
                    <option value="All">All Zonings</option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Agricultural">Agricultural</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>

                <div className={`col-span-2 sm:col-span-1 flex items-center space-x-2 px-3 py-2 rounded-xl border ${themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a]' : 'bg-white/80 border-slate-200/80 shadow-sm'}`}>
                  <span className={`text-xs font-bold ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-500'}`}>Project:</span>
                  <select
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                    className={`bg-transparent text-xs font-bold focus:outline-none w-full truncate ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}
                  >
                    {projectNames.map((proj, idx) => (
                      <option key={idx} value={proj}>{proj}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Inventory Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredParcels.length === 0 ? (
                <div className={`col-span-full text-center py-20 rounded-[2.5rem] border ${themeMode === 'dark' ? 'bg-[#0b0c10]/50 border-[#20222a]' : 'bg-white/50 border-slate-200'}`}>
                  <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#d4af37]" />
                  <p className={`text-base font-bold ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>No land parcels match your search filters.</p>
                  <button 
                    onClick={() => { setSearchTerm(''); setStatusFilter('All'); setTypeFilter('All'); setProjectFilter('All'); }}
                    className="mt-3 text-xs text-[#b8860b] hover:underline font-bold"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                filteredParcels.map(p => {
                  const statusBadgeColor = 
                    p.status === 'Available' ? 'bg-emerald-500/20 text-emerald-800 border-emerald-500/30' :
                    p.status === 'Reserved' ? 'bg-amber-500/20 text-amber-800 border-amber-500/30' :
                    p.status === 'Sold' ? 'bg-rose-500/20 text-rose-800 border-rose-500/30' :
                    'bg-purple-500/20 text-purple-800 border-purple-500/30';

                  return (
                    <div key={p.id} className={`border rounded-[2.5rem] overflow-hidden shadow-xl hover:border-[#d4af37]/50 transition-all flex flex-col group ${
                      themeMode === 'dark' ? 'bg-[#0b0c10]/90 border-[#20222a]' : 'bg-white/80 backdrop-blur-2xl border-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.03)]'
                    }`}>
                      
                      {/* Prominent Large Land Image Card Header */}
                      <div className={`relative h-56 sm:h-60 overflow-hidden ${themeMode === 'dark' ? 'bg-[#12141c]' : 'bg-slate-100'}`}>
                        <img 
                          src={p.imageUrl} 
                          alt={p.surveyNo} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 cursor-pointer"
                          onClick={() => setFullscreenImage(p.imageUrl)}
                          title="Click to view high-res image"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${themeMode === 'dark' ? 'from-[#0b0c10] via-[#0b0c10]/20' : 'from-black/60 via-black/10'} to-transparent`}></div>
                        <span className={`absolute top-4 right-4 text-xs px-3.5 py-1 rounded-full font-extrabold backdrop-blur-md border ${statusBadgeColor}`}>
                          {p.status}
                        </span>
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                          <div>
                            <span className="text-[10px] uppercase font-black tracking-widest text-[#f3e5ab]">{p.id}</span>
                            <h3 className="text-xl sm:text-2xl font-black text-white font-serif">{p.surveyNo}</h3>
                          </div>
                          <button
                            onClick={() => setFullscreenImage(p.imageUrl)}
                            className="bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-xl backdrop-blur-md transition-colors cursor-pointer border border-white/20"
                            title="Expand Photo"
                          >
                            <Camera className="w-4 h-4 text-[#d4af37]" />
                          </button>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-5">
                        <div>
                          <p className="text-xs font-bold text-[#b8860b]">{p.projectName}</p>
                          <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-500'}`}>{p.location}</p>
                        </div>

                        <div className={`grid grid-cols-2 gap-3 text-xs p-4 rounded-2xl border ${
                          themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a]' : 'bg-slate-50/80 border-slate-200/60 shadow-inner'
                        }`}>
                          <div>
                            <span className={`block text-[10px] font-bold uppercase ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-400'}`}>Area</span>
                            <span className={`font-black text-sm ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{p.area} {p.areaUnit}</span>
                          </div>
                          <div>
                            <span className={`block text-[10px] font-bold uppercase ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-400'}`}>Zoning</span>
                            <span className={`font-black text-sm ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{p.zoning}</span>
                          </div>
                        </div>

                        <div className={`flex justify-between items-center pt-4 border-t ${themeMode === 'dark' ? 'border-[#20222a]' : 'border-slate-100'}`}>
                          <div>
                            <span className={`text-[10px] uppercase font-bold block ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-400'}`}>Listing Valuation</span>
                            <span className={`font-black text-base sm:text-lg ${themeMode === 'dark' ? 'text-[#f3e5ab]' : 'text-amber-900'}`}>{formatIndianCurrency(p.price)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1.5">
                            <button
                              title="View Details"
                              onClick={() => setViewingParcel(p)}
                              className={`p-2.5 rounded-xl transition-colors cursor-pointer border ${
                                themeMode === 'dark' ? 'bg-[#12141c] hover:bg-[#1f222e] text-slate-200 border-[#20222a]' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 shadow-sm'
                              }`}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              title="Edit Parcel"
                              onClick={() => { 
                                setEditingParcel(p); 
                                setFormImageUrl(p.imageUrl);
                                setIsModalOpen(true); 
                              }}
                              className={`p-2.5 rounded-xl transition-colors cursor-pointer border ${
                                themeMode === 'dark' ? 'bg-[#12141c] hover:bg-[#1f222e] text-slate-200 border-[#20222a]' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 shadow-sm'
                              }`}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              title="Delete Parcel"
                              onClick={() => handleDelete(p.id)}
                              className={`p-2.5 rounded-xl transition-colors cursor-pointer border ${
                                themeMode === 'dark' ? 'bg-[#12141c] hover:bg-[#1f222e] text-slate-200 border-[#20222a]' : 'bg-white hover:bg-slate-50 text-rose-600 border-slate-200/80 shadow-sm'
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* ================= TAB 3: MASTER LAYOUT MAP ================= */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <div className={`border rounded-[2.5rem] p-6 sm:p-8 shadow-2xl ${themeMode === 'dark' ? 'bg-[#0b0c10]/90 border-[#20222a]' : 'bg-white/70 backdrop-blur-2xl border-white/80'}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h3 className={`text-lg sm:text-xl font-black flex items-center gap-2 font-serif ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    <MapIcon className="w-5 h-5 text-[#d4af37]" />
                    <span>Master Layout Map & Aerial Viewer</span>
                  </h3>
                  <p className={`text-xs ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-500'}`}>Click any parcel card to inspect high-res aerial imagery and legal documents.</p>
                </div>
                
                <div className={`flex flex-wrap items-center gap-3 text-xs font-bold px-4 py-2.5 rounded-2xl border ${
                  themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a] text-slate-300' : 'bg-white/80 border-slate-200/80 text-slate-700 shadow-sm'
                }`}>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Reserved</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Sold</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Dispute</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {parcels.map(p => {
                  const borderColor = 
                    p.status === 'Available' ? 'border-emerald-500/60 hover:border-emerald-500' :
                    p.status === 'Reserved' ? 'border-amber-500/60 hover:border-amber-500' :
                    p.status === 'Sold' ? 'border-rose-500/60 hover:border-rose-500' :
                    'border-purple-500/60 hover:border-purple-500';

                  return (
                    <div 
                      key={p.id}
                      onClick={() => setViewingParcel(p)}
                      className={`border-2 rounded-[2.5rem] overflow-hidden transition-all cursor-pointer group shadow-xl flex flex-col ${
                        themeMode === 'dark' ? `bg-[#12141c] ${borderColor}` : `bg-white/90 ${borderColor} shadow-amber-900/5 backdrop-blur-md`
                      }`}
                    >
                      <div className="relative h-52 sm:h-56 overflow-hidden bg-slate-200">
                        <img src={p.imageUrl} alt={p.surveyNo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-[#f3e5ab]">{p.projectName}</span>
                          <h4 className="text-xl sm:text-2xl font-black text-white font-serif">{p.surveyNo}</h4>
                        </div>
                      </div>

                      <div className={`p-5 flex justify-between items-center ${themeMode === 'dark' ? 'bg-[#0b0c10]/90' : 'bg-slate-50/80'}`}>
                        <span className={`text-xs font-bold ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{p.area} {p.areaUnit} • {p.zoning}</span>
                        <span className={`font-black ${themeMode === 'dark' ? 'text-[#f3e5ab]' : 'text-amber-900'}`}>{formatIndianCurrency(p.price)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: CLOUD DOCUMENT VAULT ================= */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className={`border rounded-[2.5rem] p-6 sm:p-8 shadow-2xl ${themeMode === 'dark' ? 'bg-[#0b0c10]/90 border-[#20222a]' : 'bg-white/70 backdrop-blur-2xl border-white/80'}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h3 className={`text-lg sm:text-xl font-black flex items-center gap-2 font-serif ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    <Database className="w-5 h-5 text-[#d4af37]" />
                    <span>SGR Cloud Document & Legal Vault</span>
                  </h3>
                  <p className={`text-xs ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-500'}`}>Secure cloud repository linked to title deeds, encumbrance certificates, and statutory approvals.</p>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="bg-[#d4af37] hover:bg-[#e5c158] text-slate-950 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg shadow-[#d4af37]/20 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Legal Document</span>
                </button>
              </div>

              <div className="space-y-6">
                {parcels.map(p => (
                  <div key={p.id} className={`border rounded-[2rem] p-5 sm:p-6 shadow-xl ${themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a]' : 'bg-white/80 border-slate-200/80 shadow-sm'}`}>
                    <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b gap-4 ${themeMode === 'dark' ? 'border-[#20222a]' : 'border-slate-100'}`}>
                      <div className="flex items-center space-x-4">
                        <img 
                          src={p.imageUrl} 
                          alt={p.surveyNo} 
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border border-slate-200 cursor-pointer shadow-sm"
                          onClick={() => setFullscreenImage(p.imageUrl)}
                        />
                        <div>
                          <div className="flex items-center space-x-3">
                            <h4 className={`font-black text-base sm:text-lg font-serif ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{p.surveyNo}</h4>
                            <span className="text-xs text-[#b8860b] font-bold">({p.projectName})</span>
                          </div>
                          <p className={`text-xs font-medium mt-0.5 ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-500'}`}>Legal Status: <span className="text-emerald-600 font-bold">{p.legalStatus}</span></p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedParcelForUpload(p.id);
                          setIsUploadModalOpen(true);
                        }}
                        className={`text-xs border px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          themeMode === 'dark' ? 'bg-[#0b0c10] hover:bg-[#1f222e] text-[#f3e5ab] border-[#374151]' : 'bg-white hover:bg-slate-50 text-amber-900 border-slate-300/80 shadow-sm'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Attach File</span>
                      </button>
                    </div>

                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {p.documents.length === 0 ? (
                        <p className={`text-xs italic py-2 ${themeMode === 'dark' ? 'text-[#6b7280]' : 'text-slate-400'}`}>No documents linked to this parcel yet.</p>
                      ) : (
                        p.documents.map((doc, idx) => (
                          <div key={idx} className={`border rounded-2xl p-4 flex items-center justify-between ${themeMode === 'dark' ? 'bg-[#0b0c10] border-[#20222a]' : 'bg-white border-slate-200/80 shadow-sm'}`}>
                            <div className="flex items-center space-x-3 overflow-hidden">
                              <div className="bg-[#d4af37]/10 text-[#d4af37] p-2.5 rounded-xl border border-[#d4af37]/20 shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="truncate">
                                <p className={`text-xs font-bold truncate ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{doc.name}</p>
                                <p className={`text-[10px] font-medium ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-400'}`}>{doc.type} • {doc.size} • {doc.date}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => showToast(`Downloading simulated cloud file: ${doc.name}`)}
                              className={`p-2.5 rounded-xl transition-colors cursor-pointer shrink-0 ${themeMode === 'dark' ? 'hover:bg-[#1f222e] text-slate-300 hover:text-white' : 'hover:bg-slate-50 text-slate-700'}`}
                              title="Download File"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: PORTFOLIO ANALYTICS ================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className={`border rounded-[2.5rem] p-6 sm:p-8 shadow-2xl ${themeMode === 'dark' ? 'bg-[#0b0c10]/90 border-[#20222a]' : 'bg-white/70 backdrop-blur-2xl border-white/80'}`}>
              <h3 className={`text-lg sm:text-xl font-black flex items-center gap-2 mb-2 font-serif ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                <BarChart3 className="w-5 h-5 text-[#d4af37]" />
                <span>SGR Realty Financial & Acquisition Analytics</span>
              </h3>
              <p className={`text-xs mb-8 ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-500'}`}>Comprehensive breakdown of acquisition costs vs. projected market valuation.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className={`border p-6 rounded-[2rem] ${themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a]' : 'bg-white/80 border-slate-200/80 shadow-sm'}`}>
                  <span className={`text-xs font-bold uppercase tracking-wider ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-400'}`}>Total Acquisition Capital</span>
                  <h4 className={`text-2xl sm:text-3xl font-black mt-2 ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{formatIndianCurrency(metrics.totalAcquisitionCost)}</h4>
                  <p className={`text-xs mt-2 ${themeMode === 'dark' ? 'text-[#6b7280]' : 'text-slate-400'}`}>Aggregate initial purchase cost of land bank.</p>
                </div>
                <div className={`border p-6 rounded-[2rem] ${themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a]' : 'bg-white/80 border-slate-200/80 shadow-sm'}`}>
                  <span className={`text-xs font-bold uppercase tracking-wider ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-400'}`}>Total Listing Valuation</span>
                  <h4 className={`text-2xl sm:text-3xl font-black mt-2 ${themeMode === 'dark' ? 'text-[#f3e5ab]' : 'text-amber-900'}`}>{formatIndianCurrency(metrics.totalPortfolioValue)}</h4>
                  <p className={`text-xs mt-2 ${themeMode === 'dark' ? 'text-[#6b7280]' : 'text-slate-400'}`}>Current estimated market realization value.</p>
                </div>
                <div className={`border p-6 rounded-[2rem] ${themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a]' : 'bg-white/80 border-slate-200/80 shadow-sm'}`}>
                  <span className={`text-xs font-bold uppercase tracking-wider ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-400'}`}>Projected Unrealized Profit</span>
                  <h4 className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">{formatIndianCurrency(metrics.unrealizedProfit)}</h4>
                  <p className="text-xs text-emerald-600 mt-2 font-semibold">Estimated gross appreciation margin.</p>
                </div>
              </div>

              <div className={`border p-6 rounded-[2rem] ${themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a]' : 'bg-white/80 border-slate-200/80 shadow-sm'}`}>
                <h4 className={`text-sm font-black mb-4 font-serif ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>Project-wise Land Valuation Distribution</h4>
                <div className="space-y-4">
                  {parcels.map(p => {
                    const percentage = metrics.totalPortfolioValue > 0 ? Math.round((p.price / metrics.totalPortfolioValue) * 100) : 0;
                    return (
                      <div key={p.id}>
                        <div className="flex justify-between text-xs mb-1.5 font-bold">
                          <span className={`truncate pr-2 ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{p.projectName} ({p.surveyNo})</span>
                          <span className={`shrink-0 ${themeMode === 'dark' ? 'text-[#f3e5ab]' : 'text-amber-900'}`}>{formatIndianCurrency(p.price)} ({percentage}%)</span>
                        </div>
                        <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 border ${themeMode === 'dark' ? 'bg-[#0b0c10] border-[#20222a]' : 'bg-slate-100 border-slate-200 shadow-inner'}`}>
                          <div className="bg-gradient-to-r from-[#d4af37] to-[#aa7c11] h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(percentage, 5)}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ================= MODAL: ADD / EDIT LAND PARCEL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <div className={`border rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl my-8 ${
            themeMode === 'dark' ? 'bg-[#0b0c10] border-[#20222a]' : 'bg-white/95 border-white shadow-2xl backdrop-blur-3xl'
          }`}>
            <div className={`px-6 sm:px-8 py-5 border-b flex justify-between items-center sticky top-0 z-10 ${
              themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a]' : 'bg-slate-50/80 border-slate-200/80 backdrop-blur-md'
            }`}>
              <h3 className={`text-base sm:text-lg font-black flex items-center gap-2 font-serif ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                <Building2 className="w-5 h-5 text-[#d4af37]" />
                <span>{editingParcel ? 'Edit SGR Land Parcel' : 'Add New SGR Land Parcel'}</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${themeMode === 'dark' ? 'text-[#9ca3af] hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveParcel} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Survey / Plot Number *</label>
                  <input
                    type="text"
                    name="surveyNo"
                    required
                    defaultValue={editingParcel ? editingParcel.surveyNo : ''}
                    placeholder="e.g. Sy. No. 214/4B"
                    className={`w-full border rounded-2xl px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:border-[#d4af37] font-bold transition-all ${
                      themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a] text-white' : 'bg-slate-50/80 border-slate-200/80 text-slate-900 shadow-inner'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Project / Development Name *</label>
                  <input
                    type="text"
                    name="projectName"
                    required
                    defaultValue={editingParcel ? editingParcel.projectName : ''}
                    placeholder="e.g. SGR Grand Emerald Meadows"
                    className={`w-full border rounded-2xl px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:border-[#d4af37] font-bold transition-all ${
                      themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a] text-white' : 'bg-slate-50/80 border-slate-200/80 text-slate-900 shadow-inner'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Location / Address *</label>
                <input
                  type="text"
                  name="location"
                  required
                  defaultValue={editingParcel ? editingParcel.location : ''}
                  placeholder="e.g. Sarjapur Corridor, Bengaluru, Karnataka - 562107"
                  className={`w-full border rounded-2xl px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:border-[#d4af37] font-medium transition-all ${
                    themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a] text-white' : 'bg-slate-50/80 border-slate-200/80 text-slate-900 shadow-inner'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Total Area *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="area"
                    required
                    defaultValue={editingParcel ? editingParcel.area : ''}
                    placeholder="e.g. 4.2"
                    className={`w-full border rounded-2xl px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:border-[#d4af37] font-bold transition-all ${
                      themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a] text-white' : 'bg-slate-50/80 border-slate-200/80 text-slate-900 shadow-inner'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Area Unit</label>
                  <select
                    name="areaUnit"
                    defaultValue={editingParcel ? editingParcel.areaUnit : 'Acres'}
                    className={`w-full border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#d4af37] ${
                      themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a] text-white' : 'bg-slate-50/80 border-slate-200/80 text-slate-900 shadow-inner'
                    }`}
                  >
                    <option value="Acres">Acres</option>
                    <option value="Sq. Ft.">Sq. Ft.</option>
                    <option value="Sq. Meters">Sq. Meters</option>
                    <option value="Hectares">Hectares</option>
                    <option value="Cents">Cents</option>
                    <option value="Gunta">Gunta</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Dimensions</label>
                  <input
                    type="text"
                    name="dimensions"
                    defaultValue={editingParcel ? editingParcel.dimensions : ''}
                    placeholder="e.g. 320 x 570 ft"
                    className={`w-full border rounded-2xl px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:border-[#d4af37] font-bold transition-all ${
                      themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a] text-white' : 'bg-slate-50/80 border-slate-200/80 text-slate-900 shadow-inner'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Facing Direction</label>
                  <input
                    type="text"
                    name="facing"
                    defaultValue={editingParcel ? editingParcel.facing : ''}
                    placeholder="e.g. East Facing"
                    className={`w-full border rounded-2xl px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:border-[#d4af37] font-bold transition-all ${
                      themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a] text-white' : 'bg-slate-50/80 border-slate-200/80 text-slate-900 shadow-inner'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Zoning / Type</label>
                  <select
                    name="zoning"
                    defaultValue={editingParcel ? editingParcel.zoning : 'Residential'}
                    className={`w-full border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#d4af37] ${
                      themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a] text-white' : 'bg-slate-50/80 border-slate-200/80 text-slate-900 shadow-inner'
                    }`}
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Agricultural">Agricultural</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Status</label>
                  <select
                    name="status"
                    defaultValue={editingParcel ? editingParcel.status : 'Available'}
                    className={`w-full border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#d4af37] ${
                      themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a] text-white' : 'bg-slate-50/80 border-slate-200/80 text-slate-900 shadow-inner'
                    }`}
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                    <option value="Under Dispute">Under Dispute</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Acquisition Cost (₹) *</label>
                  <input
                    type="number"
                    name="acquisitionCost"
                    required
                    defaultValue={editingParcel ? editingParcel.acquisitionCost : ''}
                    placeholder="e.g. 28000000"
                    className={`w-full border rounded-2xl px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:border-[#d4af37] font-bold transition-all ${
                      themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a] text-white' : 'bg-slate-50/80 border-slate-200/80 text-slate-900 shadow-inner'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Listing Selling Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    required
                    defaultValue={editingParcel ? editingParcel.price : ''}
                    placeholder="e.g. 42500000"
                    className={`w-full border rounded-2xl px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:border-[#d4af37] font-bold transition-all ${
                      themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a] text-[#f3e5ab]' : 'bg-slate-50/80 border-slate-200/80 text-amber-900 shadow-inner'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Legal Status & Title Approvals</label>
                <input
                  type="text"
                  name="legalStatus"
                  defaultValue={editingParcel ? editingParcel.legalStatus : 'Clear Title'}
                  placeholder="e.g. Clear Title (DTCP & RERA Approved)"
                  className={`w-full border rounded-2xl px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:border-[#d4af37] font-bold transition-all ${
                    themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a] text-white' : 'bg-slate-50/80 border-slate-200/80 text-slate-900 shadow-inner'
                  }`}
                />
              </div>

              {/* Direct Photo File Upload & URL Section */}
              <div className={`border rounded-2xl p-4 sm:p-5 space-y-4 ${themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a]' : 'bg-white/80 border-slate-200/80 shadow-sm'}`}>
                <div className="flex items-center justify-between">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${themeMode === 'dark' ? 'text-[#f3e5ab]' : 'text-amber-900'}`}>Land Parcel Photo</label>
                  {isUploadingImage && <span className="text-xs text-amber-600 animate-pulse font-bold">Processing image...</span>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-500'}`}>Option A: Upload Image File from Device</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDirectImageUpload}
                      className={`w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#d4af37] file:text-slate-950 hover:file:bg-[#e5c158] cursor-pointer border rounded-xl p-2 ${
                        themeMode === 'dark' ? 'bg-[#0b0c10] border-[#20222a] text-slate-300' : 'bg-slate-50 border-slate-200/80 text-slate-700 shadow-inner'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-500'}`}>Option B: Or Enter Image URL</label>
                    <input
                      type="url"
                      name="imageUrl"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className={`w-full border rounded-xl px-4 py-2.5 text-xs placeholder-slate-400 focus:outline-none focus:border-[#d4af37] font-medium transition-all ${
                        themeMode === 'dark' ? 'bg-[#0b0c10] border-[#20222a] text-white' : 'bg-slate-50/80 border-slate-200/80 text-slate-900 shadow-inner'
                      }`}
                    />
                  </div>
                </div>

                {formImageUrl && (
                  <div className={`mt-3 flex items-center space-x-4 pt-3 border-t ${themeMode === 'dark' ? 'border-[#20222a]' : 'border-slate-100'}`}>
                    <img src={formImageUrl} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-[#d4af37]/40 shrink-0 shadow-sm" />
                    <div>
                      <p className={`text-xs font-bold ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>Preview Selected Image</p>
                      <p className={`text-[10px] truncate max-w-xs ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-400'}`}>{formImageUrl}</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Notes, Topography & Utility Remarks</label>
                <textarea
                  name="notes"
                  rows="3"
                  defaultValue={editingParcel ? editingParcel.notes : ''}
                  placeholder="Enter road width, electricity lines, borewell status, boundary fencing..."
                  className={`w-full border rounded-2xl px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:border-[#d4af37] font-medium transition-all ${
                    themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a] text-white' : 'bg-slate-50/80 border-slate-200/80 text-slate-900 shadow-inner'
                  }`}
                ></textarea>
              </div>

              <div className={`pt-4 border-t flex flex-col sm:flex-row justify-end gap-3 ${themeMode === 'dark' ? 'border-[#20222a]' : 'border-slate-100'}`}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-5 py-3 rounded-2xl text-sm font-bold transition-colors cursor-pointer order-2 sm:order-1 ${
                    themeMode === 'dark' ? 'text-slate-300 hover:bg-[#1f222e]' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl text-sm font-black bg-[#d4af37] hover:bg-[#e5c158] text-slate-950 shadow-lg shadow-[#d4af37]/20 transition-all cursor-pointer order-1 sm:order-2"
                >
                  {editingParcel ? 'Save Changes' : 'Create Parcel Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: UPLOAD DOCUMENT ================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className={`border rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl ${themeMode === 'dark' ? 'bg-[#0b0c10] border-[#20222a]' : 'bg-white/95 border-white shadow-2xl backdrop-blur-3xl'}`}>
            <div className={`px-6 py-5 border-b flex justify-between items-center ${themeMode === 'dark' ? 'border-[#20222a]' : 'border-slate-100'}`}>
              <h3 className={`text-base font-black flex items-center gap-2 font-serif ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                <Upload className="w-5 h-5 text-[#d4af37]" />
                <span>Upload Document to SGR Vault</span>
              </h3>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${themeMode === 'dark' ? 'text-[#9ca3af] hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="p-6 space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Select Land Parcel *</label>
                <select
                  name="parcelId"
                  required
                  defaultValue={selectedParcelForUpload || (parcels[0] ? parcels[0].id : '')}
                  className={`w-full border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#d4af37] ${
                    themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a] text-white' : 'bg-slate-50/80 border-slate-200/80 text-slate-900 shadow-inner'
                  }`}
                >
                  {parcels.map(p => (
                    <option key={p.id} value={p.id}>{p.surveyNo} - {p.projectName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Document Type *</label>
                <select
                  name="docType"
                  required
                  className={`w-full border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#d4af37] ${
                    themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a] text-white' : 'bg-slate-50/80 border-slate-200/80 text-slate-900 shadow-inner'
                  }`}
                >
                  <option value="Deed">Title Deed / Sale Deed</option>
                  <option value="EC">Encumbrance Certificate (EC)</option>
                  <option value="Survey Map">Official Survey Map / FMB</option>
                  <option value="Approval">DTCP / RERA / HMDA Approval</option>
                  <option value="Agreement">Advance / Sale Agreement</option>
                  <option value="Legal">Legal Opinion / Court Notice</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Choose File *</label>
                <input
                  type="file"
                  name="docFile"
                  required
                  className={`w-full border rounded-2xl px-4 py-3 text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#d4af37] file:text-slate-950 hover:file:bg-[#e5c158] cursor-pointer ${
                    themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a] text-slate-300' : 'bg-slate-50/80 border-slate-200/80 text-slate-700 shadow-inner'
                  }`}
                />
              </div>

              <div className={`pt-4 border-t flex justify-end space-x-3 ${themeMode === 'dark' ? 'border-[#20222a]' : 'border-slate-100'}`}>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-colors cursor-pointer ${
                    themeMode === 'dark' ? 'text-slate-300 hover:bg-[#1f222e]' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl text-sm font-black bg-[#d4af37] hover:bg-[#e5c158] text-slate-950 shadow-lg shadow-[#d4af37]/20 transition-all cursor-pointer"
                >
                  Upload & Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIEW PARCEL DETAILS ================= */}
      {viewingParcel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className={`border rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl my-8 ${themeMode === 'dark' ? 'bg-[#0b0c10] border-[#20222a]' : 'bg-white/95 border-white shadow-2xl backdrop-blur-3xl'}`}>
            
            <div className={`relative h-60 sm:h-72 overflow-hidden group ${themeMode === 'dark' ? 'bg-[#12141c]' : 'bg-slate-100'}`}>
              <img 
                src={viewingParcel.imageUrl} 
                alt={viewingParcel.surveyNo} 
                className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-500" 
                onClick={() => setFullscreenImage(viewingParcel.imageUrl)}
                title="Click to enlarge"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <button 
                onClick={() => setViewingParcel(null)}
                className="absolute top-4 right-4 bg-black/80 hover:bg-black text-white p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer border border-white/20"
              >
                <XCircle className="w-5 h-5" />
              </button>
              <div className="absolute bottom-5 left-6 right-6 flex justify-between items-end">
                <div>
                  <span className={`text-xs px-3 py-1 rounded-full font-black ${
                    viewingParcel.status === 'Available' ? 'bg-emerald-500 text-slate-950' :
                    viewingParcel.status === 'Reserved' ? 'bg-amber-500 text-slate-950' :
                    viewingParcel.status === 'Sold' ? 'bg-rose-500 text-white' : 'bg-purple-500 text-white'
                  }`}>
                    {viewingParcel.status}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mt-1.5 font-serif">{viewingParcel.surveyNo}</h3>
                  <p className="text-xs text-slate-200 font-semibold">{viewingParcel.projectName} • {viewingParcel.location}</p>
                </div>
                <button
                  onClick={() => setFullscreenImage(viewingParcel.imageUrl)}
                  className="hidden sm:flex bg-[#d4af37] text-slate-950 text-xs px-4 py-2 rounded-xl font-black shadow-lg cursor-pointer items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Enlarge Photo</span>
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6 max-h-[50vh] overflow-y-auto">
              <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl border ${
                themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a]' : 'bg-slate-50/80 border-slate-200/80 shadow-inner'
              }`}>
                <div>
                  <span className={`text-[10px] uppercase font-extrabold block ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-400'}`}>Total Area</span>
                  <span className={`text-sm sm:text-base font-black ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{viewingParcel.area} {viewingParcel.areaUnit}</span>
                </div>
                <div>
                  <span className={`text-[10px] uppercase font-extrabold block ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-400'}`}>Zoning</span>
                  <span className={`text-sm sm:text-base font-black ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{viewingParcel.zoning}</span>
                </div>
                <div>
                  <span className={`text-[10px] uppercase font-extrabold block ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-400'}`}>Facing</span>
                  <span className={`text-sm sm:text-base font-black ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{viewingParcel.facing || 'N/A'}</span>
                </div>
                <div>
                  <span className={`text-[10px] uppercase font-extrabold block ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-400'}`}>Listing Valuation</span>
                  <span className={`text-sm sm:text-base font-black ${themeMode === 'dark' ? 'text-[#f3e5ab]' : 'text-amber-900'}`}>{formatIndianCurrency(viewingParcel.price)}</span>
                </div>
              </div>

              <div>
                <h4 className={`text-xs font-black uppercase tracking-wider mb-2 ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-500'}`}>Legal Compliance & Title</h4>
                <div className={`border p-4 rounded-2xl flex items-center justify-between ${themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a]' : 'bg-white/80 border-slate-200/80 shadow-sm'}`}>
                  <span className={`text-xs sm:text-sm font-bold ${themeMode === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{viewingParcel.legalStatus}</span>
                  <ShieldCheck className="w-5 h-5 text-[#d4af37] shrink-0 ml-2" />
                </div>
              </div>

              <div>
                <h4 className={`text-xs font-black uppercase tracking-wider mb-2 ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-500'}`}>Notes & Remarks</h4>
                <p className={`text-xs sm:text-sm border p-4 rounded-2xl font-medium leading-relaxed ${
                  themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a] text-slate-300' : 'bg-white/80 border-slate-200/80 text-slate-700 shadow-sm'
                }`}>
                  {viewingParcel.notes || 'No remarks specified.'}
                </p>
              </div>

              <div>
                <h4 className={`text-xs font-black uppercase tracking-wider mb-2 ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-500'}`}>Attached Documents ({viewingParcel.documents.length})</h4>
                <div className="space-y-2.5">
                  {viewingParcel.documents.length === 0 ? (
                    <p className={`text-xs italic ${themeMode === 'dark' ? 'text-[#6b7280]' : 'text-slate-400'}`}>No files linked.</p>
                  ) : (
                    viewingParcel.documents.map((doc, idx) => (
                      <div key={idx} className={`border p-3.5 rounded-2xl flex items-center justify-between text-xs ${themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a]' : 'bg-white/80 border-slate-200/80 shadow-sm'}`}>
                        <div className="flex items-center space-x-2.5 overflow-hidden">
                          <FileText className="w-4 h-4 text-[#d4af37] shrink-0" />
                          <span className={`font-bold truncate ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{doc.name}</span>
                          <span className={`font-semibold shrink-0 ${themeMode === 'dark' ? 'text-[#9ca3af]' : 'text-slate-400'}`}>({doc.type})</span>
                        </div>
                        <button 
                          onClick={() => showToast(`Downloading simulated cloud file: ${doc.name}`)}
                          className="text-[#b8860b] hover:underline font-bold cursor-pointer shrink-0 ml-2"
                        >
                          Download
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className={`px-6 sm:px-8 py-5 border-t flex justify-end space-x-3 ${themeMode === 'dark' ? 'bg-[#12141c] border-[#20222a]' : 'bg-slate-50/80 border-slate-100'}`}>
              <button
                onClick={() => {
                  const p = viewingParcel;
                  setViewingParcel(null);
                  setEditingParcel(p);
                  setFormImageUrl(p.imageUrl);
                  setIsModalOpen(true);
                }}
                className={`px-5 py-2.5 rounded-2xl text-sm font-bold border transition-colors cursor-pointer ${
                  themeMode === 'dark' ? 'bg-[#0b0c10] hover:bg-[#1f222e] text-white border-[#374151]' : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300/80 shadow-sm'
                }`}
              >
                Edit Record
              </button>
              <button
                onClick={() => setViewingParcel(null)}
                className="px-6 py-2.5 rounded-2xl text-sm font-black bg-[#d4af37] hover:bg-[#e5c158] text-slate-950 transition-all cursor-pointer shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`border-t py-6 text-center text-xs font-semibold ${themeMode === 'dark' ? 'bg-[#0b0c10] border-[#20222a] text-[#6b7280]' : 'bg-white/60 border-slate-200/80 text-slate-400'}`}>
        <p>SGR Realty Enterprise Land Inventory Management System • All Valuations in Indian Rupees (₹) (Lakhs & Crores).</p>
      </footer>

    </div>
  );
}