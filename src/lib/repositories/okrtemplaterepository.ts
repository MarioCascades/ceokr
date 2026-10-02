import { supabase } from "@/lib/supabase/client";

import type {
  OKRTemplate,
  OKRTemplateObjective,
  OKRTemplateKeyResult,
  OKRTemplateInitiative,
  OKRTemplateScope,
  OKRTemplateStatus,
  OKRTemplateMeasurementType,
  OKRTemplateScoringMethod,
  OKRTemplateKeyResultStatus,

  CreateOKRTemplateInput,
  UpdateOKRTemplateInput,

  CreateOKRTemplateObjectiveInput,
  UpdateOKRTemplateObjectiveInput,

  CreateOKRTemplateKeyResultInput,
  UpdateOKRTemplateKeyResultInput,

  CreateOKRTemplateInitiativeInput,
  UpdateOKRTemplateInitiativeInput,

  OrganizationOKRTemplateObjective,
  OrganizationOKRTemplateKeyResult,
  OrganizationOKRTemplateInitiative,

  CreateOrganizationOKRTemplateObjectiveInput,
  UpdateOrganizationOKRTemplateObjectiveInput,

  CreateOrganizationOKRTemplateKeyResultInput,
  UpdateOrganizationOKRTemplateKeyResultInput,

  CreateOrganizationOKRTemplateInitiativeInput,
  UpdateOrganizationOKRTemplateInitiativeInput,
} from "@/lib/domain/okrtemplate";


/* ==========================================================
   Constants
========================================================== */

const GLOBAL_TEMPLATE_LIBRARY_ID =
  "global-okr-template-library";

const ORGANIZATION_TEMPLATE_LIBRARY_ID_PREFIX =
  "organization-okr-template-library:";

const MAX_TEMPLATE_INITIATIVES = 3;


/* ==========================================================
   Database Records
========================================================== */

interface ObjectiveTemplateRecord {
  id: string;

  title: string;

  description: string | null;

  weight: number | null;

  position: number;

  created_by: string | null;

  created_at: string;

  updated_at: string;
}


interface KeyResultTemplateRecord {
  id: string;

  title: string;

  target: unknown;

  weight: number | null;

  measurement_type:
    | OKRTemplateMeasurementType
    | null;

  scoring_method:
    | OKRTemplateScoringMethod
    | null;

  status:
    OKRTemplateKeyResultStatus;

  created_by: string | null;

  created_at: string;

  updated_at: string;
}


interface KeyResultTemplateInitiativeRecord {
  id: string;

  key_result_template_id: string;

  text: string;

  position: number;

  created_at: string;

  updated_at: string;
}


/* ==========================================================
   Organization Database Records
========================================================== */

interface OrganizationObjectiveTemplateRecord {
  id: string;

  organization_id: string;

  source_global_template_id: string | null;

  title: string;

  description: string | null;

  weight: number | null;

  position: number;

  created_by: string | null;

  created_at: string;

  updated_at: string;
}


interface OrganizationKeyResultTemplateRecord {
  id: string;

  organization_id: string;

  source_global_template_id: string | null;

  title: string;

  target: unknown;

  weight: number | null;

  measurement_type:
    | OKRTemplateMeasurementType
    | null;

  scoring_method:
    | OKRTemplateScoringMethod
    | null;

  status:
    OKRTemplateKeyResultStatus;

  created_by: string | null;

  created_at: string;

  updated_at: string;
}


interface OrganizationKeyResultTemplateInitiativeRecord {
  id: string;

  organization_key_result_template_id: string;

  text: string;

  position: number;

  created_at: string;

  updated_at: string;
}


/* ==========================================================
   Copy Inputs
========================================================== */

export interface CopyGlobalOKRTemplateObjectiveInput {
  organizationId: string;

  sourceGlobalTemplateId: string;

  createdBy?: string;
}


export interface CopyGlobalOKRTemplateKeyResultInput {
  organizationId: string;

  sourceGlobalTemplateId: string;

  createdBy?: string;
}


/* ==========================================================
   Validation Helpers
========================================================== */

function requireTitle(
  value: string,
  label: string
): string {

  const title =
    value.trim();


  if (!title) {

    throw new Error(
      `${label} is required.`
    );
  }


  return title;
}


function requireOrganizationId(
  organizationId: string
): string {

  const value =
    organizationId.trim();


  if (!value) {

    throw new Error(
      "Organization ID is required."
    );
  }


  return value;
}


function requireId(
  value: string,
  label: string
): string {

  const id =
    value.trim();


  if (!id) {

    throw new Error(
      `${label} is required.`
    );
  }


  return id;
}


function validateWeight(
  weight: number | undefined,
  label: string
): number | null {

  if (
    weight === undefined ||
    weight === null
  ) {

    return null;
  }


  if (!Number.isFinite(weight)) {

    throw new Error(
      `${label} weight must be a valid number.`
    );
  }


  if (
    weight < 0 ||
    weight > 100
  ) {

    throw new Error(
      `${label} weight must be between 0 and 100.`
    );
  }


  return weight;
}


function validatePosition(
  position: number | undefined
): number | null {

  if (
    position === undefined
  ) {

    return null;
  }


  if (
    !Number.isInteger(position) ||
    position < 0
  ) {

    throw new Error(
      "Position must be a non-negative whole number."
    );
  }


  return position;
}


/* ==========================================================
   Compatibility Scope Validation
------------------------------------------------------------
   The finalized global library is global-only.

   Organization templates use dedicated organization-owned
   records and do not pass through this compatibility layer.
========================================================== */

function validateTemplateScope(
  scope: OKRTemplateScope,
  organizationId?: string
): void {

  if (
    scope !== "global"
  ) {

    throw new Error(
      "Organization templates are no longer supported through the legacy parent template API."
    );
  }


  if (
    organizationId
  ) {

    throw new Error(
      "Global templates cannot belong to an organization."
    );
  }
}


/* ==========================================================
   Global Mappers
========================================================== */

function mapObjectiveTemplate(
  record: ObjectiveTemplateRecord
): OKRTemplateObjective {

  return {

    id:
      record.id,

    okrTemplateId:
      GLOBAL_TEMPLATE_LIBRARY_ID,

    title:
      record.title,

    description:
      record.description ??
      undefined,

    weight:
      record.weight ??
      undefined,

    position:
      record.position,

    createdAt:
      record.created_at,

    updatedAt:
      record.updated_at,
  };
}


function mapKeyResultTemplate(
  record: KeyResultTemplateRecord
): OKRTemplateKeyResult {

  return {

    id:
      record.id,

    title:
      record.title,

    target:
      record.target,

    weight:
      record.weight ??
      undefined,

    measurementType:
      record.measurement_type ??
      undefined,

    scoringMethod:
      record.scoring_method ??
      undefined,

    status:
      record.status,

    createdAt:
      record.created_at,

    updatedAt:
      record.updated_at,

    initiatives: [],
  };
}


function mapKeyResultTemplateInitiative(
  record: KeyResultTemplateInitiativeRecord
): OKRTemplateInitiative {

  return {

    id:
      record.id,

    okrTemplateKeyResultId:
      record.key_result_template_id,

    text:
      record.text,

    position:
      record.position,

    createdAt:
      record.created_at,

    updatedAt:
      record.updated_at,
  };
}


/* ==========================================================
   Organization Mappers
========================================================== */

function mapOrganizationObjectiveTemplate(
  record: OrganizationObjectiveTemplateRecord
): OrganizationOKRTemplateObjective {

  return {

    id:
      record.id,

    organizationId:
      record.organization_id,

    sourceGlobalTemplateId:
      record.source_global_template_id ??
      undefined,

    title:
      record.title,

    description:
      record.description ??
      undefined,

    weight:
      record.weight ??
      undefined,

    position:
      record.position,

    createdBy:
      record.created_by ??
      undefined,

    createdAt:
      record.created_at,

    updatedAt:
      record.updated_at,
  };
}


function mapOrganizationKeyResultTemplate(
  record: OrganizationKeyResultTemplateRecord
): OrganizationOKRTemplateKeyResult {

  return {

    id:
      record.id,

    organizationId:
      record.organization_id,

    sourceGlobalTemplateId:
      record.source_global_template_id ??
      undefined,

    title:
      record.title,

    target:
      record.target,

    weight:
      record.weight ??
      undefined,

    measurementType:
      record.measurement_type ??
      undefined,

    scoringMethod:
      record.scoring_method ??
      undefined,

    status:
      record.status,

    createdBy:
      record.created_by ??
      undefined,

    createdAt:
      record.created_at,

    updatedAt:
      record.updated_at,

    initiatives: [],
  };
}


function mapOrganizationKeyResultTemplateInitiative(
  record: OrganizationKeyResultTemplateInitiativeRecord
): OrganizationOKRTemplateInitiative {

  return {

    id:
      record.id,

    organizationKeyResultTemplateId:
      record.organization_key_result_template_id,

    text:
      record.text,

    position:
      record.position,

    createdAt:
      record.created_at,

    updatedAt:
      record.updated_at,
  };
}


/* ==========================================================
   Global Objective Templates
========================================================== */

async function loadObjectiveTemplates(): Promise<
  OKRTemplateObjective[]
> {

  const {
    data,
    error,
  } = await supabase

    .from(
      "objective_templates"
    )

    .select("*")

    .order(
      "position",
      {
        ascending: true,
      }
    )

    .order(
      "created_at",
      {
        ascending: true,
      }
    );


  if (error) {

    throw new Error(
      `Failed to load Objective Templates: ${error.message}`
    );
  }


  return (
    (data ?? []) as
      ObjectiveTemplateRecord[]
  ).map(
    mapObjectiveTemplate
  );
}


/* ==========================================================
   Global Key Result Template Initiatives
========================================================== */

async function loadKeyResultTemplateInitiatives(
  keyResultIds: string[]
): Promise<
  OKRTemplateInitiative[]
> {

  if (
    keyResultIds.length === 0
  ) {

    return [];
  }


  const {
    data,
    error,
  } = await supabase

    .from(
      "key_result_template_initiatives"
    )

    .select("*")

    .in(
      "key_result_template_id",
      keyResultIds
    )

    .order(
      "position",
      {
        ascending: true,
      }
    );


  if (error) {

    throw new Error(
      `Failed to load Key Result Template initiatives: ${error.message}`
    );
  }


  return (
    (data ?? []) as
      KeyResultTemplateInitiativeRecord[]
  ).map(
    mapKeyResultTemplateInitiative
  );
}


/* ==========================================================
   Global Key Result Templates
========================================================== */

async function loadKeyResultTemplates(
  includeArchived = false
): Promise<
  OKRTemplateKeyResult[]
> {

  let query =
    supabase

      .from(
        "key_result_templates"
      )

      .select("*");


  if (
    !includeArchived
  ) {

    query =
      query.eq(
        "status",
        "active"
      );
  }


  const {
    data,
    error,
  } =
    await query

      .order(
        "created_at",
        {
          ascending: true,
        }
      );


  if (error) {

    throw new Error(
      `Failed to load Key Result Templates: ${error.message}`
    );
  }


  const keyResults =
    (
      (data ?? []) as
        KeyResultTemplateRecord[]
    ).map(
      mapKeyResultTemplate
    );


  if (
    keyResults.length === 0
  ) {

    return keyResults;
  }


  const keyResultIds =
    keyResults.map(
      (
        keyResult
      ) =>
        keyResult.id
    );


  const initiatives =
    await loadKeyResultTemplateInitiatives(
      keyResultIds
    );


  const initiativesByKeyResult =
    new Map<
      string,
      OKRTemplateInitiative[]
    >();


  for (
    const initiative of
    initiatives
  ) {

    const existing =
      initiativesByKeyResult.get(
        initiative.okrTemplateKeyResultId
      ) ??
      [];


    existing.push(
      initiative
    );


    initiativesByKeyResult.set(
      initiative.okrTemplateKeyResultId,
      existing
    );
  }


  for (
    const keyResult of
    keyResults
  ) {

    keyResult.initiatives =
      initiativesByKeyResult.get(
        keyResult.id
      ) ??
      [];
  }


  return keyResults;
}


/* ==========================================================
   Organization Objective Templates
========================================================== */

export async function loadOrganizationObjectiveTemplates(
  organizationId: string
): Promise<
  OrganizationOKRTemplateObjective[]
> {

  const orgId =
    requireOrganizationId(
      organizationId
    );


  const {
    data,
    error,
  } = await supabase

    .from(
      "organization_objective_templates"
    )

    .select("*")

    .eq(
      "organization_id",
      orgId
    )

    .order(
      "position",
      {
        ascending: true,
      }
    )

    .order(
      "created_at",
      {
        ascending: true,
      }
    );


  if (error) {

    throw new Error(
      `Failed to load Organization Objective Templates: ${error.message}`
    );
  }


  return (
    (data ?? []) as
      OrganizationObjectiveTemplateRecord[]
  ).map(
    mapOrganizationObjectiveTemplate
  );
}


/* ==========================================================
   Organization Key Result Template Initiatives
========================================================== */

async function loadOrganizationKeyResultTemplateInitiatives(
  keyResultIds: string[]
): Promise<
  OrganizationOKRTemplateInitiative[]
> {

  if (
    keyResultIds.length === 0
  ) {

    return [];
  }


  const {
    data,
    error,
  } = await supabase

    .from(
      "organization_key_result_template_initiatives"
    )

    .select("*")

    .in(
      "organization_key_result_template_id",
      keyResultIds
    )

    .order(
      "position",
      {
        ascending: true,
      }
    );


  if (error) {

    throw new Error(
      `Failed to load Organization Key Result Template initiatives: ${error.message}`
    );
  }


  return (
    (data ?? []) as
      OrganizationKeyResultTemplateInitiativeRecord[]
  ).map(
    mapOrganizationKeyResultTemplateInitiative
  );
}


/* ==========================================================
   Organization Key Result Templates
========================================================== */

export async function loadOrganizationKeyResultTemplates(
  organizationId: string,
  includeArchived = false
): Promise<
  OrganizationOKRTemplateKeyResult[]
> {

  const orgId =
    requireOrganizationId(
      organizationId
    );


  let query =
    supabase

      .from(
        "organization_key_result_templates"
      )

      .select("*")

      .eq(
        "organization_id",
        orgId
      );


  if (
    !includeArchived
  ) {

    query =
      query.eq(
        "status",
        "active"
      );
  }


  const {
    data,
    error,
  } =
    await query

      .order(
        "created_at",
        {
          ascending: true,
        }
      );


  if (error) {

    throw new Error(
      `Failed to load Organization Key Result Templates: ${error.message}`
    );
  }


  const keyResults =
    (
      (data ?? []) as
        OrganizationKeyResultTemplateRecord[]
    ).map(
      mapOrganizationKeyResultTemplate
    );


  if (
    keyResults.length === 0
  ) {

    return keyResults;
  }


  const keyResultIds =
    keyResults.map(
      (
        keyResult
      ) =>
        keyResult.id
    );


  const initiatives =
    await loadOrganizationKeyResultTemplateInitiatives(
      keyResultIds
    );


  const initiativesByKeyResult =
    new Map<
      string,
      OrganizationOKRTemplateInitiative[]
    >();


  for (
    const initiative of
    initiatives
  ) {

    const existing =
      initiativesByKeyResult.get(
        initiative.organizationKeyResultTemplateId
      ) ??
      [];


    existing.push(
      initiative
    );


    initiativesByKeyResult.set(
      initiative.organizationKeyResultTemplateId,
      existing
    );
  }


  for (
    const keyResult of
    keyResults
  ) {

    keyResult.initiatives =
      initiativesByKeyResult.get(
        keyResult.id
      ) ??
      [];
  }


  return keyResults;
}


/* ==========================================================
   Global Template Library
========================================================== */

export async function loadGlobalOKRTemplateLibrary(
  includeArchivedKeyResults = false
): Promise<OKRTemplate> {

  const [
    objectives,
    keyResults,
  ] =
    await Promise.all([

      loadObjectiveTemplates(),

      loadKeyResultTemplates(
        includeArchivedKeyResults
      ),

    ]);


  return {

    id:
      GLOBAL_TEMPLATE_LIBRARY_ID,

    name:
      "Global OKR Template Library",

    description:
      "Reusable global Objective and Key Result Templates.",

    scope:
      "global",

    organizationId:
      undefined,

    createdBy:
      undefined,

    status:
      "active",

    createdAt:
      new Date(0).toISOString(),

    updatedAt:
      new Date().toISOString(),

    objectives,

    keyResults,
  };
}


/* ==========================================================
   Organization Template Library
------------------------------------------------------------
   This is a virtual compatibility representation only.

   There is NO organization parent template row in the
   database. Objective Templates and Key Result Templates
   remain independent organization-owned records.
========================================================== */

export async function loadOrganizationOKRTemplateLibrary(
  organizationId: string,
  includeArchivedKeyResults = false
): Promise<OKRTemplate> {

  const orgId =
    requireOrganizationId(
      organizationId
    );


  const [
    objectives,
    keyResults,
  ] =
    await Promise.all([

      loadOrganizationObjectiveTemplates(
        orgId
      ),

      loadOrganizationKeyResultTemplates(
        orgId,
        includeArchivedKeyResults
      ),

    ]);


  return {

    id:
      `${ORGANIZATION_TEMPLATE_LIBRARY_ID_PREFIX}${orgId}`,

    name:
      "Organization OKR Templates",

    description:
      "Reusable Objective and Key Result Templates owned by this organization.",

    scope:
      "organization",

    organizationId:
      orgId,

    createdBy:
      undefined,

    status:
      "active",

    createdAt:
      new Date(0).toISOString(),

    updatedAt:
      new Date().toISOString(),

    objectives:
      objectives.map(
        (
          objective
        ) => ({
          id:
            objective.id,

          okrTemplateId:
            `${ORGANIZATION_TEMPLATE_LIBRARY_ID_PREFIX}${orgId}`,

          title:
            objective.title,

          description:
            objective.description,

          weight:
            objective.weight,

          position:
            objective.position,

          createdAt:
            objective.createdAt,

          updatedAt:
            objective.updatedAt,
        })
      ),

    keyResults:
      keyResults.map(
        (
          keyResult
        ) => ({
          id:
            keyResult.id,

          title:
            keyResult.title,

          target:
            keyResult.target,

          weight:
            keyResult.weight,

          measurementType:
            keyResult.measurementType,

          scoringMethod:
            keyResult.scoringMethod,

          status:
            keyResult.status,

          createdAt:
            keyResult.createdAt,

          updatedAt:
            keyResult.updatedAt,

          initiatives:
            keyResult.initiatives.map(
              (
                initiative
              ) => ({
                id:
                  initiative.id,

                okrTemplateKeyResultId:
                  initiative.organizationKeyResultTemplateId,

                text:
                  initiative.text,

                position:
                  initiative.position,

                createdAt:
                  initiative.createdAt,

                updatedAt:
                  initiative.updatedAt,
              })
            ),
        })
      ),
  };
}


/* ==========================================================
   Load One Template
------------------------------------------------------------
   Compatibility function.
========================================================== */

export async function loadOKRTemplate(
  _templateId: string
): Promise<OKRTemplate | null> {

  return loadGlobalOKRTemplateLibrary();
}


/* ==========================================================
   Load Global Templates
========================================================== */

export async function loadGlobalOKRTemplates(
  includeArchived = false
): Promise<OKRTemplate[]> {

  return [
    await loadGlobalOKRTemplateLibrary(
      includeArchived
    ),
  ];
}


/* ==========================================================
   Load Organization Templates
========================================================== */

export async function loadOrganizationOKRTemplates(
  organizationId: string,
  includeArchived = false
): Promise<OKRTemplate[]> {

  return [
    await loadOrganizationOKRTemplateLibrary(
      organizationId,
      includeArchived
    ),
  ];
}


/* ==========================================================
   Load Available Templates
------------------------------------------------------------
   Kept global-only for compatibility.

   The Organization Template Workspace should separately
   load the global library and the organization's own copies.
========================================================== */

export async function loadAvailableOKRTemplates(
  _organizationId?: string
): Promise<OKRTemplate[]> {

  return [
    await loadGlobalOKRTemplateLibrary(),
  ];
}


/* ==========================================================
   Legacy Parent Template Creation
========================================================== */

export async function createOKRTemplate(
  input: CreateOKRTemplateInput
): Promise<OKRTemplate> {

  validateTemplateScope(
    input.scope,
    input.organizationId
  );


  return loadGlobalOKRTemplateLibrary();
}


/* ==========================================================
   Legacy Parent Template Update
========================================================== */

export async function updateOKRTemplate(
  input: UpdateOKRTemplateInput
): Promise<OKRTemplate> {

  void input;


  return loadGlobalOKRTemplateLibrary();
}


/* ==========================================================
   Legacy Parent Template Delete
========================================================== */

export async function deleteOKRTemplate(
  _templateId: string
): Promise<void> {

  throw new Error(
    "The global OKR Template Library cannot be deleted. Delete individual Objective or Key Result Templates instead."
  );
}


/* ==========================================================
   Legacy Parent Template Archive
========================================================== */

export async function archiveOKRTemplate(
  _templateId: string
): Promise<void> {

  throw new Error(
    "The global OKR Template Library cannot be archived."
  );
}


/* ==========================================================
   Create Global Objective Template
========================================================== */

export async function createOKRTemplateObjective(
  input: CreateOKRTemplateObjectiveInput
): Promise<OKRTemplateObjective> {

  const title =
    requireTitle(
      input.title,
      "Objective Template title"
    );


  const weight =
    validateWeight(
      input.weight,
      "Objective Template"
    );


  const position =
    validatePosition(
      input.position
    );


  let finalPosition =
    position;


  if (
    finalPosition === null
  ) {

    finalPosition =
      await getNextObjectiveTemplatePosition();
  }


  const {
    data,
    error,
  } =
    await supabase

      .from(
        "objective_templates"
      )

      .insert({

        title,

        description:
          input.description?.trim() ||
          null,

        weight,

        position:
          finalPosition,

      })

      .select("*")

      .single();


  if (error) {

    throw new Error(
      `Failed to create Objective Template: ${error.message}`
    );
  }


  return mapObjectiveTemplate(
    data as ObjectiveTemplateRecord
  );
}


/* ==========================================================
   Update Global Objective Template
========================================================== */

export async function updateOKRTemplateObjective(
  input: UpdateOKRTemplateObjectiveInput
): Promise<OKRTemplateObjective> {

  const title =
    requireTitle(
      input.title,
      "Objective Template title"
    );


  const weight =
    validateWeight(
      input.weight,
      "Objective Template"
    );


  const position =
    validatePosition(
      input.position
    );


  const update:
    Record<
      string,
      unknown
    > = {

    title,

    description:
      input.description?.trim() ||
      null,

    weight,

    updated_at:
      new Date().toISOString(),
  };


  if (
    position !== null
  ) {

    update.position =
      position;
  }


  const {
    data,
    error,
  } =
    await supabase

      .from(
        "objective_templates"
      )

      .update(
        update
      )

      .eq(
        "id",
        input.objectiveId
      )

      .select("*")

      .single();


  if (error) {

    throw new Error(
      `Failed to update Objective Template: ${error.message}`
    );
  }


  return mapObjectiveTemplate(
    data as ObjectiveTemplateRecord
  );
}


/* ==========================================================
   Delete Global Objective Template
========================================================== */

export async function deleteOKRTemplateObjective(
  objectiveId: string
): Promise<void> {

  const {
    error,
  } =
    await supabase

      .from(
        "objective_templates"
      )

      .delete()

      .eq(
        "id",
        objectiveId
      );


  if (error) {

    throw new Error(
      `Failed to delete Objective Template: ${error.message}`
    );
  }
}


/* ==========================================================
   Create Global Key Result Template
========================================================== */

export async function createOKRTemplateKeyResult(
  input: CreateOKRTemplateKeyResultInput
): Promise<OKRTemplateKeyResult> {

  const title =
    requireTitle(
      input.title,
      "Key Result Template title"
    );


  const weight =
    validateWeight(
      input.weight,
      "Key Result Template"
    );


  const {
    data,
    error,
  } =
    await supabase

      .from(
        "key_result_templates"
      )

      .insert({

        title,

        target:
          input.target ??
          null,

        weight,

        measurement_type:
          input.measurementType ??
          null,

        scoring_method:
          input.scoringMethod ??
          null,

        status:
          input.status ??
          "active",

      })

      .select("*")

      .single();


  if (error) {

    throw new Error(
      `Failed to create Key Result Template: ${error.message}`
    );
  }


  return mapKeyResultTemplate(
    data as KeyResultTemplateRecord
  );
}


/* ==========================================================
   Update Global Key Result Template
========================================================== */

export async function updateOKRTemplateKeyResult(
  input: UpdateOKRTemplateKeyResultInput
): Promise<OKRTemplateKeyResult> {

  const title =
    requireTitle(
      input.title,
      "Key Result Template title"
    );


  const weight =
    validateWeight(
      input.weight,
      "Key Result Template"
    );


  const update:
    Record<
      string,
      unknown
    > = {

    title,

    target:
      input.target ??
      null,

    weight,

    measurement_type:
      input.measurementType ??
      null,

    scoring_method:
      input.scoringMethod ??
      null,

    status:
      input.status ??
      "active",

    updated_at:
      new Date().toISOString(),
  };


  const {
    data,
    error,
  } =
    await supabase

      .from(
        "key_result_templates"
      )

      .update(
        update
      )

      .eq(
        "id",
        input.keyResultId
      )

      .select("*")

      .single();


  if (error) {

    throw new Error(
      `Failed to update Key Result Template: ${error.message}`
    );
  }


  return mapKeyResultTemplate(
    data as KeyResultTemplateRecord
  );
}


/* ==========================================================
   Delete Global Key Result Template
========================================================== */

export async function deleteOKRTemplateKeyResult(
  keyResultId: string
): Promise<void> {

  const {
    error,
  } =
    await supabase

      .from(
        "key_result_templates"
      )

      .delete()

      .eq(
        "id",
        keyResultId
      );


  if (error) {

    throw new Error(
      `Failed to delete Key Result Template: ${error.message}`
    );
  }
}


/* ==========================================================
   Create Global Key Result Template Initiative
========================================================== */

export async function createOKRTemplateInitiative(
  input: CreateOKRTemplateInitiativeInput
): Promise<OKRTemplateInitiative> {

  await ensureTemplateInitiativeCapacity(
    input.okrTemplateKeyResultId
  );


  const text =
    requireTitle(
      input.text,
      "Key Result Template initiative"
    );


  const position =
    validatePosition(
      input.position
    );


  let finalPosition =
    position;


  if (
    finalPosition === null
  ) {

    finalPosition =
      await getNextKeyResultTemplateInitiativePosition(
        input.okrTemplateKeyResultId
      );
  }


  const {
    data,
    error,
  } =
    await supabase

      .from(
        "key_result_template_initiatives"
      )

      .insert({

        key_result_template_id:
          input.okrTemplateKeyResultId,

        text,

        position:
          finalPosition,

      })

      .select("*")

      .single();


  if (error) {

    throw new Error(
      `Failed to create Key Result Template initiative: ${error.message}`
    );
  }


  return mapKeyResultTemplateInitiative(
    data as KeyResultTemplateInitiativeRecord
  );
}


/* ==========================================================
   Update Global Key Result Template Initiative
========================================================== */

export async function updateOKRTemplateInitiative(
  input: UpdateOKRTemplateInitiativeInput
): Promise<OKRTemplateInitiative> {

  const text =
    requireTitle(
      input.text,
      "Key Result Template initiative"
    );


  const position =
    validatePosition(
      input.position
    );


  const update:
    Record<
      string,
      unknown
    > = {

    text,

    updated_at:
      new Date().toISOString(),
  };


  if (
    position !== null
  ) {

    update.position =
      position;
  }


  const {
    data,
    error,
  } =
    await supabase

      .from(
        "key_result_template_initiatives"
      )

      .update(
        update
      )

      .eq(
        "id",
        input.initiativeId
      )

      .select("*")

      .single();


  if (error) {

    throw new Error(
      `Failed to update Key Result Template initiative: ${error.message}`
    );
  }


  return mapKeyResultTemplateInitiative(
    data as KeyResultTemplateInitiativeRecord
  );
}


/* ==========================================================
   Delete Global Key Result Template Initiative
========================================================== */

export async function deleteOKRTemplateInitiative(
  initiativeId: string
): Promise<void> {

  const {
    error,
  } =
    await supabase

      .from(
        "key_result_template_initiatives"
      )

      .delete()

      .eq(
        "id",
        initiativeId
      );


  if (error) {

    throw new Error(
      `Failed to delete Key Result Template initiative: ${error.message}`
    );
  }
}


/* ==========================================================
   Create Organization Objective Template
========================================================== */

export async function createOrganizationOKRTemplateObjective(
  input: CreateOrganizationOKRTemplateObjectiveInput
): Promise<OrganizationOKRTemplateObjective> {

  const organizationId =
    requireOrganizationId(
      input.organizationId
    );


  const title =
    requireTitle(
      input.title,
      "Organization Objective Template title"
    );


  const weight =
    validateWeight(
      input.weight,
      "Organization Objective Template"
    );


  const position =
    validatePosition(
      input.position
    );


  let finalPosition =
    position;


  if (
    finalPosition === null
  ) {

    finalPosition =
      await getNextOrganizationObjectiveTemplatePosition(
        organizationId
      );
  }


  const {
    data,
    error,
  } =
    await supabase

      .from(
        "organization_objective_templates"
      )

      .insert({

        organization_id:
          organizationId,

        source_global_template_id:
          input.sourceGlobalTemplateId ??
          null,

        title,

        description:
          input.description?.trim() ||
          null,

        weight,

        position:
          finalPosition,

        created_by:
          input.createdBy ??
          null,

      })

      .select("*")

      .single();


  if (error) {

    throw new Error(
      `Failed to create Organization Objective Template: ${error.message}`
    );
  }


  return mapOrganizationObjectiveTemplate(
    data as OrganizationObjectiveTemplateRecord
  );
}


/* ==========================================================
   Update Organization Objective Template
========================================================== */

export async function updateOrganizationOKRTemplateObjective(
  organizationId: string,
  input: UpdateOrganizationOKRTemplateObjectiveInput
): Promise<OrganizationOKRTemplateObjective> {

  const orgId =
    requireOrganizationId(
      organizationId
    );


  const objectiveId =
    requireId(
      input.objectiveId,
      "Objective Template ID"
    );


  const title =
    requireTitle(
      input.title,
      "Organization Objective Template title"
    );


  const weight =
    validateWeight(
      input.weight,
      "Organization Objective Template"
    );


  const position =
    validatePosition(
      input.position
    );


  const update:
    Record<
      string,
      unknown
    > = {

    title,

    description:
      input.description?.trim() ||
      null,

    weight,

    updated_at:
      new Date().toISOString(),
  };


  if (
    position !== null
  ) {

    update.position =
      position;
  }


  const {
    data,
    error,
  } =
    await supabase

      .from(
        "organization_objective_templates"
      )

      .update(
        update
      )

      .eq(
        "id",
        objectiveId
      )

      .eq(
        "organization_id",
        orgId
      )

      .select("*")

      .single();


  if (error) {

    throw new Error(
      `Failed to update Organization Objective Template: ${error.message}`
    );
  }


  return mapOrganizationObjectiveTemplate(
    data as OrganizationObjectiveTemplateRecord
  );
}


/* ==========================================================
   Delete Organization Objective Template
========================================================== */

export async function deleteOrganizationOKRTemplateObjective(
  organizationId: string,
  objectiveId: string
): Promise<void> {

  const orgId =
    requireOrganizationId(
      organizationId
    );


  const id =
    requireId(
      objectiveId,
      "Objective Template ID"
    );


  const {
    error,
  } =
    await supabase

      .from(
        "organization_objective_templates"
      )

      .delete()

      .eq(
        "id",
        id
      )

      .eq(
        "organization_id",
        orgId
      );


  if (error) {

    throw new Error(
      `Failed to delete Organization Objective Template: ${error.message}`
    );
  }
}


/* ==========================================================
   Create Organization Key Result Template
========================================================== */

export async function createOrganizationOKRTemplateKeyResult(
  input: CreateOrganizationOKRTemplateKeyResultInput
): Promise<OrganizationOKRTemplateKeyResult> {

  const organizationId =
    requireOrganizationId(
      input.organizationId
    );


  const title =
    requireTitle(
      input.title,
      "Organization Key Result Template title"
    );


  const weight =
    validateWeight(
      input.weight,
      "Organization Key Result Template"
    );


  const {
    data,
    error,
  } =
    await supabase

      .from(
        "organization_key_result_templates"
      )

      .insert({

        organization_id:
          organizationId,

        source_global_template_id:
          input.sourceGlobalTemplateId ??
          null,

        title,

        target:
          input.target ??
          null,

        weight,

        measurement_type:
          input.measurementType ??
          null,

        scoring_method:
          input.scoringMethod ??
          null,

        status:
          input.status ??
          "active",

        created_by:
          input.createdBy ??
          null,

      })

      .select("*")

      .single();


  if (error) {

    throw new Error(
      `Failed to create Organization Key Result Template: ${error.message}`
    );
  }


  return mapOrganizationKeyResultTemplate(
    data as OrganizationKeyResultTemplateRecord
  );
}


/* ==========================================================
   Update Organization Key Result Template
========================================================== */

export async function updateOrganizationOKRTemplateKeyResult(
  organizationId: string,
  input: UpdateOrganizationOKRTemplateKeyResultInput
): Promise<OrganizationOKRTemplateKeyResult> {

  const orgId =
    requireOrganizationId(
      organizationId
    );


  const keyResultId =
    requireId(
      input.keyResultId,
      "Key Result Template ID"
    );


  const title =
    requireTitle(
      input.title,
      "Organization Key Result Template title"
    );


  const weight =
    validateWeight(
      input.weight,
      "Organization Key Result Template"
    );


  const update:
    Record<
      string,
      unknown
    > = {

    title,

    target:
      input.target ??
      null,

    weight,

    measurement_type:
      input.measurementType ??
      null,

    scoring_method:
      input.scoringMethod ??
      null,

    status:
      input.status ??
      "active",

    updated_at:
      new Date().toISOString(),
  };


  const {
    data,
    error,
  } =
    await supabase

      .from(
        "organization_key_result_templates"
      )

      .update(
        update
      )

      .eq(
        "id",
        keyResultId
      )

      .eq(
        "organization_id",
        orgId
      )

      .select("*")

      .single();


  if (error) {

    throw new Error(
      `Failed to update Organization Key Result Template: ${error.message}`
    );
  }


  return mapOrganizationKeyResultTemplate(
    data as OrganizationKeyResultTemplateRecord
  );
}


/* ==========================================================
   Delete Organization Key Result Template
------------------------------------------------------------
   Database ON DELETE CASCADE removes only the organization's
   initiatives belonging to this template.
========================================================== */

export async function deleteOrganizationOKRTemplateKeyResult(
  organizationId: string,
  keyResultId: string
): Promise<void> {

  const orgId =
    requireOrganizationId(
      organizationId
    );


  const id =
    requireId(
      keyResultId,
      "Key Result Template ID"
    );


  const {
    error,
  } =
    await supabase

      .from(
        "organization_key_result_templates"
      )

      .delete()

      .eq(
        "id",
        id
      )

      .eq(
        "organization_id",
        orgId
      );


  if (error) {

    throw new Error(
      `Failed to delete Organization Key Result Template: ${error.message}`
    );
  }
}


/* ==========================================================
   Verify Organization Key Result Ownership
========================================================== */

async function ensureOrganizationKeyResultOwnership(
  organizationId: string,
  keyResultId: string
): Promise<void> {

  const orgId =
    requireOrganizationId(
      organizationId
    );


  const id =
    requireId(
      keyResultId,
      "Organization Key Result Template ID"
    );


  const {
    data,
    error,
  } =
    await supabase

      .from(
        "organization_key_result_templates"
      )

      .select(
        "id"
      )

      .eq(
        "id",
        id
      )

      .eq(
        "organization_id",
        orgId
      )

      .maybeSingle();


  if (error) {

    throw new Error(
      `Failed to verify Organization Key Result Template ownership: ${error.message}`
    );
  }


  if (!data) {

    throw new Error(
      "The Key Result Template does not belong to this organization."
    );
  }
}


/* ==========================================================
   Create Organization Key Result Template Initiative
========================================================== */

export async function createOrganizationOKRTemplateInitiative(
  organizationId: string,
  input: CreateOrganizationOKRTemplateInitiativeInput
): Promise<OrganizationOKRTemplateInitiative> {

  const orgId =
    requireOrganizationId(
      organizationId
    );


  const keyResultId =
    requireId(
      input.organizationKeyResultTemplateId,
      "Organization Key Result Template ID"
    );


  await ensureOrganizationKeyResultOwnership(
    orgId,
    keyResultId
  );


  await ensureOrganizationTemplateInitiativeCapacity(
    keyResultId
  );


  const text =
    requireTitle(
      input.text,
      "Organization Key Result Template initiative"
    );


  const position =
    validatePosition(
      input.position
    );


  let finalPosition =
    position;


  if (
    finalPosition === null
  ) {

    finalPosition =
      await getNextOrganizationKeyResultTemplateInitiativePosition(
        keyResultId
      );
  }


  const {
    data,
    error,
  } =
    await supabase

      .from(
        "organization_key_result_template_initiatives"
      )

      .insert({

        organization_key_result_template_id:
          keyResultId,

        text,

        position:
          finalPosition,

      })

      .select("*")

      .single();


  if (error) {

    throw new Error(
      `Failed to create Organization Key Result Template initiative: ${error.message}`
    );
  }


  return mapOrganizationKeyResultTemplateInitiative(
    data as OrganizationKeyResultTemplateInitiativeRecord
  );
}


/* ==========================================================
   Update Organization Key Result Template Initiative
========================================================== */

export async function updateOrganizationOKRTemplateInitiative(
  organizationId: string,
  input: UpdateOrganizationOKRTemplateInitiativeInput
): Promise<OrganizationOKRTemplateInitiative> {

  const orgId =
    requireOrganizationId(
      organizationId
    );


  const initiativeId =
    requireId(
      input.initiativeId,
      "Organization Initiative ID"
    );


  const {
    data: existing,
    error: existingError,
  } =
    await supabase

      .from(
        "organization_key_result_template_initiatives"
      )

      .select(
        "id, organization_key_result_template_id"
      )

      .eq(
        "id",
        initiativeId
      )

      .maybeSingle();


  if (existingError) {

    throw new Error(
      `Failed to load Organization Key Result Template initiative: ${existingError.message}`
    );
  }


  if (!existing) {

    throw new Error(
      "Organization Key Result Template initiative was not found."
    );
  }


  await ensureOrganizationKeyResultOwnership(
    orgId,
    existing.organization_key_result_template_id
  );


  const text =
    requireTitle(
      input.text,
      "Organization Key Result Template initiative"
    );


  const position =
    validatePosition(
      input.position
    );


  const update:
    Record<
      string,
      unknown
    > = {

    text,

    updated_at:
      new Date().toISOString(),
  };


  if (
    position !== null
  ) {

    update.position =
      position;
  }


  const {
    data,
    error,
  } =
    await supabase

      .from(
        "organization_key_result_template_initiatives"
      )

      .update(
        update
      )

      .eq(
        "id",
        initiativeId
      )

      .select("*")

      .single();


  if (error) {

    throw new Error(
      `Failed to update Organization Key Result Template initiative: ${error.message}`
    );
  }


  return mapOrganizationKeyResultTemplateInitiative(
    data as OrganizationKeyResultTemplateInitiativeRecord
  );
}


/* ==========================================================
   Delete Organization Key Result Template Initiative
========================================================== */

export async function deleteOrganizationOKRTemplateInitiative(
  organizationId: string,
  initiativeId: string
): Promise<void> {

  const orgId =
    requireOrganizationId(
      organizationId
    );


  const id =
    requireId(
      initiativeId,
      "Organization Initiative ID"
    );


  const {
    data: existing,
    error: existingError,
  } =
    await supabase

      .from(
        "organization_key_result_template_initiatives"
      )

      .select(
        "id, organization_key_result_template_id"
      )

      .eq(
        "id",
        id
      )

      .maybeSingle();


  if (existingError) {

    throw new Error(
      `Failed to load Organization Key Result Template initiative: ${existingError.message}`
    );
  }


  if (!existing) {

    throw new Error(
      "Organization Key Result Template initiative was not found."
    );
  }


  await ensureOrganizationKeyResultOwnership(
    orgId,
    existing.organization_key_result_template_id
  );


  const {
    error,
  } =
    await supabase

      .from(
        "organization_key_result_template_initiatives"
      )

      .delete()

      .eq(
        "id",
        id
      );


  if (error) {

    throw new Error(
      `Failed to delete Organization Key Result Template initiative: ${error.message}`
    );
  }
}


/* ==========================================================
   Copy Global Objective Template → Organization
========================================================== */

export async function copyGlobalOKRTemplateObjectiveToOrganization(
  input: CopyGlobalOKRTemplateObjectiveInput
): Promise<OrganizationOKRTemplateObjective> {

  const organizationId =
    requireOrganizationId(
      input.organizationId
    );


  const sourceGlobalTemplateId =
    requireId(
      input.sourceGlobalTemplateId,
      "Global Objective Template ID"
    );


  const {
    data,
    error,
  } =
    await supabase

      .from(
        "objective_templates"
      )

      .select("*")

      .eq(
        "id",
        sourceGlobalTemplateId
      )

      .maybeSingle();


  if (error) {

    throw new Error(
      `Failed to load Global Objective Template for copying: ${error.message}`
    );
  }


  if (!data) {

    throw new Error(
      "The Global Objective Template was not found."
    );
  }


  const globalObjective =
    data as ObjectiveTemplateRecord;


  return createOrganizationOKRTemplateObjective({

    organizationId,

    sourceGlobalTemplateId:
      globalObjective.id,

    title:
      globalObjective.title,

    description:
      globalObjective.description ??
      undefined,

    weight:
      globalObjective.weight ??
      undefined,

    createdBy:
      input.createdBy,

  });
}


/* ==========================================================
   Copy Global Key Result Template → Organization
------------------------------------------------------------
   This copies the Key Result itself AND all of its
   reusable initiatives.
========================================================== */

export async function copyGlobalOKRTemplateKeyResultToOrganization(
  input: CopyGlobalOKRTemplateKeyResultInput
): Promise<OrganizationOKRTemplateKeyResult> {

  const organizationId =
    requireOrganizationId(
      input.organizationId
    );


  const sourceGlobalTemplateId =
    requireId(
      input.sourceGlobalTemplateId,
      "Global Key Result Template ID"
    );


  const {
    data,
    error,
  } =
    await supabase

      .from(
        "key_result_templates"
      )

      .select("*")

      .eq(
        "id",
        sourceGlobalTemplateId
      )

      .maybeSingle();


  if (error) {

    throw new Error(
      `Failed to load Global Key Result Template for copying: ${error.message}`
    );
  }


  if (!data) {

    throw new Error(
      "The Global Key Result Template was not found."
    );
  }


  const globalKeyResult =
    data as KeyResultTemplateRecord;


  const {
    data: initiativeData,
    error: initiativeError,
  } =
    await supabase

      .from(
        "key_result_template_initiatives"
      )

      .select("*")

      .eq(
        "key_result_template_id",
        globalKeyResult.id
      )

      .order(
        "position",
        {
          ascending: true,
        }
      );


  if (initiativeError) {

    throw new Error(
      `Failed to load Global Key Result Template initiatives for copying: ${initiativeError.message}`
    );
  }


  const globalInitiatives =
    (
      (initiativeData ?? []) as
        KeyResultTemplateInitiativeRecord[]
    );


  if (
    globalInitiatives.length >
    MAX_TEMPLATE_INITIATIVES
  ) {

    throw new Error(
      `The Global Key Result Template contains more than ${MAX_TEMPLATE_INITIATIVES} initiatives and cannot be copied.`
    );
  }


  const created =
    await createOrganizationOKRTemplateKeyResult({

      organizationId,

      sourceGlobalTemplateId:
        globalKeyResult.id,

      title:
        globalKeyResult.title,

      target:
        globalKeyResult.target,

      weight:
        globalKeyResult.weight ??
        undefined,

      measurementType:
        globalKeyResult.measurement_type ??
        undefined,

      scoringMethod:
        globalKeyResult.scoring_method ??
        undefined,

      status:
        globalKeyResult.status,

      createdBy:
        input.createdBy,

    });


  try {

    for (
      const initiative of
      globalInitiatives
    ) {

      await createOrganizationOKRTemplateInitiative(

        organizationId,

        {

          organizationKeyResultTemplateId:
            created.id,

          text:
            initiative.text,

          position:
            initiative.position,

        }

      );
    }

  } catch (error) {

    try {

      await deleteOrganizationOKRTemplateKeyResult(
        organizationId,
        created.id
      );

    } catch {
      /* Preserve the original copy error. */
    }


    throw error;
  }


  const copied =
    await loadOrganizationKeyResultTemplateById(
      organizationId,
      created.id
    );


  if (!copied) {

    throw new Error(
      "The copied Organization Key Result Template could not be reloaded."
    );
  }


  return copied;
}


/* ==========================================================
   Load One Organization Objective Template
========================================================== */

export async function loadOrganizationObjectiveTemplateById(
  organizationId: string,
  objectiveId: string
): Promise<OrganizationOKRTemplateObjective | null> {

  const orgId =
    requireOrganizationId(
      organizationId
    );


  const id =
    requireId(
      objectiveId,
      "Organization Objective Template ID"
    );


  const {
    data,
    error,
  } =
    await supabase

      .from(
        "organization_objective_templates"
      )

      .select("*")

      .eq(
        "organization_id",
        orgId
      )

      .eq(
        "id",
        id
      )

      .maybeSingle();


  if (error) {

    throw new Error(
      `Failed to load Organization Objective Template: ${error.message}`
    );
  }


  if (!data) {

    return null;
  }


  return mapOrganizationObjectiveTemplate(
    data as OrganizationObjectiveTemplateRecord
  );
}


/* ==========================================================
   Load One Organization Key Result Template
========================================================== */

export async function loadOrganizationKeyResultTemplateById(
  organizationId: string,
  keyResultId: string
): Promise<OrganizationOKRTemplateKeyResult | null> {

  const orgId =
    requireOrganizationId(
      organizationId
    );


  const id =
    requireId(
      keyResultId,
      "Organization Key Result Template ID"
    );


  const {
    data,
    error,
  } =
    await supabase

      .from(
        "organization_key_result_templates"
      )

      .select("*")

      .eq(
        "organization_id",
        orgId
      )

      .eq(
        "id",
        id
      )

      .maybeSingle();


  if (error) {

    throw new Error(
      `Failed to load Organization Key Result Template: ${error.message}`
    );
  }


  if (!data) {

    return null;
  }


  const keyResult =
    mapOrganizationKeyResultTemplate(
      data as OrganizationKeyResultTemplateRecord
    );


  const initiatives =
    await loadOrganizationKeyResultTemplateInitiatives([
      keyResult.id,
    ]);


  keyResult.initiatives =
    initiatives;


  return keyResult;
}


/* ==========================================================
   Organization Objective Template Position
========================================================== */

async function getNextOrganizationObjectiveTemplatePosition(
  organizationId: string
): Promise<number> {

  const orgId =
    requireOrganizationId(
      organizationId
    );


  const {
    data,
    error,
  } =
    await supabase

      .from(
        "organization_objective_templates"
      )

      .select(
        "position"
      )

      .eq(
        "organization_id",
        orgId
      )

      .order(
        "position",
        {
          ascending: false,
        }
      )

      .limit(1)

      .maybeSingle();


  if (error) {

    throw new Error(
      `Failed to determine Organization Objective Template position: ${error.message}`
    );
  }


  return (
    data?.position ??
    -1
  ) + 1;
}


/* ==========================================================
   Global Objective Template Position
========================================================== */

async function getNextObjectiveTemplatePosition(): Promise<number> {

  const {
    data,
    error,
  } =
    await supabase

      .from(
        "objective_templates"
      )

      .select(
        "position"
      )

      .order(
        "position",
        {
          ascending: false,
        }
      )

      .limit(1)

      .maybeSingle();


  if (error) {

    throw new Error(
      `Failed to determine Objective Template position: ${error.message}`
    );
  }


  return (
    data?.position ??
    -1
  ) + 1;
}


/* ==========================================================
   Global Key Result Initiative Position
========================================================== */

async function getNextKeyResultTemplateInitiativePosition(
  keyResultId: string
): Promise<number> {

  const {
    data,
    error,
  } =
    await supabase

      .from(
        "key_result_template_initiatives"
      )

      .select(
        "position"
      )

      .eq(
        "key_result_template_id",
        keyResultId
      )

      .order(
        "position",
        {
          ascending: false,
        }
      )

      .limit(1)

      .maybeSingle();


  if (error) {

    throw new Error(
      `Failed to determine Key Result Template initiative position: ${error.message}`
    );
  }


  return (
    data?.position ??
    -1
  ) + 1;
}


/* ==========================================================
   Organization Key Result Initiative Position
========================================================== */

async function getNextOrganizationKeyResultTemplateInitiativePosition(
  keyResultId: string
): Promise<number> {

  const {
    data,
    error,
  } =
    await supabase

      .from(
        "organization_key_result_template_initiatives"
      )

      .select(
        "position"
      )

      .eq(
        "organization_key_result_template_id",
        keyResultId
      )

      .order(
        "position",
        {
          ascending: false,
        }
      )

      .limit(1)

      .maybeSingle();


  if (error) {

    throw new Error(
      `Failed to determine Organization Key Result Template initiative position: ${error.message}`
    );
  }


  return (
    data?.position ??
    -1
  ) + 1;
}


/* ==========================================================
   Global Initiative Capacity
========================================================== */

async function ensureTemplateInitiativeCapacity(
  keyResultId: string,
  excludingInitiativeId?: string
): Promise<void> {

  const {
    data,
    error,
  } =
    await supabase

      .from(
        "key_result_template_initiatives"
      )

      .select(
        "id"
      )

      .eq(
        "key_result_template_id",
        keyResultId
      );


  if (error) {

    throw new Error(
      `Failed to check Key Result Template initiative capacity: ${error.message}`
    );
  }


  const count =
    (
      data ?? []
    ).filter(
      (
        initiative
      ) =>
        initiative.id !==
        excludingInitiativeId
    ).length;


  if (
    count >=
    MAX_TEMPLATE_INITIATIVES
  ) {

    throw new Error(
      `A Key Result Template can have a maximum of ${MAX_TEMPLATE_INITIATIVES} initiatives.`
    );
  }
}


/* ==========================================================
   Organization Initiative Capacity
========================================================== */

async function ensureOrganizationTemplateInitiativeCapacity(
  keyResultId: string,
  excludingInitiativeId?: string
): Promise<void> {

  const {
    data,
    error,
  } =
    await supabase

      .from(
        "organization_key_result_template_initiatives"
      )

      .select(
        "id"
      )

      .eq(
        "organization_key_result_template_id",
        keyResultId
      );


  if (error) {

    throw new Error(
      `Failed to check Organization Key Result Template initiative capacity: ${error.message}`
    );
  }


  const count =
    (
      data ?? []
    ).filter(
      (
        initiative
      ) =>
        initiative.id !==
        excludingInitiativeId
    ).length;


  if (
    count >=
    MAX_TEMPLATE_INITIATIVES
  ) {

    throw new Error(
      `An Organization Key Result Template can have a maximum of ${MAX_TEMPLATE_INITIATIVES} initiatives.`
    );
  }
}


/* ==========================================================
   Convenience Global Loaders
========================================================== */

export async function loadAllObjectiveTemplates(): Promise<
  OKRTemplateObjective[]
> {

  return loadObjectiveTemplates();
}


export async function loadAllKeyResultTemplates(
  includeArchived = false
): Promise<
  OKRTemplateKeyResult[]
> {

  return loadKeyResultTemplates(
    includeArchived
  );
}


/* ==========================================================
   Convenience Organization Loaders
========================================================== */

export async function loadAllOrganizationObjectiveTemplates(
  organizationId: string
): Promise<
  OrganizationOKRTemplateObjective[]
> {

  return loadOrganizationObjectiveTemplates(
    organizationId
  );
}


export async function loadAllOrganizationKeyResultTemplates(
  organizationId: string,
  includeArchived = false
): Promise<
  OrganizationOKRTemplateKeyResult[]
> {

  return loadOrganizationKeyResultTemplates(
    organizationId,
    includeArchived
  );
}


/* ==========================================================
   Exported Constants
========================================================== */

export {
  GLOBAL_TEMPLATE_LIBRARY_ID,
  MAX_TEMPLATE_INITIATIVES,
};