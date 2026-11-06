import { Inbound, Client, NodeLocation } from '../types/xray';

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateShortId(): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateRealityKeyPair(): { publicKey: string; privateKey: string } {
  // Simulates Xray x25519 keypair generation format (base64url)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let pub = '';
  let priv = '';
  for (let i = 0; i < 43; i++) {
    pub += chars.charAt(Math.floor(Math.random() * chars.length));
    priv += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return {
    publicKey: pub,
    privateKey: priv
  };
}

export interface GeneratedConfigItem {
  nodeId: string;
  nodeName: string;
  flag: string;
  protocol: string;
  uri: string;
  ping: number;
}

/**
 * Generates client config URI for a specific Inbound, Client, and Node
 */
export function buildClientUri(inbound: Inbound, client: Client, node: NodeLocation): string {
  const tag = encodeURIComponent(`${node.flag} ${node.city.split(' ')[0]} | ${client.email} | ${inbound.protocol.toUpperCase()}`);
  const host = node.ip;
  const port = inbound.port;

  if (inbound.protocol === 'vless') {
    const stream = inbound.streamSettings;
    const isReality = stream.security === 'reality';
    const isTls = stream.security === 'tls';

    const params = new URLSearchParams();
    params.set('type', stream.network);
    params.set('encryption', 'none');

    if (client.flow) {
      params.set('flow', client.flow);
    }

    if (isReality && stream.realitySettings) {
      params.set('security', 'reality');
      const sni = stream.realitySettings.serverNames[0] || 'speed.cloudflare.com';
      params.set('sni', sni);
      params.set('fp', 'chrome');
      params.set('pbk', stream.realitySettings.publicKey);
      if (stream.realitySettings.shortIds && stream.realitySettings.shortIds.length > 0) {
        params.set('sid', stream.realitySettings.shortIds[0]);
      }
      params.set('spx', stream.realitySettings.spiderX || '/');
    } else if (isTls && stream.tlsSettings) {
      params.set('security', 'tls');
      params.set('sni', stream.tlsSettings.serverName || host);
      params.set('fp', 'chrome');
    } else {
      params.set('security', 'none');
    }

    if (stream.network === 'ws' && stream.wsSettings) {
      params.set('path', stream.wsSettings.path);
      if (stream.wsSettings.headers?.Host) {
        params.set('host', stream.wsSettings.headers.Host);
      }
    } else if (stream.network === 'grpc' && stream.grpcSettings) {
      params.set('serviceName', stream.grpcSettings.serviceName);
      params.set('mode', stream.grpcSettings.multiMode ? 'multi' : 'gun');
    }

    return `vless://${client.id}@${host}:${port}?${params.toString()}#${tag}`;
  }

  if (inbound.protocol === 'vmess') {
    const stream = inbound.streamSettings;
    const vmessJson = {
      v: '2',
      ps: `${node.flag} ${node.city.split(' ')[0]} | ${client.email}`,
      add: host,
      port: port,
      id: client.id,
      aid: 0,
      scy: 'auto',
      net: stream.network,
      type: 'none',
      host: stream.wsSettings?.headers?.Host || stream.tlsSettings?.serverName || '',
      path: stream.wsSettings?.path || '',
      tls: stream.security === 'tls' ? 'tls' : '',
      sni: stream.tlsSettings?.serverName || '',
      alpn: stream.tlsSettings?.alpn ? stream.tlsSettings.alpn.join(',') : ''
    };
    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(vmessJson))));
    return `vmess://${b64}`;
  }

  if (inbound.protocol === 'trojan') {
    const stream = inbound.streamSettings;
    const pass = client.id || inbound.settings.password || 'password123';
    const params = new URLSearchParams();
    params.set('security', stream.security === 'reality' ? 'reality' : 'tls');
    params.set('type', stream.network);
    params.set('sni', stream.tlsSettings?.serverName || stream.realitySettings?.serverNames[0] || host);

    if (stream.network === 'grpc' && stream.grpcSettings) {
      params.set('serviceName', stream.grpcSettings.serviceName);
    } else if (stream.network === 'ws' && stream.wsSettings) {
      params.set('path', stream.wsSettings.path);
    }

    return `trojan://${pass}@${host}:${port}?${params.toString()}#${tag}`;
  }

  if (inbound.protocol === 'shadowsocks') {
    const method = inbound.settings.method || '2022-blake3-aes-128-gcm';
    const pass = inbound.settings.password || client.id;
    const raw = `${method}:${pass}`;
    const userinfo = btoa(raw);
    return `ss://${userinfo}@${host}:${port}#${tag}`;
  }

  // Fallback socks5
  return `socks5://${client.email}:${client.id.slice(0, 8)}@${host}:${port}#${tag}`;
}

/**
 * Generates configs for a client across all 29 (or active) nodes
 */
export function generateClientConfigsForNodes(
  inbound: Inbound,
  client: Client,
  nodes: NodeLocation[],
  onlyHealthy = false
): GeneratedConfigItem[] {
  const eligibleNodes = nodes.filter(
    (n) => n.enabledInSub && (!onlyHealthy || n.status === 'online')
  );

  return eligibleNodes.map((node) => ({
    nodeId: node.id,
    nodeName: `${node.flag} ${node.country.split(' ')[0]} - ${node.city.split(' ')[0]}`,
    flag: node.flag,
    protocol: inbound.protocol,
    uri: buildClientUri(inbound, client, node),
    ping: node.ping
  }));
}

/**
 * Generates Base64 subscription content containing all active nodes
 */
export function generateSubscriptionBase64(
  inbounds: Inbound[],
  client: Client,
  nodes: NodeLocation[],
  onlyHealthy = true
): string {
  const lines: string[] = [];
  const targetInbound = inbounds.find((i) => i.id === client.inboundId) || inbounds[0];

  if (!targetInbound) return '';

  const activeNodes = nodes.filter(
    (n) => n.enabledInSub && (!onlyHealthy || n.status === 'online')
  );

  activeNodes.forEach((node) => {
    const uri = buildClientUri(targetInbound, client, node);
    lines.push(uri);
  });

  const fullText = lines.join('\n');
  try {
    return btoa(unescape(encodeURIComponent(fullText)));
  } catch {
    return btoa(fullText);
  }
}

/**
 * Generates Clash Meta (Mihomo) configuration YAML for 29 nodes
 */
export function generateClashMetaYaml(
  inbounds: Inbound[],
  client: Client,
  nodes: NodeLocation[]
): string {
  const targetInbound = inbounds.find((i) => i.id === client.inboundId) || inbounds[0];
  const activeNodes = nodes.filter((n) => n.enabledInSub);

  const proxiesYaml = activeNodes.map((n) => {
    const name = `${n.flag} ${n.countryCode} - ${n.city.split(' ')[0]}`;
    if (targetInbound.protocol === 'vless') {
      const isReality = targetInbound.streamSettings.security === 'reality';
      const sni = targetInbound.streamSettings.realitySettings?.serverNames[0] || 'speed.cloudflare.com';
      const pbk = targetInbound.streamSettings.realitySettings?.publicKey || '';
      const sid = targetInbound.streamSettings.realitySettings?.shortIds?.[0] || '';

      return `  - name: "${name}"
    type: vless
    server: ${n.ip}
    port: ${targetInbound.port}
    uuid: ${client.id}
    cipher: none
    tls: true
    flow: ${client.flow || 'xtls-rprx-vision'}
    servername: ${sni}
    reality-opts:
      public-key: ${pbk}
      short-id: ${sid}
    client-fingerprint: chrome`;
    }

    if (targetInbound.protocol === 'vmess') {
      return `  - name: "${name}"
    type: vmess
    server: ${n.ip}
    port: ${targetInbound.port}
    uuid: ${client.id}
    alterId: 0
    cipher: auto
    tls: ${targetInbound.streamSettings.security === 'tls'}
    network: ${targetInbound.streamSettings.network}
    ws-opts:
      path: "${targetInbound.streamSettings.wsSettings?.path || '/'}"
      headers:
        Host: "${targetInbound.streamSettings.wsSettings?.headers?.Host || n.ip}"`;
    }

    return `  - name: "${name}"
    type: trojan
    server: ${n.ip}
    port: ${targetInbound.port}
    password: "${client.id}"
    sni: ${n.ip}
    skip-cert-verify: true`;
  }).join('\n');

  const proxyNames = activeNodes.map((n) => `      - "${n.flag} ${n.countryCode} - ${n.city.split(' ')[0]}"`).join('\n');

  return `# ==============================================
# 3X-UI Sanaei Pro - Clash Meta / Mihomo Profile
# User: ${client.email} | Locations: ${activeNodes.length} Verified Nodes
# ==============================================
port: 7890
socks-port: 7891
mixed-port: 7892
allow-lan: true
mode: rule
log-level: info
ipv6: false

dns:
  enable: true
  listen: 0.0.0.0:1053
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  nameserver:
    - 8.8.8.8
    - 1.1.1.1
    - https://dns.google/dns-query

proxies:
${proxiesYaml}

proxy-groups:
  - name: "⚡ AUTO (Fastest Node)"
    type: url-test
    url: http://www.gstatic.com/generate_204
    interval: 300
    tolerance: 50
    proxies:
${proxyNames}

  - name: "🌐 SELECT LOCATION (29 Nodes)"
    type: select
    proxies:
      - "⚡ AUTO (Fastest Node)"
${proxyNames}

rules:
  - GEOIP,private,DIRECT
  - GEOIP,IR,DIRECT
  - GEOSITE,category-ir,DIRECT
  - GEOSITE,category-ads-all,REJECT
  - MATCH,🌐 SELECT LOCATION (29 Nodes)
`;
}

/**
 * Generates Sing-Box 1.8+ format JSON profile with 29 nodes & auto-urltest
 */
export function generateSingBoxJson(
  inbounds: Inbound[],
  client: Client,
  nodes: NodeLocation[]
): string {
  const targetInbound = inbounds.find((i) => i.id === client.inboundId) || inbounds[0];
  const activeNodes = nodes.filter((n) => n.enabledInSub);

  const outbounds: any[] = [];
  const nodeTags: string[] = [];

  activeNodes.forEach((n) => {
    const tag = `${n.flag} ${n.countryCode} - ${n.city.split(' ')[0]}`;
    nodeTags.push(tag);

    if (targetInbound.protocol === 'vless') {
      const isReality = targetInbound.streamSettings.security === 'reality';
      const reality = targetInbound.streamSettings.realitySettings;
      outbounds.push({
        type: 'vless',
        tag: tag,
        server: n.ip,
        server_port: targetInbound.port,
        uuid: client.id,
        flow: client.flow || 'xtls-rprx-vision',
        tls: {
          enabled: true,
          server_name: reality?.serverNames[0] || 'speed.cloudflare.com',
          reality: isReality ? {
            enabled: true,
            public_key: reality?.publicKey || '',
            short_id: reality?.shortIds?.[0] || ''
          } : undefined,
          utls: {
            enabled: true,
            fingerprint: 'chrome'
          }
        }
      });
    } else if (targetInbound.protocol === 'vmess') {
      outbounds.push({
        type: 'vmess',
        tag: tag,
        server: n.ip,
        server_port: targetInbound.port,
        uuid: client.id,
        security: 'auto',
        transport: {
          type: targetInbound.streamSettings.network === 'ws' ? 'ws' : 'grpc',
          path: targetInbound.streamSettings.wsSettings?.path || '/',
          headers: {
            Host: targetInbound.streamSettings.wsSettings?.headers?.Host || n.ip
          }
        }
      });
    } else {
      outbounds.push({
        type: 'trojan',
        tag: tag,
        server: n.ip,
        server_port: targetInbound.port,
        password: client.id,
        tls: {
          enabled: true,
          server_name: n.ip,
          insecure: true
        }
      });
    }
  });

  // Selector and URL-test groups
  outbounds.unshift(
    {
      type: 'selector',
      tag: '🌐 SELECT LOCATION',
      outbounds: ['⚡ AUTO (Fastest Node)', ...nodeTags],
      default: '⚡ AUTO (Fastest Node)'
    },
    {
      type: 'urltest',
      tag: '⚡ AUTO (Fastest Node)',
      outbounds: nodeTags,
      url: 'http://www.gstatic.com/generate_204',
      interval: '3m',
      tolerance: 50
    }
  );

  outbounds.push(
    { type: 'direct', tag: 'direct' },
    { type: 'block', tag: 'block' },
    { type: 'dns', tag: 'dns-out' }
  );

  const singBoxConfig = {
    log: { level: 'info', timestamp: true },
    dns: {
      servers: [
        { tag: 'remote', address: 'tls://8.8.8.8', detour: '🌐 SELECT LOCATION' },
        { tag: 'local', address: 'local', detour: 'direct' }
      ],
      rules: [
        { geosite: 'ir', server: 'local' },
        { geosite: 'category-ads-all', server: 'block' }
      ]
    },
    inbounds: [
      {
        type: 'tun',
        tag: 'tun-in',
        interface_name: 'tun0',
        inet4_address: '172.19.0.1/30',
        auto_route: true,
        strict_route: true,
        stack: 'mixed',
        sniff: true
      }
    ],
    outbounds: outbounds,
    route: {
      rules: [
        { protocol: 'dns', outbound: 'dns-out' },
        { geosite: 'category-ads-all', outbound: 'block' },
        { geoip: 'private', outbound: 'direct' },
        { geoip: 'ir', outbound: 'direct' },
        { geosite: 'ir', outbound: 'direct' }
      ],
      auto_detect_interface: true
    }
  };

  return JSON.stringify(singBoxConfig, null, 2);
}

/**
 * Generates raw URI list separated by newlines
 */
export function generateRawUriList(
  inbounds: Inbound[],
  client: Client,
  nodes: NodeLocation[],
  onlyHealthy = false
): string {
  const targetInbound = inbounds.find((i) => i.id === client.inboundId) || inbounds[0];
  if (!targetInbound) return '';
  const activeNodes = nodes.filter((n) => n.enabledInSub && (!onlyHealthy || n.status === 'online'));
  return activeNodes.map((node) => buildClientUri(targetInbound, client, node)).join('\n');
}

/**
 * Generates full production Xray config.json for the server
 */
export function generateXrayServerConfig(
  inbounds: Inbound[],
  panelSettingsPort = 2053
): string {
  const inboundsJson = inbounds.map((inb) => {
    const clients = inb.settings.clients || [];

    const item: Record<string, unknown> = {
      tag: `inbound-${inb.id}-${inb.protocol}`,
      port: inb.port,
      protocol: inb.protocol,
      settings: {
        clients: clients.map((c) => ({
          id: c.id,
          flow: c.flow || undefined,
          email: c.email
        })),
        decryption: inb.settings.decryption || 'none',
        fallbacks: inb.settings.fallbacks || []
      },
      streamSettings: {
        network: inb.streamSettings.network,
        security: inb.streamSettings.security
      },
      sniffing: {
        enabled: inb.sniffing.enabled,
        destOverride: inb.sniffing.destOverride
      }
    };

    if (inb.streamSettings.security === 'reality' && inb.streamSettings.realitySettings) {
      (item.streamSettings as Record<string, unknown>).realitySettings = {
        show: inb.streamSettings.realitySettings.show,
        dest: inb.streamSettings.realitySettings.dest,
        xver: inb.streamSettings.realitySettings.xver,
        serverNames: inb.streamSettings.realitySettings.serverNames,
        privateKey: inb.streamSettings.realitySettings.privateKey,
        shortIds: inb.streamSettings.realitySettings.shortIds,
        spiderX: inb.streamSettings.realitySettings.spiderX
      };
    }

    if (inb.streamSettings.network === 'ws' && inb.streamSettings.wsSettings) {
      (item.streamSettings as Record<string, unknown>).wsSettings = inb.streamSettings.wsSettings;
    }

    if (inb.streamSettings.network === 'grpc' && inb.streamSettings.grpcSettings) {
      (item.streamSettings as Record<string, unknown>).grpcSettings = inb.streamSettings.grpcSettings;
    }

    return item;
  });

  const fullXray = {
    log: {
      access: '/var/log/xray/access.log',
      error: '/var/log/xray/error.log',
      loglevel: 'warning'
    },
    api: {
      tag: 'api',
      services: ['HandlerService', 'LoggerService', 'StatsService']
    },
    stats: {},
    policy: {
      levels: {
        '0': {
          statsUserUplink: true,
          statsUserDownlink: true
        }
      },
      system: {
        statsInboundUplink: true,
        statsInboundDownlink: true
      }
    },
    inbounds: inboundsJson,
    outbounds: [
      {
        tag: 'direct',
        protocol: 'freedom',
        settings: {
          domainStrategy: 'UseIP'
        }
      },
      {
        tag: 'blocked',
        protocol: 'blackhole',
        settings: {}
      },
      {
        tag: 'warp-out',
        protocol: 'wireguard',
        settings: {
          secretKey: 'aW5pdGlhbF93YXJwX2tleV9leGFtcGxl',
          address: ['172.16.0.2/32', '2606:4700:110:8751:2e9e:84c4:ec5d:452f/128'],
          peers: [
            {
              publicKey: 'bmXOC+F1FxEMF9dyiK2H5/1SUtzH0JuVo51h2wPfgyo=',
              endpoint: '162.159.192.1:2408'
            }
          ]
        }
      }
    ],
    routing: {
      domainStrategy: 'IPIfNonMatch',
      rules: [
        {
          type: 'field',
          inboundTag: ['api'],
          outboundTag: 'api'
        },
        {
          type: 'field',
          domain: ['geosite:category-ads-all'],
          outboundTag: 'blocked'
        },
        {
          type: 'field',
          ip: ['geoip:private', 'geoip:ir'],
          outboundTag: 'direct'
        },
        {
          type: 'field',
          domain: ['geosite:ir', 'domain:.ir'],
          outboundTag: 'direct'
        },
        {
          type: 'field',
          network: 'tcp,udp',
          outboundTag: 'direct'
        }
      ]
    }
  };

  return JSON.stringify(fullXray, null, 2);
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
