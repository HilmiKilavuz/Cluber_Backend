#  Club Connect Backend

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-%23FA7343.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

**Modern, güvenli ve ölçeklenebilir bir kulüp yönetim platformu**

[English](./README.md) · [Features](#-özellikler) · [Architecture](#-mimari) · [Getting Started](#-hızlı-başlangıç) · [API Reference](#-api-endpointleri)

</div>

---

##  Proje Hakkında

Club Connect, **ilgi alanlarına dayalı topluluklar oluşturmak, yönetmek ve büyütmek** için tasarlanmış kapsamlı bir backend platformudur. Kullanıcılar kendi ilgi alanlarına göre kulüpler kurabilir, bu topluluklara katılabilir, gerçek zamanlı sohbet edebilir ve etkinlikler organize edebilir.

###  Temel Değer Önerileri

| Özellik | Açıklama |
|---------|----------|
|  **Güvenli Kimlik Doğrulama** | JWT tabanlı, HttpOnly cookie ile güvenli oturum yönetimi ve e-posta doğrulama |
|  **Kulüp Yönetimi** | Tam CRUD operasyonları, üye yönetimi ve rol tabanlı erişim kontrolü |
|  **Gerçek Zamanlı Sohbet** | Socket.io ile anlık mesajlaşma ve kulüp odaları |
| 🤖 **Yapay Zeka Entegrasyonu** | Kullanıcı kulüplerine göre karakter analizi ve AI destekli kulüp önerileri (OpenRouter) |
|  **Etkinlik Organizasyonu** | Etkinlik oluşturma, RSVP sistemi ve otomatik hatırlatmalar |
|  **Enterprise Güvenlik** | Rate limiting, Helmet, input validation ve CSRF koruması |

---

##  Teknoloji Yığını

### Backend Stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            Application Layer                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ ┌───────┐  │
│  │   Auth      │ │   Clubs     │ │   Chat      │ │ Events  │ │  AI   │  │
│  │   Module    │ │   Module    │ │   Module    │ │ Module  │ │ Mod.  │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ └───────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     Infrastructure Layer                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │   NestJS    │ │   Prisma    │ │  Socket.io  │ │   Cron    │ │
│  │   (TS)      │ │   ORM       │ │   WebSocket │ │  Jobs     │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                               │
│  ┌─────────────┐ ┌─────────────┐ ┌────────────────────────────┐ │
│  │ PostgreSQL  │ │    Redis    │ │  Nodemailer (SMTP)        │ │
│  │  (Primary)  │ │  (Cache)    │ │  (E-posta gönderimi)      │ │
│  └─────────────┘ └─────────────┘ └────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

###  Kullanılan Teknolojiler

| Kategori | Teknoloji | Versiyon |
|----------|-----------|----------|
| **Framework** | NestJS | ^10.4.15 |
| **Language** | TypeScript | ^5.7.3 |
| **Database** | PostgreSQL | 16+ |
| **ORM** | Prisma | ^6.3.1 |
| **Cache/Real-time** | Redis | Latest |
| **Authentication** | JWT (@nestjs/jwt) | ^10.2.0 |
| **WebSocket** | Socket.io | ^10.4.15 |
| **Validation** | class-validator | ^0.14.1 |
| **Security** | @nestjs/throttler, Helmet | ^6.3.0, ^8.0.0 |
| **Email** | Nodemailer | ^8.0.3 |
| **Scheduling** | @nestjs/schedule | ^6.1.1 |
| **Container** | Docker & Docker Compose | Latest |

---

##  Proje Yapısı

```
cluber-backend/
├── 📁 src/
│   ├── 📁 common/                      # Paylaşılan kodlar
│   │   ├── 📁 filters/                 # Exception filter'lar
│   │   │   ├── all-exceptions.filter.ts
│   │   │   └── http-exception.filter.ts
│   │   └── 📁 prisma/                  # Prisma modülü
│   │       ├── prisma.module.ts
│   │       └── prisma.service.ts
│   │
│   ├── 📁 modules/                     # Feature modülleri
│   │   ├── 🟢 auth/                    # Kimlik doğrulama
│   │   │   ├── auth.controller.ts      # REST endpoints
│   │   │   ├── auth.service.ts         # Business logic
│   │   │   ├── auth.module.ts          # Module definition
│   │   │   ├── guards/                 # JWT guards
│   │   │   ├── decorators/             # Custom decorators
│   │   │   ├── dto/                    # Validation DTOs
│   │   │   └── interfaces/             # TypeScript types
│   │   │
│   │   ├── 🔵 clubs/                   # Kulüp yönetimi
│   │   ├── 🟣 chat/                    # WebSocket sohbet
│   │   ├── 🟠 events/                  # Etkinlik yönetimi
│   │   ├── 🤖 ai/                      # Yapay zeka servisleri
│   │   ├── 🔴 health/                  # Health check
│   │   ├── 🟡 mail/                    # E-posta servisi
│   │   ├── ⚪ users/                    # Kullanıcı yönetimi
│   │   └── ⚫ cron/                     # Zamanlı işler
│   │
│   ├── 📁 types/                       # Custom type definitions
│   ├── app.module.ts                  # Root module
│   └── main.ts                         # Application entry point
│
├── 📁 prisma/
│   ├── schema.prisma                   # Database schema
│   └── seed.ts                         # Database seeder
│
├── 📁 test/                            # Test dosyaları
├── docker-compose.yml                  # Production Docker setup
├── docker-compose.dev.yml              # Development Docker setup
├── Dockerfile                          # Application container
├── package.json                        # Dependencies
└── tsconfig.json                       # TypeScript config
```

---

##  Mimari Tasarım

### Veritabanı Şeması (ER Diagram)

```
┌─────────────────┐       ┌─────────────────┐
│      User       │       │     Club        │
├─────────────────┤       ├─────────────────┤
│ id (UUID)       │       │ id (UUID)       │
│ email           │       │ name            │
│ passwordHash    │──────<│ description     │
│ displayName     │       │ category        │
│ bio             │       │ imageUrl        │
│ avatarUrl       │       │ creatorId (FK)  │
│ interests []    │       │ isActive        │
│ createdAt       │       │ createdAt       │
└────────┬────────┘       └────────┬────────┘
         │                         │
         │    ┌────────────────────┤
         │    │                    │
         ▼    ▼                    ▼
┌─────────────────┐       ┌─────────────────┐
│   Membership    │       │    Message      │
├─────────────────┤       ├─────────────────┤
│ id (UUID)       │       │ id (UUID)       │
│ userId (FK)     │       │ content         │
│ clubId (FK)     │       │ userId (FK)     │
│ role (ENUM)     │       │ clubId (FK)     │
│ joinedAt        │       │ createdAt       │
└─────────────────┘       └────────┬────────┘
                                   │
         ┌─────────────────────────┤
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│     Event       │       │ EventParticipant│
├─────────────────┤       ├─────────────────┤
│ id (UUID)       │       │ id (UUID)       │
│ title           │       │ userId (FK)     │
│ description     │       │ eventId (FK)    │
│ date            │       │ reminderSent    │
│ location        │       │ joinedAt        │
│ clubId (FK)     └───────┴─────────────────┘
│ createdAt       │
└─────────────────┘
```

### Rol Tabanlı Erişim Kontrolü (RBAC)

```
        ┌─────────────┐
        │    ADMIN    │  ◄── Tüm işlemlere erişim
        └──────┬──────┘
               │
    ┌──────────┼──────────┐
    ▼                     ▼
┌─────────┐          ┌───────────┐
│MODERATOR│          │  MEMBER   │
├─────────┤          ├───────────┤
│ Club    │          │ Club      │
│ - Update│          │ - Read    │
│ - Delete│          │ - Join    │
│ - Member│          │ - Message │
│ - Manage│          │ - RSVP    │
└─────────┘          └───────────┘
```

---

##  Hızlı Başlangıç

### Ön Gereksinimler

| Gereksinim | Minimum Versiyon | Açıklama |
|------------|------------------|-----------|
| Node.js | v18+ | JavaScript runtime |
| Docker | Latest | Container platform |
| Docker Compose | Latest | Multi-container orchestration |
| npm | v9+ | Package manager |

### Kurulum Adımları

#### 1. Projeyi Klonlayın

```bash
git clone https://github.com/HilmiKilavuz/Cluber_Backend.git
cd Cluber_Backend
```

#### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

#### 3. Ortam Değişkenlerini Yapılandırın

```bash
# .env.example dosyasını kopyalayın
cp .env.example .env

# .env dosyasını düzenleyin
#  Önemli: JWT_SECRET ve veritabanı şifrelerini değiştirin!
```

#### 4. Docker ile Çalıştırma (Önerilen)

```bash
# Tüm servisleri başlat (PostgreSQL, Redis, NestJS)
npm run docker:up

# Servisleri durdurmak için
npm run docker:down
```

#### 5. Local Geliştirme

```bash
# Veritabanı migrasyonları çalıştır
npm run prisma:migrate:dev

# Prisma Client oluştur
npm run prisma:generate

# Geliştirme sunucusunu başlat
npm run start:dev
```

Sunucu `http://localhost:3000` adresinde çalışacak.

---

##  API Endpointleri

###  Authentication

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| POST | `/auth/register` | Yeni kullanıcı kaydı | ❌ |
| POST | `/auth/login` | Kullanıcı girişi | ❌ |
| POST | `/auth/logout` | Kullanıcı çıkışı | ✅ |
| GET | `/auth/profile` | Kullanıcı profilini getir | ✅ |
| POST | `/auth/verify-email` | E-posta doğrulama | ❌ |

###  Clubs

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | `/clubs` | Tüm kulüpleri listele | ❌ |
| POST | `/clubs` | Yeni kulüp oluştur | ✅ |
| GET | `/clubs/:id` | Kulüp detaylarını getir | ❌ |
| PATCH | `/clubs/:id` | Kulüp bilgilerini güncelle | ✅ |
| DELETE | `/clubs/:id` | Kulübü sil | ✅ |
| POST | `/clubs/:id/join` | Kulübe katıl | ✅ |
| POST | `/clubs/:id/leave` | Kulüpten ayrıl | ✅ |
| GET | `/clubs/:id/members` | Kulüp üyelerini listele | ❌ |

###  Events

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | `/events` | Tüm etkinlikleri listele | ❌ |
| POST | `/events` | Yeni etkinlik oluştur | ✅ |
| GET | `/events/:id` | Etkinlik detaylarını getir | ❌ |
| PATCH | `/events/:id` | Etkinlik bilgilerini güncelle | ✅ |
| DELETE | `/events/:id` | Etkinliği sil | ✅ |
| POST | `/events/:id/rsvp` | Etkinliğe katılım | ✅ |

###  WebSocket Events (Chat)

| Event | Yön | Açıklama |
|-------|-----|----------|
| `joinClub` | Client → Server | Kulüp sohbet odasına katıl |
| `leaveClub` | Client → Server | Kulüp sohbet odasından ayrıl |
| `sendMessage` | Client → Server | Mesaj gönder |
| `receiveMessage` | Server → Client | Mesaj alma (broadcast) |
| `userJoined` | Server → Client | Kullanıcı katıldı bildirimi |
| `userLeft` | Server → Client | Kullanıcı ayrıldı bildirimi |

### 🤖 Yapay Zeka (AI)

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| POST | `/ai/profile-insight` | Kullanıcının kulüplerine göre AI karakter yorumu ve kulüp önerisi | ✅ |

###  Health Check

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | `/health` | Uygulama sağlık durumu | ❌ |
| GET | `/health/ready` | Readiness probe | ❌ |
| GET | `/health/live` | Liveness probe | ❌ |

---

##  Environment Değişkenleri

| Değişken | Açıklama | Varsayılan | Required |
|----------|----------|------------|----------|
| `NODE_ENV` | Ortam modu | development | ✅ |
| `APP_PORT` | Uygulama portu | 3000 | ❌ |
| `CORS_ORIGIN` | İzin verilen origin | http://localhost:3001 | ✅ |
| `POSTGRES_USER` | PostgreSQL kullanıcı adı | cluber | ✅ |
| `POSTGRES_PASSWORD` | PostgreSQL şifresi | cluber_secret | ✅ |
| `POSTGRES_DB` | Veritabanı adı | cluber_db | ✅ |
| `POSTGRES_PORT` | PostgreSQL portu | 5432 | ❌ |
| `DATABASE_URL` | PostgreSQL bağlantı URL | - | ✅ |
| `REDIS_HOST` | Redis host | localhost | ❌ |
| `REDIS_PORT` | Redis port | 6379 | ❌ |
| `JWT_SECRET` | JWT gizli anahtar | - | ✅ |
| `JWT_EXPIRES_IN` | JWT token süresi | 15m | ❌ |
| `MAIL_HOST` | SMTP sunucu adresi | - | ✅ |
| `MAIL_PORT` | SMTP port | 587 | ❌ |
| `MAIL_USER` | SMTP kullanıcı adı | - | ✅ |
| `MAIL_PASSWORD` | SMTP şifre | - | ✅ |

---

##  Docker Komutları

```bash
# Tüm servisleri build ve başlat
docker-compose up -d --build

# Sadece build et
docker-compose build

# Servisleri başlat
docker-compose start

# Servisleri durdur
docker-compose stop

# Servisleri sil (volumes dahil)
docker-compose down -v

# Logları takip et (tüm servisler)
docker-compose logs -f

# Belirli bir servisin loglarını takip et
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis
```

---

##  Test

```bash
# Unit testleri çalıştır
npm run test

# Test coverage raporu
npm run test:cov

# E2E testleri çalıştır
npm run test:e2e
```

---

##  Kod Kalitesi

```bash
# Lint (ESLint)
npm run lint

# Format (Prettier)
npm run format
```

---

##  Güvenlik Best Practices

>  **Önemli**: Production ortamına geçmeden önce aşağıdaki adımları mutlaka uygulayın!

- [ ] `JWT_SECRET` değerini güçlü ve benzersiz bir değerle değiştirin
- [ ] Veritabanı şifrelerini güçlü tutun (en az 16 karakter)
- [ ] `.env` dosyasını asla version control'e atmayın
- [ ] Rate limiting değerlerini production'a uygun yapılandırın
- [ ] CORS_ORIGIN'i sadece frontend adresiyle sınırlayın
- [ ] SSL/TLS kullanın (production'da)
- [ ] Loglama ve monitoring ekleyin

---

##  Katkıda Bulunma

1. Fork edin (`https://github.com/HilmiKilavuz/Cluber_Backend/fork`)
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişiklikleri commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'i push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın
---

##  Yazar

**Hilmi Kılavuz**

- GitHub: [HilmiKilavuz](https://github.com/HilmiKilavuz)
- Proje: [Club Connect](https://github.com/HilmiKilavuz/Cluber_Backend)

---

<div align="center">

⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!

</div>
