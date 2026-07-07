"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";

export default function DepartmentsStep() {
  const [departmentName, setDepartmentName] = useState("");
  const [departments, setDepartments] = useState<
  { id: string; name: string }[]
>([]);

const [organizationId, setOrganizationId] =
  useState<string | null>(null);

  const loadOrganization = async () => {
  const { data, error } = await supabase
    .from("organization")
    .select("id")
    .limit(1)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  setOrganizationId(data.id);
};

const loadDepartments = async () => {
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .order("name");

  if (error) {
    console.error(error);
    return;
  }

  setDepartments(data || []);
};

       


useEffect(() => {
  loadDepartments();
}, []);


const addDepartment = async () => {
  if (!departmentName.trim()) return;

  if (!organizationId) {
    alert("Organization not loaded");
    return;
  }

  const { error } = await supabase
    .from("departments")
    .insert({
      organization_id: organizationId,
      name: departmentName,
    });

  if (error) {
    console.error(error);
    alert("Failed to save department");
    return;
  }

  setDepartmentName("");

  await loadDepartments();
};

const deleteDepartment = async (
  departmentId: string
) => {
  const { error } = await supabase
    .from("departments")
    .delete()
    .eq("id", departmentId);

  if (error) {
    console.error(error);
    alert("Failed to delete department");
    return;
  }

  await loadDepartments();
};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">
          Departments
        </h2>

        <p className="text-muted-foreground">
          Create your organization's departments.
        </p>
      </div>

      <Input
        value={departmentName}
        onChange={(e) =>
          setDepartmentName(e.target.value)
        }
        placeholder="Department Name"
      />

      <Button onClick={addDepartment}>
        Add Department
      </Button>

      <div className="space-y-2">
   {departments.map((department) => (
  <div
    key={department.id}
    className="flex items-center justify-between border rounded-md p-3"
  >
    <span>{department.name}</span>

    <Button
      variant="destructive"
      size="sm"
      onClick={() =>
        deleteDepartment(department.id)
      }
    >
      Delete
    </Button>
  </div>
))}
   
      </div>
    </div>
  );
}