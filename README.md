# Enim Meme Generator

> enim is hot bozo. enim is him.

AI-powered meme generator featuring Enim as the eternal main character. Built with Next.js 14, Gemini 2.0 Flash, Supabase, and Umami Analytics.

---

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Gemini 2.5 Flash** — free tier, 1,500 req/day
- **Supabase** — Postgres DB + Storage for meme images
- **sharp** — server-side meme image compositing
- **@vercel/og** — dynamic OG images per meme
- **Umami** — privacy-first analytics
- **Playfair Display + Lato** — type pair

---

## Setup

### 1. Clone & install

```bash
git clone <repo>
cd enim-meme-generator
npm install
```

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```
GEMINI_API_KEY=          # https://aistudio.google.com/app/apikey (free)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=    # https://enimmeme.vercel.app
NEXT_PUBLIC_UMAMI_WEBSITE_ID=
```

### 3. Supabase

Run the SQL in `supabase-schema.sql` in your Supabase SQL Editor.

Make sure your `memes` storage bucket exists and is set to **public**.

### 4. Add Enim's image

Place `hotenim.jpg` in the `/public` folder. This is the hardcoded character that appears in every meme.

Place `avalanche-avax-logo.png` in the `/public` folder (footer credit).

### 5. Icons

Your icons are already in `/public`:
- `favicon.ico`
- `favicon-16x16.png`
- `favicon-32x32.png`
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`

### 6. Run

```bash
npm run dev
```

---

## Deploy (Vercel)

```bash
vercel --prod
```

Add all env vars in Vercel dashboard → Settings → Environment Variables.

Note: `sharp` requires the `@vercel/node` runtime for image compositing — this is automatic on Vercel.

---

## How memes are generated

1. User uploads a photo + writes a vibe prompt + optional X handle
2. `POST /api/generate` sends image + prompt to **Gemini 2.0 Flash**
3. Gemini returns `top_text`, `bottom_text`, and a `caption`
4. **sharp** composites the text over `/public/hotenim.jpg` (user image shown as corner overlay if provided)
5. Composited JPEG → uploaded to Supabase Storage
6. Row saved to `memes` table with slug
7. `/meme/[slug]` page is the shareable link
8. OG image at `/api/og/[slug]` is the Twitter card preview

---

## Credits

- Built by [@mojeebeth](https://x.com/mojeebeth) of [BlindspotLab](https://blindspotlab.xyz)
- Powered by [Avalanche](https://avax.network)
- Follow [$HOTENIM](https://x.com/HotEminSummer) — @HotEminSummer
