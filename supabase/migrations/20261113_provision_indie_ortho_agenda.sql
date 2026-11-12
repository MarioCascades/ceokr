BEGIN;

INSERT INTO public.custom_table_definitions (
    organization_id,
    table_key,
    name,
    description,
    runtime_tab_key,
    persistence_mode,
    is_enabled
)
SELECT
    o.id,
    'agenda',
    'Agenda',
    'Indie Ortho shared operational agenda. Includes Wins, Announcements, Rocks, Where I Need Help, and Items Carried Over From Last Week.',
    'agenda',
    'current_state',
    TRUE
FROM public.organization AS o
WHERE o.id = 'c15618e5-10d4-4909-976b-84d855d847b0'
  AND LOWER(TRIM(o.company_name)) = 'indie ortho'

ON CONFLICT (organization_id, table_key)
DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    runtime_tab_key = EXCLUDED.runtime_tab_key,
    persistence_mode = EXCLUDED.persistence_mode,
    is_enabled = TRUE,
    updated_at = NOW();

COMMIT;