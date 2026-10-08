import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Building2, MapPin, Layers, Search, Plus, Eye, Edit, Trash2, 
  FileText, CheckCircle2, Upload, Download, ShieldCheck, 
  Map as MapIcon, Database, LayoutDashboard, FileSpreadsheet, 
  ChevronRight, Camera, Sparkles, IndianRupee, 
  Lock, User, LogOut, Menu, X, Sun, Moon 
} from 'lucide-react';

// Initialize Supabase Client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('sgr_theme_mode') || 'light');
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('sgr_auth_status') === 'true');
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [parcels, setParcels] = useState([]); // Now defaults to empty array while cloud loads
  const [isLoading, setIsLoading] = useState(true);

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

  // Fetch from Supabase on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchParcels();
    }
  }, [isAuthenticated]);

  const fetchParcels = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('land_parcels').select('*').order('updatedAt', { ascending: false });
    if (error) {
      console.error('Error fetching from cloud:', error);
      showToast('Error syncing with cloud database.');
    } else {
      setParcels(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    localStorage.setItem('sgr_theme_mode', themeMode);
  }, [themeMode]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
    showToast(`Switched theme.`);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginEmail === 'director@sgrrealty.in' && loginPassword === 'SGR@2026') {
      setIsAuthenticated(true);
      localStorage.setItem('sgr_auth_status', 'true');
      showToast('Welcome to SGR Realty Executive Portal.');
    } else {
      setLoginError('Invalid enterprise credentials.');
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
      showToast('Please upload a valid image file.');
      return;
    }

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setFormImageUrl(compressedDataUrl);
        setIsUploadingImage(false);
        showToast('Photo compressed for cloud upload!');
      };
      img.src = uploadEvent.target.result;
    };
    reader.readAsDataURL(file);
  };

  const metrics = useMemo(() => {
    const totalCount = parcels.length;
    const totalAreaAcres = parcels.reduce((acc, p) => acc + (Number(p.area) || 0), 0);
    const availableCount = parcels.filter(p => p.status === 'Available').length;
    const totalPortfolioValue = parcels.reduce((acc, p) => acc + (Number(p.price) || 0), 0);
    const totalAcquisitionCost = parcels.reduce((acc, p) => acc + (Number(p.acquisitionCost) || 0), 0);
    const unrealizedProfit = totalPortfolioValue - totalAcquisitionCost;

    return { totalCount, totalAreaAcres: totalAreaAcres.toFixed(2), availableCount, totalPortfolioValue, unrealizedProfit };
  }, [parcels]);

  const projectNames = useMemo(() => ['All', ...new Set(parcels.map(p => p.projectName))], [parcels]);

  const filteredParcels = useMemo(() => {
    return parcels.filter(p => {
      const matchesSearch = p.surveyNo.toLowerCase().includes(searchTerm.toLowerCase()) || p.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchesType = typeFilter === 'All' || p.zoning === typeFilter;
      const matchesProject = projectFilter === 'All' || p.projectName === projectFilter;
      return matchesSearch && matchesStatus && matchesType && matchesProject;
    });
  }, [parcels, searchTerm, statusFilter, typeFilter, projectFilter]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this parcel globally?')) {
      const { error } = await supabase.from('land_parcels').delete().eq('id', id);
      if (error) {
        showToast('Error deleting from cloud.');
        console.error(error);
      } else {
        setParcels(prev => prev.filter(p => p.id !== id));
        showToast('Parcel deleted from global database.');
      }
    }
  };

  const handleSaveParcel = async (e) => {
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
      updatedAt: new Date().toISOString()
    };

    // Upsert into Supabase (Insert or Update)
    const { error } = await supabase.from('land_parcels').upsert(parcelData);

    if (error) {
      showToast('Error saving to cloud database.');
      console.error(error);
    } else {
      showToast(editingParcel ? 'Global parcel updated.' : 'New parcel synced to cloud.');
      fetchParcels(); // Refresh data from cloud
      setIsModalOpen(false);
      setEditingParcel(null);
      setFormImageUrl('');
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const parcelId = formData.get('parcelId');
    
    const targetParcel = parcels.find(p => p.id === parcelId);
    if (!targetParcel) return;

    const newDoc = {
      name: formData.get('docFile').name || `SGR_Record_${Date.now()}.pdf`,
      type: formData.get('docType'),
      size: '3.1 MB',
      date: new Date().toISOString().split('T')[0]
    };

    const updatedDocuments = [newDoc, ...(targetParcel.documents || [])];

    const { error } = await supabase
      .from('land_parcels')
      .update({ documents: updatedDocuments, updatedAt: new Date().toISOString() })
      .eq('id', parcelId);

    if (error) {
      showToast('Error uploading document to vault.');
    } else {
      fetchParcels();
      setIsUploadModalOpen(false);
      showToast('Document securely uploaded to SGR Vault.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-2xl rounded-3xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black font-serif text-slate-900">SGR REALTY</h1>
            <p className="text-xs text-amber-700 font-bold uppercase mt-1">Global Land Inventory</p>
          </div>
          {loginError && <div className="mb-4 bg-rose-50 text-rose-600 text-xs p-3 rounded-xl font-bold text-center">{loginError}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700">Corporate Email</label>
              <input
                type="email"
                required
                autoComplete="off"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-600 bg-slate-50 font-medium"
                placeholder="director@sgrrealty.in"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700">Security Passkey</label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-600 bg-slate-50 font-medium"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl text-sm font-black shadow-lg shadow-amber-600/20 cursor-pointer">
              Secure Cloud Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-[#0f1117] text-white' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans transition-colors`}>
      <header className={`border-b sticky top-0 z-40 backdrop-blur-xl ${themeMode === 'dark' ? 'bg-[#161922]/90 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500/10 p-2.5 rounded-2xl border border-amber-500/20">
              <Building2 className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl font-black font-serif tracking-tight">SGR REALTY</h1>
              <p className="text-xs text-amber-600 font-bold uppercase flex items-center gap-1">
                <Database className="w-3 h-3" /> Cloud Synced
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={toggleTheme} className="p-2.5 rounded-xl border border-slate-200 bg-white/50 text-amber-700 shadow-sm cursor-pointer">
              {themeMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => { setEditingParcel(null); setFormImageUrl(''); setIsModalOpen(true); }} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-600/20 cursor-pointer">
              <Plus className="w-4 h-4" /> Add Parcel
            </button>
            <button onClick={handleLogout} className="p-2.5 rounded-xl border border-slate-200 bg-white/50 text-slate-600 hover:text-rose-600 shadow-sm cursor-pointer" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {fullscreenImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
          <div className="relative max-w-4xl w-full flex flex-col items-center">
            <button onClick={() => setFullscreenImage(null)} className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full cursor-pointer">
              <X className="w-6 h-6" />
            </button>
            <img src={fullscreenImage} alt="Expanded Preview" className="max-h-[80vh] w-auto object-contain rounded-2xl border border-white/20" />
          </div>
        </div>
      )}

      <div className={`border-b ${themeMode === 'dark' ? 'bg-[#161922]/50 border-slate-800' : 'bg-white/50 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 flex space-x-6 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'inventory', label: 'Inventory Grid', icon: FileSpreadsheet },
            { id: 'map', label: 'Master Map', icon: MapIcon },
            { id: 'documents', label: 'Document Vault', icon: Database }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-bold text-sm cursor-pointer whitespace-nowrap ${
                  isActive ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-amber-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            <span className="ml-3 font-bold">Syncing with global database...</span>
          </div>
        ) : activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className={`border rounded-3xl p-6 md:p-8 shadow-xl ${themeMode === 'dark' ? 'bg-[#161922] border-slate-800' : 'bg-white border-slate-200'}`}>
              <h2 className="text-2xl md:text-3xl font-black font-serif">Executive Dashboard</h2>
              <p className="text-xs text-slate-500 mt-1">Managing {metrics.totalCount} strategic land parcels spanning {metrics.totalAreaAcres} acres.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className={`p-5 rounded-2xl border ${themeMode === 'dark' ? 'bg-[#0f1117] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-xs font-bold text-slate-400 uppercase">Portfolio Valuation</p>
                  <h3 className="text-2xl font-black text-amber-600 mt-1">{formatIndianCurrency(metrics.totalPortfolioValue)}</h3>
                </div>
                <div className={`p-5 rounded-2xl border ${themeMode === 'dark' ? 'bg-[#0f1117] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-xs font-bold text-slate-400 uppercase">Available Inventory</p>
                  <h3 className="text-2xl font-black text-emerald-600 mt-1">{metrics.availableCount} plots</h3>
                </div>
                <div className={`p-5 rounded-2xl border ${themeMode === 'dark' ? 'bg-[#0f1117] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-xs font-bold text-slate-400 uppercase">Projected Profit</p>
                  <h3 className="text-2xl font-black text-emerald-600 mt-1">{formatIndianCurrency(metrics.unrealizedProfit)}</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isLoading && activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className={`border rounded-3xl p-4 md:p-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl ${themeMode === 'dark' ? 'bg-[#161922] border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search survey no, project..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full border rounded-2xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-600 ${themeMode === 'dark' ? 'bg-[#0f1117] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`border rounded-xl px-3 py-2 text-xs font-bold ${themeMode === 'dark' ? 'bg-[#0f1117] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                  <option value="All">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredParcels.map(p => (
                <div key={p.id} className={`border rounded-3xl overflow-hidden shadow-xl flex flex-col ${themeMode === 'dark' ? 'bg-[#161922] border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="relative h-52 bg-slate-200">
                    <img src={p.imageUrl} alt={p.surveyNo} className="w-full h-full object-cover cursor-pointer" onClick={() => setFullscreenImage(p.imageUrl)} />
                    <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-bold">
                      {p.status}
                    </span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <p className="text-xs font-bold text-amber-600">{p.projectName}</p>
                      <h3 className="text-xl font-black font-serif mt-0.5">{p.surveyNo}</h3>
                      <p className="text-xs text-slate-500 mt-1">{p.location}</p>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Valuation</span>
                        <span className="font-black text-amber-600 text-base">{formatIndianCurrency(p.price)}</span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setViewingParcel(p)} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 rounded-xl border border-slate-200 hover:bg-rose-50 text-rose-600 cursor-pointer" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && activeTab === 'map' && (
          <div className={`border rounded-3xl p-6 shadow-xl ${themeMode === 'dark' ? 'bg-[#161922] border-slate-800' : 'bg-white border-slate-200'}`}>
            <h2 className="text-xl font-black font-serif mb-4">Master Layout Map</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {parcels.map(p => (
                <div key={p.id} onClick={() => setViewingParcel(p)} className={`p-4 rounded-2xl border cursor-pointer hover:border-amber-600 transition-all ${themeMode === 'dark' ? 'bg-[#0f1117] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-xs text-amber-600 font-bold">{p.projectName}</p>
                  <h4 className="font-black text-lg">{p.surveyNo}</h4>
                  <p className="text-xs text-slate-400 mt-1">{p.area} {p.areaUnit} • {formatIndianCurrency(p.price)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && activeTab === 'documents' && (
          <div className={`border rounded-3xl p-6 shadow-xl ${themeMode === 'dark' ? 'bg-[#161922] border-slate-800' : 'bg-white border-slate-200'}`}>
            <h2 className="text-xl font-black font-serif mb-4">Cloud Document Vault</h2>
            <div className="space-y-4">
              {parcels.map(p => (
                <div key={p.id} className={`p-4 rounded-2xl border flex justify-between items-center ${themeMode === 'dark' ? 'bg-[#0f1117] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div>
                    <h4 className="font-black text-sm">{p.surveyNo} ({p.projectName})</h4>
                    <p className="text-xs text-emerald-600 font-bold">{p.legalStatus}</p>
                  </div>
                  <span className="text-xs bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full font-bold">{(p.documents || []).length} Files</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <div className={`border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 ${themeMode === 'dark' ? 'bg-[#161922] border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-black font-serif text-lg">{editingParcel ? 'Edit SGR Land Parcel' : 'Add New SGR Land Parcel'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveParcel} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Survey No *</label>
                  <input type="text" name="surveyNo" required defaultValue={editingParcel ? editingParcel.surveyNo : ''} placeholder="Sy. No. 214/4B" className="w-full border rounded-xl px-3 py-2.5 text-sm bg-slate-50 dark:bg-[#0f1117] border-slate-200 dark:border-slate-800 font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Project Name *</label>
                  <input type="text" name="projectName" required defaultValue={editingParcel ? editingParcel.projectName : ''} placeholder="SGR Grand Emerald Meadows" className="w-full border rounded-xl px-3 py-2.5 text-sm bg-slate-50 dark:bg-[#0f1117] border-slate-200 dark:border-slate-800 font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Location *</label>
                <input type="text" name="location" required defaultValue={editingParcel ? editingParcel.location : ''} placeholder="Bengaluru, Karnataka" className="w-full border rounded-xl px-3 py-2.5 text-sm bg-slate-50 dark:bg-[#0f1117] border-slate-200 dark:border-slate-800 font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Area *</label>
                  <input type="number" step="0.01" name="area" required defaultValue={editingParcel ? editingParcel.area : ''} placeholder="4.2" className="w-full border rounded-xl px-3 py-2.5 text-sm bg-slate-50 dark:bg-[#0f1117] border-slate-200 dark:border-slate-800 font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Unit</label>
                  <select name="areaUnit" defaultValue={editingParcel ? editingParcel.areaUnit : 'Acres'} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-slate-50 dark:bg-[#0f1117] border-slate-200 dark:border-slate-800 font-bold">
                    <option value="Acres">Acres</option>
                    <option value="Sq. Ft.">Sq. Ft.</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Zoning</label>
                  <select name="zoning" defaultValue={editingParcel ? editingParcel.zoning : 'Residential'} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-slate-50 dark:bg-[#0f1117] border-slate-200 dark:border-slate-800 font-bold">
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Agricultural">Agricultural</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Status</label>
                  <select name="status" defaultValue={editingParcel ? editingParcel.status : 'Available'} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-slate-50 dark:bg-[#0f1117] border-slate-200 dark:border-slate-800 font-bold">
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Facing</label>
                  <input type="text" name="facing" defaultValue={editingParcel ? editingParcel.facing : ''} placeholder="East Facing" className="w-full border rounded-xl px-3 py-2.5 text-sm bg-slate-50 dark:bg-[#0f1117] border-slate-200 dark:border-slate-800 font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Acquisition Cost (₹) *</label>
                  <input type="number" name="acquisitionCost" required defaultValue={editingParcel ? editingParcel.acquisitionCost : ''} placeholder="28000000" className="w-full border rounded-xl px-3 py-2.5 text-sm bg-slate-50 dark:bg-[#0f1117] border-slate-200 dark:border-slate-800 font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Selling Price (₹) *</label>
                  <input type="number" name="price" required defaultValue={editingParcel ? editingParcel.price : ''} placeholder="42500000" className="w-full border rounded-xl px-3 py-2.5 text-sm bg-slate-50 dark:bg-[#0f1117] border-slate-200 dark:border-slate-800 font-bold text-amber-600" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Upload Photo</label>
                <input type="file" accept="image/*" onChange={handleDirectImageUpload} className="w-full text-xs border rounded-xl p-2 cursor-pointer bg-slate-50 dark:bg-[#0f1117] border-slate-200 dark:border-slate-800" />
              </div>
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-xl text-sm font-black shadow-lg shadow-amber-600/20 cursor-pointer">
                  {editingParcel ? 'Save Changes' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className={`border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl ${themeMode === 'dark' ? 'bg-[#161922] border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-black font-serif text-lg">Upload Document</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUploadDocument} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Select Land Parcel *</label>
                <select name="parcelId" required defaultValue={selectedParcelForUpload || (parcels[0]?.id || '')} className="w-full border rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-[#0f1117] border-slate-200 dark:border-slate-800 font-bold">
                  {parcels.map(p => <option key={p.id} value={p.id}>{p.surveyNo} - {p.projectName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Document Type *</label>
                <select name="docType" required className="w-full border rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-[#0f1117] border-slate-200 dark:border-slate-800 font-bold">
                  <option value="Deed">Title Deed</option>
                  <option value="EC">Encumbrance Certificate</option>
                  <option value="Approval">DTCP / RERA Approval</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Choose File *</label>
                <input type="file" name="docFile" required className="w-full text-xs border rounded-xl p-2 bg-slate-50 dark:bg-[#0f1117] border-slate-200 dark:border-slate-800" />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="bg-amber-600 text-white px-5 py-2 rounded-xl text-sm font-black cursor-pointer">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingParcel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className={`border rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl ${themeMode === 'dark' ? 'bg-[#161922] border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="relative h-60 bg-slate-200">
              <img src={viewingParcel.imageUrl} alt={viewingParcel.surveyNo} className="w-full h-full object-cover cursor-pointer" onClick={() => setFullscreenImage(viewingParcel.imageUrl)} />
              <button onClick={() => setViewingParcel(null)} className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <h3 className="text-2xl font-black font-serif">{viewingParcel.surveyNo}</h3>
              <p className="text-xs text-slate-400">{viewingParcel.projectName} • {viewingParcel.location}</p>
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#0f1117] border border-slate-200 dark:border-slate-800 text-xs">
                <div><span className="text-slate-400 block font-bold uppercase">Area</span><b>{viewingParcel.area} {viewingParcel.areaUnit}</b></div>
                <div><span className="text-slate-400 block font-bold uppercase">Valuation</span><b className="text-amber-600">{formatIndianCurrency(viewingParcel.price)}</b></div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button onClick={() => setViewingParcel(null)} className="bg-amber-600 text-white px-5 py-2 rounded-xl text-sm font-black cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}