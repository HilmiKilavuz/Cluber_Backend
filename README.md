# Club Connect Backend

![NestJS](https://img.shields.io/badge/NestJS-%23FA7343.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

Club Connect, kullanıcıların ilgi alanlarına göre kulüp oluşturabileceği, bu kulüplere katılabileceği, gerçek zamanlı sohbet edebileceği ve etkinlikler düzenleyebileceği kapsamlı bir platformdur.

##  Özellikler

- **Kullanıcı Sistemi**: Kayıt, giriş ve JWT tabanlı kimlik doğrulama
- **Kulüp Yönetimi**: Kulüp oluşturma, güncelleme, silme ve üye yönetimi
- **Gerçek Zamanlı Sohbet**: Socket.io tabanlı anlık mesajlaşma
- **Etkinlik Yönetimi**: Etkinlik oluşturma, RSVP ve katılımcı takibi
- **Güvenlik**: Rate limiting, input validation, Helmet güvenlik başlıkları
- **Role-Based Access Control**: Admin, Moderator, Member roller

##  Kullanılan Teknolojiler

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache/Real-time**: Redis
- **Authentication**: JWT with HttpOnly Cookies
- **Real-time**: Socket.io (WebSockets)
- **Validation**: class-validator, class-transformer
- **Security**: @nestjs/throttler, Helmet

### DevOps
- **Container**: Docker & Docker Compose
- **Node.js**: LTS version

##  Ön Gereksinimler

- Node.js (v18+)
- Docker & Docker Compose
- PostgreSQL ( lokalde çalıştırmak için)
- Redis ( lokalde çalıştırmak için)

##  Kurulum

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/HilmiKilavuz/Cluber_Backend.git
cd cluber-backend
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Ortam Değişkenlerini Yapılandırın

```bash
# .env.example dosyasını kopyalayın ve .env olarak yeniden adlandırın
cp .env.example .env

# .env dosyasını düzenleyin
# Not: Gerçek projede JWT_SECRET ve veritabanı şifrelerini değiştirin
```

### 4. Docker ile Çalıştırma (Önerilen)

```bash
# Tüm servisleri başlatın (PostgreSQL, Redis, NestJS)
npm run docker:up

# Servisleri durdurmak için
npm run docker:down
```

### 5. Local Çalıştırma

```bash
# Veritabanı migrasyonları
npm run prisma:migrate:dev

# Prisma Client oluştur
npm run prisma:generate

# Geliştirme sunucusunu başlat
npm run start:dev
```

Sunucu `http://localhost:3000` adresinde çalışacak.

##  Environment Değişkenleri

| Değişken | Açıklama | Varsayılan |
|----------|----------|------------|
| `NODE_ENV` | Ortam modu | development |
| `APP_PORT` | Uygulama portu | 3000 |
| `CORS_ORIGIN` | CORS izin verilen origin | http://localhost:3001 |
| `POSTGRES_USER` | PostgreSQL kullanıcı adı | cluber |
| `POSTGRES_PASSWORD` | PostgreSQL şifresi | cluber_secret |
| `POSTGRES_DB` | Veritabanı adı | cluber_db |
| `POSTGRES_PORT` | PostgreSQL portu | 5432 |
| `DATABASE_URL` | PostgreSQL bağlantı URL | - |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_PORT` | Redis port | 6379 |
| `JWT_SECRET` | JWT gizli anahtar | - |
| `JWT_EXPIRES_IN` | JWT token süresi | 15m |

## Proje Yapısı

```
src/
├── app.module.ts              # Root module
├── main.ts                    # Application entry point
├── common/
│   ├── filters/               # Exception filters
│   └── prisma/                # Prisma module & service
└── modules/
    ├── auth/                  # Authentication module
    │   ├── controllers/       # Auth endpoints
    │   ├── services/          # Auth business logic
    │   ├── guards/            # JWT guard
    │   ├── decorators/        # Custom decorators
    │   ├── dto/               # Data transfer objects
    │   └── interfaces/        # TypeScript interfaces
    ├── clubs/                 # Club management
    ├── chat/                  # Real-time chat (WebSocket)
    ├── events/                # Event management
    └── health/                # Health check endpoints
```

## 📡 API Endpointleri

### Auth
- `POST /auth/register` - Yeni kullanıcı kaydı
- `POST /auth/login` - Kullanıcı girişi
- `POST /auth/logout` - Kullanıcı çıkışı
- `GET /auth/profile` - Kullanıcı profilini getir

### Clubs
- `GET /clubs` - Tüm kulüpleri listele
- `POST /clubs` - Yeni kulüp oluştur
- `GET /clubs/:id` - Kulüp detaylarını getir
- `PATCH /clubs/:id` - Kulüp bilgilerini güncelle
- `DELETE /clubs/:id` - Kulübü sil
- `POST /clubs/:id/join` - Kulübe katıl
- `POST /clubs/:id/leave` - Kulüpten ayrıl
- `GET /clubs/:id/members` - Kulüp üyelerini listele

### Events
- `GET /events` - Tüm etkinlikleri listele
- `POST /events` - Yeni etkinlik oluştur
- `GET /events/:id` - Etkinlik detaylarını getir
- `PATCH /events/:id` - Etkinlik bilgilerini güncelle
- `DELETE /events/:id` - Etkinliği sil
- `POST /events/:id/rsvp` - Etkinliğe katılım/RSVP

### Chat (WebSocket)
- `joinClub` - Kulüp sohbet odasına katıl
- `leaveClub` - Kulüp sohbet odasından ayrıl
- `sendMessage` - Mesaj gönder
- `receiveMessage` - Mesaj alma (event)

### Health
- `GET /health` - Uygulama sağlık durumu

##  Veritabanı Şeması

### User
- `id` (UUID) - Benzersiz kimlik
- `email` (String, unique) - E-posta adresi
- `passwordHash` (String) - Şifrelenmiş şifre
- `displayName` (String) - Görünen isim
- `bio` (String, optional) - Biyografi
- `avatarUrl` (String, optional) - Avatar URL
- `interests` (String[]) - İlgi alanları

### Club
- `id` (UUID) - Benzersiz kimlik
- `name` (String, unique) - Kulüp adı
- `description` (String) - Açıklama
- `category` (String) - Kategori
- `imageUrl` (String, optional) - Kulüp resmi
- `creatorId` (String) - Oluşturan kullanıcı ID

### Membership
- `id` (UUID) - Benzersiz kimlik
- `userId` (String) - Kullanıcı ID
- `clubId` (String) - Kulüp ID
- `role` (Enum) - ADMIN, MODERATOR, MEMBER

### Event
- `id` (UUID) - Benzersiz kimlik
- `title` (String) - Etkinlik başlığı
- `description` (String, optional) - Açıklama
- `date` (DateTime) - Etkinlik tarihi
- `location` (String) - Konum
- `clubId` (String) - Kulüp ID

### Message
- `id` (UUID) - Benzersiz kimlik
- `content` (String) - Mesaj içeriği
- `userId` (String) - Gönderen kullanıcı ID
- `clubId` (String) - Kulüp ID

##  Docker Komutları

```bash
# Tüm servisleri build ve başlat
docker-compose up -d --build

# Sadece build
docker-compose build

# Servisleri başlat
docker-compose start

# Servisleri durdur
docker-compose stop

# Servisleri sil
docker-compose down

# Logları takip et
docker-compose logs -f

# Belirli bir servisin loglarını takip et
docker-compose logs -f app
```

##  Test

```bash
# Unit testleri çalıştır
npm run test

# Test coverage raporu
npm run test:cov

# E2E testleri çalıştır
npm run test:e2e
```

##  Kod Kalitesi

```bash
# Lint
npm run lint

# Format
npm run format
```

##  Güvenlik Notları

- `JWT_SECRET` değerini production'da mutlaka değiştirin
- Veritabanı şifrelerini güçlü tutun
- `.env` dosyasını asla version control'e atmayın
- Rate limiting production'da uygun şekilde yapılandırın


##  Yazar

Hilmi Kılavuz - [GitHub](https://github.com/HilmiKilavuz)

---

⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!
