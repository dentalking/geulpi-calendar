# Geulpi Calendar - Frontend

Next.js frontend application with TypeScript, GraphQL, and Apollo Client.

## Features

- Next.js 14 with TypeScript
- Apollo Client for GraphQL integration
- Responsive design
- Real-time updates
- Google OAuth integration
- Calendar management interface

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Build

```bash
npm run build
npm start
```

### GraphQL Code Generation

```bash
npm run codegen
```

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:8080/graphql
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

## Project Structure

```
src/
├── pages/          # Next.js pages
├── components/     # React components
├── lib/           # Utilities and configurations
└── graphql/       # GraphQL queries and generated types
```