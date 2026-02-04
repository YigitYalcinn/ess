# Eray Ship Supply

Marketing website for Eray Ship Supply with multilingual content (TR/EN/RU), product categories, brand partners, contact info, and a Google Maps location section.

## Tech Stack
- React + Vite
- i18next for translations
- Framer Motion for animations

## Features
- Multilingual UI (TR/EN/RU)
- Hero, About, Products, Brands, Contact sections
- WhatsApp, Call, and Email actions
- Google Maps embed
- SEO meta tags per language

## Getting Started
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Project Structure
```
src/
  components/
  i18n/
public/
  brands/
  images/
```

## Localization
Translation files live in:
- `src/i18n/translations/tr.json`
- `src/i18n/translations/en.json`
- `src/i18n/translations/ru.json`

## Deployment (Vercel)
Recommended settings:
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
