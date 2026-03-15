import React from 'react';
import { FiAlertTriangle, FiShield } from 'react-icons/fi';
import { format } from 'date-fns';

function AlertPanel({ alerts, loading }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2 text-red-400">
        <FiAlertTriangle /> Security Alerts
      </h2>
      
      <div className="bg-[#1a1a24] border border-gray-800 rounded-2xl p-2 min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500 py-20">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 py-20 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
              <FiShield className="w-8 h-8 text-emerald-500/50" />
            </div>
            <p>No suspicious activities detected.</p>
            <p className="text-sm mt-1">Your account is safe.</p>
          </div>
        ) : (
          <div className="space-y-3 p-2">
            {alerts.map((alert, idx) => (
              <div key={idx} className="bg-red-950/20 border border-red-900/40 rounded-xl p-4 hover:border-red-500/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400">
                    Risk Score: {alert.risk_score}
                  </span>
                  <span className="text-xs text-gray-500">
                    {alert.timestamp ? format(new Date(alert.timestamp), 'HH:mm') : ''}
                  </span>
                </div>
                <h4 className="text-gray-200 font-medium text-sm mb-3">
                  Suspicious login from <span className="text-white font-bold">{alert.location}</span>
                </h4>
                <div className="space-y-1">
                  <div className="text-xs text-gray-400 flex justify-between">
                    <span>IP:</span> <span className="text-gray-300 font-mono">{alert.ip_address}</span>
                  </div>
                  <div className="text-xs text-gray-400 flex justify-between gap-4">
                    <span>Device:</span> <span className="text-gray-300 text-right truncate">{alert.device}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AlertPanel;
