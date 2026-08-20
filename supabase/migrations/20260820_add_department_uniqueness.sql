alter table public.departments
add constraint departments_organization_id_name_key
unique (organization_id, name);