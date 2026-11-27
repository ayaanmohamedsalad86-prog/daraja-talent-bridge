# Daraja Talent Bridge

Build a full-stack web application called "Daraja Talent" (or "BridgePath") for Track 3 of the Power Learn Project (PLP) & ILO PROSPECTS Mini Hackathon: Local Experience & Networks for Skilled Refugees (aligned with SDGs 8, 10, and 17, serving cohorts in Kenya including Turkana and Garissa counties).

Core Problem:
Skilled displaced professionals often lack local referrals, mentorship, and local work experience, even when they have strong technical or professional skills.

Build a working, interactive app with three connected modules and role-based views (Candidate / Refugee Talent, Industry Mentor, and Hiring Partner / Admin):

1. Skills-First Matching Engine:
- Allow candidates to build a skills-first profile (skills, verified project/GitHub links, language, county/remote availability, and work-readiness status) without requiring physical degree certificates.
- Allow hiring partners to post roles or short paid trials and view an AI-style match score (0–100%) with clear matching reasons (skills overlap, readiness, availability).
- Include a "Request Warm Intro / Referral" workflow so mentors or cohort leads can endorse candidates directly to employers.

2. Mentor-Fellowship Tracker:
- Pair displaced professionals with industry mentors for structured 4-to-8 week fellowships.
- Include a milestone tracker (e.g., Week 1: Portfolio Review, Week 2: Mock Interview, Week 3: Local Industry Project, Week 4: Employer Referral) with progress bars, session notes, and mentor endorsement badges.

3. Returnship Marketplace:
- List short-term paid returnships/trials (2–4 weeks) that convert into full-time or contract roles.
- Include an interactive application flow, status pipeline (Applied -> Trial Active -> Endorsed -> Hired), and employer feedback form to convert trials into offers.

4. Impact & Scalability Dashboard (Admin / Evaluators View):
- Show live, calculated metrics tied to SDGs 8, 10, and 17: active mentor-fellow pairs, warm referrals made, paid trials started, trial-to-hire conversion rate, and cohort scalability stats.
- Include a "Switch Role" toggle in the top navbar (Talent | Mentor | Employer | Impact Dashboard) so judges can test every workflow end-to-end without login friction.

Data & UX Requirements:
- Pre-populate with realistic sample data (diverse skilled refugee profiles across software dev, data analysis, nursing/health ops, and digital marketing; Kenyan & remote hiring partners; active mentors).
- Ensure every form, filter, search bar, status update, and endorsement button works and updates state immediately.
- Use a clean, accessible, mobile-responsive UI with clear status badges and a dark/light modern professional palette.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://daraja-talent-bridge.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/32f2ab08-81c7-4c1d-bb97-b1ecaf15722e).

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
