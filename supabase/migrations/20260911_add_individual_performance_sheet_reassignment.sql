/*
============================================================
CascadEffects Performance Platform
Individual Performance Sheet Reassignment
------------------------------------------------------------
Reassigns an individual member from one published
Performance Sheet assignment to another.

The previous assignment is preserved as a historical
record.

A new active assignment is created for the same member.

This operation is intentionally atomic so the member cannot
be left with two active assignments or no assignment because
of a partial client-side workflow.
============================================================
*/

create or replace function public.reassign_individual_performance_sheet(
  p_organization_id uuid,
  p_current_assignment_id uuid,
  p_new_performance_sheet_id uuid,
  p_assigned_by uuid
)
returns public.assignments
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_current_assignment public.assignments;
  v_new_assignment public.assignments;
begin

  /*
   * Lock and load the current assignment.
   */
  select *
  into v_current_assignment
  from public.assignments
  where id = p_current_assignment_id
    and organization_id = p_organization_id
  for update;

  if not found then
    raise exception 'Current assignment not found.';
  end if;

  /*
   * Reassignment is currently supported only for
   * individual member Performance Sheet assignments.
   */
  if v_current_assignment.assignment_type <> 'individual' then
    raise exception 'Only individual member Performance Sheet assignments can be reassigned.';
  end if;

  if v_current_assignment.status <> 'active' then
    raise exception 'Only active assignments can be reassigned.';
  end if;

  /*
   * Verify the replacement Performance Sheet belongs to the
   * same organization and is currently published.
   */
  if not exists (
    select 1
    from public.performance_sheets
    where id = p_new_performance_sheet_id
      and organization_id = p_organization_id
      and status = 'published'
  ) then
    raise exception 'The replacement Performance Sheet could not be found or is not published.';
  end if;

  /*
   * Prevent a pointless reassignment to the exact same
   * published Performance Sheet version.
   */
  if v_current_assignment.performance_sheet_id =
     p_new_performance_sheet_id then
    raise exception 'The replacement Performance Sheet is the same as the current Performance Sheet.';
  end if;

  /*
   * Verify the acting user exists, is active, and belongs
   * to the organization.
   */
  if not exists (
    select 1
    from public.users u
    inner join public.organization_memberships om
      on om.user_id = u.id
     and om.organization_id = p_organization_id
    where u.id = p_assigned_by
      and u.is_active = true
  ) then
    raise exception 'The assigning user is not an active member of this organization.';
  end if;

  /*
   * End the current assignment.

   * We use completed because this assignment has reached the
   * end of its active lifecycle through reassignment.
   *
   * The record itself is intentionally preserved.
   */
  update public.assignments
  set
    status = 'completed',
    completed_at = now()
  where id = v_current_assignment.id
    and organization_id = p_organization_id;

  /*
   * Create the replacement assignment as active.

   * The exact published Performance Sheet version is stored
   * on the new assignment.
   */
  insert into public.assignments (
    organization_id,
    performance_sheet_id,
    assignment_type,
    subject_id,
    status,
    assigned_by,
    assigned_at,
    activated_at
  )
  values (
    p_organization_id,
    p_new_performance_sheet_id,
    'individual',
    v_current_assignment.subject_id,
    'active',
    p_assigned_by,
    now(),
    now()
  )
  returning *
  into v_new_assignment;

  return v_new_assignment;

end;
$$;