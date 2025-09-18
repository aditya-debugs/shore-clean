# Shore Clean - Comprehensive Project Analysis

## Project Overview

Shore Clean is a Next.js-based web application designed for organizing and participating in environmental cleanup events, particularly focused on coastal/shore cleanup activities. It's a community-driven platform where organizers can create events, volunteers can participate, and AI assists with various tasks.

## Tech Stack & Dependencies

### Core Framework

- **Next.js 14.2.16** - React-based full-stack framework with App Router
- **React 18** - Frontend library
- **TypeScript** - Type-safe development
- **Tailwind CSS 4.1.9** - Utility-first CSS framework

### Database & ORM

- **Prisma** - Database ORM with PostgreSQL as the database
- **PostgreSQL** - Primary database (configured via `DATABASE_URL`)

### Authentication & Security

- **JWT (jose)** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **crypto** - Token generation and hashing

### UI Components

- **Radix UI** - Comprehensive headless UI component library
- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- **shadcn/ui components** - Pre-built component system

### AI Integration

- **@ai-sdk/openai** - OpenAI integration
- **ai** - AI SDK for text generation

### File Handling

- **Cloudinary** - Image/file upload and management
- **QR Code generation** - For event check-ins

### Additional Features

- **Charts (recharts)** - Data visualization
- **PDF generation (jspdf)** - Certificate generation
- **Date handling (date-fns)** - Date utilities
- **Form handling (react-hook-form + zod)** - Form validation

## Project Structure

### `app/` Directory (Next.js App Router)

```
app/
├── layout.tsx           # Root layout with providers
├── page.tsx            # Homepage with hero section
├── globals.css         # Global styles
├── auth/               # Authentication pages
│   ├── login/
│   └── register/
├── events/             # Event-related pages
├── profile/            # User profile
├── volunteer/          # Volunteer dashboard
├── organizer/          # Organizer dashboard
├── rewards/            # Points/rewards system
├── chat/              # AI chat interface
├── analytics/         # Analytics dashboard
└── api/               # Backend API routes
    ├── auth/          # Authentication endpoints
    ├── events/        # Event management
    ├── chat/          # AI chat
    ├── waste/         # Waste reporting
    └── [other endpoints]
```

### `components/` Directory

- **Providers**: `auth-provider.tsx`, `events-provider.tsx`, `theme-provider.tsx`
- **Layout**: `site-header.tsx`, `site-footer.tsx`
- **Security**: `protected-client.tsx`, `role-redirect.tsx`
- **UI Components**: Complete shadcn/ui component library in `ui/` folder

### `lib/` Directory (Utility Libraries)

- **`auth.ts`** - Authentication helpers and role-based access
- **`jwt.ts`** - JWT token management (access/refresh tokens)
- **`prisma.ts`** - Database connection
- **`ai.ts`** - AI integration for chat and content generation
- **`cloudinary.ts`** - File upload configuration
- **`utils.ts`** - Utility functions (className merging)

### `prisma/` Directory

- **`schema.prisma`** - Database schema definition

## Database Schema

### Core Models

#### 1. User Model

```prisma
model User {
  id            String          @id @default(uuid())
  email         String          @unique
  name          String
  role          Role            @default(VOLUNTEER)
  passwordHash  String
  preferredLang String          @default("en")
  points        Int             @default(0)
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  refreshTokens RefreshToken[]
  events        Event[]         @relation("OrganizerEvents")
  attendances   Attendance[]
  wasteReports  WasteReport[]   @relation("ReporterWasteReports")
}
```

- **Roles**: VOLUNTEER, ORGANIZER, ADMIN
- **Authentication**: email, passwordHash
- **Gamification**: points system
- **Localization**: preferredLang

#### 2. Event Model

```prisma
model Event {
  id             String        @id @default(uuid())
  organizer      User          @relation("OrganizerEvents", fields: [organizerId], references: [id])
  organizerId    String
  title          String
  desc           String
  category       String
  location       String
  startAt        DateTime
  endAt          DateTime
  coverImageUrl  String?
  qrSecret       String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  attendances    Attendance[]
  wasteReports   WasteReport[]
}
```

- Created by organizers
- Location-based with time slots
- QR code integration for check-ins
- Cover images support

#### 3. Attendance Model

```prisma
model Attendance {
  id         String   @id @default(uuid())
  event      Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  eventId    String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId     String
  checkedIn  Boolean  @default(false)
  checkInAt  DateTime?
  createdAt  DateTime @default(now())

  @@unique([eventId, userId])
}
```

- Links users to events
- Check-in tracking with timestamps
- Unique constraint per user-event pair

#### 4. WasteReport Model

```prisma
model WasteReport {
  id             String   @id @default(uuid())
  event          Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  eventId        String
  reporter       User     @relation("ReporterWasteReports", fields: [reporterId], references: [id], onDelete: SetNull)
  reporterId     String?
  imageUrl       String
  classification String
  weightKg       Float?
  createdAt      DateTime @default(now())

  @@index([eventId])
  @@index([reporterId])
}
```

- Image-based waste reporting
- AI classification of waste types
- Weight tracking
- Linked to specific events

#### 5. RefreshToken Model

```prisma
model RefreshToken {
  id         String   @id @default(uuid())
  tokenHash  String   @unique
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId     String
  expiresAt  DateTime
  createdAt  DateTime @default(now())

  @@index([userId])
  @@index([expiresAt])
}
```

- Secure token management
- Automatic cleanup of expired tokens

## Key Features & Functionality

### Authentication System

- **JWT-based** with access tokens (15min) and refresh tokens (30 days)
- **Role-based access control** (Volunteer, Organizer, Admin)
- **Secure password hashing** with bcrypt
- **Token rotation** for enhanced security
- **HTTP-only cookies** for refresh tokens

#### Authentication Flow

1. User registers/logs in with email/password
2. Server validates credentials and generates JWT access token
3. Refresh token stored as HTTP-only cookie
4. Access token used for API authentication
5. Token rotation on refresh for security

### Event Management

- **Event creation** by organizers
- **Event discovery** with filtering (date, category, location)
- **QR code check-ins** for attendance tracking
- **Real-time attendance management**

#### Event Workflow

1. Organizers create events with details
2. QR codes generated for check-ins
3. Volunteers discover and join events
4. Check-in via QR code scanning
5. Attendance tracked with timestamps

### Waste Reporting System

- **Image upload** via Cloudinary
- **AI-powered waste classification** (placeholder implementation)
- **Weight tracking** for environmental impact
- **Event-specific reporting**

#### Waste Reporting Process

1. User uploads waste photo
2. AI classifies waste type (recyclable, organic, hazardous, etc.)
3. Optional weight entry
4. Report linked to specific cleanup event
5. Data used for impact analytics

### AI Integration

- **Chat functionality** with OpenAI GPT-4o-mini
- **Content generation** for social media captions
- **Multi-language support**
- **Waste image classification** (planned feature)

#### AI Features

```typescript
// Chat functionality
export async function chatReply(input: {
  messages: { role: "user" | "system" | "assistant"; content: string }[];
  language?: string;
});

// Caption generation
export async function generateCaption(input: {
  topic: string;
  tone?: string;
  language?: string;
});

// Waste classification (placeholder)
export async function classifyWasteImage(imageUrl: string);
```

### Gamification

- **Points system** for user engagement
- **Rewards tracking**
- **Certificate generation** for completed events

### User Interfaces

- **Responsive design** with Tailwind CSS
- **Modern UI components** from Radix UI
- **Role-specific dashboards**
- **Real-time notifications** with Sonner

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout

### Event Endpoints

- `GET /api/events` - List events with filtering
- `POST /api/events` - Create new event (organizers only)
- `GET /api/events/[id]` - Get event details
- `PUT /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event

### Attendance Endpoints

- `GET /api/attendances` - List user attendances
- `POST /api/attendances` - Join event
- `POST /api/checkin` - Check-in to event

### Other Endpoints

- `POST /api/chat` - AI chat interface
- `POST /api/waste/upload` - Upload waste report
- `POST /api/generate-certificate` - Generate completion certificate
- `GET /api/dashboard/[eventId]` - Event dashboard data

## Configuration Files

### `next.config.mjs`

```javascript
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};
```

- Disables ESLint and TypeScript errors during builds
- Unoptimized images for deployment flexibility

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "target": "ES6",
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  }
}
```

- Modern TypeScript configuration
- Path aliases (`@/*` for root imports)
- Next.js plugin integration

### `components.json`

- shadcn/ui configuration
- Tailwind CSS integration settings

## Development & Deployment

### Package.json Scripts

```json
{
  "scripts": {
    "build": "next build",
    "dev": "next dev",
    "lint": "next lint",
    "start": "next start"
  }
}
```

### Environment Variables Required

```env
DATABASE_URL=postgresql://...           # PostgreSQL connection string
JWT_SECRET=your_jwt_secret             # JWT signing secret
QR_SECRET=your_qr_secret              # QR token signing secret
OPENAI_API_KEY=your_openai_key        # OpenAI API access
CLOUDINARY_CLOUD_NAME=your_cloud      # Cloudinary configuration
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_secret
```

## Security Features

### Password Security

- **bcrypt hashing** with salt rounds (10)
- **Password verification** on login
- **Secure storage** in database

### JWT Token Security

- **Short-lived access tokens** (15 minutes)
- **Secure refresh tokens** (30 days)
- **Token rotation** on refresh
- **HTTP-only cookies** for refresh tokens
- **Secure cookie settings** (httpOnly, secure, sameSite)

### API Security

- **Role-based access control** on all endpoints
- **Authentication required** for protected routes
- **Input validation** with request body parsing
- **Error handling** without information leakage

### Database Security

- **Prepared statements** via Prisma ORM
- **Foreign key constraints** for data integrity
- **Cascade deletions** for cleanup
- **Indexed fields** for performance

## Performance Optimizations

### Database

- **Prisma ORM** for efficient queries
- **Database indexing** on frequently queried fields
- **Relationship optimization** with proper foreign keys
- **Query optimization** with selective field retrieval

### Frontend

- **Next.js App Router** for efficient routing
- **Component lazy loading** where applicable
- **Image optimization** via Cloudinary
- **Static generation** capabilities
- **CSS optimization** with Tailwind

### Caching Strategy

- **JWT token caching** in localStorage
- **Refresh token** in HTTP-only cookies
- **Static asset caching** via Next.js
- **Database connection pooling** via Prisma

## File Upload & Media Management

### Cloudinary Integration

- **Image upload** for event covers
- **Waste report photos** with automatic optimization
- **User profile pictures** (planned)
- **Automatic format conversion** and compression

### File Types Supported

- **Images**: JPG, PNG, WebP for event covers and waste reports
- **Documents**: PDF for certificates
- **QR Codes**: Generated dynamically for events

## Internationalization (i18n)

### Multi-language Support

- **User preference storage** in database (`preferredLang`)
- **AI chat responses** in user's preferred language
- **Content generation** with language specification
- **Frontend localization** framework ready

## Analytics & Reporting

### Data Tracking

- **Event participation** metrics
- **Waste collection** statistics
- **User engagement** analytics
- **Environmental impact** calculations

### Dashboard Features

- **Organizer dashboards** for event management
- **Volunteer progress** tracking
- **System-wide analytics** for admins
- **Export capabilities** for reports

## Future Enhancements

### Planned Features

1. **Real-time waste image classification** with computer vision
2. **Enhanced gamification** with badges and achievements
3. **Social features** for community building
4. **Mobile app** development
5. **Payment integration** for donations
6. **Advanced analytics** with ML insights

### Technical Improvements

1. **Real-time updates** with WebSockets
2. **Offline capabilities** with PWA
3. **Enhanced caching** strategies
4. **API rate limiting** implementation
5. **Comprehensive testing** suite

## Deployment Considerations

### Production Requirements

- **PostgreSQL database** hosting
- **Redis** for session management (optional)
- **Cloudinary account** for media storage
- **OpenAI API** access for AI features
- **SSL certificates** for HTTPS

### Recommended Hosting

- **Vercel** for Next.js deployment
- **Railway/Supabase** for PostgreSQL
- **Cloudinary** for media CDN
- **Environment variable** management

This comprehensive analysis covers all aspects of the Shore Clean project, from technical architecture to business functionality, providing a complete understanding of the codebase and its capabilities.
