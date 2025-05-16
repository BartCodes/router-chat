"use client";

import { Dispatch, SetStateAction } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_MODELS } from "@/lib/constants";

interface ModelSelectorProps {
  currentModelId: string;
  setCurrentModelId: Dispatch<SetStateAction<string>>;
}

export function ModelSelector({ 
  currentModelId, 
  setCurrentModelId 
}: ModelSelectorProps) {
  return (
    <Select
      value={currentModelId}
      onValueChange={setCurrentModelId}
    >
      <SelectTrigger className="w-[200px] bg-content2 border-default-200 hover:cursor-pointer">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {SUPPORTED_MODELS.map((model) => (
            <SelectItem 
              key={model.id} 
              value={model.id}
              className="hover:cursor-pointer"
            >
              {model.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
} 