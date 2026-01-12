# Christmas Light Takedown Optimizer

## Project Overview
A mobile-first web app to help optimize and plan Christmas light takedown.

## Tech Stack
- **Framework:** Next.js 16 with App Router
- **Styling:** Tailwind CSS
- **Database:** Supabase
- **Deployment:** Vercel
- **Mobile:** Capacitor (for future iOS conversion)

## Key Files
- `src/lib/supabase.ts` - Supabase client
- `src/app/layout.tsx` - Root layout with mobile-first meta tags
- `capacitor.config.ts` - iOS/Android settings

## Environment Variables
See `.env.local` for required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Commands
| Task | Command |
|------|---------|
| Run locally | `npm run dev` |
| Deploy to Vercel | `npx vercel --prod` |
| Push to GitHub | `git push` |
| Supabase Studio | `npx supabase studio` |
| Sync iOS build | `npx cap sync ios` |

## Links
- **Live site:** https://christmas-light-takedown-optimizer.vercel.app
- **GitHub:** https://github.com/brandonogram/christmas-light-takedown-optimizer
- **Supabase Dashboard:** https://supabase.com/dashboard/project/xqngbmzqoivrocrxpiug
- **Vercel Dashboard:** https://vercel.com/brandon-calloways-projects/christmas-light-takedown-optimizer

## Development Notes
- Mobile-first design: start with mobile styles, add `md:` and `lg:` for larger screens
- Use Tailwind utility classes
- Keep components in `src/components/`
