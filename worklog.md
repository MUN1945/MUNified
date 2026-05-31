---
Task ID: 1
Agent: Main
Task: Fix deployment sync - push to GitHub, deploy on Vercel, verify OAuth/email integration

Work Log:
- Investigated git status: 3 commits ahead of origin/main
- Pushed all 3 commits to GitHub successfully
- Verified GitHub repo MUN1945/MUN is accessible (HTTP 200)
- Found Vercel is connected via GitHub App integration (15 deployments, all via vercel[bot])
- Latest deployment (SHA 0b3c4c1) matches HEAD - successful production deployment
- Discovered .env had been overwritten with local SQLite URL - restored proper Neon PostgreSQL URL
- Found system-level DATABASE_URL env var was overriding .env file
- Production Vercel URL: mun-diplomatiq-mun-1945.vercel.app (has Deployment Protection - 401)
- Custom domain diplomatiq.io points to OLD Webflow site, not our app
- app.diplomatiq.io has no DNS records
- OAuth keys (Google/GitHub) are empty in .env
- Resend API key is placeholder only
- Build succeeds with production DB URL

Stage Summary:
- GitHub push: ✅ Complete (3 commits pushed)
- Vercel auto-deploy: ✅ Working (latest SHA deployed)
- Production URL accessible: ❌ Blocked by Vercel Deployment Protection
- Custom domain: ❌ Points to old Webflow site
- Environment variables: ⚠️ Need to be set in Vercel dashboard
- OAuth integration: ❌ No client IDs/secrets configured
- Email (Resend): ❌ API key is placeholder
