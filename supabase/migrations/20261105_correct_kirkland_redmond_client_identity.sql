/*
============================================================
CascadEffects Performance Platform
Correct Kirkland & Redmond Client Identity
------------------------------------------------------------
Migration: 20261105

Renames the existing Kirkland & Richmond client identity to
Kirkland & Redmond without creating a new client or changing
its UUID. Related snapshots, monthly metrics, year visibility,
and other client-linked records remain attached to the same ID.
============================================================
*/

BEGIN;

DO $$
DECLARE
    v_old_count integer;
    v_new_count integer;
BEGIN
    SELECT count(*) INTO v_old_count
    FROM public.client_performance_clients
    WHERE organization_id = 'e571cd65-b7f8-4669-bb41-370806097792'
      AND custom_table_definition_id = '3d49013b-7682-4d37-9cba-6229d3cf15ec'
      AND client_key = 'kirkland-richmond';

    SELECT count(*) INTO v_new_count
    FROM public.client_performance_clients
    WHERE organization_id = 'e571cd65-b7f8-4669-bb41-370806097792'
      AND custom_table_definition_id = '3d49013b-7682-4d37-9cba-6229d3cf15ec'
      AND client_key = 'kirkland-redmond';

    IF v_old_count = 1 AND v_new_count = 0 THEN
        UPDATE public.client_performance_clients
        SET client_key = 'kirkland-redmond',
            display_name = 'Kirkland & Redmond'
        WHERE organization_id = 'e571cd65-b7f8-4669-bb41-370806097792'
          AND custom_table_definition_id = '3d49013b-7682-4d37-9cba-6229d3cf15ec'
          AND client_key = 'kirkland-richmond';
    ELSIF v_old_count = 0 AND v_new_count = 1 THEN
        UPDATE public.client_performance_clients
        SET display_name = 'Kirkland & Redmond'
        WHERE organization_id = 'e571cd65-b7f8-4669-bb41-370806097792'
          AND custom_table_definition_id = '3d49013b-7682-4d37-9cba-6229d3cf15ec'
          AND client_key = 'kirkland-redmond';
    ELSE
        RAISE EXCEPTION
            'Expected exactly one existing Kirkland client identity (old key or new key). Found old=%, new=%. No changes applied.',
            v_old_count, v_new_count;
    END IF;
END;
$$;

COMMIT;
