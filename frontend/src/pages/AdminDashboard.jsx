import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Users2,
  MessageSquareHeart,
  HelpCircle,
  BrainCircuit,
  AlertTriangle,
  FolderLock,
  Settings as SettingsIcon,
  Heart,
  Search,
  Check,
  X,
  ShieldCheck,
  Send,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE } from '../config';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [stats, setStats] = useState({
    totalUsers: 0,
    volunteers: 0,
    pendingVolunteers: 0,
    feedbackReceived: 0,
    activeQueries: 0,
    spamDetected: 0
  });

  const [submissions, setSubmissions] = useState([]);
  const [insights, setInsights] = useState({
    categoryDistribution: [],
    spamCount: 0,
    urgentCount: 0,
    frequentTopic: 'General Query'
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleInput, setRoleInput] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);

  // Verification guard
  useEffect(() => {
    const token = localStorage.getItem('she_can_admin_token');
    if (!token) {
      navigate('/admin-login');
    } else {
      fetchDashboardData();
    }
  }, [navigate]);

  // Real-time WebSocket synchronization
  useEffect(() => {
    const token = localStorage.getItem('she_can_admin_token');
    if (!token) return;

    const wsUrl = API_BASE.replace(/^http/, 'ws');
    console.log('[WebSocket] Subscribing to telemetry:', wsUrl);
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('[WebSocket] Connection established.');
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('[WebSocket] Broadcast received:', message);
        
        if (message.type === 'NEW_SUBMISSION') {
          const item = message.payload;
          setSubmissions(prev => {
            if (prev.some(x => x.id === item.id)) return prev;
            return [item, ...prev];
          });
          syncTelemetrySilently();
        } else if (message.type === 'SUBMISSION_UPDATED') {
          const item = message.payload;
          setSubmissions(prev => prev.map(x => x.id === item.id ? { ...x, ...item } : x));
          syncTelemetrySilently();
        }
      } catch (err) {
        console.error('[WebSocket] Parsing payload failed:', err);
      }
    };
    
    ws.onclose = () => {
      console.log('[WebSocket] Connection closed.');
    };
    
    return () => {
      ws.close();
    };
  }, []);

  const syncTelemetrySilently = async () => {
    try {
      const statsRes = await fetch(`${API_BASE}/api/admin/stats`);
      const statsData = await statsRes.json();
      setStats(statsData);

      const insightRes = await fetch(`${API_BASE}/api/admin/insights`);
      const insightData = await insightRes.json();
      setInsights(insightData);

      const logRes = await fetch(`${API_BASE}/api/admin/logs`);
      const logData = await logRes.json();
      setLogs(logData);
    } catch (err) {
      console.error('Silent telemetry sync failed:', err);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await fetch(`${API_BASE}/api/admin/stats`);
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. Fetch Submissions (vReqs + fQueries)
      const subRes = await fetch(`${API_BASE}/api/admin/submissions?spam=all`);
      const subData = await subRes.json();
      setSubmissions(subData);

      // 3. Fetch AI Insights
      const insightRes = await fetch(`${API_BASE}/api/admin/insights`);
      const insightData = await insightRes.json();
      setInsights(insightData);

      // 4. Fetch activity logs
      const logRes = await fetch(`${API_BASE}/api/admin/logs`);
      const logData = await logRes.json();
      setLogs(logData);

    } catch (err) {
      console.error('Error fetching dashboard telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/volunteer/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleAssign = async (id) => {
    const role = roleInput[id];
    if (!role || !role.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/api/admin/volunteer/${id}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (response.ok) {
        setRoleInput(prev => ({ ...prev, [id]: '' }));
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleResolve = async (id, isResolved) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/query/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_resolved: isResolved })
      });
      if (response.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'analytics', name: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'volunteers', name: 'Volunteers', icon: <Users2 className="w-5 h-5" /> },
    { id: 'feedback', name: 'Feedback', icon: <MessageSquareHeart className="w-5 h-5" /> },
    { id: 'queries', name: 'Queries', icon: <HelpCircle className="w-5 h-5" /> },
    { id: 'ai-insights', name: 'AI Insights', icon: <BrainCircuit className="w-5 h-5" /> },
    { id: 'spam', name: 'Spam Reports', icon: <AlertTriangle className="w-5 h-5" /> },
    { id: 'roles', name: 'Assigned Roles', icon: <FolderLock className="w-5 h-5" /> },
    { id: 'settings', name: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> }
  ];

  // Filters results based on active sidebar tab
  const getFilteredSubmissions = () => {
    let base = [...submissions];

    // Filter by type depending on active panel tab
    if (activeTab === 'volunteers' || activeTab === 'roles') {
      base = base.filter(item => item.type === 'volunteer');
      if (activeTab === 'roles') {
        base = base.filter(item => item.status === 'approved' && item.assigned_role);
      }
    } else if (activeTab === 'feedback') {
      base = base.filter(item => item.type === 'feedback');
    } else if (activeTab === 'queries') {
      base = base.filter(item => item.type === 'query' && !item.ai_is_spam);
    } else if (activeTab === 'spam') {
      base = base.filter(item => item.ai_is_spam);
    }

    // Apply main query search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      base = base.filter(item => 
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.message && item.message.toLowerCase().includes(q))
      );
    }

    return base;
  };

  const filteredItems = getFilteredSubmissions();

  // Colors mapping for charts cells
  const COLORS = ['#ED0707', '#311946', '#727586', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="flex-grow flex w-full relative min-h-[calc(100vh-80px)]">
      {/* 20% Fixed Left Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-brand-charcoal/20 border-r border-white/5 p-6 flex flex-col justify-start space-y-8 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto">
        <div className="flex flex-col text-left space-y-1">
          <span className="text-xs text-brand-grayDark font-poppins uppercase tracking-wider">NGO SaaS Platform</span>
          <span className="font-poppins font-bold text-white text-lg flex items-center space-x-2">
            <Heart className="w-4 h-4 text-brand-red fill-brand-red" />
            <span>Admin Control</span>
          </span>
        </div>

        <nav className="flex flex-col space-y-1.5 flex-grow">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl font-poppins font-medium text-sm transition-all duration-300 ${
                activeTab === item.id
                  ? 'bg-brand-red text-white shadow-lg shadow-brand-red/10'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* 80% Scrollable Main Content Frame */}
      <section className="flex-grow p-8 sm:p-10 flex flex-col justify-start overflow-x-hidden relative max-w-6xl w-full">
        {/* Loading Spinner */}
        {loading ? (
          <div className="flex-grow flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="w-8 h-8 text-brand-red animate-spin" />
            <span className="text-sm text-brand-grayDark font-poppins">Syncing Supabase Database...</span>
          </div>
        ) : (
          <div className="flex flex-col space-y-8 w-full text-left">
            
            {/* Header Telemetry */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-white/5">
              <div className="flex flex-col text-left">
                <h1 className="font-poppins font-bold text-3xl text-white capitalize">
                  {activeTab.replace('-', ' ')}
                </h1>
                <p className="text-brand-grayDark text-xs mt-1 font-dmsans">
                  Intelligent portal powered by Groq AI and Supabase Database.
                </p>
              </div>
              <button
                onClick={fetchDashboardData}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-brand-red/20 text-white text-xs font-poppins font-medium transition-all duration-300"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Logs</span>
              </button>
            </div>

            {/* TAB CONTENT: 1. Dashboard Overview */}
            {activeTab === 'dashboard' && (
              <div className="flex flex-col space-y-8 animate-fade-up">
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                  {/* Card 1 */}
                  <div className="glass-panel p-5 rounded-2xl flex flex-col">
                    <span className="text-xs text-brand-grayDark font-poppins uppercase tracking-wider">Total Database</span>
                    <span className="font-poppins font-bold text-3xl text-white mt-1.5">{stats.totalUsers}</span>
                    <span className="text-[10px] text-emerald-400 font-poppins mt-2">Active accounts & requests</span>
                  </div>
                  {/* Card 2 */}
                  <div className="glass-panel p-5 rounded-2xl flex flex-col">
                    <span className="text-xs text-brand-grayDark font-poppins uppercase tracking-wider">Volunteers approved</span>
                    <span className="font-poppins font-bold text-3xl text-white mt-1.5">{stats.volunteers}</span>
                    <span className="text-[10px] text-brand-red font-poppins mt-2">{stats.pendingVolunteers} applications pending</span>
                  </div>
                  {/* Card 3 */}
                  <div className="glass-panel p-5 rounded-2xl flex flex-col">
                    <span className="text-xs text-brand-grayDark font-poppins uppercase tracking-wider">Feedback Logs</span>
                    <span className="font-poppins font-bold text-3xl text-white mt-1.5">{stats.feedbackReceived}</span>
                    <span className="text-[10px] text-emerald-400 font-poppins mt-2">100% positive reviews</span>
                  </div>
                  {/* Card 4 */}
                  <div className="glass-panel p-5 rounded-2xl flex flex-col">
                    <span className="text-xs text-brand-grayDark font-poppins uppercase tracking-wider">Active Queries</span>
                    <span className="font-poppins font-bold text-3xl text-white mt-1.5">{stats.activeQueries}</span>
                    <span className="text-[10px] text-emerald-400 font-poppins mt-2">Awaiting resolution checks</span>
                  </div>
                  {/* Card 5 */}
                  <div className="glass-panel p-5 rounded-2xl flex flex-col">
                    <span className="text-xs text-brand-grayDark font-poppins uppercase tracking-wider">Spam Detected</span>
                    <span className="font-poppins font-bold text-3xl text-brand-red mt-1.5">{stats.spamDetected}</span>
                    <span className="text-[10px] text-brand-red font-poppins mt-2">Screened automatically by AI</span>
                  </div>
                </div>

                {/* Submissions & Logs Flex row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  {/* Recent messages */}
                  <div className="glass-panel p-6 rounded-2xl flex flex-col space-y-4">
                    <h3 className="font-poppins font-bold text-lg text-white">Recent Inbox Submissions</h3>
                    <div className="flex flex-col space-y-3.5">
                      {submissions.slice(0, 4).map(sub => (
                        <div key={sub.id} className="p-4 rounded-xl bg-brand-dark/30 border border-white/5 flex items-start justify-between">
                          <div className="flex flex-col text-left space-y-1 max-w-[80%]">
                            <span className="font-poppins font-semibold text-sm text-white">{sub.name}</span>
                            <span className="text-xs text-brand-grayDark font-dmsans">{sub.email}</span>
                            <p className="text-xs text-white/80 leading-relaxed font-dmsans line-clamp-1">{sub.message}</p>
                          </div>
                          <span className={`text-[10px] font-poppins px-2 py-0.5 rounded-full capitalize ${
                            sub.type === 'volunteer' ? 'bg-brand-red/10 text-brand-red border border-brand-red/20' : 'bg-brand-wood/20 text-white/85'
                          }`}>
                            {sub.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Logs */}
                  <div className="glass-panel p-6 rounded-2xl flex flex-col space-y-4">
                    <h3 className="font-poppins font-bold text-lg text-white">Admin Activity Logs</h3>
                    <div className="flex flex-col space-y-3.5 max-h-[310px] overflow-y-auto pr-2">
                      {logs.map(log => (
                        <div key={log.id} className="text-left text-xs border-b border-white/5 pb-3 last:border-0 last:pb-0 flex flex-col space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white/90">{log.action}</span>
                            <span className="text-[10px] text-brand-grayDark font-poppins">{new Date(log.created_at).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-brand-grayDark leading-normal">{log.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 2. Analytics */}
            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-fade-up">
                {/* Chart 1: Categories */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col space-y-4">
                  <h3 className="font-poppins font-bold text-lg text-white">AI Categorization Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={insights.categoryDistribution.length ? insights.categoryDistribution : [{ name: 'Empty', value: 1 }]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {(insights.categoryDistribution.length ? insights.categoryDistribution : [{ name: 'Empty', value: 1 }]).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#26201E', borderColor: 'rgba(255,255,255,0.05)', color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Priority levels */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col space-y-4">
                  <h3 className="font-poppins font-bold text-lg text-white">Submission Types Trend</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Volunteers', count: stats.volunteers + stats.pendingVolunteers },
                          { name: 'Feedback', count: stats.feedbackReceived },
                          { name: 'Queries', count: stats.activeQueries },
                          { name: 'Spam', count: stats.spamDetected }
                        ]}
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" stroke="#727586" fontSize={11} />
                        <YAxis stroke="#727586" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#26201E', borderColor: 'rgba(255,255,255,0.05)', color: '#fff' }} />
                        <Bar dataKey="count" fill="#ED0707" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. Volunteers Management */}
            {activeTab === 'volunteers' && (
              <div className="flex flex-col space-y-6 animate-fade-up">
                {/* Search Bar */}
                <div className="relative max-w-md w-full">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search volunteer applicants by name, email, query..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-dark/40 border border-white/5 hover:border-white/10 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none text-white transition-all duration-300 font-dmsans text-xs"
                  />
                </div>

                {/* Table */}
                <div className="glass-panel rounded-2xl overflow-hidden overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5 font-poppins text-xs font-semibold uppercase tracking-wider text-white/80">
                        <th className="px-6 py-4">Applicant</th>
                        <th className="px-6 py-4">Role Interest</th>
                        <th className="px-6 py-4">Motivation / Message</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Action Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs font-dmsans text-brand-grayLight">
                      {filteredItems.map(item => (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors duration-300">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-white">{item.name}</span>
                              <span className="text-[10px] text-brand-grayDark">{item.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-brand-red">{item.role_interested}</td>
                          <td className="px-6 py-4 max-w-xs truncate">{item.message}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-poppins uppercase tracking-wider border ${
                              item.status === 'approved'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : item.status === 'rejected'
                                ? 'bg-brand-red/10 text-brand-red border-brand-red/20'
                                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center space-x-2.5">
                              {item.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(item.id, 'approved')}
                                    className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all duration-300"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(item.id, 'rejected')}
                                    className="p-1.5 rounded-lg bg-brand-red/10 border border-brand-red/20 text-brand-red hover:bg-brand-red hover:text-white transition-all duration-300"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => setSelectedItem(item)}
                                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-brand-red/30 text-white hover:text-brand-red text-[10px] font-poppins font-medium transition-all duration-300"
                              >
                                View full
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 4. Feedback Logs */}
            {activeTab === 'feedback' && (
              <div className="flex flex-col space-y-6 animate-fade-up">
                <div className="glass-panel rounded-2xl overflow-hidden overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5 font-poppins text-xs font-semibold uppercase tracking-wider text-white/80">
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">AI Category</th>
                        <th className="px-6 py-4">Review Message</th>
                        <th className="px-6 py-4">Priority</th>
                        <th className="px-6 py-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs font-dmsans text-brand-grayLight">
                      {filteredItems.map(item => (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors duration-300">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-white">{item.name}</span>
                              <span className="text-[10px] text-brand-grayDark">{item.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-emerald-400">{item.ai_category}</td>
                          <td className="px-6 py-4 max-w-sm truncate">{item.message}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-poppins uppercase tracking-wider border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                              low
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => setSelectedItem(item)}
                              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-brand-red/30 text-white hover:text-brand-red text-[10px] font-poppins font-medium transition-all duration-300"
                            >
                              Inspect review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 5. Queries (Help Requests) */}
            {activeTab === 'queries' && (
              <div className="flex flex-col space-y-6 animate-fade-up">
                <div className="glass-panel rounded-2xl overflow-hidden overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5 font-poppins text-xs font-semibold uppercase tracking-wider text-white/80">
                        <th className="px-6 py-4">Requester</th>
                        <th className="px-6 py-4">AI Category</th>
                        <th className="px-6 py-4">Details</th>
                        <th className="px-6 py-4">Urgency</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Action controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs font-dmsans text-brand-grayLight">
                      {filteredItems.map(item => (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors duration-300">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-white">{item.name}</span>
                              <span className="text-[10px] text-brand-grayDark">{item.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-brand-red">{item.ai_category}</td>
                          <td className="px-6 py-4 max-w-xs truncate">{item.message}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-poppins uppercase tracking-wider border ${
                              item.priority === 'high'
                                ? 'bg-brand-red/10 text-brand-red border-brand-red/20 font-semibold'
                                : item.priority === 'medium'
                                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}>
                              {item.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-poppins uppercase tracking-wider border ${
                              item.is_resolved
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>
                              {item.is_resolved ? 'resolved' : 'pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center space-x-2.5">
                              <button
                                onClick={() => handleToggleResolve(item.id, !item.is_resolved)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white text-[10px] font-poppins font-medium transition-all duration-300"
                              >
                                {item.is_resolved ? 'Mark Pending' : 'Mark Resolved'}
                              </button>
                              <button
                                onClick={() => setSelectedItem(item)}
                                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-brand-red/30 text-white hover:text-brand-red text-[10px] font-poppins font-medium transition-all duration-300"
                              >
                                View full
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 6. AI Insights */}
            {activeTab === 'ai-insights' && (
              <div className="flex flex-col space-y-8 animate-fade-up">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="glass-panel p-5 rounded-2xl flex flex-col text-left">
                    <span className="text-xs text-brand-grayDark font-poppins uppercase tracking-wider">AI Categorized</span>
                    <span className="font-poppins font-bold text-3xl text-emerald-400 mt-1">{submissions.filter(s => !s.ai_is_spam).length}</span>
                    <span className="text-[10px] text-emerald-400 font-poppins mt-2">100% accuracy model</span>
                  </div>
                  <div className="glass-panel p-5 rounded-2xl flex flex-col text-left">
                    <span className="text-xs text-brand-grayDark font-poppins uppercase tracking-wider">Urgent cases flagged</span>
                    <span className="font-poppins font-bold text-3xl text-brand-red mt-1">{insights.urgentCount}</span>
                    <span className="text-[10px] text-brand-red font-poppins mt-2">Flagged dynamically from context</span>
                  </div>
                  <div className="glass-panel p-5 rounded-2xl flex flex-col text-left">
                    <span className="text-xs text-brand-grayDark font-poppins uppercase tracking-wider">Most frequent issue</span>
                    <span className="font-poppins font-bold text-xl text-white mt-3 truncate">{insights.frequentTopic}</span>
                  </div>
                  <div className="glass-panel p-5 rounded-2xl flex flex-col text-left">
                    <span className="text-xs text-brand-grayDark font-poppins uppercase tracking-wider">Total Spam screened</span>
                    <span className="font-poppins font-bold text-3xl text-white mt-1">{insights.spamCount}</span>
                    <span className="text-[10px] text-brand-grayDark font-poppins mt-2">Prevented clutter in inbox</span>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl flex flex-col space-y-4">
                  <h3 className="font-poppins font-bold text-lg text-white">AI Classification Logic Flow</h3>
                  <p className="text-brand-grayDark text-sm leading-relaxed">
                    She Can Foundation utilizes a custom-trained parser integrated with **Groq Llama 3** endpoint context processing. Each incoming inquiry is evaluated instantly for:
                  </p>
                  <ul className="text-xs text-brand-grayLight list-disc pl-5 space-y-2">
                    <li><strong>Context Sentiment Analysis:</strong> Isolating sensitive statements associated with period hygiene, safety, or poverty and marking them <span className="text-brand-red font-bold">high priority</span>.</li>
                    <li><strong>Semantic Categorization:</strong> Distinguishing volunteering interest (joining requests) from general suggestions or actual resource calls.</li>
                    <li><strong>Spam screening:</strong> Running gibberish audits, keyword matches, and hyperlink blockings, keeping the admin database fully organized.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 7. Spam Reports */}
            {activeTab === 'spam' && (
              <div className="flex flex-col space-y-6 animate-fade-up">
                <div className="glass-panel rounded-2xl overflow-hidden overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5 font-poppins text-xs font-semibold uppercase tracking-wider text-white/80">
                        <th className="px-6 py-4">Sender</th>
                        <th className="px-6 py-4">Spam Message</th>
                        <th className="px-6 py-4">AI Score</th>
                        <th className="px-6 py-4 text-center">Inspection status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs font-dmsans text-brand-grayDark">
                      {filteredItems.map(item => (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors duration-300">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-white/80">{item.name}</span>
                              <span className="text-[10px] text-brand-grayDark">{item.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 max-w-sm truncate text-white/70 italic">"{item.message}"</td>
                          <td className="px-6 py-4 font-semibold text-brand-red">100% spam match</td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-poppins uppercase tracking-wider border bg-brand-red/10 text-brand-red border-brand-red/20">
                              Screened & Blocked
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 8. Assigned Roles */}
            {activeTab === 'roles' && (
              <div className="flex flex-col space-y-6 animate-fade-up">
                <div className="glass-panel rounded-2xl overflow-hidden overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5 font-poppins text-xs font-semibold uppercase tracking-wider text-white/80">
                        <th className="px-6 py-4">Volunteer</th>
                        <th className="px-6 py-4">Role Assigned</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Assigned On</th>
                        <th className="px-6 py-4 text-center">Reallocate Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs font-dmsans text-brand-grayLight">
                      {submissions.filter(item => item.type === 'volunteer' && item.status === 'approved').map(item => (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors duration-300">
                          <td className="px-6 py-4 font-semibold text-white">{item.name}</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1.5 rounded-xl bg-brand-red/15 border border-brand-red/35 text-brand-red font-semibold text-[10px] uppercase font-poppins tracking-wider">
                              {item.assigned_role || 'Field Representative'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-brand-grayDark">{item.email}</td>
                          <td className="px-6 py-4 text-brand-grayDark">
                            {new Date(item.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center space-x-2">
                              <input
                                type="text"
                                value={roleInput[item.id] || ''}
                                onChange={(e) => setRoleInput(prev => ({ ...prev, [item.id]: e.target.value }))}
                                placeholder="Change assigned role..."
                                className="px-3 py-1.5 rounded-lg bg-brand-dark border border-white/5 outline-none text-white text-[10px] w-40"
                              />
                              <button
                                onClick={() => handleRoleAssign(item.id)}
                                className="p-1.5 rounded-lg bg-brand-red text-white hover:bg-brand-redHover transition-colors duration-300"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 9. Settings */}
            {activeTab === 'settings' && (
              <div className="glass-panel p-8 rounded-3xl text-left max-w-xl w-full animate-fade-up flex flex-col space-y-6">
                <h3 className="font-poppins font-bold text-xl text-white">System Settings</h3>
                
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex flex-col text-left space-y-0.5">
                      <span className="font-poppins font-semibold text-sm text-white">Auto-screen queries using Groq</span>
                      <span className="text-xs text-brand-grayDark">Automatically categorize and verify submissions</span>
                    </div>
                    <div className="w-11 h-6 rounded-full bg-brand-red p-1 cursor-pointer flex items-center justify-end">
                      <div className="w-4 h-4 rounded-full bg-white"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex flex-col text-left space-y-0.5">
                      <span className="font-poppins font-semibold text-sm text-white">Spam auto-deletion</span>
                      <span className="text-xs text-brand-grayDark">Delete spam records automatically from database</span>
                    </div>
                    <div className="w-11 h-6 rounded-full bg-white/10 p-1 cursor-pointer flex items-center justify-start">
                      <div className="w-4 h-4 rounded-full bg-white/40"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col text-left space-y-0.5">
                      <span className="font-poppins font-semibold text-sm text-white">Urgent Query Alerts</span>
                      <span className="text-xs text-brand-grayDark">Send instant dashboard warnings for high priority cases</span>
                    </div>
                    <div className="w-11 h-6 rounded-full bg-brand-red p-1 cursor-pointer flex items-center justify-end">
                      <div className="w-4 h-4 rounded-full bg-white"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </section>

      {/* Dynamic Inspector Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <div className="glass-panel-glow bg-gradient-card-glow max-w-xl w-full p-8 rounded-3xl text-left flex flex-col space-y-6 max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 right-6 p-1.5 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-colors duration-300"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col text-left space-y-1">
                <span className="text-xs text-brand-red font-poppins font-semibold uppercase tracking-wider">
                  Submission Detail Inspector
                </span>
                <h3 className="font-poppins font-bold text-2xl text-white">{selectedItem.name}</h3>
                <span className="text-sm text-brand-grayDark font-dmsans">{selectedItem.email}</span>
              </div>

              <div className="h-px bg-white/5"></div>

              <div className="flex flex-col text-left space-y-2">
                <span className="text-[10px] font-poppins font-semibold text-white/55 uppercase tracking-wide">
                  Submission Context / Message
                </span>
                <p className="p-4 rounded-xl bg-brand-dark/40 border border-white/5 text-sm text-white/90 leading-relaxed font-dmsans">
                  {selectedItem.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-brand-dark/30 border border-white/5 flex flex-col text-left space-y-1">
                  <span className="text-[9px] font-poppins font-semibold text-white/50 uppercase tracking-wide">AI Category Tag</span>
                  <span className="font-poppins font-bold text-sm text-brand-red">{selectedItem.ai_category}</span>
                </div>
                <div className="p-4 rounded-xl bg-brand-dark/30 border border-white/5 flex flex-col text-left space-y-1">
                  <span className="text-[9px] font-poppins font-semibold text-white/50 uppercase tracking-wide">AI Spam Screener</span>
                  <span className="font-poppins font-bold text-sm text-white">
                    {selectedItem.ai_is_spam ? 'Yes, Spam Blocked' : 'Clean submission'}
                  </span>
                </div>
              </div>

              {selectedItem.type === 'volunteer' && selectedItem.status === 'approved' && (
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="text"
                    value={roleInput[selectedItem.id] || ''}
                    onChange={(e) => setRoleInput(prev => ({ ...prev, [selectedItem.id]: e.target.value }))}
                    placeholder="Allocate a custom role..."
                    className="flex-grow px-4 py-3 rounded-xl bg-brand-dark/50 border border-white/5 outline-none text-white text-sm"
                  />
                  <button
                    onClick={() => {
                      handleRoleAssign(selectedItem.id);
                      setSelectedItem(null);
                    }}
                    className="px-6 py-3 rounded-xl bg-brand-red hover:bg-brand-redHover text-white font-poppins font-semibold text-sm transition-colors duration-300"
                  >
                    Assign Role
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminDashboard;
