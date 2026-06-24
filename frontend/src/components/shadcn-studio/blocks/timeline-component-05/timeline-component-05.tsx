import { cn } from "../../../../lib/utils";
import type { ReactNode } from "react";

// ============================================================================
// 1. 組合式外層容器 (TimelineWrapper & Timeline)
// ============================================================================

export interface TimelineWrapperProps {
  title?: string;
  description?: string;
  children?: ReactNode;
}

export const TimelineWrapper = ({
  title,
  description,
  children,
}: TimelineWrapperProps) => {
  return (
    <div className="w-full">
      {(title || description) && (
        <div className="mb-8 space-y-4 text-center md:mb-10 lg:mb-18">
          {title && (
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-muted-foreground text-xl">{description}</p>
          )}
        </div>
      )}
      <div className="flex flex-col">{children}</div>
    </div>
  );
};

export interface TimelineProps {
  title?: string;
  description?: string;
  children?: ReactNode;
}

export const Timeline = ({ title, description, children }: TimelineProps) => {
  return (
    <TimelineWrapper title={title} description={description}>
      {children}
    </TimelineWrapper>
  );
};

// ============================================================================
// 2. 組合式時間節點 (TimelineItem)
// ============================================================================

export interface TimelineItemProps {
  version?: string;
  date?: string;
  children?: ReactNode;
  dot?: ReactNode;
  compact?: boolean;
  isLast?: boolean;
}

export const TimelineItem = ({
  version,
  date,
  children,
  dot,
  compact = false,
  isLast = false,
}: TimelineItemProps) => {
  return (
    <div className={cn(
      "relative flex scroll-mt-18 gap-2",
      compact ? "justify-start" : "justify-end"
    )}>
      {/* 左側資訊 (桌面端顯示) */}
      {!compact && (version || date) && (
        <div className="sticky top-19 flex w-36 flex-col items-end gap-2 self-start pb-4 max-md:hidden text-right">
          {version && (
            <span className="flex items-center justify-center bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded px-2 py-1 font-medium w-fit">
              {version}
            </span>
          )}
          {date && <div className="text-muted-foreground text-xs font-medium">{date}</div>}
        </div>
      )}

      {/* 中間時間軸圓點與垂直軸線 */}
      <div className="flex flex-col items-center">
        <div className={cn(
          "flex size-6 items-center justify-center",
          !compact && "sticky top-19 max-sm:top-5"
        )}>
          {dot ? (
            dot
          ) : (
            <span className="bg-primary/20 flex size-4.5 shrink-0 items-center justify-center rounded-full">
              <span className="bg-primary size-3 rounded-full" />
            </span>
          )}
        </div>
        {!isLast && (
          <span className="-mt-2.5 w-px flex-1 border border-zinc-850" />
        )}
      </div>

      {/* 右側內容 */}
      <div className={cn(
        "flex flex-1 flex-col pl-3 md:pl-6 lg:pl-9",
        compact ? "pb-6" : "pb-11"
      )}>
        {/* 行動端顯示的左側資訊 */}
        {!compact && (version || date) && (
          <div className="flex flex-col gap-2 md:hidden">
            {version && (
              <span className="flex items-center justify-center bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded px-2 py-1 font-medium w-fit">
                {version}
              </span>
            )}
            {date && <div className="font-medium text-xs text-muted-foreground">{date}</div>}
          </div>
        )}

        {children}
      </div>
    </div>
  );
};
