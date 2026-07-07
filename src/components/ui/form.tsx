"use client";

import {
  Controller,
  FormProvider,
  useFormContext,
} from "react-hook-form";

export const Form = FormProvider;

export function FormField({
  control,
  name,
  render,
}: {
  control: any;
  name: string;
  render: any;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={render}
    />
  );
}

export function FormItem({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      {children}
    </div>
  );
}

export function FormLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <label className="text-sm font-medium">
      {children}
    </label>
  );
}

export function FormControl({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

export function FormMessage() {
  const {
    formState: { errors },
  } = useFormContext();

  const firstError = Object.values(errors)[0];

  if (!firstError) return null;

  return (
    <p className="text-sm text-red-500">
      {(firstError as any)?.message}
    </p>
  );
}