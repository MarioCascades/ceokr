
"use client";

import { useMemo, useState } from "react";

import { supabase } from "@/lib/supabase/client";


type PlatformUser = {
  id: string;
  auth_user_id: string;
  first_name: string;
  last_name: string;
  display_name: string | null;
  email: string;
  is_active: boolean;
};


type PasswordManagementClientProps = {
  users: PlatformUser[];
};


export default function PasswordManagementClient({
  users,
}: PasswordManagementClientProps) {

  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");


  /* ==========================================================
     Selected User
  ========================================================== */

  const selectedUser = users.find(
    (user) => user.id === selectedUserId
  ) ?? null;


  /* ==========================================================
     Display Name
  ========================================================== */

  function getDisplayName(user: PlatformUser) {

    return (
      user.display_name?.trim() ||
      `${user.first_name} ${user.last_name}`.trim() ||
      user.email
    );
  }


  /* ==========================================================
     Search Users
  ========================================================== */

  const filteredUsers = useMemo(() => {

    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) => {

      const name = getDisplayName(user).toLowerCase();

      return (
        name.includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    });

  }, [users, search]);


  /* ==========================================================
     Select User
  ========================================================== */

  function handleUserSelect(userId: string) {

    setSelectedUserId(userId);

    setPassword("");
    setConfirmPassword("");

    setSuccessMessage("");
    setErrorMessage("");
  }


  /* ==========================================================
     Reset Password
  ========================================================== */

  async function handlePasswordReset() {

    setSuccessMessage("");
    setErrorMessage("");


    if (!selectedUser) {

      setErrorMessage(
        "Please select a platform user."
      );

      return;
    }


    if (
      password.length < 12 ||
      password.length > 72
    ) {

      setErrorMessage(
        "Password must be between 12 and 72 characters."
      );

      return;
    }


    if (password !== confirmPassword) {

      setErrorMessage(
        "The password confirmation does not match."
      );

      return;
    }


    const confirmed = window.confirm(
      `Are you sure you want to reset the password for ${getDisplayName(selectedUser)} (${selectedUser.email})?`
    );

    if (!confirmed) {
      return;
    }


    setLoading(true);


    try {

      const {
        data,
        error,
      } = await supabase.functions.invoke(
        "admin-reset-user-password",
        {
          body: {
            target_user_id: selectedUser.auth_user_id,
            password,
          },
        }
      );


      if (error) {

        let message = error.message;

        try {

          const response = await error.context?.json();

          if (response?.error) {
            message = response.error;
          }

        } catch {
          // Keep the original error message.
        }

        throw new Error(message);
      }


      if (!data?.success) {

        throw new Error(
          data?.error ||
          "The password reset could not be completed."
        );
      }


      setSuccessMessage(
        `Password successfully updated for ${getDisplayName(selectedUser)}.`
      );

      setPassword("");
      setConfirmPassword("");

    } catch (error) {

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred."
      );

    } finally {

      setLoading(false);

    }
  }


  /* ==========================================================
     Render
  ========================================================== */

  return (

    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">

      {/* Header */}

      <div className="space-y-2">

        <h1 className="text-2xl font-bold text-[#082550]">
          Password Management
        </h1>

        <p className="text-sm text-gray-500">
          Search platform users and securely reset their account passwords.
        </p>

      </div>


      {/* User Selection */}

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <h2 className="mb-4 text-lg font-semibold text-[#082550]">
          1. Select Platform User
        </h2>


        <label
          htmlFor="user-search"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Search by name or email
        </label>


        <input
          id="user-search"
          type="text"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setSelectedUserId("");
            setPassword("");
            setConfirmPassword("");
            setSuccessMessage("");
            setErrorMessage("");
          }}
          placeholder="Enter user name or email..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#082550] focus:ring-2 focus:ring-[#082550]/10"
        />


        <div className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-gray-200">

          {filteredUsers.length === 0 ? (

            <div className="p-4 text-sm text-gray-500">
              No matching users found.
            </div>

          ) : (

            filteredUsers.map((user) => (

              <button
                key={user.id}
                type="button"
                onClick={() => handleUserSelect(user.id)}
                className={`flex w-full items-center justify-between gap-4 border-b border-gray-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-[#E9F4F8] ${
                  selectedUserId === user.id
                    ? "bg-[#E9F4F8]"
                    : "bg-white"
                }`}
              >

                <div className="min-w-0">

                  <p className="truncate text-sm font-semibold text-gray-800">
                    {getDisplayName(user)}
                  </p>

                  <p className="truncate text-xs text-gray-500">
                    {user.email}
                  </p>

                </div>


                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    user.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {user.is_active ? "Active" : "Inactive"}
                </span>

              </button>

            ))

          )}

        </div>


        <p className="mt-2 text-xs text-gray-400">
          {filteredUsers.length} of {users.length} platform users
        </p>

      </section>


      {/* Selected User */}

      {selectedUser && (

        <section className="rounded-xl border border-[#B4C2D1] bg-[#E9F4F8] p-6">

          <h2 className="mb-3 text-lg font-semibold text-[#082550]">
            Selected Account
          </h2>


          <div className="space-y-1">

            <p className="text-sm font-semibold text-gray-800">
              {getDisplayName(selectedUser)}
            </p>

            <p className="text-sm text-gray-600">
              {selectedUser.email}
            </p>

            <p className="text-xs text-gray-500">
              Account status: {selectedUser.is_active ? "Active" : "Inactive"}
            </p>

          </div>

        </section>

      )}


      {/* Password Form */}

      {selectedUser && (

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <h2 className="mb-2 text-lg font-semibold text-[#082550]">
            2. Set New Password
          </h2>

          <p className="mb-5 text-sm text-gray-500">
            Enter a new password for the selected account.
            Passwords must contain between 12 and 72 characters.
          </p>


          <div className="space-y-4">

            <div>

              <label
                htmlFor="new-password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                New Password
              </label>

              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Enter new password"
                maxLength={72}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#082550] focus:ring-2 focus:ring-[#082550]/10"
              />

            </div>


            <div>

              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>

              <input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Re-enter new password"
                maxLength={72}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#082550] focus:ring-2 focus:ring-[#082550]/10"
              />

            </div>


            <label className="flex items-center gap-2 text-sm text-gray-600">

              <input
                type="checkbox"
                checked={showPassword}
                onChange={(event) => setShowPassword(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />

              Show password

            </label>


            {password.length > 0 && password.length < 12 && (

              <p className="text-xs text-red-600">
                Password must contain at least 12 characters.
              </p>

            )}


            {confirmPassword.length > 0 &&
              password !== confirmPassword && (

              <p className="text-xs text-red-600">
                Passwords do not match.
              </p>

            )}


            {/* Messages */}

            {successMessage && (

              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                {successMessage}
              </div>

            )}


            {errorMessage && (

              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>

            )}


            {/* Submit */}

            <div className="border-t border-gray-100 pt-5">

              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={
                  loading ||
                  password.length < 12 ||
                  password.length > 72 ||
                  password !== confirmPassword
                }
                className="w-full rounded-lg bg-[#082550] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#123968] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >

                {loading
                  ? "Updating Password..."
                  : "Reset User Password"}

              </button>


              <p className="mt-3 text-xs text-gray-400">
                This action updates the selected user's existing
                authentication account. It does not create or delete
                user accounts.
              </p>

            </div>

          </div>

        </section>

      )}


      {/* Initial State */}

      {!selectedUser && (

        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">

          <p className="text-sm font-medium text-gray-600">
            Select a user to manage their password.
          </p>

          <p className="mt-1 text-xs text-gray-400">
            All platform users are available for selection.
          </p>

        </div>

      )}

    </div>

  );

}
