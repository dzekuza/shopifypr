# Cart Note Replacer (Smart Cart Message)

A Shopify app that allows merchants to display dynamic cart messages based on various conditions like cart total, collections, customer tags, and country.

## Features

- 🎯 Rule-based cart messages
- 💼 Multiple condition types:
  - Cart total thresholds
  - Product collections
  - Customer tags
  - Country-specific messages
- 🎨 Theme-safe implementation via App Embed block
- 📱 Mobile-responsive design
- ⚡ Real-time updates
- 🔒 Secure OAuth authentication

## Tech Stack

- Frontend: React + TypeScript
- UI Framework: Shopify Polaris
- Backend: Next.js API Routes
- Database: PostgreSQL (via Prisma)
- Integration: Shopify App Bridge + App Embed

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your Shopify API credentials and database URL.

3. Initialize the database:
   ```bash
   npx prisma db push
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

The app is ready to deploy on Vercel or Railway:

1. Connect your repository
2. Set environment variables
3. Deploy!

## Theme Integration

Add the app block to your theme's cart template:

```liquid
{% render 'cart-note-replacer' %}
```

## License

MIT License - see LICENSE file for details 