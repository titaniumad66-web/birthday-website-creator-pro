# AURA Landing (Next.js)

Premium dark landing page: App Router, Tailwind CSS v4, Framer Motion, Lucide icons.

## Run locally

```bash
cd aura-landing
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

```
src/
  app/
    layout.tsx      # Root layout, metadata, fonts
    page.tsx        # Entry — renders LandingPage
    globals.css     # Theme tokens + utilities
  components/
    effects/        # Lightweight background motion (AnimatedOrbs)
    landing/        # Hero, parallax bands, features, interactive, testimonials, footer
```

## Animations

- **Hero**: `useScroll` + `useTransform` for parallax between background and headline.
- **Parallax sections**: Per-section scroll progress drives layered `y` transforms.
- **Features**: `whileInView` + staggered variants; hover scale + glow.
- **Interactive**: Staggered blur/slide reveal + `animate()` for metric counters.
- **Testimonials**: Horizontal scroll with `snap-x` and entrance motion.
