# CascadEffects Performance Platform

# Waypoint 25 — Runtime Foundation Checkpoint & CascadEffects Design Direction

**Date:** 2026-09-10

**Milestone:** Runtime Product Experience / CascadEffects Design & Vibe

**Status:** RUNTIME DASHBOARD / MEMBER PERFORMANCE SEPARATION COMPLETE — AUTHENTICATION IS NEXT

**Previous Waypoint:** Waypoint 24 — Runtime Product Experience Direction

---

# 1. Overview

This Waypoint records the current Runtime checkpoint after browser verification
of the separation between organization-level performance and individual member
performance.

The Runtime foundation remains established, and the product experience has
now clarified an important dependency: the intended three-role product flow
requires authenticated identity and role-aware entry.

The immediate next milestone is therefore:

> Authentication + Role-Based Entry

CascadEffects Design & Vibe remains an active product-experience direction,
but broader visual refinement will continue after the authentication and
role-based entry foundation is established.

---

# 2. Runtime Foundation Checkpoint

The following Runtime foundations are established:

- Assignment resolution
- Published Performance Sheet resolution
- Monthly Performance Instance resolution
- Runtime subject resolution
- Runtime Objectives
- Runtime Key Results
- Runtime Initiatives
- Key Result Progress
- Current values
- Scores
- Employee comments
- Manager comments
- Runtime lifecycle state
- Runtime Objective editing
- Runtime Key Result editing
- Runtime Initiative editing
- Member-specific Runtime navigation
- Monthly performance navigation
- Organization Runtime overview foundation

Runtime remains the authoritative execution layer.

The Member Workspace remains a presentation, navigation, and workflow layer
over Runtime.

No second performance engine has been introduced.

---

# 3. Completed Runtime Product Experience Increment

The Runtime Product Experience foundation has now been verified in the browser
with a clear separation between organization-level performance and individual
member performance.

The Runtime navigation establishes the intended simple Mint-inspired model:

Dashboard
↓

Organization-level Runtime performance view

Member
↓

Individual member Performance Sheet

The current demonstration includes:

- Dashboard and individual member performance are no longer stacked together
  on one page.
- Test User can be opened as an individual member performance context.
- The individual member Performance Sheet retains monthly Performance Instance
  navigation.
- Previous monthly Performance Instances can be selected through the existing
  monthly Runtime mechanism.
- The existing Runtime execution engine and Performance Instance model were
  reused.
- No second performance engine or second Member performance data model was
  introduced.
- `npm run build` passed after the Runtime separation work.
- Browser verification confirmed the Dashboard / Test User separation.

This is an incremental product-experience completion, not a new Runtime
architecture.

---

# 4. Official CascadEffects Brand Direction

The CascadEffects Brand Guide remains the visual source of truth for the
default platform brand.

Official colors:

- Deep Navy — `#082550`
- Grayish Blue — `#B4C2D1`
- Light Blue — `#E9F4F8`
- Dark Charcoal — `#272D2C`
- White — `#FFFFFF`
- Coral — `#E26D5C`

The four signature colors that should remain visually prominent are:

- Deep Navy
- Grayish Blue
- Light Blue
- Coral

Coral remains an accent / callout color and should be used selectively.

Brand typography direction:

- Roboto Black
- Martel Sans
- Khula

The visual direction remains:

- sleek
- innovative
- minimalist
- clean
- modern
- professional
- clear
- forward-thinking

The design principle remains:

> Calm outside. Strong inside.

---

# 5. Design System Architecture

The CascadEffects design system remains centralized.

Conceptual ownership:

CascadEffects Platform

↓

Centralized CascadEffects Design System

↓

Administration / Builder / Shared Platform UI

Runtime presentation remains architecturally distinct because organization-
facing Runtime presentation may eventually support organization-specific
visual configuration.

The CascadEffects default theme remains the fallback theme for organizations
that have not configured their own branding.

Future organization-specific branding should use configuration and theme
overrides rather than duplicate UI systems.

---

# 6. Architecture Preserved

The established architecture remains:

Administration

↓

Builder

↓

Published Performance Sheet Version

↓

Assignment

↓

Monthly Performance Instance

↓

Runtime Execution

↓

Member / Manager Performance Experience

↓

Historical Performance Data / Reporting

Builder remains the reusable definition engine.

Runtime remains the execution engine.

Administration remains the configuration and management entry layer.

The platform remains data-driven and multi-tenant.

No new Reporting Period product entity was introduced.

---

# 7. Product Discovery — Authentication Is Now the Next Dependency

The Runtime separation exposed an important product-flow dependency.

The intended CascadEffects product has three distinct authenticated user
experiences.

## Platform Super Admin

After login:

Super Admin Landing

↓

Manage Organizations

OR

Open Organization Performance

↓

Select Organization

↓

Open the existing performance / Runtime experience

A Platform Super Admin operates above the organization boundary and therefore
selects an Organization when entering an organization-specific performance
experience.

## Organization Admin

After login:

Organization Admin Landing

↓

Open Organization Workspace

OR

Open Organization Performance

The Organization Admin operates within one authorized Organization and does
not require a cross-organization selector.

## Member

After login:

Member Landing

↓

Open My Performance

OR

Open Organization Performance

My Performance remains the member's own editable Runtime performance
experience.

Organization Performance is initially a performance-facing view and does
not make the Member an Administration actor.

The landing pages are entry points into existing platform experiences. They
must not become new performance engines or duplicate business systems.

---

# 8. Authentication Scope

Authentication is now a required product dependency for the next milestone.

The immediate authentication milestone is intentionally limited to the
foundation required to establish the three role-based entry experiences.

Initial scope:

- Login
- Authenticated session
- Supabase Auth identity resolution
- Application User resolution
- Platform Super Admin resolution
- Organization Membership resolution
- Role-aware entry routing
- Super Admin landing page
- Organization Admin landing page
- Member landing page
- Forgot Password
- Password Reset
- Clear return to login after password reset

Password recovery belongs to the authentication experience and should be
available from the login page.

Account/password management for an already authenticated user should
eventually live within account/profile settings rather than inside the role
landing page.

Full production authorization remains a separate later security milestone.

Authentication establishes identity.

Authorization determines what that identity is allowed to access.

Production authorization and RLS must not be replaced by client-side role
checks or navigation visibility.

---

# 9. Product Navigation Direction

The intended role-based entry model is:

Super Admin
↓

Super Admin Landing

├── Manage Organizations

└── Open Organization Performance

    ↓

Organization Selector

    ↓

Existing Runtime / Performance experience

Organization Admin
↓

Organization Admin Landing

├── Open Organization Workspace

└── Open Organization Performance

    ↓

Existing Runtime / Performance experience

Member
↓

Member Landing

├── Open My Performance

└── Open Organization Performance

The existing Runtime experience remains the destination for performance
execution.

The existing Organization Workspace remains the destination for organization
administration.

The Super Admin landing page is a launch point, not a replacement for the
existing Administration system.

The Organization Admin landing page is a launch point, not a second
Organization Workspace.

The Member landing page is a launch point, not a second Member performance
engine.

---

# 10. Super Admin / Organization Admin Dashboard Discovery

The current Runtime work clarified the relationship between administration
and organization performance.

The Super Admin should not receive a duplicate organization dashboard merely
because the Super Admin operates at the platform level.

The intended Super Admin entry pattern is:

Super Admin Landing

↓

Select Organization

↓

Open Organization Performance

↓

Existing organization/runtime performance experience

The existing Organization Dashboard remains an organization-facing
performance experience.

The future Super Admin landing page may also use the same simple pattern for
other organization-scoped actions:

Select Organization

↓

Open selected organization experience

This is a navigation/context pattern, not a new database entity.

Organization Admins have a fixed organization context and therefore should
enter their organization's existing workspace or performance experience
directly without a tenant-switching selector.

---

# 11. Database Changes

No new database changes were introduced by the Runtime Dashboard / member
separation.

The existing monthly Performance Instance uniqueness rule remains in place.

No new Reporting Period entity was introduced.

The authentication milestone is expected to reuse the existing identity and
membership architecture:

Supabase Auth

↓

Application User

↓

Platform Membership
OR
Organization Membership

↓

Roles / Permissions

No duplicate user identity model should be created for the landing pages.

---

# 12. Documentation Updated

This Waypoint is being reconciled to reflect the actual current product state
after Runtime browser verification and the newly discovered authentication
dependency.

Related current documents are being reconciled:

- `docs/01_Platform_Decisions.md`
- `docs/02_Platform_Backlog.md`

No change is required to:

- `docs/00_Engineering_Process.md`
- `docs/03_Product_North_Star.md`

Historical Waypoints remain historical and are not rewritten.

---

# 13. Technical Debt / Deferred Work

The following remain intentionally deferred:

- Production tenant authorization
- Production Row Level Security
- Complete authorization enforcement across UI, services, APIs, and database
- Runtime security boundaries
- Assignment Subject Validation
- Performance Instance Relationship Integrity hardening
- Historical KPI Updates
- Generalized KPI Calculation Engine
- Weighted Aggregation
- Historical Performance Reporting
- Dynamic Dashboard System expansion
- AI capabilities
- Organization-specific branding configuration
- Broader Super Admin dashboard redesign
- Broader Organization Admin page redesign

Authentication is no longer optional for the next product-flow milestone
because role-aware post-login routing cannot be demonstrated correctly
without authenticated identity.

---

# 14. Next Development Session

The next development milestone is:

> Authentication + Role-Based Entry

Startup sequence:

Review Product North Star

↓

Review latest Waypoint

↓

Review Platform Decisions

↓

Review Platform Backlog

↓

Confirm Authentication + Role-Based Entry milestone

↓

Inspect existing Supabase Auth implementation

↓

Inspect existing Application User / Platform Membership /
Organization Membership resolution

↓

Inspect existing login page and authentication services

↓

Implement the smallest authentication foundation required for role-aware
entry

↓

Compile

↓

Browser / Functional Verification

↓

Review Diff

↓

Commit

↓

Update Documentation

↓

Create the next Waypoint when the authentication milestone is complete

The first implementation should not attempt full production authorization,
RLS, or a complete permissions enforcement system.

---

# 15. Milestone Status

Administration:

**COMPLETE / ESTABLISHED**

Organization Admin Workspace Foundation:

**COMPLETE / ESTABLISHED**

Builder:

**COMPLETE / ESTABLISHED**

Runtime Execution Foundation:

**COMPLETE / ESTABLISHED**

Member Workspace Foundation:

**COMPLETE / ESTABLISHED**

Monthly Performance Cadence:

**ESTABLISHED PRODUCT RULE**

Member Performance Navigation:

**ESTABLISHED**

Runtime Dashboard / Member Performance Separation:

**COMPLETE / VERIFIED**

Runtime Product Experience:

**FOUNDATION CHECKPOINT COMPLETE**

CascadEffects Design & Vibe:

**PARTIALLY ESTABLISHED / CONTINUE AFTER AUTHENTICATION**

Authentication + Role-Based Entry:

**NEXT MILESTONE**

Production Authorization / RLS:

**OUTSTANDING / LATER SECURITY MILESTONE**

Runtime Security:

**DEFERRED**

Historical KPI Updates:

**DEFERRED**

KPI Calculation Engine:

**DEFERRED**

Weighted Aggregation:

**DEFERRED**

Historical Performance Reporting:

**DEFERRED**

AI:

**FUTURE**

---

# 16. Final Direction

The current platform path is now:

Runtime separation verified

↓

Authentication + Role-Based Entry

↓

Super Admin / Organization Admin / Member landing experiences

↓

Re-enter and refine the existing Runtime / Administration experiences

↓

Continue CascadEffects Design & Vibe refinement

The immediate goal is not to build more systems.

It is to connect the systems already established into the correct user
experience:

Authenticate

↓

Identify the actor

↓

Enter the correct role-based landing page

↓

Open the existing organization, workspace, or Runtime experience

The platform remains data-driven, multi-tenant, reusable, and based on the
established Administration → Builder → Published Performance Sheet →
Assignment → Monthly Performance Instance → Runtime architecture.

The central product principle remains:

> Calm outside. Strong inside.
