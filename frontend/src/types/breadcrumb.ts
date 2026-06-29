import type { IconName } from "lucide-react/dynamic";
import type { ReactNode } from "react";
import type { Params } from "react-router-dom";

export interface Crumb {
  label: string;
  to?: string;
  icon?: IconName;
  iconNode?: ReactNode;
}

export interface RouteHandle<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends (...args: any[]) => any = (...args: any[]) => any,
> {
  label?:
    | string
    | ((data: Awaited<ReturnType<T>>, params: Params<string>) => string);
  icon?: IconName;
  iconNode?: ReactNode;
  to?: string | ((params: Params<string>) => string);
}

export function isRouteHandle(handle: unknown): handle is RouteHandle {
  return (
    typeof handle === "object" &&
    handle !== null &&
    ("label" in handle || "icon" in handle || "iconNode" in handle)
  );
}
