export type ProtocolType = 'vless' | 'vmess' | 'trojan' | 'shadowsocks' | 'socks';

export type NetworkType = 'tcp' | 'ws' | 'grpc' | 'splithttp' | 'http';

export type SecurityType = 'none' | 'tls' | 'reality';

export interface RealitySettings {
  show: boolean;
  dest: string;
  xver: number;
  serverNames: string[];
  privateKey: string;
  publicKey: string;
  minClientVer?: string;
  maxClientVer?: string;
  maxTimeDiff?: number;
  shortIds: string[];
  spiderX: string;
}

export interface WsSettings {
  path: string;
  headers: {
    Host: string;
    [key: string]: string;
  };
}

export interface GrpcSettings {
  serviceName: string;
  multiMode: boolean;
}

export interface TlsSettings {
  serverName: string;
  alpn: string[];
  minVersion?: string;
  certificateFile?: string;
  keyFile?: string;
}

export interface StreamSettings {
  network: NetworkType;
  security: SecurityType;
  realitySettings?: RealitySettings;
  wsSettings?: WsSettings;
  grpcSettings?: GrpcSettings;
  tlsSettings?: TlsSettings;
  tcpSettings?: {
    header: {
      type: string;
      request?: {
        version?: string;
        method?: string;
        path?: string[];
        headers?: Record<string, string[]>;
      };
    };
  };
}

export interface Client {
  id: string; // UUID
  email: string;
  inboundId: number;
  flow?: 'xtls-rprx-vision' | 'none' | '';
  limitIp?: number;
  totalGB: number; // 0 means unlimited
  up: number; // bytes
  down: number; // bytes
  expiryTime: number; // timestamp in ms, 0 means unlimited
  enable: boolean;
  createdAt: number;
  subId: string;
  notes?: string;
}

export interface Inbound {
  id: number;
  up: number;
  down: number;
  total: number;
  remark: string;
  enable: boolean;
  port: number;
  protocol: ProtocolType;
  settings: {
    clients?: Client[];
    decryption?: string;
    fallbacks?: Array<{ dest: string; xver: number }>;
    method?: string;
    password?: string;
    network?: string;
    accounts?: Array<{ user: string; pass: string }>;
  };
  streamSettings: StreamSettings;
  sniffing: {
    enabled: boolean;
    destOverride: string[];
  };
  listen?: string;
}

export interface NodeLocation {
  id: string;
  country: string;
  countryCode: string;
  city: string;
  flag: string;
  ip: string;
  isp: string;
  datacenter: string;
  ping: number; // ms
  jitter: number; // ms
  packetLoss: number; // percent 0-100
  status: 'online' | 'degraded' | 'offline';
  lastChecked: number;
  isCustom?: boolean;
  enabledInSub: boolean;
  region: 'Europe' | 'America' | 'Asia' | 'Oceania' | 'Middle East';
  pingHistory?: number[];
}

export interface SystemStats {
  cpuUsage: number;
  memTotal: number;
  memUsed: number;
  swapTotal: number;
  swapUsed: number;
  diskTotal: number;
  diskUsed: number;
  uptime: number; // seconds
  networkUp: number; // B/s
  networkDown: number; // B/s
  totalUp: number; // bytes
  totalDown: number; // bytes
  tcpConnections: number;
  udpConnections: number;
  xrayVersion: string;
  xrayStatus: 'running' | 'stopped' | 'restarting';
}

export interface PanelSettings {
  panelPort: number;
  webBasePath: string;
  subPath: string;
  subDomain: string;
  subPort: number;
  subTls: boolean;
  xrayCorePath: string;
  telegramBotToken: string;
  telegramChatId: string;
  telegramAlerts: boolean;
  autoBackup: boolean;
  autoPingInterval: number; // minutes
  language: 'fa' | 'en';
  theme: 'dark' | 'light';
}
