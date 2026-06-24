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
  version: string;
  date: string;
  children?: ReactNode;
}

export const TimelineItem = ({
  version,
  date,
  children,
}: TimelineItemProps) => {
  return (
    <div className="relative flex scroll-mt-18 justify-end gap-2">
      {/* 左側資訊 (桌面端顯示) */}
      <div className="sticky top-19 flex w-36 flex-col items-end gap-2 self-start pb-4 max-md:hidden text-right">
        <span className="flex items-center justify-center bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded px-2 py-1 font-medium w-fit">
          {version}
        </span>
        <div className="text-muted-foreground text-xs font-medium">{date}</div>
      </div>

      {/* 中間時間軸圓點與垂直軸線 */}
      <div className="flex flex-col items-center">
        <div className="sticky top-19 flex size-6 items-center justify-center max-sm:top-5">
          <span className="bg-primary/20 flex size-4.5 shrink-0 items-center justify-center rounded-full">
            <span className="bg-primary size-3 rounded-full" />
          </span>
        </div>
        <span className="-mt-2.5 w-px flex-1 border border-zinc-850" />
      </div>

      {/* 右側詳細內容區域 (直接渲染自訂元件 children) */}
      <div className="flex flex-1 flex-col gap-4 pb-11 pl-3 md:pl-6 lg:pl-9">
        {/* 行動端顯示的左側資訊 */}
        <div className="flex flex-col gap-2 md:hidden">
          <span className="flex items-center justify-center bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded px-2 py-1 font-medium w-fit">
            {version}
          </span>
          <div className="font-medium text-xs text-muted-foreground">{date}</div>
        </div>

        {children}
      </div>
    </div>
  );
};
