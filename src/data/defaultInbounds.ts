import { Inbound, Client } from '../types/xray';

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'e28bbd91-4c12-4fb3-8e77-508b98f2441a',
    email: 'vip_user_alireza',
    inboundId: 1,
    flow: 'xtls-rprx-vision',
    limitIp: 2,
    totalGB: 60,
    up: 8492819200, // 7.9 GB
    down: 25482910300, // 23.7 GB
    expiryTime: Date.now() + 25 * 86400000, // 25 days remaining
    enable: true,
    createdAt: Date.now() - 5 * 86400000,
    subId: 'sub_ali_98f2',
    notes: 'کاربر VIP - دسترسی به تمامی ۲۹ لوکیشن'
  },
  {
    id: '7b9f1a28-912c-4903-88ec-a38f7105cb82',
    email: 'office_team_maryam',
    inboundId: 1,
    flow: 'xtls-rprx-vision',
    limitIp: 5,
    totalGB: 150,
    up: 18492819200,
    down: 74829103000,
    expiryTime: Date.now() + 45 * 86400000,
    enable: true,
    createdAt: Date.now() - 15 * 86400000,
    subId: 'sub_maryam_cb82',
    notes: 'تیم فنی دفتر مرکزی'
  },
  {
    id: '3c814b7e-01af-4c3e-8367-11f81e3599a4',
    email: 'client_reza_gaming',
    inboundId: 2,
    flow: '',
    limitIp: 1,
    totalGB: 80,
    up: 3492819200,
    down: 42829103000,
    expiryTime: Date.now() + 18 * 86400000,
    enable: true,
    createdAt: Date.now() - 12 * 86400000,
    subId: 'sub_reza_gaming',
    notes: 'پینگ پایین آلمان/ترکیه برای گیمینگ'
  },
  {
    id: '9d47a82b-6582-4f01-97b4-8e54737199c0',
    email: 'test_user_free',
    inboundId: 3,
    flow: '',
    limitIp: 1,
    totalGB: 10,
    up: 1204000000,
    down: 7850000000,
    expiryTime: Date.now() + 3 * 86400000,
    enable: true,
    createdAt: Date.now() - 27 * 86400000,
    subId: 'sub_test_free',
    notes: 'اکانت تست ۳۰ روزه'
  }
];

export const INITIAL_INBOUNDS: Inbound[] = [
  {
    id: 1,
    up: 26985638400,
    down: 100312013300,
    total: 0,
    remark: 'VLESS Reality (Vision/TCP)',
    enable: true,
    port: 443,
    protocol: 'vless',
    settings: {
      clients: [INITIAL_CLIENTS[0], INITIAL_CLIENTS[1]],
      decryption: 'none',
      fallbacks: [
        {
          dest: 'speed.cloudflare.com:443',
          xver: 1
        }
      ]
    },
    streamSettings: {
      network: 'tcp',
      security: 'reality',
      realitySettings: {
        show: false,
        dest: 'speed.cloudflare.com:443',
        xver: 0,
        serverNames: ['speed.cloudflare.com', 'www.microsoft.com', 'addons.mozilla.org'],
        privateKey: 'yE0l2...generated_priv_sample_2X_Sanaei',
        publicKey: 'l34h7tK_samplePublicKeyRealityXraySanaei29Loc',
        shortIds: ['6b8e', '91a4', 'c0f3', 'fa82'],
        spiderX: '/'
      }
    },
    sniffing: {
      enabled: true,
      destOverride: ['http', 'tls', 'quic']
    }
  },
  {
    id: 2,
    up: 12450890000,
    down: 68900234000,
    total: 0,
    remark: 'VMess WebSocket CDN (Cloudflare)',
    enable: true,
    port: 8443,
    protocol: 'vmess',
    settings: {
      clients: [INITIAL_CLIENTS[2]]
    },
    streamSettings: {
      network: 'ws',
      security: 'tls',
      wsSettings: {
        path: '/v2ray-stream-cdn',
        headers: {
          Host: 'cdn.fast-network.top'
        }
      },
      tlsSettings: {
        serverName: 'cdn.fast-network.top',
        alpn: ['h2', 'http/1.1']
      }
    },
    sniffing: {
      enabled: true,
      destOverride: ['http', 'tls']
    }
  },
  {
    id: 3,
    up: 4890123000,
    down: 18940560000,
    total: 0,
    remark: 'Trojan gRPC Multiplex',
    enable: true,
    port: 2083,
    protocol: 'trojan',
    settings: {
      clients: [INITIAL_CLIENTS[3]],
      password: 'TrojanSecurePass_3X_Sanaei2026'
    },
    streamSettings: {
      network: 'grpc',
      security: 'tls',
      grpcSettings: {
        serviceName: 'trojan-grpc-service',
        multiMode: true
      },
      tlsSettings: {
        serverName: 'secure-edge.speed-vpn.org',
        alpn: ['h2']
      }
    },
    sniffing: {
      enabled: true,
      destOverride: ['http', 'tls']
    }
  },
  {
    id: 4,
    up: 2190000000,
    down: 9400000000,
    total: 0,
    remark: 'Shadowsocks 2022 (High Speed UDP)',
    enable: true,
    port: 8388,
    protocol: 'shadowsocks',
    settings: {
      method: '2022-blake3-aes-128-gcm',
      password: 'j8+PqK8W+WvL3m2N4XgY6A=='
    },
    streamSettings: {
      network: 'tcp',
      security: 'none'
    },
    sniffing: {
      enabled: true,
      destOverride: ['http', 'tls']
    }
  }
];
