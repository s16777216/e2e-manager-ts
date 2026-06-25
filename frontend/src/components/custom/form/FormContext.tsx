import { createContext } from "react";
import type { UseFormReturn } from "react-hook-form";

export const FormContext = createContext<UseFormReturn | null>(null);
