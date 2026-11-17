# kaveron // Modern Digital Agency Website

A fast, responsive, modern foundation and homepage for **kaveron**, a digital agency specializing in website development, landing pages, mobile apps, and web apps.

---

## 🎨 Design System

- **Background:** `#0A0A0A`
- **Cards:** `#111111` with `rgba(255, 255, 255, 0.08)` border and `backdrop-blur-xl`
- **Accent:** Neon Green `#00FF88` (with `box-shadow: 0 0 20px rgba(0,255,136,0.35)`)
- **Typography:**
  - Headings: **Space Grotesk** (`#FFFFFF`)
  - Body: **Inter** (`#A1A1AA`)
  - Code / Status / Badges / Numbers: **JetBrains Mono**
  - Arabic: **Cairo** (automatically applied when switching language)
- **Corners:** `12px` to `24px` border radius
- **Hover effects:** Smooth lift-up with neon green border glow

---

## 📄 Site Structure & Navigation

### 1. Homepage (`/`)
1. **Navbar** (Sticky, blurred dark background, logo with glowing brackets, navigation links, EN/AR switcher, CTA, mobile slide-in menu)
2. **Hero Section** (Available badge, headline with neon highlights, dual CTAs, animated stats counter, moving glow background)
3. **Services Section** (`#services`, 4 glass cards with Lucide icons, 3 bullet points each, and hover glow)
4. **Projects Section** (`#projects`, responsive grid with dynamic layout scaling, real Arc Design project card, "Your project could be next" card, and full Case Study modal)
5. **Pricing Section** (`#pricing`, placed after Projects: 3 tiered plans with popular glow, feature checklists, and quote buttons that navigate to `/contact?plan=PLAN_NAME`)
6. **Process Section** (`#process`, vertical timeline with connecting glowing neon line, 5 steps, scroll-activated fade and number glow)
7. **Tech Stack Section** (Infinite horizontal marquee with edge fades, pauses on hover, gray-to-neon tech pills)
8. **Testimonials Section** (`#testimonials`, glass card carousel with auto-play, touch swipe for mobile, arrows/dots for desktop)
9. **FAQ Section** (`#faq`, accordion with one open at a time, smooth drawer animation, rotating neon `+` to `×`)
10. **Final CTA Banner** (High-impact glass banner with radiant glow, headline, subtitle, and primary CTA linking to `/contact`)
11. **Footer** (Logo, quick links, contact info, status badge, custom social icons, copyright)
12. **Floating WhatsApp** (Positioned bottom-left in LTR, bottom-right in RTL with neon pulse, leaving opposite side ready for chatbot)

### 2. Standalone Contact Page (`/contact`)
- **URL:** [http://localhost:3000/contact](http://localhost:3000/contact) or `#/contact`
- Dedicated page containing:
  - Top **"Back to Home"** link (`← Back to Home` / `← العودة للرئيسية`).
  - Automatic scroll to top on entry.
  - Pre-selected plan detection via query param `?plan=PLAN_NAME` (e.g. Starter, Pro, Custom).
  - Pre-filled project message via query param `?project=PROJECT_TITLE` ("I'm interested in a project similar to PROJECT_TITLE").
  - Direct contact cards (Email, WhatsApp link, Working hours).
  - Glass inquiry form with validation, spam honeypot, rate limiting, and animated checkmark success state.
  - Direct persistence into the **Leads** database entity with email notifications.

### 3. Protected Admin Leads Portal (`/admin/leads`)
- **URL:** [http://localhost:3000/admin/leads](http://localhost:3000/admin/leads) or `#/admin/leads`
- **Access:** Authenticated administrators via Supabase Auth.
- View and search all client submissions, change statuses (`new`, `contacted`, `closed`), view inquiry details in a slide-out drawer, and access direct email/WhatsApp/call actions.

---

## 🚀 Running the Project

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
