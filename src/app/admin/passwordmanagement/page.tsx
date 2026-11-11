
import {
  requirePlatformSuperAdmin,
} from "@/lib/auth/authorization";

import {
  createSupabaseServerClient,
} from "@/lib/supabase/server";

import PasswordManagementClient from "./passwordmanagementclient";

export const dynamic = "force-dynamic";

export default async function PasswordManagementPage() {
  // Enforce Platform Super Admin access on the server.
  await requirePlatformSuperAdmin();

  // Load all application users.
  const supabase = await createSupabaseServerClient();

  const {
    data: users,
    error,
  } = await supabase
    .from("users")
    .select(`
      id,
      auth_user_id,
      first_name,
      last_name,
      display_name,
      email,
      is_active
    `)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Failed to load platform users: ${error.message}`
    );
  }

  return (
    <PasswordManagementClient
      users={users ?? []}
    />
  );
}
