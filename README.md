
# MarketMind AI

An all-in-one digital marketing platform offering AI-powered workflows, creative templates, and performance insights.

## Deployment Guide

### 1. Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: MarketMind AI Platform"
```

### 2. Push to GitHub
- Create a new repository on GitHub.
- Run the following commands (replace `YOUR_URL`):
```bash
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

### 3. Deploy to Vercel/Netlify
- Connect your GitHub account to [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
- Select the `marketmind-ai` repository.
- **Environment Variables**: Add `API_KEY` with your Google Gemini API Key.
- Click **Deploy**.

## Tech Stack
- React 19
- Tailwind CSS
- Google Gemini API (@google/genai)
- Lucide React Icons
- Vite
