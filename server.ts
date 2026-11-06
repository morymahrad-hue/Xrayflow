import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { INITIAL_29_NODES } from './src/data/nodes29';
import { INITIAL_INBOUNDS, INITIAL_CLIENTS } from './src/data/defaultInbounds';
import {
  generateSubscriptionBase64,
  generateClashMetaYaml,
  generateSingBoxJson,
  generateRawUriList,
  generateXrayServerConfig
} from './src/utils/xrayCoreGenerator';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Trust reverse proxy for Railway / Cloud Run / Render SSL termination
  app.set('trust proxy', 1);

  // Auto-detect Railway deployed domain if APP_URL is not explicitly set
  if (!process.env.APP_URL) {
    if (process.env.RAILWAY_PUBLIC_DOMAIN) {
      process.env.APP_URL = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
    } else if (process.env.RAILWAY_STATIC_URL) {
      process.env.APP_URL = `https://${process.env.RAILWAY_STATIC_URL}`;
    }
  }

  app.use(express.json());

  // Global CORS headers for subscriptions, apps and web clients
  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
  });

  // Health check for Cloud providers (Railway, Render, Fly, K8s)
  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: Date.now(),
      platform: process.env.RAILWAY_ENVIRONMENT ? 'railway' : 'standard',
      railwayDomain: process.env.RAILWAY_PUBLIC_DOMAIN || null
    });
  });

  // In-memory / initial state with persistence simulation
  let nodes = [...INITIAL_29_NODES];

  // If user deployed with a custom server IP or domain in environment variables
  if (process.env.SERVER_IP) {
    nodes = [
      {
        id: 'node-primary-vps',
        country: 'سرور اختصاصی (Primary VPS)',
        countryCode: 'VPS',
        city: 'سرور فعال (Active Host)',
        flag: '🚀',
        ip: process.env.SERVER_IP,
        isp: process.env.SERVER_ISP || 'Primary Deployed VPS',
        datacenter: 'Host-Primary',
        ping: 25,
        jitter: 1.0,
        packetLoss: 0,
        status: 'online',
        lastChecked: Date.now(),
        enabledInSub: true,
        region: 'Middle East',
        pingHistory: [26, 25, 24, 25, 25]
      },
      ...nodes
    ];
  }

  let inbounds = [...INITIAL_INBOUNDS];
  let clients = [...INITIAL_CLIENTS];

  // System stats endpoint
  app.get('/api/stats', (_req, res) => {
    const memTotal = 8 * 1024 * 1024 * 1024; // 8 GB
    const memUsed = Math.floor(memTotal * 0.38 + Math.random() * 200000000);
    const cpuUsage = Math.floor(8 + Math.random() * 14);
    
    res.json({
      cpuUsage,
      memTotal,
      memUsed,
      swapTotal: 2 * 1024 * 1024 * 1024,
      swapUsed: 120 * 1024 * 1024,
      diskTotal: 120 * 1024 * 1024 * 1024,
      diskUsed: 34 * 1024 * 1024 * 1024,
      uptime: 86400 * 14 + 3600 * 5,
      networkUp: Math.floor(2.4 * 1024 * 1024 + Math.random() * 800000),
      networkDown: Math.floor(9.8 * 1024 * 1024 + Math.random() * 2000000),
      totalUp: 38492000000,
      totalDown: 149302000000,
      tcpConnections: 184 + Math.floor(Math.random() * 25),
      udpConnections: 42 + Math.floor(Math.random() * 10),
      xrayVersion: 'v1.8.24 (Xray, Penetrates Everything)',
      xrayStatus: 'running'
    });
  });

  // Nodes endpoint
  app.get('/api/nodes', (_req, res) => {
    res.json(nodes);
  });

  // Ping test endpoint (live test simulation for 29 nodes)
  app.post('/api/nodes/ping', (req, res) => {
    const { nodeId } = req.body;
    nodes = nodes.map((n) => {
      if (!nodeId || n.id === nodeId) {
        const jitter = +(1 + Math.random() * 3).toFixed(1);
        const pingDelta = Math.floor((Math.random() - 0.5) * 8);
        const basePing = n.region === 'Middle East' ? 30 : n.region === 'Europe' ? 50 : n.region === 'America' ? 130 : 150;
        const newPing = Math.max(18, basePing + pingDelta);
        const status = Math.random() > 0.03 ? 'online' : 'degraded';
        const prevHist = n.pingHistory && n.pingHistory.length > 0 ? n.pingHistory : [n.ping];
        return {
          ...n,
          ping: newPing,
          pingHistory: [...prevHist.slice(-8), newPing],
          jitter,
          packetLoss: status === 'degraded' ? 2 : 0,
          status,
          lastChecked: Date.now()
        };
      }
      return n;
    });

    res.json({ success: true, nodes });
  });

  // Inbounds endpoint
  app.get('/api/inbounds', (_req, res) => {
    res.json(inbounds);
  });

  app.post('/api/inbounds', (req, res) => {
    const newInbound = {
      ...req.body,
      id: inbounds.length ? Math.max(...inbounds.map((i) => i.id)) + 1 : 1,
      up: 0,
      down: 0
    };
    inbounds.push(newInbound);
    res.json({ success: true, inbound: newInbound });
  });

  app.delete('/api/inbounds/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    inbounds = inbounds.filter((i) => i.id !== id);
    res.json({ success: true });
  });

  // Clients endpoint
  app.get('/api/clients', (_req, res) => {
    res.json(clients);
  });

  app.post('/api/clients', (req, res) => {
    const newClient = req.body;
    clients.push(newClient);
    res.json({ success: true, client: newClient });
  });

  app.delete('/api/clients/:id', (req, res) => {
    clients = clients.filter((c) => c.id !== req.params.id);
    res.json({ success: true });
  });

  // Universal Subscription handler (supporting both /sub/:subId and /api/sub/:subId)
  const handleSubscriptionRequest = (req: express.Request, res: express.Response) => {
    const { subId } = req.params;
    const client = clients.find((c) => c.subId === subId || c.id === subId) || clients[0];
    const format = (req.query.format as string)?.toLowerCase();

    if (!client) {
      return res.status(404).send('Subscriber not found');
    }

    const expireSeconds = client.expiryTime > 0 ? Math.floor(client.expiryTime / 1000) : 0;
    const totalBytes = client.totalGB > 0 ? client.totalGB * 1024 * 1024 * 1024 : 0;

    // Standard Subscription User Info header recognized by v2rayNG, Shadowrocket, Clash, Sing-box
    res.setHeader(
      'Subscription-Userinfo',
      `upload=${client.up}; download=${client.down}; total=${totalBytes}; expire=${expireSeconds}`
    );
    res.setHeader('Profile-Update-Interval', '6'); // auto-update every 6 hours

    if (format === 'clash') {
      res.setHeader('Content-Type', 'text/yaml; charset=utf-8');
      res.setHeader('Content-Disposition', `inline; filename="clash-${client.email}.yaml"`);
      return res.send(generateClashMetaYaml(inbounds, client, nodes));
    }

    if (format === 'singbox' || format === 'sing-box') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `inline; filename="singbox-${client.email}.json"`);
      return res.send(generateSingBoxJson(inbounds, client, nodes));
    }

    if (format === 'raw') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(generateRawUriList(inbounds, client, nodes, false));
    }

    // Default: Base64 multi-node string
    const base64Sub = generateSubscriptionBase64(inbounds, client, nodes, false);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.send(base64Sub);
  };

  app.get('/api/sub/:subId', handleSubscriptionRequest);
  app.get('/sub/:subId', handleSubscriptionRequest);

  // Server config.json endpoint
  app.get('/api/xray/config', (_req, res) => {
    const config = generateXrayServerConfig(inbounds);
    res.setHeader('Content-Type', 'application/json');
    res.send(config);
  });

  // Vite integration in dev, or static files in production
  const isDev = process.env.NODE_ENV !== 'production';
  const distPath = path.resolve(__dirname, 'dist');
  const distExists = fs.existsSync(distPath);

  if (!isDev || distExists) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexHtml = path.resolve(distPath, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(503).send('Building application, please refresh in a moment...');
      }
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[3X-UI Pro Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
