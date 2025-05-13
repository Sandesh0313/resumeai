import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { JobSelectProps, jobRoleOptions } from "@/lib/types";

export function JobSelect({ selectedRole, onRoleSelect }: JobSelectProps) {
  const handleRoleChange = (value: string) => {
    onRoleSelect(value);
  };

  return (
    <div className="mb-6">
      <Label htmlFor="job-role" className="block text-sm font-medium text-gray-700 mb-2">
        Select Job Role (Optional)
      </Label>
      <Select value={selectedRole} onValueChange={handleRoleChange}>
        <SelectTrigger id="job-role" className="w-full">
          <SelectValue placeholder="General Resume Evaluation" />
        </SelectTrigger>
        <SelectContent>
          {jobRoleOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
