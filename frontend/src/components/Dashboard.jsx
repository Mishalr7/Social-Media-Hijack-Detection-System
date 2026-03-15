import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiShield, FiAlertTriangle, FiActivity, FiMapPin, FiMonitor, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import AlertPanel from './AlertPanel';

function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        
        const [logsResponse, alertsResponse] = await Promise.all([
          axios.get(`${apiUrl}/api/logs`, config),
          axios.get(`${apiUrl}/api/alerts`, config)
        ]);

        setLogs(logsResponse.data);
        setAlerts(alertsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getRiskColor = (score) => {
    if (score >= 60) return 'text-red-500 bg-red-500/10 border-red-500/20';
    if (score >= 30) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    return 'text-green-500 bg-green-500/10 border-green-500/20';
  };

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-[#16161f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <FiShield className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent hidden sm:block">
                Security Sentinel
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all border border-gray-700 hover:border-gray-600 flex items-center gap-2 text-sm font-medium"
            >
              <FiLogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1a1a24] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FiActivity className="w-24 h-24 text-indigo-500" />
            </div>
            <h3 className="text-gray-400 font-medium mb-1">Total Logins</h3>
            <p className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {logs.length}
            </p>
          </div>

          <div className="bg-[#1a1a24] border border-red-900/30 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FiAlertTriangle className="w-24 h-24 text-red-500" />
            </div>
            <h3 className="text-red-400/80 font-medium mb-1 flex items-center gap-2">
              Suspicious Alerts <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            </h3>
            <p className="text-4xl font-bold text-white">
              {alerts.length}
            </p>
          </div>
          
          <div className="bg-[#1a1a24] border border-gray-800 rounded-2xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
              <FiShield className="w-24 h-24 text-green-500" />
            </div>
            <h3 className="text-gray-400 font-medium mb-1">System Status</h3>
            <p className="text-2xl font-bold text-emerald-400 mt-2 flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Actively Monitoring
            </p>
          </div>
        </div>

        {/* content grids */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Logins Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FiActivity className="text-indigo-400" /> Login History
              </h2>
            </div>
            
            <div className="bg-[#1a1a24] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                  <thead className="text-xs uppercase bg-[#22222f] text-gray-300 border-b border-gray-800">
                    <tr>
                      <th className="px-6 py-4 font-semibold tracking-wider">Time</th>
                      <th className="px-6 py-4 font-semibold tracking-wider">Location</th>
                      <th className="px-6 py-4 font-semibold tracking-wider">Device/IP</th>
                      <th className="px-6 py-4 w-24 font-semibold tracking-wider text-center">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {loading ? (
                      <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500">Loading data...</td></tr>
                    ) : logs.length === 0 ? (
                      <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500">No login history found.</td></tr>
                    ) : (
                      logs.map((log, idx) => (
                        <tr key={idx} className="hover:bg-[#252533] transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-gray-300">
                              <FiClock className="w-4 h-4 text-gray-500" />
                              {log.timestamp ? format(new Date(log.timestamp), 'MMM dd, HH:mm:ss') : 'Unknown'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <FiMapPin className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 transition-colors" />
                              <span className="font-medium text-gray-300">{log.location || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-gray-300 font-mono text-xs mb-1 flex items-center gap-1">
                                {log.ip_address}
                              </span>
                              <span className="text-gray-500 flex items-center gap-1 text-xs truncate max-w-[200px]" title={log.device}>
                                <FiMonitor className="w-3 h-3 flex-shrink-0" />
                                {log.device || 'Unknown Device'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`px-2.5 py-1 rounded-md text-xs font-bold border text-center ${getRiskColor(log.risk_score)}`}>
                              {log.risk_score}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <AlertPanel alerts={alerts} loading={loading} />
          
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
