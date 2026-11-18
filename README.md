# ShopSphere — Full-Stack E-Commerce Platform

A production-ready full-stack e-commerce store built with the MERN stack + Socket.IO.

## 🚀 Quick Start (Local Dev)

### Prerequisites
- Node.js 18+
- MongoDB running on `localhost:27017`

### 1. Backend
```bash
cd server
npm install
# (Optional) Seed the database with sample data:
npm run seed
# Start dev server:
npm run dev
```
Server runs at: http://localhost:5000

### 2. Frontend
```bash
cd client
npm install
npm run dev
```
Client runs at: http://localhost:5173

### 3. Demo Login
| Role    | Email                    | Password   |
|---------|--------------------------|------------|
| Admin   | admin@shopsphere.com     | Admin@123  |

> Register a new account to try the customer flow.

---

## 🐳 Docker Compose (Full Stack)

```bash
docker-compose up --build
```
- Frontend: http://localhost:80
- Backend API: http://localhost:5000/api/health
- MongoDB: localhost:27017

---

## 🏗️ Project Structure

```
e-comm/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── cart/          # CartDrawer
│   │   │   ├── common/        # Modal, Badge, Spinner, Pagination, Routes
│   │   │   ├── layout/        # Navbar, Footer, Layout
│   │   │   └── product/       # ProductCard, StarRating
│   │   ├── hooks/             # useSocket
│   │   ├── lib/               # api.js (Axios), socket.js (Socket.IO)
│   │   ├── pages/
│   │   │   ├── admin/         # Dashboard, Products, Orders, Categories, Coupons
│   │   │   ├── auth/          # Login, Register
│   │   │   ├── Home.jsx
│   │   │   ├── ProductCatalog.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── OrderHistory.jsx
│   │   │   ├── OrderDetail.jsx
│   │   │   └── WishlistPage.jsx
│   │   └── store/             # Zustand: authStore, cartStore, wishlistStore, uiStore
│   └── package.json
│
├── server/                    # Node.js + Express backend
│   ├── src/
│   │   ├── config/            # db.js, cloudinary.js
│   │   ├── controllers/       # auth, product, category, cart, order, review, coupon, dashboard, payment
│   │   ├── middleware/        # auth, role, validate, error
│   │   ├── models/            # User, Product, Category, Order, Review, Coupon, Cart
│   │   ├── routes/            # All REST routes
│   │   ├── sockets/           # Socket.IO init + emit helpers
│   │   └── utils/             # email.js, seedData.js
│   ├── index.js
│   └── package.json
│
└── docker-compose.yml
```

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register customer |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | ✓ | Current user |
| GET | `/api/products` | — | List products (search, filter, sort, paginate) |
| GET | `/api/products/:id` | — | Product detail |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| GET | `/api/categories` | — | All categories |
| POST/PUT/DELETE | `/api/categories/:id` | Admin | Manage categories |
| GET | `/api/cart` | ✓ | Get cart |
| POST | `/api/cart` | ✓ | Add item |
| PUT/DELETE | `/api/cart/:itemId` | ✓ | Update/remove item |
| POST | `/api/orders` | ✓ | Checkout |
| GET | `/api/orders/my` | ✓ | My orders |
| GET | `/api/orders` | Admin | All orders |
| PUT | `/api/orders/:id/status` | Admin | Update status |
| POST | `/api/coupons/validate` | ✓ | Validate coupon |
| CRUD | `/api/coupons` | Admin | Manage coupons |
| GET | `/api/dashboard/stats` | Admin | Analytics |
| GET | `/api/products/:id/reviews` | — | Product reviews |
| POST | `/api/products/:id/reviews` | ✓ | Submit review |

---

## ⚡ Real-Time Events (Socket.IO)

| Event | Direction | Description |
|-------|-----------|-------------|
| `stockUpdated` | Server → All | Stock changed after order |
| `orderStatusUpdated` | Server → User | Order status changed |
| `newOrder` | Server → Admins | New order placed |
| `lowStockAlert` | Server → Admins | Stock below 5 units |

---

## 🎟️ Demo Coupons

| Code | Type | Value | Min Cart |
|------|------|-------|----------|
| WELCOME10 | 10% off | 10% | ₹500 |
| FLAT200 | Flat ₹200 | ₹200 | ₹1,000 |
| SALE25 | 25% off | 25% | ₹2,000 |

---

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS 3, React Router 6, Zustand, TanStack Query v5, Axios, Recharts, React Hook Form + Zod, Socket.IO Client, Lucide React, React Hot Toast

**Backend:** Node.js, Express, Socket.IO, Mongoose, JWT, bcryptjs, Zod, Nodemailer, node-cron, express-rate-limit, Helmet, Morgan

**Database:** MongoDB (Mongoose ODM)

**DevOps:** Docker, Docker Compose, Nginx (client container)

---

## 🌱 Environment Variables

**Server (`server/.env`):**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce_db
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=   # optional for image uploads
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=               # optional for emails
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

**Client (`client/.env`):**
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

