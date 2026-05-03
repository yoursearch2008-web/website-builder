# GitHub Secrets Setup Guide

## Required Secrets for Website Builder

Add these in repo Settings → Secrets and variables → Actions:

| Secret | Where to Get | Purpose |
|--------|-------------|---------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Dashboard → Profile → API Tokens | Deploy to Cloudflare Pages |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → Overview | Your account ID |
| `GITHUB_TOKEN` | Auto-provided | GitHub Actions token |

## Required Secrets for App Builder (Coolify)

Add these in repo Settings → Secrets and variables → Actions:

| Secret | Where to Get | Purpose |
|--------|-------------|---------|
| `COOLIFY_TOKEN` | Coolify → API Key | Deploy to self-hosted Coolify |
| `COOLIFY_SERVER` | Your server URL | e.g., http://your-server:8001 |
| `COOLIFY_APP_ID` | Coolify → App ID | The application to deploy to |

## How to Create Cloudflare API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Create Custom Token with permissions:
   - Zone:Read
   - Account:Cloudflare Pages:Edit
   - User:Read
3. Copy the token and add as `CLOUDFLARE_API_TOKEN`

## How to Get Cloudflare Account ID

1. Go to https://dash.cloudflare.com
2. Your Account ID is shown in the URL: `https://dash.cloudflare.com/{ACCOUNT_ID}`
3. Or in Overview page

## How to Get Coolify Credentials

1. Install Coolify on your server
2. Go to the Coolify dashboard
3. Settings → API Keys → Create new key
4. Copy the API key as `COOLIFY_TOKEN`
5. Copy the server URL as `COOLIFY_SERVER`
6. Copy the App ID from the app settings