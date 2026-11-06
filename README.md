# 🚀 3X-UI Pro - Xray & V2Ray Multi-Node Management Panel
### پنل پیشرفته ساخت کانفیگ و مدیریت Xray / V2Ray با استایل سنایی (3X-UI Sanaei)

<p align="center">
  <img src="https://img.shields.io/badge/Xray--core-v1.8.24-blue?style=for-the-badge&logo=xray" alt="Xray Core" />
  <img src="https://img.shields.io/badge/Global%20Nodes-29%20Locations-emerald?style=for-the-badge&logo=globe" alt="29 Global Nodes" />
  <img src="https://img.shields.io/badge/Protocols-VLESS%20Reality%20%7C%20VMess%20%7C%20Trojan%20%7C%20SS-amber?style=for-the-badge" alt="Protocols" />
  <img src="https://img.shields.io/badge/Subscriptions-Base64%20%7C%20Clash%20Meta%20%7C%20Sing--Box-purple?style=for-the-badge" alt="Subscriptions" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

---

## 📖 معرفی پروژه (Overview)
این پروژه یک پنل تحت وب فول‌استک و مدرن مشابه پنل محبوب **3X-UI سنایی** است که قابلیت ساخت و مدیریت کانفیگ‌های واقعی Xray/V2Ray را در قالب **۲۹ لوکیشن واقعی تست‌شده جهان** فراهم می‌آورد. 

شما می‌توانید این ریپازیتوری را روی **هر هاست یا ارائه‌دهنده ابری (GitHub, Render, Railway, Vercel, Coolify, Docker, VPS)** تنها با چند کلیک دیپلوی کنید و لینک‌های سابسکرایب واقعی و کارآمد برای کاربران خود بسازید.

---

## ⚡ امکانات کلیدی (Key Features)

1. **پشتیبانی کامل از پروتکل‌های فیلترگریز (Anti-Censorship Protocols):**
   - **VLESS Reality (Vision):** استتار روی دامنه‌های واقعی نظیر `speed.cloudflare.com`، `www.microsoft.com` با تولید خودکار کلیدهای x25519 (`PublicKey` و `PrivateKey`) و شناسه‌های کوتاه (`ShortIDs`).
   - **VMess:** با وب‌سوکت (WebSocket CDN) و gRPC همراه با TLS.
   - **Trojan:** استریم پرسرعت gRPC / WebSocket با گواهی معتبر.
   - **Shadowsocks 2022:** با سایفرهای پیشرفته `2022-blake3-aes-128-gcm`.
   - **SOCKS5:** احراز هویت کاربری.

2. **سیستم توزیع ۲۹ لوکیشن واقعی جهان:**
   - ۲۹ موقعیت جغرافیایی فعال در آلمان، هلند، فنلاند، فرانسه، انگلستان، ایالات متحده (۴ ایالت)، کانادا، ترکیه، امارات، سنگاپور، ژاپن، کره جنوبی، سوئیس، سوئد، لهستان، اتریش، اسپانیا، ایتالیا، استرالیا، هنگ‌کنگ، هند، نروژ، دانمارک، ایرلند، برزیل و گرجستان.
   - نمودار مینی اسپارک‌لاین (**Recharts Sparkline**) برای نمایش تاریخچه پینگ و روند تاخیر هر سرور به صورت زنده.
   - تست پینگ زنده، جیتر (Jitter) و پکت‌لاست (Packet Loss).
   - امکان فیلتر هوشمند نودها (فقط نودهای سالم و زیر ۷۰ میلی‌ثانیه در ساب قرار گیرند).

3. **مرکز سابسکرایب هوشمند چند پلتفرمه:**
   - خروجی لینک هوشمند استاندارد **Base64** سازگار با تمامی برنامه‌های v2rayNG, Streisand, Shadowrocket, FoXray.
   - خروجی کانفیگ **Clash Meta (Mihomo)** با سیستم سوئیچ خودکار به سریع‌ترین نود (`url-test`).
   - خروجی کانفیگ **Sing-Box 1.8+** با هسته روتینگ مستقیم سایت‌های داخلی ایران (`direct ir`) و مسدودسازی تبلیغات.
   - تولید بارکد **QR Code** اختصاصی برای اسکن با دوربین تلفن همراه.

4. **معماری خودکار برای دیپلوی در هر سایت:**
   - بهینه‌شده برای تشخیص خودکار دامنه دیپلوی‌شده (`APP_URL` یا `window.location.origin`).
   - امکان تزریق آی‌پی یا دامنه اختصاصی سرور شما از طریق متغیر محیطی `SERVER_IP` یا `CUSTOM_DOMAIN`.

---

## 🚀 روش‌های دیپلوی (Deployment Guide)

### روش ۱: دیپلوی با ۱ کلیک در Render.com (رایگان)
1. این پروژه را در اکانت گیت‌هاب خود **Fork** یا **Push** کنید.
2. وارد پنل [Render.com](https://render.com) شوید و **New Web Service** را انتخاب کنید.
3. ریپازیتوری خود را متصل کنید:
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npm run start`
   - **Environment:** `Node`
4. متغیرهای محیطی زیر را در تب Environment وارد کنید:
   - `PORT=3000`
   - `NODE_ENV=production`
   - `SERVER_IP` (اختیاری: اگر سرور اختصاصی دارید، آی‌پی آن را اینجا قرار دهید تا به عنوان نود اصلی در کانفیگ‌ها قرار گیرد).
5. روی **Create Web Service** کلیک کنید. پس از ۲ دقیقه پنل شما با آدرس اختصاصی اینترنتی فعال خواهد شد!

---

<p align="center">
  <a href="https://railway.com/new" target="_blank">
    <img src="https://railway.com/button.svg" alt="Deploy on Railway" height="38" />
  </a>
</p>

---

### روش ۲: دیپلوی فوق‌سریع و خودکار در Railway (Railway.com / Railway.app)
پروژه مجهز به فایل‌های اختصاصی `railway.json` و `railway.toml` است، بنابراین Railway تمام مراحل بیلد و استقرار را به شکل ۱۰۰٪ اتوماتیک انجام می‌دهد:

1. روی دکمه **Deploy on Railway** در بالای صفحه کلیک کنید یا وارد پنل [Railway.com](https://railway.com) شوید.
2. روی دکمه **+ New Project** کلیک کرده و گزینه **Deploy from GitHub repo** را انتخاب کنید.
3. ریپازیتوری خود را انتخاب کنید. ریل‌وی به صورت خودکار فایل `railway.json` و `Dockerfile` را شناسایی و فرآیند ساخت را آغاز می‌کند.
4. دریافت آدرس عمومی اینترنتی:
   - پس از اتمام دیپلوی، وارد سرویس خود شده و در تب **Settings**، در بخش **Networking** روی دکمه **Generate Domain** کلیک کنید.
   - آدرس اینترنتی معتبر شما (مانند `https://your-panel.up.railway.app`) بلافاصله صادر می‌شود.
5. **دیپلوی مداوم (Continuous Deployment):** هر بار که در گیت‌هاب دستور `git push` را بزنید، Railway به طور اتوماتیک نسخه جدید را بیلد و دیپلوی می‌کند!

#### روش جایگزین با ترمینال (Railway CLI):
```bash
# نصب ابزار ریل‌وی و ورود
npm i -g @railway/cli
railway login

# ایجاد پروژه و دیپلوی آنی
railway init
railway up
```

---

### روش ۳: دیپلوی با داکر روی سرور مجازی (Linux VPS / Docker)
روی سرور لینوکس خود دستورات زیر را اجرا کنید:

```bash
# ۱. کلون پروژه
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# ۲. اجرای کانتینر در پس‌زمینه
docker compose up -d --build
```
پنل شما در آدرس `http://YOUR_SERVER_IP:3000` در دسترس خواهد بود.

---

### روش ۴: نصب مستقیم با Node.js
```bash
# نصب وابستگی‌ها
npm install

# ساخت نسخه پروداکشن فرانت‌اند
npm run build

# اجرای سرور فول‌استک
npm run start
```

---

## ⚙️ متغیرهای محیطی (Environment Variables)

| متغیر | مقدار پیش‌فرض | توضیحات |
| :--- | :--- | :--- |
| `PORT` | `3000` | پورت گوش‌دادن سرور Express |
| `NODE_ENV` | `production` | حالت اجرای محیط سرور |
| `APP_URL` | خودکار | آدرس کامل دامنه دیپلوی‌شده برای ساخت لینک سابسکرایب |
| `SERVER_IP` | اختیاری | آی‌پی VPS شما برای افزودن خودکار به لیست نودهای اصلی |
| `CUSTOM_DOMAIN` | اختیاری | دامنه اختصاصی برای سابسکرایب یا CDN |

---

## 📱 راهنمای کلاینت‌ها (Client Apps Setup)

1. **اندروید (Android):**
   - برنامه **v2rayNG** را باز کنید.
   - از منوی کناری، روی **Subscription group settings** بزنید و `+` را انتخاب کنید.
   - نام دلخواه و لینک سابسکرایب دریافت‌شده از پنل را وارد کنید.
   - گزینه **Update subscription** را بزنید تا ۲۹ لوکیشن بارگذاری شوند.
2. **آیفون (iOS):**
   - در برنامه‌های **Streisand**، **Shadowrocket** یا **FoXray**، لینک را در بخش سابسکرایب پیست کرده یا بارکد QR را اسکن کنید.
3. **ویندوز و مک (Windows & macOS):**
   - در **v2rayN** یا **Clash Verge Rev**، لینک را به سابسکرایب‌ها اضافه کرده و دکمه Update را بزنید.

---

## 🛠️ ساختار پروژه (Project Structure)
```
├── src/
│   ├── components/       # کامپوننت‌های 3X-UI سنایی، مودال‌ها و اسپارک‌لاین
│   ├── context/          # مدیریت سراسری استیت، تست پینگ زنده و کاربران
│   ├── data/             # دیتای ۲۹ لوکیشن واقعی جهان و اینباندهای پیش‌فرض
│   ├── types/            # تایپ‌های TypeScript برای Xray، Reality، TLS و کلاینت‌ها
│   └── utils/            # موتور تولید کانفیگ‌های Reality، Clash و Sing-box
├── server.ts             # بک‌اند Express با اندپوینت‌های زنده سابسکرایب و سلامت
├── Dockerfile            # بیلد چندمرحله‌ای برای دیپلوی در هر کلاود
├── docker-compose.yml    # اجرای ۱ کلیکی داکر
├── render.yaml           # استقرار اتوماتیک در Render
├── vercel.json           # استقرار اتوماتیک در Vercel
└── package.json          # اسکریپت‌ها و وابستگی‌ها
```

---

## 📄 مجوز (License)
این پروژه تحت مجوز MIT منتشر شده است. استفاده و توسعه آن برای همگان آزاد و رایگان است.
