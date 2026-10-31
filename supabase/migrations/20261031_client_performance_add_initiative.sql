/*
 * ==========================================================
 * CascadEffects Performance Platform
 *
 * Client Performance Initiative Creation
 * ----------------------------------------------------------
 * Adds an atomic database operation for creating initiative
 * tracker rows in a Client Performance workspace.
 *
 * Security:
 * - Organization ownership is validated.
 * - Client workspace is locked during creation.
 * - Execution is restricted to service_role.
 * - Application authorization remains mandatory.
 * ==========================================================
 */

CREATE OR REPLACE FUNCTION public.add_client_performance_initiative(
  p_organization_id uuid,
  p_client_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
  v_client_id uuid;
  v_initiative_id uuid;
  v_next_position integer;
BEGIN

  IF p_organization_id IS NULL THEN
    RAISE EXCEPTION 'Organization is required.';
  END IF;

  IF p_client_id IS NULL THEN
    RAISE EXCEPTION 'Client ID is required.';
  END IF;

  /*
   * Validate organization ownership and serialize
   * initiative creation for this client.
   */

  SELECT c.id
  INTO v_client_id
  FROM public.client_performance_clients AS c
  WHERE c.id = p_client_id
    AND c.organization_id = p_organization_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION
      'Client Performance workspace was not found.';
  END IF;

  /*
   * Determine the next position without changing
   * the order of existing initiatives.
   */

  SELECT COALESCE(MAX(i.position), -1) + 1
  INTO v_next_position
  FROM public.client_performance_initiatives AS i
  WHERE i.client_id = v_client_id
    AND i.organization_id = p_organization_id;

  /*
   * Create a blank initiative.
   * The additional_data object preserves the existing
   * unlabeled spreadsheet column without inventing
   * a field name or meaning.
   */

  INSERT INTO public.client_performance_initiatives (
    client_id,
    organization_id,
    title,
    description,
    completion_month,
    additional_data,
    notes,
    position,
    created_at,
    updated_at
  )
  VALUES (
    v_client_id,
    p_organization_id,
    '',
    '',
    NULL,
    '{}'::jsonb,
    '',
    v_next_position,
    now(),
    now()
  )
  RETURNING id
  INTO v_initiative_id;

  /*
   * Update Last Updated only after successful creation.
   */

  UPDATE public.client_performance_clients
  SET
    last_updated_at = now(),
    updated_at = now()
  WHERE id = v_client_id
    AND organization_id = p_organization_id;

  RETURN v_initiative_id;

END;
$function$;


/*
 * Restrict execution to the trusted server-side role.
 */

REVOKE ALL ON FUNCTION
  public.add_client_performance_initiative(uuid, uuid)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
  public.add_client_performance_initiative(uuid, uuid)
TO service_role;


/*
 * Documentation
 */

COMMENT ON FUNCTION
  public.add_client_performance_initiative(uuid, uuid)
IS
  'Atomically creates a blank Client Performance initiative row and advances the client Last Updated timestamp.';