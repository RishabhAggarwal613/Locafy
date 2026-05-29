# Official Website

The Locafy official website is a **multi-page marketing site** built in Next.js with a striking 3D animated hero, smooth page transitions via Framer Motion, and clean Tailwind CSS layouts. It explains the platform to new visitors and funnels each user type to their respective sub-application.

---

## Pages

### 1. Home Page (`/`)

The main marketing landing page. Contains:

**Hero Section**
- Full-viewport 3D scene built with Three.js + `@react-three/fiber`
- Animated floating product cards and location pins orbiting a stylized map sphere
- Headline: *"Discover what's right around you"*
- Sub-headline explaining hyperlocal discovery
- Two CTAs: "Find Shops Near Me" → customer app, "List Your Shop" → vendor app
- Scroll-triggered entry animations via Framer Motion

**Features Section**
- 3-column grid highlighting core platform features:
  - Locality-based discovery (radius search)
  - Product reels (short videos from local vendors)
  - Fast hyperlocal delivery
  - Pickup booking at shop
- Each feature has an animated icon and scroll-reveal entrance

**How It Works Section**
- Step-by-step flow (3 steps) for customers and vendors side by side
- Framer Motion stagger animation on scroll

**Roles Overview Section**
- 4 role cards: Customer, Vendor, Delivery Partner, Admin
- Each card shows a brief description of the role and its benefits
- Each card has a "Learn More" link to its dedicated role page
- Cards use a subtle hover scale and border highlight

**Testimonials Section**
- 3 testimonials from (sample) customers and vendors
- Star rating display
- Avatar, name, and locality

**Stats Section**
- Key platform numbers: shops, localities, orders
- Animated count-up on scroll entry

**Footer**
- Links to all 5 pages, legal pages (Privacy, Terms), and social media

---

### 2. Customer Page (`/customer`)

Dedicated page explaining the customer experience.

**Hero**
- Split layout: phone mockup on the right showing the customer app
- Headline: *"Everything near you, at your fingertips"*
- CTA: "Get Started as Customer"

**Feature Deep-Dives**
- Locality switching — set your locality, see what's nearby
- Reels feed — discover products through short videos
- Advanced search — find by product name, shop, category, price
- Cart & Checkout — pickup or delivery, COD or Razorpay
- Live order tracking — real-time map during delivery

**How Customer App Works**
- Numbered steps with animated illustrations

**Navigation Link**
- Prominent button: "Open Customer App →"

---

### 3. Vendor Page (`/vendor`)

Dedicated page for shop owners considering listing on Locafy.

**Hero**
- Headline: *"Reach customers in your locality — for free"*
- CTA: "Join as a Vendor"

**Feature Deep-Dives**
- Shop profile — set your shop's location, hours, categories
- Product manager — CRUD products with images
- Reel Studio — shoot and upload short product videos
- Order management — accept, prepare, mark ready
- Finance dashboard — see earnings, payouts, GST summary

**Benefits Section**
- Zero commission on first 3 months, then low flat fee
- Hyper-targeted audience (your locality)
- Reel-driven discovery

**Navigation Link**
- "Start Selling on Locafy →"

---

### 4. Delivery Page (`/delivery`)

Dedicated page for delivery partners.

**Hero**
- Headline: *"Earn on your schedule, in your neighbourhood"*
- CTA: "Become a Delivery Partner"

**Feature Deep-Dives**
- Choose your zone — deliver only in areas you know
- Accept orders — browse order pool, pick what you want
- Turn-by-turn navigation — Mapbox routing from shop to customer
- Daily earnings — withdraw anytime via UPI

**Earnings Calculator** (interactive)
- Slider: deliveries per day
- Output: estimated monthly income

**Navigation Link**
- "Join as Delivery Partner →"

---

### 5. Admin Page (`/admin`)

Dedicated page describing the admin/operations panel.

**Hero**
- Headline: *"Full platform control"*
- CTA: "Admin Portal"

**Feature Deep-Dives**
- User management (customers, vendors, delivery partners)
- Shop verification and moderation
- Order oversight and dispute resolution
- Platform analytics and GMV tracking

**Navigation Link**
- "Go to Admin Portal →"

---

## Navbar

The official site navbar is present on all 5 pages:

```
[ Locafy Logo ]   Home   Customer   Vendor   Delivery   Admin   [ Get Started Button ]
```

- **Locafy Logo** — SVG logo, links back to `/`
- On mobile: hamburger menu with slide-in drawer
- Active page highlighted with an underline accent
- Sticky on scroll with a subtle backdrop blur

---

## Technical Notes

### Three.js 3D Hero

```tsx
// components/official/Hero3D.tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Float, MeshDistortMaterial } from '@react-three/drei'

export function Hero3D() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <Float speed={2} rotationIntensity={1}>
        <mesh>
          <sphereGeometry args={[1.5, 64, 64]} />
          <MeshDistortMaterial color="#4f46e5" distort={0.3} speed={2} />
        </mesh>
      </Float>
      <OrbitControls enableZoom={false} />
    </Canvas>
  )
}
```

### Framer Motion Page Transitions

```tsx
// app/(official)/layout.tsx
import { motion, AnimatePresence } from 'framer-motion'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export default function OfficialLayout({ children }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

### SEO

Each page uses Next.js `generateMetadata` to export:
- `title` — page-specific
- `description` — role-specific description
- `openGraph` — for social sharing cards
- `structuredData` — JSON-LD for organization and local business schemas
