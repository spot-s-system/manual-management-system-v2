# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev          # Start development server with Turbopack

# Building
npm run build        # Create production build
npm start           # Start production server

# Code Quality
npm run lint        # Run Biome linting
npm run lint:fix    # Auto-fix linting issues
npm run format      # Format code with Biome
npm run format:check # Check code formatting
npm run type-check  # Run TypeScript type checking

# Testing
npm run test        # Run Vitest unit tests
npm run test:watch  # Run tests in watch mode
npm run test:e2e    # Run Playwright E2E tests
```

## Architecture Overview

This is a Next.js 15 manual management system using App Router with the following stack:

### Core Technologies
- **Next.js 15.3.3** with App Router and Server Components
- **TypeScript** for type safety
- **Supabase** for database (PostgreSQL) and authentication
- **Tailwind CSS** with shadcn/ui components
- **Biome** for linting and formatting (2 spaces, double quotes, 100 char lines)
- **Vitest** for unit testing
- **Playwright** for E2E testing

### Key Architectural Patterns

1. **Database-First Design**: PostgreSQL with Row Level Security (RLS)
   - `manuals` table: id, title, url, main_category, sub_category, tags[], is_published, order_index
   - `manual_requests` table: id, requester info, manual details, status, timestamps
   - Fixed categories defined in `app/constants/categories.ts`
   - Types defined in `types/database.ts`
   - Tags array supports multiple values including contract plans (ミニマム, スターター, スタンダード, プロフェッショナル, アドバンス)

2. **Authentication**: Dual system
   - Primary: Supabase Auth via middleware (`middleware.ts`)
   - Backup: Simple cookie-based auth in `lib/auth.ts`
   - Admin routes protected at `/admin/*`

3. **Route Structure**:
   - `/` - Public homepage with category navigation
   - `/category/[slug]` - Category view with tag filtering
   - `/manual/[id]` - Manual detail view (iframe embed)
   - `/search` - Search functionality
   - `/request` - Manual request form
   - `/admin/*` - Protected admin area (manuals, requests management)

4. **Data Access Pattern**:
   - Server Components fetch data directly using Supabase server client
   - Client components use Supabase browser client
   - RLS policies enforce access control at database level

### Important Configuration

- **Environment Variables**: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` required
- **Fixed Categories**: Defined in `app/constants/categories.ts` - includes main and sub categories
- **Tags**: Predefined tags in `app/constants/tags.ts` for user targeting and plan restrictions

### Development Workflow

1. Always run `npm run lint:fix` and `npm run type-check` before committing
2. Use Server Components by default, Client Components only when needed (interactivity)
3. Follow existing patterns for CRUD operations in admin pages
4. Maintain consistent error handling with try-catch blocks
5. Use Supabase's built-in RLS for security rather than client-side checks
6. Run tests before pushing: `npm run test` and `npm run test:e2e`

### Key Features Implementation

- **Category System**: Fixed two-level hierarchy (main/sub categories)
- **Tag System**: Used for filtering by target audience and plan restrictions
  - Contract plan tags: Each manual can have multiple plan tags (e.g., スタンダード, プロフェッショナル, アドバンス)
  - UI displays all applicable contract plans, not just the first one
- **Manual Display**: Uses iframe embedding for external content
- **Search**: Multi-field search across titles, categories, and tags
- **Request System**: Users can request new manuals, admins can manage requests

### Search Implementation Details

The search functionality includes:

1. **Search Interface**: 
   - Hero section on homepage with prominent search box
   - Search example text for user guidance
   - Direct navigation to search results page

2. **Search Logic** (`/app/search/page.tsx`):
   ```typescript
   .or(
     `title.ilike.%${query}%,` +
     `main_category.ilike.%${query}%,` +
     `sub_category.ilike.%${query}%,` +
     `tags.cs.{${query}}`
   )
   ```

3. **Search Features**:
   - Case-insensitive partial matching
   - OR search across multiple fields
   - Highlighted search results
   - Custom result cards showing matched fields
   - Result count display

4. **Database Optimization**:
   - Indexes on searchable columns (title, categories, tags)
   - Optional full-text search with triggers
   - Performance-optimized queries

5. **UI Components**:
   - `SearchResultCard` component with highlighting
   - Responsive grid layout for results
   - Empty state handling with helpful messages