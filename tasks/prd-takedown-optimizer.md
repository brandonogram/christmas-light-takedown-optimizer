# PRD: Christmas Light Takedown Optimizer

## Introduction

A comprehensive mobile-first web application designed for professional Christmas light installation companies to optimize their post-holiday takedown operations. The app integrates with Jobber (the industry-standard field service management platform) to sync customer data, jobs, and scheduling while providing specialized tools for takedown-specific workflows including route optimization, inventory tracking, crew management, storage documentation, and real-time progress monitoring.

The takedown season (January-February) presents unique operational challenges: crews must efficiently remove lights from hundreds of properties, properly label and store equipment by address, document any issues, and coordinate multiple teams across service regions. Current solutions rely on manual processes, paper checklists, and disconnected tools—leading to lost inventory, missed appointments, and poor customer communication.

## Goals

- Reduce takedown completion time per property by 30% through optimized routing and pre-loaded job context
- Eliminate lost/misplaced inventory through address-specific labeling and storage tracking
- Provide crews with mobile-friendly access to job details, property notes, and photo documentation from installation
- Enable real-time progress visibility for dispatchers and business owners
- Seamless two-way sync with Jobber for customer data, jobs, and scheduling
- Reduce customer callbacks by ensuring complete removal verification with photo documentation
- Generate professional completion reports automatically sent to customers

## User Stories

### Authentication & Onboarding

#### US-001: Jobber OAuth Connection
**Description:** As a business owner, I want to connect my Jobber account so that customer and job data syncs automatically.

**Acceptance Criteria:**
- [ ] "Connect with Jobber" button initiates OAuth 2.0 flow
- [ ] Callback URL properly receives authorization code
- [ ] Access token and refresh token stored securely in Supabase
- [ ] User redirected to dashboard after successful connection
- [ ] Error handling for denied/failed authorization
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-002: User Profile Setup
**Description:** As a new user, I want to set up my company profile so the system knows my business details.

**Acceptance Criteria:**
- [ ] Form captures: company name, phone, email, service regions
- [ ] Crew count and typical crew size fields
- [ ] Storage facility address(es) input
- [ ] Profile saved to Supabase
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### Dashboard & Overview

#### US-003: Takedown Season Dashboard
**Description:** As a dispatcher, I want to see an overview of takedown progress so I can manage operations effectively.

**Acceptance Criteria:**
- [ ] Shows total jobs remaining vs completed
- [ ] Progress bar visualization
- [ ] Today's scheduled takedowns list
- [ ] Crew status cards (idle, en route, on site, completed)
- [ ] Weather alert banner if conditions affect work
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-004: Revenue Tracking Widget
**Description:** As a business owner, I want to see takedown revenue metrics so I understand financial performance.

**Acceptance Criteria:**
- [ ] Total takedown revenue collected
- [ ] Outstanding balances (unpaid before takedown)
- [ ] Jobs blocked pending payment indicator
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### Job Management

#### US-005: Job List with Filters
**Description:** As a dispatcher, I want to filter and sort takedown jobs so I can prioritize scheduling.

**Acceptance Criteria:**
- [ ] List view shows all takedown jobs from Jobber
- [ ] Filter by: status (scheduled, in progress, completed), region, payment status
- [ ] Sort by: date, address, crew assigned
- [ ] Search by customer name or address
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-006: Job Detail View
**Description:** As a crew member, I want to see complete job details so I know what to expect on site.

**Acceptance Criteria:**
- [ ] Customer name, address, phone displayed prominently
- [ ] Installation photos gallery (pulled from Jobber or uploaded)
- [ ] Special notes/instructions highlighted
- [ ] Property access details (gate codes, where to park)
- [ ] Previous year's takedown notes if available
- [ ] Inventory list of what was installed
- [ ] Estimated time for takedown
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-007: Job Status Updates
**Description:** As a crew lead, I want to update job status from my phone so dispatch knows our progress.

**Acceptance Criteria:**
- [ ] Status buttons: "En Route", "On Site", "In Progress", "Completed"
- [ ] Timestamps recorded for each status change
- [ ] Status syncs back to Jobber
- [ ] Push notification to dispatcher on status changes
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### Route Optimization

#### US-008: Daily Route Builder
**Description:** As a dispatcher, I want to build optimized routes for crews so they spend less time driving.

**Acceptance Criteria:**
- [ ] Drag-and-drop interface to assign jobs to crews
- [ ] Auto-optimize route order button
- [ ] Shows estimated drive time between stops
- [ ] Map visualization of route
- [ ] Start/end at storage facility option
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-009: Crew Route View
**Description:** As a crew member, I want to see my daily route in order so I know where to go next.

**Acceptance Criteria:**
- [ ] List of jobs in route order
- [ ] One-tap navigation to Google Maps/Apple Maps
- [ ] Next job prominently displayed
- [ ] Estimated arrival times shown
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### Inventory & Storage

#### US-010: Takedown Checklist
**Description:** As a crew member, I want a checklist of items to remove so nothing gets left behind.

**Acceptance Criteria:**
- [ ] Checklist populated from installation inventory
- [ ] Checkbox for each item category (lights, extension cords, clips, timers)
- [ ] Ability to add notes per item
- [ ] "Missing/Damaged" flag option
- [ ] Photo capture for damaged items
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-011: Storage Label Generator
**Description:** As a crew member, I want to generate storage labels so equipment stays organized by customer.

**Acceptance Criteria:**
- [ ] Generate QR code label for each job's equipment
- [ ] Label includes: customer name, address, bin number
- [ ] Print-friendly format or save as image
- [ ] Scan QR code to pull up customer record
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-012: Storage Location Tracking
**Description:** As a warehouse manager, I want to track where each customer's equipment is stored so we can find it next season.

**Acceptance Criteria:**
- [ ] Assign storage location (facility, row, bin) to each job's inventory
- [ ] Search by customer name to find storage location
- [ ] Scan QR code to update location
- [ ] Storage map visualization
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### Documentation & Photos

#### US-013: Before/After Photo Capture
**Description:** As a crew member, I want to take completion photos so we have proof of work done.

**Acceptance Criteria:**
- [ ] Camera interface within app
- [ ] Photo tagged to specific job automatically
- [ ] Before (arriving) and After (leaving) photo categories
- [ ] Photos upload to cloud storage
- [ ] Offline capability - queue for upload when connected
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-014: Completion Report Generation
**Description:** As a business owner, I want automatic completion reports sent to customers so they know the work is done.

**Acceptance Criteria:**
- [ ] Auto-generate PDF report on job completion
- [ ] Includes: date, crew, before/after photos, checklist summary
- [ ] Email sent to customer with report attached
- [ ] Copy stored in job record
- [ ] Typecheck passes

### Customer Communication

#### US-015: Scheduling Notification
**Description:** As a customer, I want to receive notification when my takedown is scheduled so I can prepare.

**Acceptance Criteria:**
- [ ] Email/SMS sent 48 hours before scheduled takedown
- [ ] Includes date, time window, and any prep instructions
- [ ] Triggered when job is assigned to route
- [ ] Typecheck passes

#### US-016: Completion Notification
**Description:** As a customer, I want to know when my lights have been removed so I can check the work.

**Acceptance Criteria:**
- [ ] Email/SMS sent when job marked complete
- [ ] Links to completion report with photos
- [ ] Thank you message with booking link for next season
- [ ] Typecheck passes

### Crew Management

#### US-017: Crew Assignment Interface
**Description:** As a dispatcher, I want to assign crews to jobs so everyone knows their responsibilities.

**Acceptance Criteria:**
- [ ] Create crew groups with member names
- [ ] Assign crew to specific jobs or full routes
- [ ] View crew workload and availability
- [ ] Reassign capability if crew changes
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-018: Crew Performance Dashboard
**Description:** As a business owner, I want to see crew productivity metrics so I can optimize staffing.

**Acceptance Criteria:**
- [ ] Jobs completed per crew per day
- [ ] Average time per job by crew
- [ ] Comparison across crews
- [ ] Date range selector
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### Payment Integration

#### US-019: Payment Status Check
**Description:** As a dispatcher, I want to see payment status before scheduling takedowns so I can enforce payment policies.

**Acceptance Criteria:**
- [ ] Payment status pulled from Jobber
- [ ] Visual indicator: paid (green), partial (yellow), unpaid (red)
- [ ] Filter to show only unpaid jobs
- [ ] Block scheduling for unpaid beyond threshold
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### Landing Page & Marketing

#### US-020: Marketing Landing Page
**Description:** As a potential customer, I want to learn about the tool before signing up so I understand its value.

**Acceptance Criteria:**
- [ ] Hero section with HeyGen avatar video of Brandon Calloway
- [ ] Gemini-generated 10-second background video clip
- [ ] Feature highlights with icons
- [ ] Testimonials section
- [ ] Pricing information
- [ ] "Connect with Jobber" CTA button
- [ ] Mobile-responsive design
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-021: HeyGen Avatar Video Integration
**Description:** As a visitor, I want to see a video introduction so I can learn from a real person.

**Acceptance Criteria:**
- [ ] HeyGen API integration
- [ ] Video of Brandon Calloway explaining the tool
- [ ] Script covers: problem, solution, key features, CTA
- [ ] Video player with controls
- [ ] Fallback image if video fails to load
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-022: Gemini Background Video
**Description:** As a visitor, I want an engaging visual background so the site feels professional.

**Acceptance Criteria:**
- [ ] Gemini Veo API integration
- [ ] 10-second looping video of Christmas lights being taken down
- [ ] Video plays automatically, muted
- [ ] Optimized for web (compressed, lazy loaded)
- [ ] Fallback gradient if video fails
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### Jobber Integration

#### US-023: Jobber Data Sync
**Description:** As a system, I need to sync data bidirectionally with Jobber so information stays current.

**Acceptance Criteria:**
- [ ] Pull clients, jobs, and schedules from Jobber GraphQL API
- [ ] Push status updates back to Jobber
- [ ] Webhook listener for real-time updates
- [ ] Sync runs on configurable schedule
- [ ] Error handling and retry logic
- [ ] Typecheck passes

#### US-024: Jobber App Marketplace URLs
**Description:** As a Jobber user, I want to access the app from Jobber's marketplace so I can easily connect.

**Acceptance Criteria:**
- [ ] OAuth Callback URL configured: `https://christmas-light-takedown-optimizer.vercel.app/api/auth/jobber/callback`
- [ ] Manage App URL configured: `https://christmas-light-takedown-optimizer.vercel.app/dashboard`
- [ ] Both URLs documented and ready for Jobber submission
- [ ] Typecheck passes

## Functional Requirements

- FR-1: OAuth 2.0 authentication with Jobber using authorization code flow
- FR-2: Secure token storage and automatic refresh in Supabase
- FR-3: GraphQL client for Jobber API queries and mutations
- FR-4: Real-time status updates via Supabase subscriptions
- FR-5: Offline-capable Progressive Web App for field crews
- FR-6: QR code generation and scanning for inventory labels
- FR-7: Google Maps API integration for route optimization
- FR-8: HeyGen API integration for avatar video generation
- FR-9: Gemini Veo API integration for background video
- FR-10: Email/SMS notifications via SendGrid or Twilio
- FR-11: PDF generation for completion reports
- FR-12: Image upload and storage via Supabase Storage
- FR-13: Mobile-first responsive design using Tailwind CSS

## Non-Goals

- Not building a full CRM - Jobber handles customer management
- Not building invoicing - Jobber handles payments
- Not building a scheduling calendar - integrating with Jobber's scheduler
- No native mobile apps initially - PWA provides mobile experience
- Not supporting competitors to Jobber in initial release

## Technical Considerations

- **Framework:** Next.js 16 with App Router
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth + Jobber OAuth
- **Styling:** Tailwind CSS with mobile-first approach
- **State:** React Server Components + Client Components where needed
- **Maps:** Google Maps JavaScript API or Mapbox
- **Video:** HeyGen API, Gemini Veo API
- **Notifications:** SendGrid (email), Twilio (SMS)
- **Storage:** Supabase Storage for photos and documents

## Success Metrics

- 50+ businesses connected to Jobber within first season
- Average 25% reduction in takedown time per job reported by users
- 90% of crews actively using mobile app for daily routes
- Less than 2% inventory loss rate (down from industry 8-10%)
- 95% customer satisfaction on completion reports

## Open Questions

- Should we support multiple field service platforms beyond Jobber in future?
- What level of offline capability is essential for areas with poor cell coverage?
- Should crew time tracking be built-in or rely on Jobber's time tracking?
