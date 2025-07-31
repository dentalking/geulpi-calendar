# Frontend Service Prompt

## Overview
This is the frontend service for Geulpi Calendar, a Next.js application providing a modern calendar interface with AI-powered features.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Apollo Client for GraphQL
- Tailwind CSS
- Framer Motion for animations
- React Hook Form
- Date-fns for date manipulation

## Project Structure
```
frontend/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── calendar/          # Calendar routes
├── components/            # React components
│   ├── ui/               # UI components
│   ├── calendar/         # Calendar components
│   └── forms/            # Form components
├── lib/                   # Utility functions
│   ├── apollo-client.ts  # Apollo Client setup
│   └── utils.ts          # Helper functions
├── graphql/              # GraphQL queries and mutations
├── hooks/                # Custom React hooks
└── styles/               # Global styles
```

## Key Features
- Server-side rendering with Next.js App Router
- Real-time updates via GraphQL subscriptions
- Responsive design with Tailwind CSS
- Smooth animations with Framer Motion
- Form validation with React Hook Form
- Calendar view with drag-and-drop support
- AI-powered event suggestions

## GraphQL Integration
- Apollo Client for GraphQL queries and mutations
- Type-safe GraphQL with generated types
- Optimistic UI updates
- Cache management

## Development Guidelines
1. Use TypeScript strictly
2. Follow React best practices
3. Implement proper error boundaries
4. Use server components where possible
5. Optimize for performance with lazy loading
6. Ensure accessibility (WCAG 2.1 AA)
7. Write unit tests for components

## Environment Variables
- `NEXT_PUBLIC_GRAPHQL_URL`: GraphQL endpoint URL
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Google OAuth client ID

## Running the Service
```bash
# Install dependencies
npm install

# Local development
npm run dev

# Production build
npm run build
npm start

# Docker
docker-compose up frontend
```

## Testing
```bash
# Unit tests
npm test

# E2E tests
npm run e2e
```

## UI/UX Guidelines
- Follow Material Design principles
- Use consistent spacing (Tailwind's spacing scale)
- Ensure proper contrast ratios
- Implement loading states
- Show meaningful error messages
- Provide keyboard navigation support