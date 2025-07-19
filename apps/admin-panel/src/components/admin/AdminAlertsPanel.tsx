
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';

interface AdminAlertsPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const AdminAlertsPanel = ({ isVisible, onClose }: AdminAlertsPanelProps) => {
  if (!isVisible) return null;

  const alerts = [
    { status: 'Critical', user: 'John Doe', helpers: 2, statusColor: 'bg-sos-red', time: '2m ago' },
    { status: 'Active', user: 'Alice Smith', helpers: 1, statusColor: 'bg-yellow-400', time: '5m ago' },
    { status: 'Responding', user: 'Robert Johnson', helpers: 3, statusColor: 'bg-sos-cyan', time: '8m ago' }
  ];

  return (
    <div className="floating-panel top-20 right-6 w-96">
      <div className="bg-black/80 backdrop-blur-md border border-sos-cyan/30 rounded-lg overflow-hidden shadow-lg shadow-sos-cyan/10">
        <div className="bg-sos-cyan/10 p-4 border-b border-sos-cyan/30 flex justify-between items-center">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-3 text-sos-cyan" />
            <h2 className="text-lg font-bold uppercase tracking-widest text-sos-cyan">Active SOS Alerts</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-sos-cyan/20 text-sos-cyan px-2 py-0.5 rounded-full text-xs font-medium">
              3 Active
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-sos-cyan/70 hover:text-sos-cyan hover:bg-sos-cyan/10"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="overflow-y-auto max-h-96">
          <table className="w-full text-white">
            <thead className="text-sos-cyan/70">
              <tr className="text-left text-xs uppercase tracking-wider">
                <th className="py-2 pl-4 font-normal">Status</th>
                <th className="py-2 font-normal">User</th>
                <th className="py-2 font-normal">Helpers</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert, i) => (
                <tr key={i} className="border-t border-sos-cyan/20 hover:bg-sos-cyan/5 transition-colors">
                  <td className="py-3 pl-4">
                    <div className="flex items-center">
                      <span className={`w-2 h-2 rounded-full ${alert.statusColor} mr-3`}></span>
                      <div>
                        <div className="text-sm font-medium">{alert.status}</div>
                        <div className="text-xs text-gray-500">{alert.time}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-sm">{alert.user}</td>
                  <td className="py-3 text-sm">{alert.helpers} assigned</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAlertsPanel;
