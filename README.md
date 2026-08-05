# Preloved Atelier

# FINAL WEBSITE GENERATION PROMPT

You are a senior full-stack engineer and product designer specializing in e-commerce platforms for the resale/circular-fashion industry. Build a complete, production-ready web application called **Thrifted Threads** — a curated marketplace for gently-used, single-wear, and photoshoot-sample clothing, positioned as "pre-loved luxury" rather than generic thrift. Every design and engineering decision must reinforce trust, authenticity, and sustainability, since resale customers are inherently more skeptical than first-hand retail buyers.

## 1. PRODUCT CONTEXT (for your own reasoning, not to restate to the user)

- **Problem solved:** Buyers want designer-quality, on-trend clothing without designer prices or fashion waste, but existing thrift options feel low-quality and unfiltered.

- **Solution:** A trust-first resale marketplace with rigorous condition grading, verified authenticity, transparent flaw disclosure, and a unique "Shop the Shoot" feature tying garments to the photoshoots/campaigns they originated from. All inventory is sourced and listed directly by the internal team — there is no public seller/consignment flow.

- **Target users:** Fashion-conscious buyers aged 18–35 in urban Pakistan/South Asia who care about sustainability, affordability, and style.

- **Core feature:** Condition-graded product listings with multi-photo evidence and "Shop the Shoot" origin storytelling.

- **USP:** Every item is single-unit inventory (not restocked), creating built-in scarcity ("only 1 in stock"), combined with radical transparency (flaw photos, grading scale, sustainability impact metrics per purchase).

- **Monetization:** Direct margin on inventory (buy low, sell at a markup); no subscription tier at launch.

- **Brand tone:** Warm, handmade, sustainability-forward — built around the brand's hand-drawn, sketch-style hanger logo rendered in black ink on a white/cream background, with hand-lettered wordmark typography. The aesthetic should feel like an indie, artisanal sustainable-fashion label — intimate and DIY-considered rather than glossy or discount-bin. Think "zine meets boutique resale," not a corporate marketplace.

## 2. ROLE DEFINITION

Act as a senior full-stack engineer pairing with a product designer. Produce clean, typed, componentized, production-grade code — not a prototype or wireframe. Assume the output will be deployed and used by real paying customers on day one.

## 3. TECHNICAL STACK (MANDATORY)

- **Frontend:** React 18+ with Vite as the build tool, TypeScript, React Router v6 for client-side routing, Tailwind CSS, shadcn/ui component library

- **State/data fetching:** React Query (TanStack Query) for server state; Zustand for lightweight client state (cart, wishlist UI state)

- **Backend/DB:** Supabase (Postgres, Auth, Storage, Row Level Security) — chosen for fast setup of auth, file storage (product photos), and relational data (orders, listings, users)

- **Auth:** Supabase Auth with email/password + Google OAuth; role-based access (buyer, admin), enforced client-side via protected route wrappers around React Router routes

- **Payments:** Stripe for card payments; also integrate a local payment gateway placeholder (e.g. JazzCash/Easypaisa via a generic payment adapter interface) since the primary market is Pakistan — build the payment layer as an abstracted interface so gateways can be swapped without touching checkout logic

- **Image handling:** Supabase Storage buckets for product photos, with client-side image compression before upload (use `browser-image-compression` or equivalent) to keep multi-photo listings performant; use native `loading="lazy"` and responsive `srcset` on `<img>` tags since there is no framework-level image optimizer

- **Search/filtering:** Postgres full-text search + indexed columns for size/brand/condition/price filters; no external search service needed at this scale

- **Notifications:** Email via Resend (transactional: order confirmation, back-in-stock-style alerts for similar drops); WhatsApp integration via WhatsApp Business API (Twilio or Meta Cloud API) for order updates and customer support, since WhatsApp is the dominant support channel in this market

- **Hosting:** Vercel or Netlify for the static/SPA frontend build, Supabase managed cloud for backend

- **SEO note:** Since this is a client-rendered SPA (not server-rendered), implement `react-helmet-async` for per-page `<title>`/meta tag management, and treat SEO as best-effort rather than a hard requirement — flag this tradeoff to the user rather than silently working around it

- **Analytics:** Plausible or PostHog for privacy-respecting product analytics

Do NOT introduce additional frameworks, state libraries, or backend services beyond this stack unless a stated feature is technically impossible without them. Do NOT use Next.js, Remix, or any other React meta-framework — this must be a plain client-rendered React SPA built with Vite.

## 4. FUNCTIONAL REQUIREMENTS (EXACT USER FLOWS)

### 4.1 Buyer flow

1. Land on Home → browse by category shortcut or "New Arrivals" → apply filters (size, brand, condition, price, occasion, color) on Shop page.

2. Open Product Detail Page → view full photo set including flaw close-ups → view condition grade, "worn by" origin tag, original vs. resale price, fabric details, size chart → add to Wishlist or Cart.

3. If item has a "Shop the Shoot" tag, show the originating campaign photo and a short story blurb linking the garment to its shoot.

4. Proceed to Cart → apply bundle discount automatically if 3+ items qualify → Checkout (guest checkout allowed, but account creation encouraged with an incentive message) → select payment method → confirm order.

5. Post-purchase: order confirmation email + WhatsApp message; Account Dashboard shows order status, tracking, and a running "sustainability impact" tally (water/carbon saved based on item count and category).

6. Since each item is single-unit, once purchased it is immediately marked sold and removed from active listings (no oversell risk) — implement this as an atomic transaction (reserve-on-checkout-start, release-on-timeout) to prevent two buyers purchasing the same one-off item.

### 4.2 Admin flow

1. Admin dashboard (separate protected route, role-gated) to create, edit, publish, and delist product listings directly (photos, category, brand, condition grade, price, fabric details) — there is no consignment intake or seller-submitted content; all listings originate from the admin panel.

2. Admin can set/edit the condition grading scale definitions and flaw-disclosure taxonomy centrally so it stays consistent across all listings.

3. Admin dashboard also manages orders and moderates customer reviews.

## 5. NON-FUNCTIONAL REQUIREMENTS

- **Performance:** Product images must lazy-load (`loading="lazy"`) and use responsive `srcset`; code-split routes with `React.lazy`/`Suspense` so initial bundle stays small; Largest Contentful Paint under 2.5s on 4G for the Shop and Product Detail pages.

- **Security:** Row Level Security enforced on every Supabase table so buyers can only read their own orders/wishlists, and admin-only tables (internal grading notes, cost/margin data) are inaccessible to non-admin roles. All payment handling goes through Stripe's hosted elements/PCI-compliant flow — never store raw card data.

- **Scalability:** Data model must support thousands of single-unit SKUs without performance degradation; use pagination (cursor-based) on Shop and Admin listing views, not full-table loads.

- **Accessibility:** WCAG 2.1 AA minimum — proper alt text fields for every product photo (required at upload, not optional), keyboard-navigable filters and cart, sufficient color contrast on all text.

- **Responsiveness:** Fully responsive from 360px mobile width up to desktop; mobile-first, since the target demographic shops primarily on phones and via WhatsApp-driven traffic.

- **Reliability:** Checkout reservation logic must be race-condition safe for single-unit inventory (use a database-level unique constraint or status lock, not just application-level checks).

## 6. PAGE STRUCTURE (ALL SCREENS)

1. **Home** — hero banner, best sellers, New Arrivals grid, trust badges (authenticity, condition rating explainer), category shortcuts

2. **Shop / Categories** — filterable grid (category, size, condition, brand, price, occasion, color), sort options (newest, price, condition)

3. **Product Detail Page** — photo gallery with flaw close-ups, condition grade badge, origin tag, original vs. resale price, size chart, fabric details, "Shop the Shoot" module (conditional), reviews section, related items

4. **Our Story / About Us** — sourcing model, sustainability angle, brand narrative

5. **How It Works** — sourcing explanation, quality-check process, grading system overview

6. **Condition & Authenticity Guide** — grading scale definitions, authentication process for branded items

7. **Size Guide** — cross-brand sizing reference tables

8. **Blog / Style Edit** — CMS-driven post list + individual post pages (styling tips, sustainability content, "get the look")

9. **Wishlist / Favorites** — saved items grid, quick-add-to-cart

10. **Cart** — line items, bundle discount indicator, promo code field

11. **Checkout** — shipping details, payment method selection, order summary

12. **Account Dashboard** — order history, saved items, loyalty points

13. **Admin Dashboard** — listing creation/management, order management (protected, role-gated route, not linked from public nav)

14. **FAQ**

15. **Contact / Support** — contact form + WhatsApp chat link

16. **Return & Exchange Policy**

17. **Sustainability Impact Page** — aggregate and per-user water/carbon savings calculator with visual counters

## 7. UI/UX RULES

- **Brand mark:** The provided logo — a hand-drawn coat hanger rendered in loose black ink linework, with "THRIFTED THREADS" set in an irregular, hand-lettered all-caps typeface — is the foundational visual reference. Every UI surface should feel like an extension of that mark, not a mismatched corporate skin on top of it.

- **Layout:** Airy, single-column-leaning layout with generous white space around large product photography; use the hanger silhouette or simple line-art icons (not filled/glossy icon sets) for category markers, section dividers, and empty states.

- **Color palette:** Near-monochrome base — off-white/cream background (`#FAFAF7`-ish) with black or near-black ink (`#1A1A1A`) for typography, linework, and primary UI chrome. Introduce exactly one warm accent color (a muted terracotta or olive) used sparingly for CTAs, condition badges, and price highlights — everything else stays black, white, and grayscale so the hand-drawn logo doesn't clash with the surrounding UI.

- **Typography:** Pair a hand-lettered/marker-style display font (matching the logo's wordmark) for the H1 hero and section headers with a simple, humanist sans-serif for body copy, nav, and UI text — the hand-lettered font should be used sparingly (hero, page titles, section labels) and never for dense body text or form fields, to protect readability. Establish a clear type scale (h1–h6, body, caption) and use it consistently — no inline font-size overrides.

- **Iconography & dividers:** Use simple, single-stroke line-art icons (thin black strokes, no fill, no gradients) throughout — cart, wishlist heart, filter, search — echoing the loose linework style of the hanger logo. Avoid glossy, 3D, or heavily shadowed UI elements anywhere in the app.

- **Condition badges:** Each grading tier (e.g. New with Tags, Photoshoot Sample, Worn Once, Gently Used) gets a distinct badge styled as a simple black-outlined tag/label (not a solid colored pill) to stay consistent with the ink-on-paper aesthetic, used identically across Shop grid, Product Detail, and Admin views.

- **Photography rules:** Product images are always real photos of the actual item (never stock/placeholder imagery) — enforce this in the upload UI copy and admin review checklist. Photos should be presented with a thin black border or simple frame treatment that nods to the hand-drawn brand mark, rather than a bare, borderless grid.

- **Scarcity messaging:** Since each item is single-unit, surface "Only 1 available" or "Last one" states clearly on both the grid card and Product Detail page, styled as a small hand-drawn-style tag rather than a loud red banner — pair it with the item's story, not just a countdown.

- **Responsiveness:** Mobile-first breakpoints at 360px, 768px, 1024px, 1440px; sticky add-to-cart bar on mobile Product Detail pages; filters collapse into a slide-over drawer on mobile.

- **Micro-interactions:** Wishlist heart toggle with a subtle hand-drawn "sketch fill" animation; skeleton loaders (not spinners) for product grids and detail pages during data fetch, styled in the same off-white/black tones as the rest of the UI.

## 8. INTEGRATION LOGIC (APIs, WEBHOOKS, AUTOMATION)

- **Stripe:** Checkout Sessions API for payment; webhook listener (`checkout.session.completed`) to mark order paid, decrement single-unit inventory atomically, and trigger confirmation notifications.

- **WhatsApp Business API:** Triggered server-side on order confirmation and shipping update events; template messages must be pre-approved per WhatsApp Business policy.

- **Resend (email):** Transactional emails for order confirmation and password reset — triggered via Supabase Edge Functions on relevant database events.

- **Supabase Edge Functions:** Use for (a) inventory reservation/release logic during checkout, (b) sustainability impact calculation on order completion.

- **Admin listing management:** Implemented as a status-driven table (`draft`, `published`, `sold`, `delisted`) with RLS ensuring only admin role can create or transition listing status; no external workflow tool needed.

## 9. OUTPUT EXPECTATIONS

- Deliver a fully functional Vite + React project with organized folder structure (`/src/pages`, `/src/components`, `/src/lib`, `/src/types`, `/src/hooks`, `/src/routes`).

- All components typed with TypeScript interfaces/types — no `any`.

- Supabase schema provided as SQL migration files, including RLS policies, not just described in prose.

- Seed data included for at least 20 sample product listings covering all condition grades, so the storefront is demo-ready immediately.

- Environment variables clearly documented in a `.env.example` file (Supabase keys, Stripe keys, Resend key, WhatsApp API credentials).

- Code must be immediately runnable with `npm install && npm run dev` after environment variables are set — no missing steps.

## 10. RESTRICTIONS (WHAT NOT TO BUILD)

- Do NOT build any public seller, consignment, or sell-back flow, account role, or dashboard — this is a buyer-only storefront; all inventory is sourced and listed exclusively through the admin panel.

- Do NOT implement "restock" or "notify when back in stock" logic for individual SKUs — items are single-unit and permanently sold once purchased; wishlisting is for similar future drops only, not restock alerts on the same item.

- Do NOT use stock photography anywhere in product listings or seed data placeholders that could be mistaken for real inventory photos in the final demo.

- Do NOT build a native mobile app — this is a responsive web application only.

- Do NOT add subscription/membership monetization — monetization is direct inventory margin only at this stage.

- Do NOT use bright "clearance sale" visual styling (red banners, countdown timers with aggressive urgency copy) — scarcity should be communicated through calm, editorial language consistent with the brand's sustainability positioning.

use the attached image as the logo and for website color theme identification

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6f2e9e87-1676-428a-b703-d05dc72f1fd2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
