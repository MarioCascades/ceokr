"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavigationTabsProps = {
  id: string;
  name: string;
  active: boolean;
  editMode: boolean;
  system?: boolean;
  onClick: () => void;
  onRename: () => void;
  onDelete: () => void;
};

export default function NavigationTabs({
  name,
  active,
  editMode,
  system = false,
  onClick,
  onRename,
  onDelete,
}: NavigationTabsProps) {
  return (
    <div className="flex items-center gap-1">
      {/* Tab */}

      <Button
        variant={active ? "default" : "outline"}
        onClick={onClick}
        className={`rounded-md ${
          active
            ? "bg-orange-500 hover:bg-orange-600"
            : "border-orange-500 text-orange-500 hover:bg-orange-50"
        }`}
      >
        {name}
      </Button>

      {/* Edit Menu */}

      {editMode && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={onRename}>
              Rename
            </DropdownMenuItem>

            {!system && (
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600 focus:text-red-600"
              >
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}