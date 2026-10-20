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
    'overall-practice-performance',
    'Overall Practice Performance',
    'Practice-level dashboard reflecting the existing monthly Key Results for Production, Collections, Starts, and Same Day Starts.',
    'overall-practice-performance',
    'current_state',
    TRUE
FROM public.organization AS o
WHERE LOWER(TRIM(o.company_name)) = 'indie ortho'
ON CONFLICT (organization_id, table_key)
DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    runtime_tab_key = EXCLUDED.runtime_tab_key,
    persistence_mode = EXCLUDED.persistence_mode,
    is_enabled = TRUE,
    updated_at = NOW();

COMMIT;