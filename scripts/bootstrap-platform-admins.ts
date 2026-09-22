/**
 * ==========================================================
 * CascadEffects Performance Platform
 * Platform Super Admin Bootstrap
 * ----------------------------------------------------------
 * Creates the initial platform Super Admin accounts and,
 * where specified, their CascadEffects Member membership.
 *
 * IMPORTANT:
 * - This script is for controlled administrative/bootstrap use.
 * - It must NEVER be exposed through a public API route.
 * - It uses the Supabase service-role key.
 * - Do not commit credentials to source control.
 * - Existing users are never assigned a new password.
 * ==========================================================
 */

import dotenv from "dotenv";

import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

dotenv.config({
  path: ".env.local",
});

type BootstrapUser = {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  addCascadEffectsMembership: boolean;
};

type AuthUser = {
  id: string;
  email?: string | null;
};

type PublicUser = {
  id: string;
  auth_user_id: string;
  email: string;
};

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const bootstrapPassword =
  process.env.SUPERADMIN_BOOTSTRAP_PASSWORD;

if (!supabaseUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL environment variable."
  );
}

if (!serviceRoleKey) {
  throw new Error(
    "Missing SUPABASE_SERVICE_ROLE_KEY environment variable."
  );
}

if (!bootstrapPassword) {
  throw new Error(
    "Missing SUPERADMIN_BOOTSTRAP_PASSWORD environment variable."
  );
}

if (bootstrapPassword.length < 8) {
  throw new Error(
    "SUPERADMIN_BOOTSTRAP_PASSWORD must contain at least 8 characters."
  );
}

const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const bootstrapUsers: BootstrapUser[] = [
  {
    firstName: "Mario",
    lastName: "",
    displayName: "Mario",
    email: "mario@cascadeffects.com",
    addCascadEffectsMembership: true,
  },
  {
    firstName: "Heather",
    lastName: "",
    displayName: "Heather",
    email: "heather@cascadeffects.com",
    addCascadEffectsMembership: true,
  },
  {
    firstName: "Casey",
    lastName: "",
    displayName: "Casey",
    email: "casey@cascadeffects.com",
    addCascadEffectsMembership: false,
  },
];

async function findAuthUserByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<AuthUser | null> {
  const normalizedEmail =
    email.trim().toLowerCase();

  let page = 1;

  while (true) {
    const { data, error } =
      await supabase.auth.admin.listUsers({
        page,
        perPage: 1000,
      });

    if (error) {
      throw new Error(
        `Unable to search Supabase Auth users: ${error.message}`
      );
    }

    const match = data.users.find(
      (user) =>
        user.email?.trim().toLowerCase() ===
        normalizedEmail
    );

    if (match) {
      return {
        id: match.id,
        email: match.email,
      };
    }

    if (data.users.length < 1000) {
      return null;
    }

    page += 1;
  }
}

async function getOrCreateAuthUser(
  user: BootstrapUser
): Promise<AuthUser> {
  const existingUser =
    await findAuthUserByEmail(
      supabaseAdmin,
      user.email
    );

  if (existingUser) {
    console.log(
      `  Auth user already exists: ${user.email}`
    );

    return existingUser;
  }

  const { data, error } =
    await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: bootstrapPassword,
      email_confirm: true,
      user_metadata: {
        first_name: user.firstName,
        last_name: user.lastName,
        display_name: user.displayName,
      },
    });

  if (error) {
    throw new Error(
      `Unable to create Auth user ${user.email}: ${error.message}`
    );
  }

  if (!data.user) {
    throw new Error(
      `Supabase did not return the created Auth user for ${user.email}.`
    );
  }

  console.log(
    `  Created Auth user: ${user.email}`
  );

  return {
    id: data.user.id,
    email: data.user.email,
  };
}

async function getOrCreatePublicUser(
  user: BootstrapUser,
  authUser: AuthUser
): Promise<PublicUser> {
  const {
    data: existingByAuthId,
    error: authLookupError,
  } =
    await supabaseAdmin
      .from("users")
      .select(
        "id, auth_user_id, email"
      )
      .eq(
        "auth_user_id",
        authUser.id
      )
      .maybeSingle();

  if (authLookupError) {
    throw new Error(
      `Unable to find public user for ${user.email}: ${authLookupError.message}`
    );
  }

  if (existingByAuthId) {
    console.log(
      `  Public user already exists: ${user.email}`
    );

    return existingByAuthId;
  }

  const {
    data: existingByEmail,
    error: emailLookupError,
  } =
    await supabaseAdmin
      .from("users")
      .select(
        "id, auth_user_id, email"
      )
      .eq(
        "email",
        user.email
      )
      .maybeSingle();

  if (emailLookupError) {
    throw new Error(
      `Unable to check public user email ${user.email}: ${emailLookupError.message}`
    );
  }

  if (existingByEmail) {
    if (
      existingByEmail.auth_user_id !==
      authUser.id
    ) {
      throw new Error(
        `A public users record already exists for ${user.email}, but it is linked to a different Auth user.`
      );
    }

    return existingByEmail;
  }

  const {
    data: createdUser,
    error: createUserError,
  } =
    await supabaseAdmin
      .from("users")
      .insert({
        auth_user_id: authUser.id,
        first_name: user.firstName,
        last_name: user.lastName,
        display_name: user.displayName,
        email: user.email,
        is_active: true,
      })
      .select(
        "id, auth_user_id, email"
      )
      .single();

  if (createUserError) {
    throw new Error(
      `Unable to create public user ${user.email}: ${createUserError.message}`
    );
  }

  if (!createdUser) {
    throw new Error(
      `Public user creation returned no user for ${user.email}.`
    );
  }

  console.log(
    `  Created public users record: ${user.email}`
  );

  return createdUser;
}

async function ensurePlatformSuperAdmin(
  publicUser: PublicUser
): Promise<void> {
  const {
    data: existingMembership,
    error: lookupError,
  } =
    await supabaseAdmin
      .from("platform_memberships")
      .select(
        "id, platform_role, is_active"
      )
      .eq(
        "user_id",
        publicUser.id
      )
      .maybeSingle();

  if (lookupError) {
    throw new Error(
      `Unable to find platform membership for ${publicUser.email}: ${lookupError.message}`
    );
  }

  if (existingMembership) {
    if (
      existingMembership.platform_role !==
      "super_admin"
    ) {
      throw new Error(
        `User ${publicUser.email} already has platform role "${existingMembership.platform_role}". The bootstrap script will not overwrite it.`
      );
    }

    if (!existingMembership.is_active) {
      const {
        error: activateError,
      } =
        await supabaseAdmin
          .from("platform_memberships")
          .update({
            is_active: true,
          })
          .eq(
            "id",
            existingMembership.id
          );

      if (activateError) {
        throw new Error(
          `Unable to activate platform membership for ${publicUser.email}: ${activateError.message}`
        );
      }

      console.log(
        `  Reactivated Super Admin membership: ${publicUser.email}`
      );
    } else {
      console.log(
        `  Super Admin membership already exists: ${publicUser.email}`
      );
    }

    return;
  }

  const {
    error: insertError,
  } =
    await supabaseAdmin
      .from("platform_memberships")
      .insert({
        user_id: publicUser.id,
        platform_role: "super_admin",
        is_active: true,
      });

  if (insertError) {
    throw new Error(
      `Unable to create Super Admin membership for ${publicUser.email}: ${insertError.message}`
    );
  }

  console.log(
    `  Created Super Admin membership: ${publicUser.email}`
  );
}

async function getCascadEffectsOrganization(): Promise<{
  id: string;
  company_name: string;
}> {
  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from("organization")
      .select(
        "id, company_name"
      )
      .eq(
        "company_name",
        "CascadEffects"
      )
      .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to find CascadEffects organization: ${error.message}`
    );
  }

  if (!data) {
    throw new Error(
      'Organization "CascadEffects" was not found.'
    );
  }

  return data;
}

async function getMemberRole(
  organizationId: string
): Promise<string> {
  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from("roles")
      .select(
        "id, name"
      )
      .eq(
        "organization_id",
        organizationId
      )
      .eq(
        "name",
        "Member"
      )
      .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to find CascadEffects Member role: ${error.message}`
    );
  }

  if (!data) {
    throw new Error(
      'The "Member" role does not exist for CascadEffects.'
    );
  }

  return data.id;
}

async function ensureCascadEffectsMembership(
  publicUser: PublicUser,
  organizationId: string,
  memberRoleId: string
): Promise<void> {
  const {
    data: existingMembership,
    error: membershipLookupError,
  } =
    await supabaseAdmin
      .from("organization_memberships")
      .select(
        "id, user_id, organization_id"
      )
      .eq(
        "user_id",
        publicUser.id
      )
      .eq(
        "organization_id",
        organizationId
      )
      .maybeSingle();

  if (membershipLookupError) {
    throw new Error(
      `Unable to find CascadEffects membership for ${publicUser.email}: ${membershipLookupError.message}`
    );
  }

  let membershipId: string;

  if (existingMembership) {
    membershipId =
      existingMembership.id;

    console.log(
      `  CascadEffects membership already exists: ${publicUser.email}`
    );
  } else {
    const {
      data: createdMembership,
      error: membershipCreateError,
    } =
      await supabaseAdmin
        .from("organization_memberships")
        .insert({
          user_id: publicUser.id,
          organization_id: organizationId,
        })
        .select("id")
        .single();

    if (membershipCreateError) {
      throw new Error(
        `Unable to create CascadEffects membership for ${publicUser.email}: ${membershipCreateError.message}`
      );
    }

    if (!createdMembership) {
      throw new Error(
        `CascadEffects membership creation returned no record for ${publicUser.email}.`
      );
    }

    membershipId =
      createdMembership.id;

    console.log(
      `  Created CascadEffects membership: ${publicUser.email}`
    );
  }

  const {
    data: existingRole,
    error: roleLookupError,
  } =
    await supabaseAdmin
      .from("membership_roles")
      .select(
        "id, role_id"
      )
      .eq(
        "organization_membership_id",
        membershipId
      )
      .eq(
        "role_id",
        memberRoleId
      )
      .maybeSingle();

  if (roleLookupError) {
    throw new Error(
      `Unable to check Member role for ${publicUser.email}: ${roleLookupError.message}`
    );
  }

  if (existingRole) {
    console.log(
      `  CascadEffects Member role already assigned: ${publicUser.email}`
    );

    return;
  }

  const {
    error: roleInsertError,
  } =
    await supabaseAdmin
      .from("membership_roles")
      .insert({
        organization_membership_id:
          membershipId,
        role_id:
          memberRoleId,
        organization_id:
          organizationId,
      });

  if (roleInsertError) {
    throw new Error(
      `Unable to assign CascadEffects Member role to ${publicUser.email}: ${roleInsertError.message}`
    );
  }

  console.log(
    `  Assigned CascadEffects Member role: ${publicUser.email}`
  );
}

async function verifyBootstrap(
  organizationId: string,
  memberRoleId: string
): Promise<void> {
  console.log("");
  console.log(
    "Verifying bootstrap state..."
  );
  console.log("");

  const emails =
    bootstrapUsers.map(
      (user) => user.email
    );

  const {
    data: users,
    error: usersError,
  } =
    await supabaseAdmin
      .from("users")
      .select(
        "id, auth_user_id, email, display_name, is_active"
      )
      .in(
        "email",
        emails
      );

  if (usersError) {
    throw new Error(
      `Unable to verify public users: ${usersError.message}`
    );
  }

  const userIds =
    (users ?? []).map(
      (user) => user.id
    );

  if (userIds.length === 0) {
    throw new Error(
      "Verification failed: no bootstrap users were found."
    );
  }

  const {
    data: platformMemberships,
    error: platformError,
  } =
    await supabaseAdmin
      .from("platform_memberships")
      .select(
        "user_id, platform_role, is_active"
      )
      .in(
        "user_id",
        userIds
      );

  if (platformError) {
    throw new Error(
      `Unable to verify platform memberships: ${platformError.message}`
    );
  }

  const {
    data: organizationMemberships,
    error: organizationError,
  } =
    await supabaseAdmin
      .from("organization_memberships")
      .select(
        "id, user_id, organization_id"
      )
      .eq(
        "organization_id",
        organizationId
      )
      .in(
        "user_id",
        userIds
      );

  if (organizationError) {
    throw new Error(
      `Unable to verify organization memberships: ${organizationError.message}`
    );
  }

  for (const bootstrapUser of bootstrapUsers) {
    const publicUser =
      users?.find(
        (record) =>
          record.email ===
          bootstrapUser.email
      );

    if (!publicUser) {
      throw new Error(
        `Verification failed: public user ${bootstrapUser.email} was not found.`
      );
    }

    const platformMembership =
      platformMemberships?.find(
        (membership) =>
          membership.user_id ===
          publicUser.id
      );

    if (
      !platformMembership ||
      platformMembership.platform_role !==
        "super_admin" ||
      !platformMembership.is_active
    ) {
      throw new Error(
        `Verification failed: ${bootstrapUser.email} is not an active Super Admin.`
      );
    }

    const organizationMembership =
      organizationMemberships?.find(
        (membership) =>
          membership.user_id ===
          publicUser.id
      );

    if (
      bootstrapUser.addCascadEffectsMembership
    ) {
      if (!organizationMembership) {
        throw new Error(
          `Verification failed: ${bootstrapUser.email} does not have a CascadEffects membership.`
        );
      }

      const {
        data: roleAssignments,
        error: roleError,
      } =
        await supabaseAdmin
          .from("membership_roles")
          .select(
            "id, role_id, organization_id"
          )
          .eq(
            "organization_membership_id",
            organizationMembership.id
          )
          .eq(
            "organization_id",
            organizationId
          );

      if (roleError) {
        throw new Error(
          `Unable to verify organization role for ${bootstrapUser.email}: ${roleError.message}`
        );
      }

      const hasMemberRole =
        roleAssignments?.some(
          (assignment) =>
            assignment.role_id ===
            memberRoleId
        );

      if (!hasMemberRole) {
        throw new Error(
          `Verification failed: ${bootstrapUser.email} does not have the CascadEffects Member role.`
        );
      }
    } else if (
      organizationMembership
    ) {
      throw new Error(
        `Verification failed: ${bootstrapUser.email} unexpectedly has a CascadEffects membership.`
      );
    }

    console.log(
      `  ✓ ${bootstrapUser.email} — Super Admin${
        bootstrapUser.addCascadEffectsMembership
          ? " + CascadEffects Member"
          : ""
      }`
    );
  }
}

async function main(): Promise<void> {
  console.log("");
  console.log(
    "=============================================="
  );
  console.log(
    "CascadEffects Platform Admin Bootstrap"
  );
  console.log(
    "=============================================="
  );
  console.log("");

  console.log(
    "Processing platform Super Admin accounts..."
  );
  console.log("");

  const organization =
    await getCascadEffectsOrganization();

  const memberRoleId =
    await getMemberRole(
      organization.id
    );

  console.log(
    `CascadEffects organization: ${organization.id}`
  );

  console.log(
    `CascadEffects Member role: ${memberRoleId}`
  );

  console.log("");

  for (const user of bootstrapUsers) {
    console.log(
      `Processing ${user.email}...`
    );

    const authUser =
      await getOrCreateAuthUser(
        user
      );

    const publicUser =
      await getOrCreatePublicUser(
        user,
        authUser
      );

    await ensurePlatformSuperAdmin(
      publicUser
    );

    if (
      user.addCascadEffectsMembership
    ) {
      await ensureCascadEffectsMembership(
        publicUser,
        organization.id,
        memberRoleId
      );
    }

    console.log("");
  }

  await verifyBootstrap(
    organization.id,
    memberRoleId
  );

  console.log("");
  console.log(
    "=============================================="
  );
  console.log(
    "BOOTSTRAP COMPLETE"
  );
  console.log(
    "=============================================="
  );
  console.log("");

  console.log(
    "Mario: Super Admin + CascadEffects Member"
  );

  console.log(
    "Heather: Super Admin + CascadEffects Member"
  );

  console.log(
    "Casey: Super Admin only"
  );

  console.log("");
  console.log(
    "Initial password for newly created accounts:"
  );
  console.log(
    "SUPERADMIN_BOOTSTRAP_PASSWORD"
  );

  console.log("");
  console.log(
    "Next step: verify authentication and organization context in the application."
  );

  console.log("");
}

main().catch(
  (error) => {
    console.error("");
    console.error(
      "=============================================="
    );
    console.error(
      "BOOTSTRAP FAILED"
    );
    console.error(
      "=============================================="
    );
    console.error("");

    console.error(
      error instanceof Error
        ? error.message
        : error
    );

    console.error("");

    process.exit(1);
  }
);