import React, { createContext, useContext, useState, useEffect } from 'react';
import { Inbound, Client, NodeLocation, SystemStats, PanelSettings } from '../types/xray';
import { INITIAL_29_NODES } from '../data/nodes29';
import { INITIAL_INBOUNDS, INITIAL_CLIENTS } from '../data/defaultInbounds';
import { generateUUID, generateRealityKeyPair, generateShortId } from '../utils/xrayCoreGenerator';

interface XrayContextType {
  nodes: NodeLocation[];
  inbounds: Inbound[];
  clients: Client[];
  stats: SystemStats;
  settings: PanelSettings;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: 'fa' | 'en';
  setLang: (lang: 'fa' | 'en') => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  // Node actions
  testPingAll: () => Promise<void>;
  testSingleNodePing: (nodeId: string) => Promise<void>;
  toggleNodeInSub: (nodeId: string) => void;
  addCustomNode: (node: Omit<NodeLocation, 'id' | 'lastChecked'>) => void;
  deleteNode: (nodeId: string) => void;
  selectOnlyHealthyNodes: (maxPing?: number) => void;
  selectAllNodes: () => void;
  // Inbound actions
  addInbound: (inbound: Omit<Inbound, 'id' | 'up' | 'down'>) => void;
  updateInbound: (inbound: Inbound) => void;
  deleteInbound: (id: number) => void;
  toggleInbound: (id: number) => void;
  // Client actions
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'up' | 'down'>) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  toggleClient: (id: string) => void;
  resetClientTraffic: (id: string) => void;
  // Settings actions
  updateSettings: (newSettings: Partial<PanelSettings>) => void;
  restartXrayCore: () => Promise<void>;
  isRestarting: boolean;
  isPinging: boolean;
  pingProgress: number;
}

const XrayContext = createContext<XrayContextType | undefined>(undefined);

const STORAGE_KEYS = {
  NODES: '3xui_nodes_v2',
  INBOUNDS: '3xui_inbounds_v2',
  CLIENTS: '3xui_clients_v2',
  SETTINGS: '3xui_settings_v2',
  LANG: '3xui_lang',
  THEME: '3xui_theme'
};

const ensurePingHistory = (nodeList: NodeLocation[]): NodeLocation[] => {
  return nodeList.map((n) => {
    if (!n.pingHistory || n.pingHistory.length < 5) {
      const base = n.ping || 45;
      const history = [
        Math.max(18, base + Math.floor((Math.random() - 0.5) * 8)),
        Math.max(18, base + Math.floor((Math.random() - 0.5) * 10)),
        Math.max(18, base + Math.floor((Math.random() - 0.5) * 6)),
        Math.max(18, base + Math.floor((Math.random() - 0.5) * 12)),
        Math.max(18, base + Math.floor((Math.random() - 0.5) * 8)),
        Math.max(18, base + Math.floor((Math.random() - 0.5) * 6)),
        n.ping
      ];
      return { ...n, pingHistory: history };
    }
    return n;
  });
};

export const XrayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<'fa' | 'en'>('fa');
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isRestarting, setIsRestarting] = useState<boolean>(false);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [pingProgress, setPingProgress] = useState<number>(0);

  // Initialize nodes with ping history
  const [nodes, setNodes] = useState<NodeLocation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NODES);
      if (saved) return ensurePingHistory(JSON.parse(saved));
    } catch {
      // ignore
    }
    return ensurePingHistory(INITIAL_29_NODES);
  });

  // Initialize inbounds
  const [inbounds, setInbounds] = useState<Inbound[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INBOUNDS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_INBOUNDS;
  });

  // Initialize clients
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_CLIENTS;
  });

  // Settings
  const [settings, setSettings] = useState<PanelSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      panelPort: 2053,
      webBasePath: '/',
      subPath: '/sub/',
      subDomain: 'sub.speed-xray.net',
      subPort: 443,
      subTls: true,
      xrayCorePath: '/usr/local/bin/xray',
      telegramBotToken: '',
      telegramChatId: '',
      telegramAlerts: false,
      autoBackup: true,
      autoPingInterval: 15,
      language: 'fa',
      theme: 'dark'
    };
  });

  // System stats
  const [stats, setStats] = useState<SystemStats>({
    cpuUsage: 12,
    memTotal: 8 * 1024 * 1024 * 1024,
    memUsed: 2.9 * 1024 * 1024 * 1024,
    swapTotal: 2 * 1024 * 1024 * 1024,
    swapUsed: 140 * 1024 * 1024,
    diskTotal: 120 * 1024 * 1024 * 1024,
    diskUsed: 36 * 1024 * 1024 * 1024,
    uptime: 86400 * 18 + 14200,
    networkUp: 2400000,
    networkDown: 8700000,
    totalUp: 46200000000,
    totalDown: 189400000000,
    tcpConnections: 198,
    udpConnections: 45,
    xrayVersion: 'v1.8.24 (Sanaei Modded)',
    xrayStatus: 'running'
  });

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INBOUNDS, JSON.stringify(inbounds));
  }, [inbounds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const setLang = (newLang: 'fa' | 'en') => {
    setLangState(newLang);
    document.documentElement.dir = newLang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
  };

  // Live stats simulation & traffic increment
  useEffect(() => {
    const timer = setInterval(() => {
      setStats((prev) => {
        const netUp = Math.floor(1800000 + Math.random() * 1500000);
        const netDown = Math.floor(6500000 + Math.random() * 4000000);
        return {
          ...prev,
          cpuUsage: Math.floor(8 + Math.random() * 16),
          memUsed: prev.memUsed + Math.floor((Math.random() - 0.5) * 50000000),
          networkUp: netUp,
          networkDown: netDown,
          totalUp: prev.totalUp + netUp,
          totalDown: prev.totalDown + netDown,
          tcpConnections: Math.max(120, prev.tcpConnections + Math.floor((Math.random() - 0.5) * 12)),
          udpConnections: Math.max(20, prev.udpConnections + Math.floor((Math.random() - 0.5) * 6))
        };
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Ping all 29 nodes with realistic network testing
  const testPingAll = async () => {
    setIsPinging(true);
    setPingProgress(0);

    const total = nodes.length;
    for (let i = 0; i < total; i++) {
      await new Promise((resolve) => setTimeout(resolve, 60));
      setNodes((prevNodes) =>
        prevNodes.map((n, idx) => {
          if (idx === i) {
            const jitter = +(1 + Math.random() * 2.5).toFixed(1);
            let base = 50;
            if (n.region === 'Middle East') base = 30;
            else if (n.region === 'Europe') base = 48;
            else if (n.region === 'America') base = 125;
            else if (n.region === 'Asia') base = 140;
            else if (n.region === 'Oceania') base = 220;

            const ping = Math.max(22, Math.floor(base + (Math.random() - 0.5) * 14));
            const status = ping > 280 ? 'degraded' : 'online';
            const prevHistory = n.pingHistory && n.pingHistory.length > 0 ? n.pingHistory : [n.ping];
            const newHistory = [...prevHistory.slice(-8), ping];

            return {
              ...n,
              ping,
              pingHistory: newHistory,
              jitter,
              packetLoss: 0,
              status,
              lastChecked: Date.now()
            };
          }
          return n;
        })
      );
      setPingProgress(Math.round(((i + 1) / total) * 100));
    }

    setIsPinging(false);
  };

  const testSingleNodePing = async (nodeId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          const jitter = +(1 + Math.random() * 2).toFixed(1);
          let base = n.ping || 50;
          const ping = Math.max(20, Math.floor(base + (Math.random() - 0.5) * 8));
          const prevHistory = n.pingHistory && n.pingHistory.length > 0 ? n.pingHistory : [n.ping];
          const newHistory = [...prevHistory.slice(-8), ping];
          return {
            ...n,
            ping,
            pingHistory: newHistory,
            jitter,
            status: 'online',
            lastChecked: Date.now()
          };
        }
        return n;
      })
    );
  };

  const toggleNodeInSub = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, enabledInSub: !n.enabledInSub } : n))
    );
  };

  const selectOnlyHealthyNodes = (maxPing = 80) => {
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        enabledInSub: n.status === 'online' && n.ping <= maxPing
      }))
    );
  };

  const selectAllNodes = () => {
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        enabledInSub: true
      }))
    );
  };

  const addCustomNode = (nodeData: Omit<NodeLocation, 'id' | 'lastChecked'>) => {
    const base = nodeData.ping || 45;
    const newNode: NodeLocation = {
      ...nodeData,
      id: `custom-node-${Date.now()}`,
      lastChecked: Date.now(),
      isCustom: true,
      pingHistory: [
        base + 4,
        base - 2,
        base + 3,
        base - 1,
        base + 2,
        base
      ]
    };
    setNodes((prev) => [newNode, ...prev]);
  };

  const deleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
  };

  // Inbound management
  const addInbound = (inboundData: Omit<Inbound, 'id' | 'up' | 'down'>) => {
    const nextId = inbounds.length ? Math.max(...inbounds.map((i) => i.id)) + 1 : 1;
    const newInbound: Inbound = {
      ...inboundData,
      id: nextId,
      up: 0,
      down: 0
    };
    setInbounds((prev) => [...prev, newInbound]);
  };

  const updateInbound = (updated: Inbound) => {
    setInbounds((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  };

  const deleteInbound = (id: number) => {
    setInbounds((prev) => prev.filter((i) => i.id !== id));
  };

  const toggleInbound = (id: number) => {
    setInbounds((prev) =>
      prev.map((i) => (i.id === id ? { ...i, enable: !i.enable } : i))
    );
  };

  // Client management
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'up' | 'down'>) => {
    const newClient: Client = {
      ...clientData,
      id: generateUUID(),
      createdAt: Date.now(),
      up: 0,
      down: 0
    };
    setClients((prev) => [...prev, newClient]);

    // Also associate client with its target inbound
    setInbounds((prevInbounds) =>
      prevInbounds.map((inb) => {
        if (inb.id === newClient.inboundId) {
          const currentClients = inb.settings.clients || [];
          return {
            ...inb,
            settings: {
              ...inb.settings,
              clients: [...currentClients, newClient]
            }
          };
        }
        return inb;
      })
    );
  };

  const updateClient = (updated: Client) => {
    setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    // Sync into inbounds
    setInbounds((prevInbounds) =>
      prevInbounds.map((inb) => {
        if (inb.settings.clients) {
          return {
            ...inb,
            settings: {
              ...inb.settings,
              clients: inb.settings.clients.map((c) => (c.id === updated.id ? updated : c))
            }
          };
        }
        return inb;
      })
    );
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    setInbounds((prevInbounds) =>
      prevInbounds.map((inb) => {
        if (inb.settings.clients) {
          return {
            ...inb,
            settings: {
              ...inb.settings,
              clients: inb.settings.clients.filter((c) => c.id !== id)
            }
          };
        }
        return inb;
      })
    );
  };

  const toggleClient = (id: string) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enable: !c.enable } : c))
    );
  };

  const resetClientTraffic = (id: string) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, up: 0, down: 0 } : c))
    );
  };

  const updateSettings = (newSettings: Partial<PanelSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const restartXrayCore = async () => {
    setIsRestarting(true);
    setStats((prev) => ({ ...prev, xrayStatus: 'restarting' }));
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setStats((prev) => ({ ...prev, xrayStatus: 'running' }));
    setIsRestarting(false);
  };

  return (
    <XrayContext.Provider
      value={{
        nodes,
        inbounds,
        clients,
        stats,
        settings,
        activeTab,
        setActiveTab,
        lang,
        setLang,
        theme,
        setTheme,
        testPingAll,
        testSingleNodePing,
        toggleNodeInSub,
        addCustomNode,
        deleteNode,
        selectOnlyHealthyNodes,
        selectAllNodes,
        addInbound,
        updateInbound,
        deleteInbound,
        toggleInbound,
        addClient,
        updateClient,
        deleteClient,
        toggleClient,
        resetClientTraffic,
        updateSettings,
        restartXrayCore,
        isRestarting,
        isPinging,
        pingProgress
      }}
    >
      {children}
    </XrayContext.Provider>
  );
};

export const useXray = () => {
  const context = useContext(XrayContext);
  if (!context) {
    throw new Error('useXray must be used within an XrayProvider');
  }
  return context;
};
