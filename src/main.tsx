import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import type { components } from "src-code/types";
import { dispatchTS } from "./utils/utils";

export const App = () => {
  const [selectedComponent, setSelectedComponent] =
    useState<components>("button");

  const onClickCreate = () => {
    dispatchTS("createComponent", {
      component: selectedComponent,
    });
  };

  const onClickClose = () => {
    dispatchTS("closePlugin", {});
  };

  return (
    <>
      <div className=" flex flex-col gap-4 justify-center items-center w-full h-full">
        <h1 className="text-xl font-medium">Select Component</h1>
        <Select
          onValueChange={(value: components) => setSelectedComponent(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="select" />
          </SelectTrigger>
          <SelectContent>
            {[
              "button",
              "checkbox",
              "radio",
              "input",
              "textarea",
              "accordion",
            ].map((component) => (
              <SelectItem key={component} value={component}>
                {component}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-row gap-4">
          <Button onClick={onClickCreate} size={"sm"}>
            Create
          </Button>
          <Button variant={"destructive"} size={"sm"} onClick={onClickClose}>
            Close
          </Button>
        </div>
      </div>
    </>
  );
};
