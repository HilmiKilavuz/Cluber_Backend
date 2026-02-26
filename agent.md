# Project Context: Club Connect (Backend)

## 1. Project Overview
- **Goal**: A platform where users can create/join clubs based on interests, chat in real-time, and organize events.
- **Platforms**: Web (Next.js), Mobile (React Native), Backend (NestJS).
- **Current Focus**: Building the Backend (API & Database).

## 2. Tech Stack (Backend)
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL (Primary Data), Redis (Caching/Real-time), MongoDB (Chat Logs - planned).
- **ORM**: Prisma
- **Communication**: REST API & WebSockets (Socket.io) for real-time features.
- **Infrastructure**: Docker & Docker Compose.
- **Auth**: JWT with HttpOnly Cookies & OAuth2.

## 3. Architecture & Standards
- **Pattern**: Modular Monolith with Clean Architecture principles.
- **Security First**: 
    - Implement Rate Limiting.
    - Strict Input Validation (class-validator/transformer).
    - Prevent SQL Injection (handled by Prisma, but keep an eye on raw queries).
    - CSRF & XSS protection.
    - Role-Based Access Control (RBAC): Admin, Moderator, Member.

## 4. Database Schema (Draft)
- `User`: id, email, password_hash, profile_info, interests[].
- `Club`: id, name, description, category, creator_id, created_at.
- `Membership`: user_id, club_id, role (Admin/Member).
- `Event`: id, club_id, title, date, location, participants[].
- `Message`: id, club_id, user_id, content, timestamp.

## 5. Development Rules for AI
- **Language**: Always write comments in English, but communication with the user is in Turkish.
- **Types**: Always use strict TypeScript types. Avoid `any`.
- **Validation**: Every DTO must have validation decorators.
- **Error Handling**: Use a global exception filter. Provide meaningful error messages.
- **Docker**: All services must be compatible with the existing `docker-compose.yml`.

## 6. Current Tasks & Roadmap
1. [ ] Initial NestJS & Prisma setup.
2. [ ] Dockerize PostgreSQL and NestJS.
3. [ ] Implement Auth System (Register/Login).
4. [ ] Create Club CRUD and Membership logic.
5. [ ] WebSocket integration for Chat.