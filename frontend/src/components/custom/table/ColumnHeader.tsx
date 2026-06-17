import { type Column } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronsUpDownIcon,
} from "@/components/icon";

interface DataTableColumnHeaderProps<
  TData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const onHeaderClick = () => {
    column.toggleSorting();
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={() => onHeaderClick()}
      >
        <span>{title}</span>
        {column.getIsSorted() === "desc" ? (
          <ArrowDownIcon />
        ) : column.getIsSorted() === "asc" ? (
          <ArrowUpIcon />
        ) : (
          <ChevronsUpDownIcon />
        )}
      </Button>
    </div>
  );
}
