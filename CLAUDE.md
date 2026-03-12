# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MyDecision** is a React-based SPA that helps users record, anchor, and revisit important life decisions. It's a local-first web app with no backend - all data is stored in browser localStorage.

**Core Problem Being Solved**: After making significant decisions, people experience recurring doubts and decision anxiety. MyDecision helps users return to the rational thinking process behind their original decision when doubt arises.

## Technology Stack

- **Framework**: React 19.2.3 + TypeScript 5.8.2
- **Build Tool**: Vite 6.2.0
- **Routing**: React Router DOM 7.11.0 (HashRouter)
- **Styling**: TailwindCSS (CDN-based via index.html)
- **Animations**: Framer Motion 11.17.0
- **Icons**: Lucide React 0.562.0
- **AI**: Gemini API (requires GEMINI_API_KEY in .env.local)
- **State**: React Context API + localStorage persistence

## Common Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

## Environment Setup

1. Create `.env.local` file in root
2. Add your Gemini API key: `GEMINI_API_KEY=your_key_here`
3. The key is injected via vite.config.ts as both `process.env.API_KEY` and `process.env.GEMINI_API_KEY`

## Architecture Overview

### State Management

**StoreContext** (`context/StoreContext.tsx`) provides global state:
- **State**: `decisions: Decision[]`, `isPremium: boolean`
- **Actions**: `addDecision()`, `updateDecision()`, `deleteDecision()`, `unlockPremium()`, `getDecision()`
- **Persistence**: Auto-saves to localStorage key `'mydecision-v1-data'` on every state change

### Data Model

Core type is `Decision` (types.ts):
```typescript
{
  id: string
  decisionText: string           // The decision
  whyText: string                // Main reason
  emotionalState: EmotionalState
  createdAt: number

  // Step 2 (optional deep dive)
  context?: string
  assumptions?: string
  fear?: string
  reasoning?: string
  motivation?: string

  // Step 3 (optional success criteria)
  outcomeSuccess?: string
  learningSuccess?: string

  // Revisit logic
  revisitDate: string            // ISO date (YYYY-MM-DD)
  revisitCondition?: string
  futureSelfMessage?: string

  // Metadata
  category: string
  isLocked: boolean
  isArchived?: boolean
  lastEditedAt?: number
  status?: DecisionStatus
}
```

### Routing Structure

```
/ (Home)              - Landing page with 3 main CTAs
/new                  - Multi-step decision creation flow
/dashboard            - View all decisions (list/card view)
/doubt-selection      - Select decision for doubt review
/decision/:id         - View/edit specific decision
/settings             - App settings
```

### Key Files

- **App.tsx** - Main app with HashRouter routing
- **index.tsx** - React root entry
- **types.ts** - All TypeScript type definitions
- **constants.ts** - App constants including category themes
- **context/StoreContext.tsx** - Global state management
- **pages/DecisionDetail.tsx** - Most complex component (1160 lines), handles full CRUD for decisions
- **pages/CreateDecision.tsx** - Multi-step decision creation form
- **pages/Dashboard.tsx** - Decision list/card view with filtering
- **doc/PRD.md** - Comprehensive product requirements (1200+ lines)

### Styling System

- **Theme**: Dark mode with black background (#000000)
- **Design**: Glassmorphism with backdrop-blur, mobile-first
- **Category Colors** (constants.ts):
  - Career: blue-600, Family: amber-600, Habit: emerald-600
  - Dream: purple-600, Health: rose-600, Money: yellow-600
- **TailwindCSS**: Loaded via CDN in index.html (not via PostCSS)

### Premium Features

- Free tier: Max 3 decisions (`MAX_FREE_DECISIONS` constant)
- Premium: Unlimited decisions
- Components: `PremiumBanner.tsx`, `PremiumModal.tsx`

## Important Implementation Notes

### Local-First Architecture
- **No backend** - 100% client-side
- **No authentication** - data is per-browser/device
- **localStorage key**: `'mydecision-v1-data'`
- All state changes immediately persist to localStorage

### Path Aliases
- `@/*` resolves to project root (configured in vite.config.ts and tsconfig.json)
- Example: `import { Button } from '@/components/Button'`

### Environment Variables Access
- Gemini API key available as `process.env.GEMINI_API_KEY` or `process.env.API_KEY`
- Injected at build time via Vite's define config

### Mobile Optimization
- HashRouter used for static deployment compatibility
- Viewport configured for mobile-first design
- Swipe navigation in card views

## User Flows

### 1. Decision Creation (CreateDecision.tsx)
Multi-step process:
1. What did you decide?
2. Why did you decide this? (expandable optional fields: context, assumptions, fear, reasoning, motivation)
3. When to revisit? + success criteria
4. Emotional state selection
5. Category selection

### 2. Doubt Review Mode
- User selects decision from DoubtSelection.tsx
- Interactive review process in DecisionDetail.tsx checks:
  - Original reasoning
  - Context changes
  - Assumption validity
  - Fear realization
- Guided decision to stay committed/adjust/abandon

### 3. Dashboard View
- Filter by category
- Sort by creation date
- Toggle list/card view
- Archive/active filtering
- Swipe navigation for card view

## Development Notes

- **No node_modules yet**: Run `npm install` first
- **Not a Git repo**: Initialize with `git init` if needed
- **TailwindCSS via CDN**: Not using PostCSS/build-time TailwindCSS
- **Import Maps**: Uses esm.sh CDN for runtime module resolution (see index.html)
- **Dev server**: Runs on port 3000, host 0.0.0.0 for network access

## Documentation

- **README.md** - Basic setup instructions
- **doc/PRD.md** - Full product requirements, user flows, UX principles, feature specs, future roadmap
