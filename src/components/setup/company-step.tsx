"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  company_name: z.string().min(2, "Company name is required"),
  timezone: z.string().min(1, "Timezone is required"),
  reporting_frequency: z.string().min(1, "Reporting frequency is required"),
  
});

type FormValues = z.infer<typeof schema>;

export default function CompanyStep() {
    const [isSaved, setIsSaved] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company_name: "",
      timezone: "UTC",
      reporting_frequency: "monthly",
    
    },
  });

const onSubmit = async (values: FormValues) => {
  const { error } = await supabase
    .from("organization")
    .insert({
      company_name: values.company_name,
      timezone: values.timezone,
      reporting_frequency: values.reporting_frequency,
    
    });

  if (error) {
    console.error("Supabase Error:", error);
    alert("Failed to save organization.");
    return;
  }

 setIsSaved(true);


};

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium mb-2">
          Company Name
        </label>

        <Input
          {...form.register("company_name")}
          placeholder="Enter company name"
        />

        <p className="text-sm text-red-500 mt-1">
          {form.formState.errors.company_name?.message}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Timezone
        </label>

        <Input
          {...form.register("timezone")}
          placeholder="UTC"
        />

        <p className="text-sm text-red-500 mt-1">
          {form.formState.errors.timezone?.message}
        </p>
      </div>

      <div>
  <label className="block text-sm font-medium mb-2">
    Reporting Frequency
  </label>

  <Select
    defaultValue="monthly"
    onValueChange={(value) =>
      form.setValue("reporting_frequency", value)
    }
  >
    <SelectTrigger>
      <SelectValue placeholder="Select frequency" />
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="weekly">
        Weekly
      </SelectItem>

      <SelectItem value="monthly">
        Monthly
      </SelectItem>

      <SelectItem value="quarterly">
        Quarterly
      </SelectItem>
    </SelectContent>
  </Select>

  <p className="text-sm text-red-500 mt-1">
    {form.formState.errors.reporting_frequency?.message}
  </p>
</div>
      



    <div className="space-y-4">

  <Button type="submit">
    Save Organization
  </Button>

  {isSaved && (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
      <p className="text-green-700 font-medium">
        ✓ Organization saved successfully.
      </p>

      <p className="mt-1 text-sm text-green-600">
        You can now continue to the Administration Console.
      </p>

      <Button asChild className="mt-4">
        <Link href="/admin">
          Go to Administration
        </Link>
      </Button>
    </div>
  )}

</div>
    </form>
  );
}