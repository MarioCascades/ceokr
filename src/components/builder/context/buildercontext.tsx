"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

type BuilderContextType = {
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;

  activeSheet: string;
  setActiveSheet: React.Dispatch<React.SetStateAction<string>>;
};

const BuilderContext = createContext<BuilderContextType | undefined>(
  undefined
);

export function BuilderProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [editMode, setEditMode] = useState(false);

  const [activeSheet, setActiveSheet] =
    useState("dashboard");

  return (
    <BuilderContext.Provider
      value={{
        editMode,
        setEditMode,
        activeSheet,
        setActiveSheet,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const context = useContext(BuilderContext);

  if (!context) {
    throw new Error(
      "useBuilder must be used inside BuilderProvider."
    );
  }

  return context;
}