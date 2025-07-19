import React, { useState, useEffect } from 'react';

const StatusItem = ({ label, value, status }: { label: string; value: string; status: 'ok' | 'warn' | 'crit' }) => {
  const statusColor = {
    ok: 'text-green-400',
    warn: 'text-yellow-400',
    crit: 'text-red-400',
  }[status];

  return (
    <div className="flex justify-between items-center py-2 border-b border-hud-border/50">
      <span className="text-hud-text-secondary">{label}</span>
      <span className={`font-bold ${statusColor}`}>{value}</span>
    </div>
  );
};

const SystemStatusPanel: React.FC = () => {
  const [cpu, setCpu] = useState(0);
  const [memory, setMemory] = useState(0);
  const [network, setNetwork] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpu(Math.random() * 100);
      setMemory(Math.random() * 100);
      setNetwork(Math.random() * 1000);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-2 h-full text-sm">
      <StatusItem label="CPU Load" value={`${cpu.toFixed(1)}%`} status={cpu > 90 ? 'crit' : cpu > 70 ? 'warn' : 'ok'} />
      <StatusItem label="Memory Usage" value={`${memory.toFixed(1)}%`} status={memory > 90 ? 'crit' : memory > 70 ? 'warn' : 'ok'} />
      <StatusItem label="Network Traffic" value={`${network.toFixed(0)} Mbps`} status={network > 900 ? 'crit' : network > 600 ? 'warn' : 'ok'} />
      <StatusItem label="Satellites" value="24/24 Online" status="ok" />
      <StatusItem label="Drones" value="16/16 Active" status="ok" />
      <StatusItem label="Responders" value="128 Active" status="ok" />
      <StatusItem label="AI Core" value="Online" status="ok" />
      <StatusItem label="Firewall" value="Active" status="ok" />
    </div>
  );
};

export default SystemStatusPanel;
