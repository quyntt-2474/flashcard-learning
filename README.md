# Flashcard English Learning App

Ứng dụng học từ vựng tiếng Anh sử dụng thẻ ghi nhớ (flashcard) kết hợp thuật toán lặp lại ngắt quãng (Spaced Repetition — SM-2). Người dùng có thể tự tạo bộ thẻ, học theo phiên, tự đánh giá mức độ nhớ và theo dõi tiến trình — hoàn toàn không cần đăng nhập.

---

## Tính năng chính

- **Duyệt chủ đề**: Các bộ thẻ được phân theo chủ đề (Travel, Business, Daily Life, …).
- **Phiên học**: Học lần lượt từng thẻ, lật mặt sau và chấm điểm: **Again / Hard / Good / Easy**.
- **Thuật toán SM-2**: Tự động tính ngày ôn tập tiếp theo dựa trên điểm đánh giá.
- **Bộ thẻ cá nhân**: Tạo, chỉnh sửa và xóa bộ thẻ & thẻ riêng.
- **Tiến trình & CEFR**: Ước tính trình độ A1–C2 sau ≥ 20 lần ôn tập; hiển thị độ chính xác theo chủ đề.
- **Không cần đăng nhập**: Dữ liệu được phân tách bằng `clientId` (UUID lưu trong `localStorage`).

---

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Backend | NestJS 11, TypeScript 5, Node.js ≥ 20 LTS |
| Frontend | Next.js 15 (App Router), React 19, TypeScript 5 |
| Database | PostgreSQL 17 + Prisma 6 ORM |
| Styling | Tailwind CSS 4 |
| State | TanStack Query 5 |
| Testing | Jest, Supertest, React Testing Library, Playwright |

---

## Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu |
|---------|---------------------|
| Node.js | 20 LTS |
| npm | 10 |
| PostgreSQL | 17 |
| Git | bất kỳ |

---

## Cài đặt & Chạy dự án

### 1. Clone repository

```bash
git clone <repo-url> flashcard-learning
cd flashcard-learning
```

### 2. Cài đặt dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Cấu hình biến môi trường

**`backend/.env`**
```dotenv
DATABASE_URL=
PORT=
CORS_ORIGIN=
```

**`frontend/.env.local`**
```dotenv
NEXT_PUBLIC_API_BASE_URL=
```

### 4. Khởi tạo database

```bash
cd backend

# Tạo và áp dụng migration
npx prisma migrate dev --name init

# Seed dữ liệu mẫu (categories & decks)
npx prisma db seed
```

### 5. Chạy môi trường development

Mở **2 terminal**:

```bash
# Terminal 1 — Backend (NestJS)
cd backend
npm run start:dev
# → http://localhost:3001
```

```bash
# Terminal 2 — Frontend (Next.js)
cd frontend
npm run dev
# → http://localhost:3000
```

Truy cập **http://localhost:3000** để sử dụng ứng dụng.

---

## Build production

### Backend

```bash
cd backend
npm run build
npm run start:prod
```

### Frontend

```bash
cd frontend
npm run build
npm run start
```

---

## Chạy tests

```bash
# Backend — unit tests
cd backend && npm run test

# Backend — coverage
cd backend && npm run test:cov

# Backend — integration / e2e
cd backend && npm run test:e2e

# Frontend — lint
cd frontend && npm run lint
```

---

## Cấu trúc dự án

```
flashcard-learning/
├── backend/                        # NestJS REST API
│   ├── prisma/
│   │   ├── schema.prisma           # Schema nguồn (single source of truth)
│   │   ├── migrations/             # Migration tự động sinh
│   │   └── seed.ts                 # Dữ liệu seed: categories & decks
│   └── src/
│       ├── core/
│       │   └── sm2/                # Thuật toán SM-2 (pure function, unit-tested)
│       ├── modules/
│       │   ├── categories/         # Module quản lý chủ đề
│       │   ├── decks/              # Module quản lý bộ thẻ
│       │   ├── cards/              # Module quản lý thẻ
│       │   ├── sessions/           # Module quản lý phiên học
│       │   └── progress/           # Module thống kê tiến trình
│       ├── common/
│       │   ├── decorators/         # @ClientId decorator
│       │   └── guards/             # ClientIdGuard
│       └── prisma/                 # PrismaService singleton
│
├── frontend/                       # Next.js 15 App Router
│   ├── app/
│   │   ├── page.tsx                # Trang Home
│   │   ├── categories/[id]/        # Trang chi tiết chủ đề
│   │   ├── decks/[id]/             # Trang chi tiết bộ thẻ
│   │   ├── study/[sessionId]/      # Trang học flashcard
│   │   ├── my-decks/               # Trang bộ thẻ cá nhân
│   │   └── progress/               # Trang tiến trình & CEFR
│   ├── components/                 # UI components (FlashCard, GradeBar, …)
│   ├── hooks/                      # Custom React hooks
│   ├── services/
│   │   └── api.ts                  # Typed API client
│   └── lib/
│       └── clientId.ts             # UUID helper (localStorage)
│
└── specs/
    └── 001-flashcard-english-learning/   # Tài liệu đặc tả & kế hoạch
```

---

## API Overview

Backend cung cấp REST API trên base path `/api`. Một số endpoint chính:

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/categories` | Danh sách chủ đề |
| `GET` | `/api/decks` | Danh sách bộ thẻ của client |
| `POST` | `/api/decks` | Tạo bộ thẻ mới |
| `GET` | `/api/decks/:id/cards` | Danh sách thẻ trong bộ |
| `POST` | `/api/sessions` | Bắt đầu phiên học |
| `POST` | `/api/sessions/:id/grade` | Chấm điểm thẻ (SM-2) |
| `GET` | `/api/progress` | Thống kê tiến trình & CEFR |

> Mọi request cần đính kèm header `X-Client-ID: <uuid>` để phân tách dữ liệu.

Chi tiết đầy đủ: [specs/001-flashcard-english-learning/contracts/api.md](specs/001-flashcard-english-learning/contracts/api.md)

---

## License

UNLICENSED — dự án nội bộ.
