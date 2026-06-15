interface SidebarContainerProps {
  header?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export default function SidebarContainer(props: SidebarContainerProps) {
  const { header, children, footer } = props;
  return (
    <aside className="w-64 border-r bg-card flex flex-col justify-between flex-shrink-0 select-none">
      {header}

      {/* 導航內容與選單 */}
      <div className="flex flex-col flex-1 overflow-hidden p-4 gap-6">
        {/* 導航選單 */}
        <nav className="flex flex-col gap-1.5">{children}</nav>
      </div>

      {/* 側邊欄底部 */}
      {footer && (
        <div className="p-4 border-t bg-zinc-950/40 flex items-center justify-between">
          {footer}
        </div>
      )}
    </aside>
  );
}
