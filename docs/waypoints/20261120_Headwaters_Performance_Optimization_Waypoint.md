# HEADWATERS | PERFORMANCE OPTIMIZATION WAYPOINT

# Headwaters Performance Optimization Waypoint

**Project continuity record • Current position, completed work, evidence reviewed, and next actions**

> **PRIMARY GOAL**
>
> Make the already-working Headwaters application noticeably faster by identifying and reducing real latency. Do not redesign, refactor unrelated areas, change business behavior, or risk existing functionality.

## 1. Executive status

Headwaters is functioning well and is close to the intended behavior. The remaining project focus is performance, particularly latency during initial Runtime loading and navigation. This is not a feature-development or application-rebuild effort.

Three optimization workstreams have been implemented and the user has confirmed the build passed: Dashboard data loading, Runtime navigation loading, and request-scoped reuse of authentication/authorization lookups. The organization lookup is the next investigation target, but it has not yet been changed. Production benchmarking is still pending.

## 2. What we completed

- **Dashboard data loading — complete.** The Runtime page no longer loads Dashboard data before it knows which workspace is being opened. Operational custom-table workspaces return without loading Dashboard data. Dashboard data is loaded only for the organization Dashboard and individual Member Performance. Existing Dashboard and Member Performance behavior is retained.
- **Runtime navigation — complete.** Saved navigation configuration is fetched during the server-rendered request and passed into RuntimeNavigation. The previous client-side fetch/effect/state loading path was removed. Saved ordering, hidden/active behavior, Dashboard fallback, members, and operational tabs were intended to remain unchanged. No database migration was introduced.
- **Authentication and authorization lookup reuse — complete.** Request-scoped caching/reuse was added so repeated identity, active application-user, and Platform Super Admin membership lookups within the same server-rendered request can be reused. Organization membership and permission checks remain in place. The important distinction was preserved: `getCurrentServerUser` requires an active application user, while the separate `requirePlatformSuperAdmin` path did not previously apply that active-user filter. The optimization preserves that distinction.

**Build status:** The user confirmed the build passed after the authentication/authorization replacement files were applied. The user has also confirmed the earlier optimization changes were applied and builds passed. Do not ask for routine build confirmation again unless the user reports an error.

## 3. Production checks and evidence reviewed

The following checks were already performed during the current optimization effort. Do not repeat them as if they have not happened.

- Used the production application at `https://ce-headwaters.vercel.app` for performance observations, rather than relying on localhost timings.
- Inspected Chrome DevTools Network Fetch/XHR behavior for Runtime navigation POST requests to `/runtime` returning `text/x-component`.
- Observed that most of the measured request duration was Waiting for server response (TTFB); request send and response download were small.
- Recorded baseline individual samples: Agenda about **1.74s**, Client Performance about **2.53s**, and return to Agenda about **1.61s**.
- Recorded later individual samples after navigation-related changes: Agenda about **1.52s**, Client Performance about **1.64s**, and return to Agenda about **1.22s**. These are individual, uncontrolled samples, not a statistically controlled benchmark.
- Reviewed Vercel production tracing with a temporary 100% sampling rule scoped to Production requests whose path begins with `/runtime`. Traces include both GET and POST requests; not every trace is a tab-navigation request.
- Reviewed trace spans for authentication, users, platform memberships, organization memberships, organization lookup, assignments, performance instances, performance sheets, and custom operational rows.
- Observed one slower Runtime GET trace with total duration about **5.39s** and function invocation about **4.41s**. In that trace, the organization request was about **1.14s**; auth about **467ms**; users calls about **291ms** and **352ms**; platform membership about **249ms**; organization membership about **242ms**; assignments about **275ms**; performance instances about **248ms**; performance sheets about **280ms**; custom operational rows about **285ms**.
- Observed another trace where organization lookup was about **256ms** and several other Supabase requests were around **237–271ms**. This variability means one 1.14s sample does not establish a consistently slow organization query.
- Confirmed from the reviewed trace/context that the Vercel function region and Supabase region are both US East/Washington DC (`iad1`); Singapore edge ingress (`sin1`) alone is not a reason to change regions.
- Noted that some data requests (including assignments, performance instances, and performance sheets) were already issued concurrently. Do not propose parallelizing those same calls again without new evidence.

## 4. Current investigation target: organization lookup

The latest reviewed Runtime page calls `getOrganization(organizationId)` early in the Server Component request. The reviewed organization service uses the shared Supabase browser client, selects the full organization row with `select('*')`, filters by the explicit organization ID, and uses `maybeSingle()`. The lookup is not a tenant fallback.

The organization lookup measured about **1.14s** in one trace but about **256ms** in another. The correct next step is to compare several comparable production traces and determine whether this is a repeatable query delay, request/cold-start variability, or another factor. Do not change the Supabase client, select list, query shape, or tenant resolution behavior based only on one slow sample.

**Important continuity note:** The latest versions of the relevant files have already been found and reviewed in this workstream. The user explicitly pointed out that repeatedly reopening and re-reviewing those same recent files was going in circles. Do not ask the user to upload them again or restart the same source-file review. Continue from the findings recorded here.

## 5. Next steps, in order

1. **Finish the organization-lookup diagnosis:** Use the existing production tracing setup and compare multiple comparable `/runtime` requests. Separate GET initial-load traces from POST navigation traces. Record organization lookup duration alongside total function duration and other spans. Look for repeatability and correlation; do not infer causation from a single span.
2. **Make one evidence-backed change only if justified:** If the organization lookup is consistently a material bottleneck, inspect the exact server/client execution and query requirements before changing it. Preserve explicit organization-ID scoping, RLS/session behavior, selected fields actually consumed by the page, and all tenant boundaries. If evidence does not justify a safe change, leave the code unchanged and move to the next measured bottleneck.
3. **Run controlled production comparisons:** Compare the same user journey and same workspace before/after, using repeated samples: initial Runtime load, Agenda to Client Performance, and return to Agenda. Record median or typical timings, not just the fastest result. Distinguish GET page loads from POST tab-navigation requests.
4. **Review remaining spans based on evidence:** Only investigate another Supabase request or server operation if repeated traces show it is materially slow and relevant to the user-visible journey. Do not skip tenant-specific data based on tenant name or ID. Use established capability/configuration rules if conditional loading is ever considered.
5. **Close out temporary diagnostics:** After sufficient evidence is collected, reduce or remove the temporary 100% Production `/runtime` tracing sampling rule to avoid unnecessary telemetry volume. Retain the measurements and conclusions in the project record.
6. **Validate and document:** For each code change, provide the complete replacement file(s), state exactly what changed and what was deliberately preserved, and wait for the user's build result. Do not deploy unless the user explicitly asks. Update this waypoint with measured results and the next single target.

## 6. Non-negotiable guardrails

- Performance-only scope. No unrelated UI, feature, cleanup, or architecture work.
- Do not alter business logic, calculations, scoring, permissions, authorization outcomes, saving/updating behavior, or historical records.
- Tenant isolation is critical. CascadEffects-specific and Indie Ortho-specific behavior must remain isolated; do not make tenant assumptions from IDs or names.
- Do not change existing database schema, relationships, or add migrations unless the user explicitly reviews and approves the need.
- Do not replace server/client Supabase access patterns casually; doing so can change session and RLS behavior.
- Use the latest current source files already reviewed. Do not fall back to older ZIPs or request the same files again.
- Provide complete replacement files, not shortened snippets, whenever a code edit is approved.
- Assume the build passes unless the user reports an error. Do not repeatedly ask for confirmation.
- Do not deploy without explicit instruction.

## 7. What success looks like

A successful outcome is a measurably faster production experience across initial Runtime loading and workspace navigation, with no regressions to the app's existing functionality, tenant separation, authorization, calculations, data persistence, or historical records. Every change must have a clear performance rationale and a before/after measurement.

## 8. Restart / handoff instructions

When restarting this conversation, attach this waypoint and say:

> Continue Headwaters performance optimization from this waypoint. Do not repeat completed work or re-review the same recent files. Our next task is to finish the evidence-based organization lookup diagnosis using the production traces already reviewed, then benchmark and proceed to the next measured bottleneck.

**Current project position:** Dashboard loading, Runtime navigation, and authentication/authorization lookup reuse are complete. Organization lookup diagnosis and controlled production benchmarking are the immediate outstanding tasks. The application is already working well; latency is the problem being addressed.

---

## Document control

| Field | Value |
|---|---|
| Document | Headwaters Performance Optimization Waypoint |
| Status date | 20 November 2026 |
| Purpose | Continuity record for restart, refresh, or handoff |

**Headwaters Performance Optimization | Working document | 20 November 2026**
