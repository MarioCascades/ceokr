# HEADWATERS

# Performance Optimization Waypoint

**Project Continuity and Next Steps**

  -----------------------------------------------------------------------
  Document Control                    Details
  ----------------------------------- -----------------------------------
  Document                            Headwaters Performance Optimization
                                      Waypoint

  Version                             1.0

  Date                                November 26, 2026

  Prepared by                         Mario Bravo

  Department                          Operations Project Management

  Status                              Active working waypoint

  Supersedes                          Headwaters Performance Optimization
                                      Waypoint, November 20, 2026
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 1. Purpose

This waypoint establishes the current position of the Headwaters
Performance Optimization initiative and provides a practical reference
for continuing the work. It replaces the earlier task sequence with a
new investigation-led roadmap that reflects the optimization work
already completed and the evidence now available from production traces
and Supabase Observability.

## 2. Current Project Position

The Headwaters Performance Platform is operational. The current
objective is to improve application responsiveness without changing or
weakening existing functionality, business logic, calculations,
permissions, authorization outcomes, tenant isolation, persistence, or
established workflows.

### 2.1 Completed optimization workstreams

-   Dashboard data loading optimization.
-   Runtime navigation loading optimization.
-   Request-scoped authentication and authorization lookup reuse.

These workstreams were completed and the user confirmed that the build
passed. They should be treated as completed work, not reopened as new
tasks unless later evidence identifies a regression.

### 2.2 Existing investigation context

-   Earlier production traces showed variation in Runtime request
    duration, with some requests taking substantially longer than the
    measured database execution time.
-   The organization lookup has appeared in production traces as a
    measurable span, but its duration has varied between observations.
-   The Supabase Slow Queries export showed organization lookup query
    averages in the approximate 6--13 ms range, with occasional maximums
    substantially higher.
-   Several other application query averages in the report were
    sub-millisecond to around 1 ms.
-   The report also contained slow catalog, metadata, and
    timezone-related queries. Their origin and relationship to end-user
    Runtime requests have not been established.
-   The slow-query export is aggregated. Its cumulative time, average
    time, and maximum time do not identify the cause of any individual
    Vercel request.

**Current interpretation:** The available query report does not, by
itself, demonstrate that ordinary application SQL execution is
consistently slow. It also does not rule out Supabase resource pressure,
connection delays, API overhead, network latency, or occasional database
outliers.

## 3. Investigation Principles and Guardrails

-   Measure first. Do not make further performance changes based on
    assumptions or a single slow sample.
-   Use comparable production journeys and repeat measurements. Separate
    initial page-load GET requests from navigation POST requests.
-   Correlate Vercel traces and Supabase activity using timestamps and
    request evidence wherever possible.
-   Distinguish PostgreSQL execution time from the full Supabase request
    duration and the total Vercel function duration.
-   Preserve all existing application functionality, calculations,
    workflows, permissions, authorization outcomes, Supabase session
    behavior, RLS behavior, tenant isolation, historical records, and
    save/persistence behavior.
-   Do not perform broad refactoring or unrelated cleanup as part of
    this initiative.
-   Do not make database schema changes or migrations without explicit
    approval.
-   Do not change Supabase plans or deploy production changes without
    explicit approval.
-   Make focused changes one at a time and validate them before
    proceeding to the next change.

## 4. New Asana Project Structure and Work Plan

Create one Asana project named **Headwaters Performance Optimization**.
Use the six sections below. Each numbered item is a parent task; the
listed actions are subtasks.

### Section 01: Performance Baseline and Assessment

**1.1 Establish Production Performance Baseline**

-   Measure initial Runtime page loading.
-   Measure Agenda → Client Performance navigation.
-   Measure Client Performance → Agenda navigation.
-   Capture at least five comparable production measurements per
    journey.
-   Record Vercel function durations and trace IDs.
-   Document median and slowest response times.

**1.2 Review Existing Performance Optimization Work**

-   Confirm dashboard data loading optimization is complete.
-   Confirm Runtime navigation loading optimization is complete.
-   Confirm request-scoped authentication and authorization lookup reuse
    is complete.
-   Identify any remaining known performance issues without reopening
    completed work unnecessarily.

### Section 02: Supabase Performance Investigation

**2.1 Review Supabase Resource Utilization**

-   Review CPU utilization.
-   Review memory utilization.
-   Review database connections and connection-pool usage.
-   Review disk I/O and storage performance.
-   Review database compute capacity and resource limits.
-   Identify resource saturation during slow periods.

**2.2 Analyze Supabase Slow Queries**

-   Confirm and document the Slow Queries report's date/time window.
-   Identify queries with the highest cumulative execution time.
-   Identify queries with the highest average execution time.
-   Identify queries with unusually high maximum execution times.
-   Identify high-frequency queries.
-   Distinguish application queries from internal Supabase, dashboard,
    or catalog queries where evidence permits.
-   Document findings and unresolved questions.

### Section 03: Vercel and Supabase Performance Correlation

**3.1 Analyze Vercel Production Traces**

-   Review initial Runtime GET requests.
-   Review Runtime navigation POST requests.
-   Identify slow server-side operations and spans.
-   Measure Supabase request spans.
-   Identify time spent outside database execution.

**3.2 Correlate Vercel and Supabase Measurements**

-   Match Vercel traces with Supabase activity using timestamps and
    available identifiers.
-   Compare Supabase request duration with PostgreSQL execution
    duration.
-   Investigate possible connection acquisition, API, and network
    delays.
-   Repeat comparisons across multiple production requests.
-   Document confirmed findings separately from hypotheses.

### Section 04: Root Cause Identification and Optimization Planning

**4.1 Identify Confirmed Performance Bottlenecks**

-   Evaluate Next.js application processing.
-   Evaluate PostgreSQL query execution.
-   Evaluate Supabase infrastructure and resource constraints.
-   Evaluate API and network overhead.
-   Identify bottlenecks supported by repeatable evidence.

**4.2 Prepare Performance Optimization Recommendations**

-   List confirmed performance issues.
-   Identify recommended technical improvements.
-   Estimate expected performance impact where it can be reasonably
    supported.
-   Identify risks to existing functionality.
-   Prioritize improvements by impact and effort.
-   Obtain approval before implementation.

### Section 05: Performance Optimization Implementation

**5.1 Implement Approved Application Optimizations**

-   Optimize identified Next.js bottlenecks.
-   Optimize identified database queries where necessary.
-   Reduce unnecessary repeated requests only where confirmed and safe.
-   Address connection handling only where evidence supports it.
-   Preserve existing functionality and business logic.
-   Run build and technical validation.

**5.2 Implement Approved Supabase Improvements**

-   Apply approved database optimizations.
-   Evaluate and implement approved infrastructure changes.
-   Validate authentication, authorization, and RLS behavior.
-   Confirm tenant isolation and data persistence.
-   Obtain explicit deployment approval before production changes.

### Section 06: Performance Validation and Project Closure

**6.1 Run Post-Optimization Performance Benchmarks**

-   Re-test initial Runtime loading.
-   Re-test Agenda → Client Performance navigation.
-   Re-test return navigation.
-   Compare before-and-after measurements using comparable conditions.
-   Confirm existing workflows remain functional.
-   Document measured improvements.

**6.2 Evaluate Supabase Plan Upgrade**

-   Review confirmed infrastructure bottlenecks.
-   Compare current and proposed compute resources.
-   Evaluate expected performance benefits.
-   Compare additional monthly costs.
-   Document the upgrade recommendation.
-   Obtain approval before changing plans.

**6.3 Complete Performance Optimization Documentation**

-   Document completed optimizations.
-   Document benchmark results.
-   Record remaining performance issues.
-   Document infrastructure decisions.
-   Update Platform Decisions and Platform Backlog documents.

## 5. Task Dependencies

  -----------------------------------------------------------------------
  Work item                           Prerequisite
  ----------------------------------- -----------------------------------
  Supabase resource and slow-query    Production baseline established
  investigation                       

  Vercel and Supabase correlation     Baseline and trace collection
                                      available

  Root cause identification           Supabase and Vercel investigations
                                      completed

  Optimization recommendations        Root causes documented with
                                      supporting evidence

  Implementation                      Recommendations reviewed and
                                      approved

  Post-optimization benchmarks        Approved changes implemented and
                                      validated

  Supabase upgrade evaluation         Infrastructure findings and
                                      resource constraints documented

  Project closure                     Results, decisions, and remaining
                                      issues documented
  -----------------------------------------------------------------------

## 6. Measurement and Acceptance Criteria

The project is successful when performance improvements are demonstrated
by comparable measurements and existing application behavior remains
intact. The following journeys are the minimum benchmark set:

  -----------------------------------------------------------------------
  Journey                             Measurement to capture
  ----------------------------------- -----------------------------------
  Initial Runtime load                Page-load experience, Vercel GET
                                      duration, relevant server and
                                      Supabase spans

  Agenda → Client Performance         Navigation experience, Vercel POST
                                      duration, relevant server and
                                      Supabase spans

  Client Performance → Agenda         Return-navigation experience,
                                      Vercel POST duration, relevant
                                      server and Supabase spans
  -----------------------------------------------------------------------

Additional measurement requirements:

-   Use at least five comparable measurements per journey for baseline
    and post-change comparisons.
-   Report medians and slowest observations; do not rely on a single
    best-case result.
-   Record date/time, environment, journey, request method, trace ID,
    and relevant Supabase evidence.
-   Record functional validation alongside performance results.
-   Do not declare an improvement solely because a database query's
    average execution time is low or because one trace is faster.

## 7. Immediate Next Actions

1.  Confirm the reporting period covered by the Supabase Slow Queries
    export.
2.  Capture a fresh, controlled production baseline for the three agreed
    Runtime journeys.
3.  Review Supabase resource metrics for the same measurement period.
4.  Identify the highest-impact application query patterns and
    distinguish them from internal/system queries.
5.  Correlate representative slow Vercel traces with Supabase activity.
6.  Update the Asana tasks with owners, due dates, evidence, and
    dependencies.

## 8. Current Decisions and Open Questions

  -----------------------------------------------------------------------
  Item                                Current position
  ----------------------------------- -----------------------------------
  Primary objective                   Improve Headwaters responsiveness
                                      through measured, targeted work.

  Completed work                      Dashboard loading, Runtime
                                      navigation loading, and
                                      request-scoped auth/authorization
                                      lookup reuse.

  Current evidence                    Slow-query averages for several
                                      application reads are low;
                                      occasional outliers and other
                                      request overhead remain under
                                      investigation.

  Supabase plan upgrade               Not approved or recommended yet;
                                      requires resource and trace
                                      evidence.

  Next technical priority             Fresh baseline, Supabase resource
                                      review, and Vercel/Supabase
                                      correlation.

  Implementation approval             Required before code, schema,
                                      infrastructure, or production
                                      deployment changes.
  -----------------------------------------------------------------------

## 9. Continuity Instructions for the Next Work Session

At the start of the next session, use this waypoint together with the
latest Platform Decisions, Platform Backlog, current source archive,
current Supabase archive, and the Slow Queries report. Do not repeat
completed optimization work or re-review unchanged files without a
specific reason.

Begin with the immediate next actions in Section 7. If new evidence
changes the diagnosis, update the Asana plan and this waypoint before
implementing a change. Keep confirmed facts, working hypotheses, and
decisions clearly separated.

## 10. Document Control

  Field            Value
  ---------------- ----------------------------------------------
  Document         Headwaters Performance Optimization Waypoint
  Version          1.0
  Effective Date   November 26, 2026
  Prepared by      Mario Bravo
  Department       Operations Project Management
  Approval         Pending

------------------------------------------------------------------------

**Headwaters \| Operations Project Management**\
**Prepared by: Mario Bravo**
