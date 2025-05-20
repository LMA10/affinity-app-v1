"use client"

import React, { createContext, useContext, useState } from "react";

export type IocType = string;
export type IocValue = string;

interface WorkbenchContextType {
  selectedIocs: { type: IocType; value: IocValue }[];
  setSelectedIocs: (iocs: { type: IocType; value: IocValue }[]) => void;
  queryString: string;
  setQueryString: (query: string) => void;
}

const WorkbenchContext = createContext<WorkbenchContextType | undefined>(undefined);

export const WorkbenchProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedIocs, setSelectedIocs] = useState<{ type: IocType; value: IocValue }[]>([]);
  const [queryString, setQueryString] = useState("");

  return (
    <WorkbenchContext.Provider value={{ selectedIocs, setSelectedIocs, queryString, setQueryString }}>
      {children}
    </WorkbenchContext.Provider>
  );
};

export function useWorkbench() {
  const ctx = useContext(WorkbenchContext);
  if (!ctx) throw new Error("useWorkbench must be used within a WorkbenchProvider");
  return ctx;
} 