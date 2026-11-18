# ShopSphere — Smart E-Commerce Store

*A unique, feature-rich full-stack project plan, modeled on the Library Management System blueprint but expanded for e-commerce.*

## 0. How This Plan Reads the Library Blueprint

The library prompt follows a clear pattern: one fixed tech stack across every layer (frontend / backend / db / security / DevOps), a hard cap on "pages" to keep scope academic, an explicit REST endpoint list, an explicit Mongoose schema list, named Socket.IO events, and a Docker Compose + CI/CD finish.

This plan mirrors that structure for e-commerce. Since you asked for "all major features, as unique as possible" rather than a fixed page cap, I split the plan into a **Core tier** (what any real store needs, same academic scope as the library project) and a **Differentiator tier** (what makes it stand out). You can dial complexity up or down before approving.

## 1. Project Concept & Unique Selling Points

Working name: **ShopSphere** (placeholder — easy to rename).

What makes it "unique" rather than a generic CRUD store:

- **Real-time everything** — live stock counts, live order status, live admin notifications, not just polling.
- **Smart discovery** — "frequently bought together," recently viewed, and a lightweight rule-based recommendation engine (no heavy ML, to stay in scope).
- A genuine **coupon/discount engine** (percentage, flat, minimum cart value, expiry, usage limits).
- **Seller/vendor mode** as a stretch goal — turns the project from "online store" into a mini marketplace.
- **Admin analytics dashboard** with real charts (revenue over time, top products, order funnel).
- **Abandoned-cart and back-in-stock nudges** (stretch) via a scheduled job.

## 2. Technology Stack

**Frontend:** React + Vite, Tailwind CSS, React Router DOM, Zustand, Axios, React Query (server-state caching — new vs. the library project), Lucide React icons, Recharts (admin charts), React Hook Form + Zod resolver.

**Backend:** Node.js, Express.js, Socket.IO, Mongoose, Zod, JWT, bcrypt, Multer + Cloudinary (product images), Nodemailer (order emails), node-cron (abandoned-cart stretch), Stripe test mode (or Razorpay test mode) for payments.

**Database:** MongoDB + Mongoose; Redis optional for cart/session cache and rate limiting (stretch).

**DevOps:** Docker, Docker Compose, Git/GitHub, GitHub Actions, Vercel (frontend), Render or Railway (backend, Docker-compatible), MongoDB Atlas, Cloudinary (images).

## 3. User Roles

- **Customer** — register/login, browse/search/filter, cart, wishlist, checkout, pay, track orders, review products.
- **Admin** — everything a customer can view, plus manage products/categories/coupons, view all orders, update order status, view analytics, receive real-time low-stock and new-order notifications.
- **Vendor** *(stretch, optional)* — manages only their own products/orders. Excluded from this build — ships as Customer + Admin only, matching the library project's scope.

## 4. Pages / Modules

**Core (always build):**

1. **Auth** — Login / Register (role defaults to customer; admin seeded).
2. **Home / Storefront** — hero banner, featured categories, trending products, newsletter signup.
3. **Product Catalog** — grid view, search, filters (category, price range, rating), sort, pagination.
4. **Product Details** — images, price, stock, description, reviews, add-to-cart/wishlist, related products.
5. **Cart & Checkout** — cart drawer/page, address form, coupon field, order summary, payment step.
6. **Order History / Tracking** — customer's past orders with live status.
7. **Admin Dashboard** — stat cards (revenue, orders, products, customers), charts, recent orders, low-stock alerts.
8. **Admin Product Management** — table + add/edit modal + delete confirmation (same modal pattern as the library project).
9. **Admin Order Management** — table of all orders, status updates (processing → shipped → delivered), triggers real-time update + email.

**Differentiator (add after core works):** 10. Wishlist page. 11. Reviews & ratings on product details (verified-purchase only). 12. Admin coupon management. 13. Vendor dashboard — excluded from this build (no marketplace mode).

## 5. Database Design (MongoDB)

Database name: `ecommerce_db`

- **Users** — name, email, password (hashed), role (customer/admin/vendor), address\[\], wishlist\[ObjectId→Product\], createdAt.
- **Products** — title, description, price, discountPrice, category (ObjectId→Category), images\[\], stock, sku, brand, ratingAvg, ratingCount, vendor (ObjectId→User, optional), isFeatured, createdAt.
- **Categories** — name, slug, description, image.
- **Orders** — user (ObjectId), items\[{product, qty, priceAtPurchase}\], shippingAddress, paymentStatus, paymentMethod, orderStatus (pending/processing/shipped/delivered/cancelled), couponUsed, subtotal, discount, total, createdAt.
- **Reviews** — product (ObjectId), user (ObjectId), rating (1–5), comment, verifiedPurchase (bool), createdAt.
- **Coupons** — code, type (percentage/flat), value, minCartValue, expiryDate, usageLimit, usedCount.
- **Cart** *(optional)* — can live in Zustand + localStorage instead of the DB, or sync per-user: user, items\[{product, qty}\].

Indexes: text index on Product.title/description for search, unique index on sku and coupon.code, compound index on Order.user + createdAt.

## 6. REST API Endpoints

**Auth:** POST /api/auth/register · POST /api/auth/login · GET /api/auth/me

**Products:** GET /api/products (query: search, category, minPrice, maxPrice, sort, page) · GET /api/products/:id · POST /api/products (admin) · PUT /api/products/:id (admin) · DELETE /api/products/:id (admin)

**Categories:** GET/POST/PUT/DELETE /api/categories (same pattern as the library project)

**Cart:** GET /api/cart · POST /api/cart · PUT /api/cart/:itemId · DELETE /api/cart/:itemId

**Orders:** POST /api/orders (checkout) · GET /api/orders/my · GET /api/orders (admin, all) · PUT /api/orders/:id/status (admin)

**Reviews:** GET /api/products/:id/reviews · POST /api/products/:id/reviews

**Coupons:** POST /api/coupons/validate · admin CRUD at /api/coupons

**Dashboard:** GET /api/dashboard/stats (admin)

**Payments:** POST /api/payments/create-intent (Stripe) or equivalent

## 7. State Management (Zustand + React Query)

Stores: `authStore`, `cartStore` (persisted to localStorage, synced on login), `productStore` (catalog/filter state), `wishlistStore`, `notificationStore`, `uiStore` (theme, modals).

React Query sits on top of Axios for server data (products, orders) — Zustand stays for client/UI state, React Query owns cached server state. This is an upgrade over the library project's pure-Zustand approach; say the word if you'd rather match that prompt 1:1 and skip React Query.

## 8. Real-Time Features (Socket.IO)

Events: `stockUpdated` (emitted whenever an order is placed/cancelled, so catalog quantities update live), `orderStatusUpdated` (customer sees live tracking), `newOrder` (admin notification), `lowStockAlert` (admin, stock below threshold), `notification` (generic toast channel).

Room-based emits: admins join an `admins` room; each customer joins a room keyed by their userId for personal order updates. Reconnection handling on the client.

## 9. Authentication, Security & Validation

JWT + bcrypt, role-based middleware (customer/admin/vendor), Zod schemas on both frontend and backend (never trust client-only validation), rate limiting on auth routes, helmet + CORS config, ObjectId validation middleware, negative-stock and negative-price guards, coupon expiry/usage checks enforced server-side even when the UI already checked.

## 10. Docker, CI/CD & Deployment

Dockerfile (frontend), Dockerfile (backend), docker-compose.yml (frontend, backend, mongo, optional redis), persistent volume for Mongo data.

GitHub Actions: install client + server dependencies, lint, run tests if present, build the client, verify the server boots.

Deployment: Vercel (frontend), Render or Railway (backend), MongoDB Atlas (database), Cloudinary (images), Stripe test keys as secrets. Document the production env vars needed for CORS and the Socket.IO URL.

## 11. Suggested Build Order (Phases)

- **Phase 1 — Foundations:** repo scaffolding, Docker Compose, Mongoose models, auth (register/login/JWT), seed data.
- **Phase 2 — Core shopping flow:** product CRUD (admin), catalog + product details (customer), cart, checkout (order creation, no payment yet).
- **Phase 3 — Real-time + admin dashboard:** Socket.IO wiring, stats/charts, order status updates.
- **Phase 4 — Payments + polish:** Stripe test integration, coupons, reviews, wishlist.
- **Phase 5 — Differentiators (optional):** vendor mode, recommendations, abandoned-cart emails.
- **Phase 6 — DevOps:** CI pipeline, deploy to Vercel/Render/Atlas, write README + deployment doc.

## 12. Decisions Confirmed (Locked In For Build)

Since you said to continue, I went with the lower-risk default on each open question so Phase 1 could start right away:

- **Marketplace / vendor role:** Out. Two roles only — Customer and Admin — same scope discipline as the library project.
- **Payments:** Mocked checkout for now (the order is created and marked paid instantly; no real gateway keys needed). Real Stripe test-mode integration stays on the roadmap for Phase 4 if you want it later.
- **Seed data niche:** A generic electronics/lifestyle catalog — easy to swap for any niche later.

**Current status:** Phase 1 (foundations) is underway — Docker Compose, Mongoose models, auth, and seed data are being scaffolded now. I'll keep building through the phases in order; say the word if you'd rather flip any decision above.
