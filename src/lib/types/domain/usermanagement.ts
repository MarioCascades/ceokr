/**
 * ==========================================================
 * CascadEffects Performance Platform
 * User Management View Model
 * ----------------------------------------------------------
 * Management/read model combining:
 *
 * User
 * Organization Membership
 * Department
 * Team
 *
 * This does not replace the underlying domain models.
 * ==========================================================
 */

import type { User } from "@/lib/types/domain/user";

import type {
  OrganizationMembership,
} from "@/lib/types/domain/organizationmembership";

import type {
  Department,
} from "@/lib/types/domain/department";

import type {
  Team,
} from "@/lib/types/domain/team";

export interface UserManagementRecord {
  user: User;

  membership:
    | OrganizationMembership
    | null;

  department:
    | Department
    | null;

  team:
    | Team
    | null;
}