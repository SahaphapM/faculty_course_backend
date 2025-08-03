<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

<p align="center">
  <strong>Englishstrong> | <a href="#-การติดตั้ง">ไทย</a>
</p>

<p align="center">
  A progressive Node.js framework for building efficient and scalable server-side applications with Bun runtime for better performance.
</p>

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
  <a href="https://bun.sh" target="_blank"><img src="https://img.shields.io/badge/Bun-0.6.0-brightgreen.svg" alt="Bun Runtime" /></a>
</p>

## 🚀 Project Overview

This is the backend service for a skill mapping application built with NestJS, Prisma, and optimized for Bun runtime. The application provides REST APIs for managing skills, curriculums, users, and various educational entities.

## 📋 Prerequisites

- Node.js 18+ (for compatibility)
- Bun runtime (recommended for better performance)
- PostgreSQL database
- Prisma CLI

## 🛠️ Installation

### Option 1: Using Bun (Recommended)

```bash
# Install dependencies with Bun
$ bun install

# Generate Prisma client
$ bunx prisma generate
```

### Option 2: Using npm (Fallback)

```bash
# Install dependencies with npm
$ npm install

# Generate Prisma client
$ npx prisma generate
```

## 🗄️ Database Setup

### Initial Database Migration

```bash
# Run initial migration with Bun (recommended)
$ bunx prisma migrate dev --name init

# Or with npm
$ npx prisma migrate dev --name init
```

### Seeding Initial Data

```bash
# Run database seed with Bun
$ bunx prisma db seed

# Or with npm
$ npx prisma db seed
```

### Updating Database Schema

When you need to update your database schema:

```bash
# Create and apply new migration with Bun
$ bunx prisma migrate dev --name <migration-name>

# Or with npm
$ npx prisma migrate dev --name <migration-name>
```

## 🏃 Running the App

### Development Mode (with Hot Reload)

```bash
# Using Bun (recommended for better performance)
$ bun run start:dev

# Using npm
$ npm run start:dev
```

### Production Mode

```bash
# Build the application
$ bun run build

# Start in production
$ bun run start:prod
```

## 🧪 Testing

```bash
# Run unit tests with Bun
$ bun run test

# Run e2e tests with Bun
$ bun run test:e2e

# Run test coverage with Bun
$ bun run test:cov
```

## 📁 Project Structure

```
src/
├── auth/                 # Authentication module
├── modules/              # Business logic modules
│   ├── skills/          # Skills management
│   ├── curriculums/     # Curriculum management
│   ├── users/           # User management
│   └── ...              # Other modules
├── prisma/              # Prisma service
├── app/                 # App module and main controller
└── main.ts              # Application entry point
prisma/
├── schema.prisma        # Database schema
├── migrations/          # Database migrations
└── seed.ts              # Database seed script
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/skill_mapping"

# JWT
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="1h"

# Refresh JWT
REFRESH_JWT_SECRET="your-refresh-jwt-secret"
REFRESH_JWT_EXPIRES_IN="7d"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## 🌟 Key Features

- **Authentication**: JWT-based authentication with refresh tokens
- **Role-based Access Control**: Multi-role user system
- **Skill Management**: Comprehensive skill tracking and mapping
- **Curriculum Integration**: Course and program management
- **Database Migrations**: Easy schema updates with Prisma
- **Performance Optimized**: Built for Bun runtime

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `bun run test`
5. Commit and push
6. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

## 📖 คำแนะการใช้งาน (ไทย)

<p align="center">
  <a href="#-project-overview">English</a> | <strong>ไทย</strong>
</p>

<p align="center">
  แพลตฟอร์ม Node.js สำหรับสร้างแอปพลิเคชันแบบ Server-side ที่มีประสิทธิภาพและขยายสเกลได้ โดยใช้ Bun runtime เพื่อประสิทธิภาพที่ดีขึ้น
</p>

## 🚀 ภาพรวมโปรเจกต์

นี่คือบริการ backend สำหรับแอปพลิเคชันการจับคูณทักษะ (skill mapping) ที่สร้างด้วย NestJS, Prisma และเพื่อให้ประสิทธิภาพสูงสุดด้วย Bun runtime แอปพลิเคชันนี้มี API สำหรับจัดการทักษะ, หลักสูตร, ผู้ใช้ และเอนทิตีทางการศึกษาต่างๆ

## 📋 ข้อกำหนดเบื้องต้น

- Node.js 18+ (สำหรับความเข้ากันได้)
- Bun runtime (แนะนำสำหรับประสิทธิภาพที่ดีที่สุด)
- ฐานข้อมูล PostgreSQL
- Prisma CLI

## 🛠️ การติดตั้ง

### ตัวเลือกที่ 1: ใช้ Bun (แนะนำ)

```bash
# ติดตั้ง dependencies ด้วย Bun
$ bun install

# สร้าง Prisma client
$ bunx prisma generate
```

### ตัวเลือกที่ 2: ใช้ npm (ทางเลือก)

```bash
# ติดตั้ง dependencies ด้วย npm
$ npm install

# สร้าง Prisma client
$ npx prisma generate
```

## 🗄️ การตั้งค่าฐานข้อมูล

### การ Migration ฐานข้อมูลเริ่มต้น

```bash
# รัน migration เริ่มต้นด้วย Bun (แนะนำ)
$ bunx prisma migrate dev --name init

# หรือใช้ npm
$ npx prisma migrate dev --name init
```

### เติมข้อมูลเริ่มต้น (Seeding)

```bash
# เติมข้อมูลเริ่มต้นด้วย Bun
$ bunx prisma db seed

# หรือใช้ npm
$ npx prisma db seed
```

### อัปเดต Schema ฐานข้อมูล

เมื่อคุณต้องการอัปเดต schema ของฐานข้อมูล:

```bash
# สร้างและนำ migration ใหม่ไปใช้งานด้วย Bun
$ bunx prisma migrate dev --name <ชื่อ-migration>

# หรือใช้ npm
$ npx prisma migrate dev --name <ชื่อ-migration>
```

## 🏃 การรันแอปพลิเคชัน

### โหมดพัฒนา (มี Hot Reload)

```bash
# ใช้ Bun (แนะนำสำหรับประสิทธิภาพที่ดีขึ้น)
$ bun run start:dev

# ใช้ npm
$ npm run start:dev
```

### โหมด Production

```bash
# Build แอปพลิเคชัน
$ bun run build

# เริ่มในโหมด production
$ bun run start:prod
```

## 🧪 การทดสอบ

```bash
# รัน unit tests ด้วย Bun
$ bun run test

# รัน e2e tests ด้วย Bun
$ bun run test:e2e

# รัน test coverage ด้วย Bun
$ bun run test:cov
```

## 📁 โครงสร้างโปรเจกต์

```
src/
├── auth/                 # โมดูลการยืนยันตัวตน
├── modules/              # โมดูล logic ทางธุรกิจ
│   ├── skills/          # การจัดการทักษะ
│   ├── curriculums/     # การจัดการหลักสูตร
│   ├── users/           # การจัดการผู้ใช้
│   └── ...              # โมดูลอื่นๆ
├── prisma/              # บริการ Prisma
├── app/                 # App module และ controller
└── main.ts              # จุดเริ่มต้นของแอปพลิเคชัน
prisma/
├── schema.prisma        # Schema ฐานข้อมูล
├── migrations/          # Database migrations
└── seed.ts              # Script สำหรับ seeding
```

## 🔧 ตัวแปรสภาพแวดล้อม

สร้างไฟล์ `.env` ใน root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/skill_mapping"

# JWT
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="1h"

# Refresh JWT
REFRESH_JWT_SECRET="your-refresh-jwt-secret"
REFRESH_JWT_EXPIRES_IN="7d"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## 🌟 คุณสมบัติหลัก

- **การยืนยันตัวตน**: ใช้ JWT พร้อม refresh tokens
- **การควบคุมสิทธิ์**: ระบบผู้ใช้หลายบทบาท
- **การจัดการทักษะ**: การติดตามและจับคูณทักษะครบวงจร
- **การรวมหลักสูตร**: การจัดการวิชาและโปรแกรม
- **Database Migrations**: อัปเดต schema ได้ง่ายด้วย Prisma
- **ประสิทธิภาพสูง**: สร้างมาสำหรับ Bun runtime

## 🤝 การมีส่วนร่วม

1. Fork โปรเจกต์
2. สร้าง branch สำหรับ feature ใหม่
3. ทำการเปลี่ยนแปลง
4. รัน tests: `bun run test`
5. Commit และ push
6. สร้าง Pull Request

## 📄 สัญญาอนุญาต

โปรเจกต์นี้อยู่ภายใต้สัญญาอนุญาต MIT License.
