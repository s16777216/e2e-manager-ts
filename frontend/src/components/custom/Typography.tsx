import { cn } from "@/lib/utils";
import type { ClassValue } from "clsx";
import { createElement } from "react";

type TypographyType =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "p"
  | "blockquote"
  | "inlineCode"
  | "lead"
  | "large"
  | "small"
  | "muted";

const map: {
  [key in TypographyType]: {
    className: string;
    tag: string;
  };
} = {
  h1: {
    className:
      "scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance",
    tag: "h1",
  },
  h2: {
    className:
      "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
    tag: "h2",
  },
  h3: {
    className: "scroll-m-20 text-2xl font-semibold tracking-tight",
    tag: "h3",
  },
  h4: {
    className: "scroll-m-20 text-xl font-semibold tracking-tight",
    tag: "h4",
  },
  p: {
    className: "leading-7 [&:not(:first-child)]:mt-6",
    tag: "p",
  },
  blockquote: {
    className: "mt-6 border-l-2 pl-6 italic",
    tag: "blockquote",
  },
  inlineCode: {
    className: "rounded bg-muted px-2 py-0.5 text-sm font-mono",
    tag: "code",
  },
  lead: {
    className: "text-xl text-muted-foreground",
    tag: "p",
  },
  large: {
    className: "text-lg font-semibold",
    tag: "div",
  },
  small: {
    className: "text-sm leading-none font-medium",
    tag: "small",
  },
  muted: {
    className: "text-sm text-muted-foreground",
    tag: "p",
  },
};

interface TypographyProps {
  children: React.ReactNode;
  className?: ClassValue;
  type: TypographyType;
}

export default function Typography(props: TypographyProps) {
  const { children, className, type } = props;
  const info = map[type];
  const _className = cn(info.className, className);

  return createElement(
    info.tag,
    {
      className: _className,
    },
    children,
  );
}
