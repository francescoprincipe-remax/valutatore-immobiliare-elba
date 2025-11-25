# 🚀 Guida Deployment - Valutatore Immobiliare Elba

Questa guida fornisce istruzioni dettagliate per deployare il Valutatore Immobiliare Elba in produzione.

---

## 📋 Indice

- [Prerequisiti](#prerequisiti)
- [Opzione 1: Manus Platform](#opzione-1-manus-platform-consigliato)
- [Opzione 2: Vercel](#opzione-2-vercel)
- [Opzione 3: Docker](#opzione-3-docker)
- [Opzione 4: VPS Ubuntu](#opzione-4-vps-ubuntu)
- [Configurazione Database](#configurazione-database)
- [Configurazione Dominio](#configurazione-dominio)
- [SSL/HTTPS](#sslhttps)
- [Monitoring](#monitoring)
- [Backup](#backup)
- [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisiti

Prima di iniziare il deployment, assicurati di avere:

- [ ] Codice progetto aggiornato e testato
- [ ] Database MySQL/TiDB configurato
- [ ] Variabili ambiente configurate
- [ ] Dominio registrato (opzionale)
- [ ] Account hosting/cloud provider

---

## 🎯 Opzione 1: Manus Platform (Consigliato)

### Perché Manus?

- ✅ **Zero configurazione** - Deploy con 1 click
- ✅ **Database incluso** - TiDB serverless gratuito
- ✅ **SSL automatico** - HTTPS out-of-the-box
- ✅ **Scaling automatico** - Gestito dalla piattaforma
- ✅ **CI/CD integrato** - Deploy automatico da Git
- ✅ **Dominio incluso** - `*.manus.space` gratuito

### Step-by-Step

#### 1. Crea Checkpoint

Il progetto usa già Manus, quindi hai già i checkpoint salvati.

**Checkpoint Corrente**: `manus-webdev://46b99e1e`

```bash
# Verifica checkpoint
git log --oneline | head -5
```

#### 2. Pubblica

1. **Apri Management UI**
   - URL: https://3000-ikihybht38uvcohx58p2v-3139bba0.manusvm.computer
   - Clicca icona pannello (top-right)

2. **Vai su Dashboard**
   - Verifica stato progetto
   - Controlla screenshot preview

3. **Clicca "Publish"**
   - Bottone in header (top-right)
   - Conferma pubblicazione
   - Attendi deploy (30-60 secondi)

4. **Verifica Deploy**
   - URL produzione: `https://your-project.manus.space`
   - Testa tutte le funzionalità
   - Verifica form valutazione

#### 3. Configura Dominio Custom (Opzionale)

1. **Vai su Settings → Domains**
2. **Aggiungi dominio**
   - Inserisci: `valutatore-elba.com`
3. **Configura DNS**
   ```
   Type: CNAME
   Name: @
   Value: your-project.manus.space
   TTL: 3600
   ```
4. **Verifica**
   - Attendi propagazione DNS (5-30 minuti)
   - Visita `https://valutatore-elba.com`

#### 4. Configura Secrets

Secrets già configurati automaticamente:
- `DATABASE_URL` - TiDB connection
- `JWT_SECRET` - Session signing
- `VITE_APP_*` - App configuration

Per aggiungere nuovi secrets:
1. **Settings → Secrets**
2. **Add Secret**
3. **Restart** server per applicare

#### 5. Monitoring

Dashboard integrato mostra:
- **UV/PV** - Visite uniche e pageviews
- **Uptime** - Disponibilità servizio
- **Errors** - Log errori in tempo reale

---

## 🔷 Opzione 2: Vercel

### Prerequisiti

- Account Vercel (gratuito)
- Repository GitHub/GitLab
- Database MySQL esterno (PlanetScale, TiDB Cloud, etc.)

### Setup

#### 1. Prepara Repository

```bash
# Push su GitHub
git remote add origin https://github.com/tuo-username/valutatore-elba.git
git push -u origin main
```

#### 2. Importa su Vercel

1. **Vai su** [vercel.com](https://vercel.com)
2. **New Project**
3. **Import Git Repository**
   - Seleziona repository
   - Framework: Vite
   - Root Directory: `./`

#### 3. Configura Build

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install",
  "devCommand": "pnpm dev"
}
```

#### 4. Configura Environment Variables

Aggiungi in Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=mysql://...
JWT_SECRET=your-secret
VITE_APP_TITLE=Valutatore Immobiliare Elba
VITE_APP_LOGO=/remax-logo-watermark.png
OWNER_NAME=Francesco Principe
```

#### 5. Deploy

```bash
# Deploy automatico
git push origin main

# Deploy manuale
vercel --prod
```

#### 6. Configura Dominio

1. **Vercel Dashboard → Domains**
2. **Add Domain**: `valutatore-elba.com`
3. **Configura DNS**:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

---

## 🐳 Opzione 3: Docker

### Dockerfile

Crea `Dockerfile` nella root:

```dockerfile
# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/drizzle ./drizzle

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server/index.js"]
```

### Docker Compose

Crea `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://root:password@db:3306/valutatore_elba
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=valutatore_elba
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  mysql_data:
```

### Deploy

```bash
# Build image
docker build -t valutatore-elba .

# Run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

### Deploy su Cloud

#### AWS ECS

```bash
# Login ECR
aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.eu-central-1.amazonaws.com

# Tag image
docker tag valutatore-elba:latest your-account.dkr.ecr.eu-central-1.amazonaws.com/valutatore-elba:latest

# Push
docker push your-account.dkr.ecr.eu-central-1.amazonaws.com/valutatore-elba:latest

# Deploy ECS task
aws ecs update-service --cluster your-cluster --service valutatore-elba --force-new-deployment
```

#### Google Cloud Run

```bash
# Build e push
gcloud builds submit --tag gcr.io/your-project/valutatore-elba

# Deploy
gcloud run deploy valutatore-elba \
  --image gcr.io/your-project/valutatore-elba \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated
```

---

## 🖥 Opzione 4: VPS Ubuntu

### Prerequisiti

- VPS Ubuntu 22.04+ (DigitalOcean, Hetzner, Linode, etc.)
- Accesso SSH root
- Dominio puntato al VPS

### Setup Server

#### 1. Connetti SSH

```bash
ssh root@your-server-ip
```

#### 2. Aggiorna Sistema

```bash
apt update && apt upgrade -y
apt install -y curl git nginx certbot python3-certbot-nginx
```

#### 3. Installa Node.js 22

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
npm install -g pnpm pm2
```

#### 4. Installa MySQL

```bash
apt install -y mysql-server
mysql_secure_installation

# Crea database
mysql -u root -p
```

```sql
CREATE DATABASE valutatore_elba CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'valutatore'@'localhost' IDENTIFIED BY 'strong-password';
GRANT ALL PRIVILEGES ON valutatore_elba.* TO 'valutatore'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 5. Clone Repository

```bash
cd /var/www
git clone https://github.com/tuo-username/valutatore-elba.git
cd valutatore-elba
```

#### 6. Configura Environment

```bash
nano .env
```

Inserisci:
```env
DATABASE_URL=mysql://valutatore:strong-password@localhost:3306/valutatore_elba
JWT_SECRET=your-super-secret-key
NODE_ENV=production
PORT=3000
VITE_APP_TITLE=Valutatore Immobiliare Elba
OWNER_NAME=Francesco Principe
```

#### 7. Build Applicazione

```bash
pnpm install
pnpm db:push
pnpm seed
pnpm build
```

#### 8. Setup PM2

```bash
# Start app
pm2 start npm --name "valutatore-elba" -- start

# Save PM2 config
pm2 save

# Auto-start on boot
pm2 startup
# Esegui comando suggerito

# Verifica
pm2 status
pm2 logs valutatore-elba
```

#### 9. Configura Nginx

```bash
nano /etc/nginx/sites-available/valutatore-elba
```

Inserisci:
```nginx
server {
    listen 80;
    server_name valutatore-elba.com www.valutatore-elba.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Abilita sito
ln -s /etc/nginx/sites-available/valutatore-elba /etc/nginx/sites-enabled/

# Test config
nginx -t

# Reload
systemctl reload nginx
```

#### 10. Setup SSL (Let's Encrypt)

```bash
certbot --nginx -d valutatore-elba.com -d www.valutatore-elba.com

# Auto-renewal (già configurato)
certbot renew --dry-run
```

#### 11. Firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### Manutenzione

#### Update Applicazione

```bash
cd /var/www/valutatore-elba
git pull origin main
pnpm install
pnpm build
pm2 restart valutatore-elba
```

#### Backup Database

```bash
# Backup
mysqldump -u valutatore -p valutatore_elba > backup_$(date +%Y%m%d).sql

# Restore
mysql -u valutatore -p valutatore_elba < backup_20250120.sql
```

#### Logs

```bash
# PM2 logs
pm2 logs valutatore-elba

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🗄 Configurazione Database

### TiDB Cloud (Consigliato)

1. **Crea account**: [tidbcloud.com](https://tidbcloud.com)
2. **New Cluster** → Serverless
3. **Copia connection string**:
   ```
   mysql://user.root:password@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/valutatore_elba?ssl={"rejectUnauthorized":true}
   ```
4. **Aggiungi a .env**:
   ```env
   DATABASE_URL=mysql://...
   ```

### PlanetScale

1. **Crea account**: [planetscale.com](https://planetscale.com)
2. **New Database** → valutatore-elba
3. **Connect** → Node.js
4. **Copia connection string**
5. **Aggiungi a .env**

### MySQL Locale

```bash
# Installa MySQL
apt install mysql-server

# Crea database
mysql -u root -p
```

```sql
CREATE DATABASE valutatore_elba;
CREATE USER 'valutatore'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON valutatore_elba.* TO 'valutatore'@'localhost';
```

---

## 🌐 Configurazione Dominio

### Registrar DNS

Configura record DNS presso il tuo registrar (GoDaddy, Namecheap, Cloudflare, etc.):

#### Per Manus/Vercel (CNAME)

```
Type: CNAME
Name: @
Value: your-project.manus.space
TTL: 3600

Type: CNAME
Name: www
Value: your-project.manus.space
TTL: 3600
```

#### Per VPS (A Record)

```
Type: A
Name: @
Value: your-server-ip
TTL: 3600

Type: A
Name: www
Value: your-server-ip
TTL: 3600
```

### Verifica Propagazione

```bash
# Check DNS
dig valutatore-elba.com
nslookup valutatore-elba.com

# Online tool
# https://dnschecker.org
```

---

## 🔒 SSL/HTTPS

### Manus/Vercel

SSL automatico - nessuna configurazione richiesta ✅

### VPS con Let's Encrypt

```bash
# Installa Certbot
apt install certbot python3-certbot-nginx

# Ottieni certificato
certbot --nginx -d valutatore-elba.com -d www.valutatore-elba.com

# Auto-renewal
certbot renew --dry-run

# Cron job (già configurato)
0 0 * * * certbot renew --quiet
```

### Cloudflare SSL

1. **Aggiungi sito** a Cloudflare
2. **SSL/TLS** → Full (strict)
3. **Always Use HTTPS** → On
4. **Automatic HTTPS Rewrites** → On

---

## 📊 Monitoring

### Uptime Monitoring

#### UptimeRobot (Gratuito)

1. **Crea account**: [uptimerobot.com](https://uptimerobot.com)
2. **Add Monitor**:
   - Type: HTTP(s)
   - URL: https://valutatore-elba.com
   - Interval: 5 minutes
3. **Alert Contacts**: Email, SMS, Slack

### Error Tracking

#### Sentry

```bash
pnpm add @sentry/node @sentry/react
```

```typescript
// server/index.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

```typescript
// client/src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

### Analytics

#### Google Analytics 4

```html
<!-- client/index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 💾 Backup

### Database Backup

#### Automatico (Cron)

```bash
# Crea script backup
nano /usr/local/bin/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/valutatore-elba"
mkdir -p $BACKUP_DIR

mysqldump -u valutatore -p'password' valutatore_elba | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

```bash
chmod +x /usr/local/bin/backup-db.sh

# Cron job (ogni giorno alle 2am)
crontab -e
```

```cron
0 2 * * * /usr/local/bin/backup-db.sh
```

### File Backup

```bash
# Backup codice
tar -czf valutatore-elba_$(date +%Y%m%d).tar.gz /var/www/valutatore-elba

# Upload a S3
aws s3 cp valutatore-elba_20250120.tar.gz s3://backups/valutatore-elba/
```

---

## 🔧 Troubleshooting

### Sito Non Raggiungibile

```bash
# Check server running
pm2 status

# Check logs
pm2 logs valutatore-elba

# Restart
pm2 restart valutatore-elba

# Check Nginx
nginx -t
systemctl status nginx

# Check firewall
ufw status
```

### Database Connection Error

```bash
# Test connection
mysql -u valutatore -p -h localhost valutatore_elba

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Restart app
pm2 restart valutatore-elba
```

### SSL Certificate Error

```bash
# Renew certificate
certbot renew --force-renewal

# Check certificate
certbot certificates

# Reload Nginx
systemctl reload nginx
```

### High Memory Usage

```bash
# Check memory
free -h

# Check processes
pm2 monit

# Restart app
pm2 restart valutatore-elba
```

### Slow Performance

```bash
# Enable Nginx caching
# Add to nginx config:
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;
proxy_cache my_cache;

# Enable gzip compression
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

---

## 📞 Supporto

Problemi con il deployment?

- **GitHub Issues**: [repository/issues](https://github.com/tuo-username/valutatore-elba/issues)
- **Email**: [tua-email]
- **WhatsApp**: https://wa.me/message/4K6JSOQWVOTRL1

---

**Buon Deploy! 🚀**
