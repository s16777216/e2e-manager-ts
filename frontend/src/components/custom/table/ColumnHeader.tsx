import { type Column } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AArrowDown, AArrowUp, ArrowUpDown, Filter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Typography from "../Typography";
import StringFilter from "./StringFilter";
import NumberRangeFilter, { type NumberRange } from "./NumberRangeFilter";
import { Field, FieldDescription } from "@/components/ui/field";
import { XIcon } from "@/components/icon/x";
import { CornerDownLeftIcon } from "@/components/ui/corner-down-left";

export interface DataTableColumnHeaderProps<
  TData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  customFilter?: (context: CustomFilterContext) => React.ReactNode;
}

export interface CustomFilterContext {
  filterValue: unknown;
  setFilterValue: (value: unknown) => void;
  setPopOverOpen: (value: boolean) => void;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  customFilter,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const [filterValue, setFilterValue] = useState<unknown>(
    column.getFilterValue(),
  );

  const [popOverOpen, setPopOverOpen] = useState<boolean>(false);

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const handleSortClick = () => {
    column.toggleSorting();
  };

  const handlePopOverChange = (open: boolean) => {
    setPopOverOpen(open);
    if (open) {
      // 打開時，重新同步 React Table 當前真正生效的值到暫存區
      setFilterValue(column.getFilterValue());
    }
  };

  const handleFilterReset = () => {
    setFilterValue(undefined);
    column.setFilterValue(undefined);
    setPopOverOpen(false);
  };

  const handleFilterSubmit = () => {
    column.setFilterValue(filterValue);
    setPopOverOpen(false);
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span>{title}</span>
      <div className="ml-auto flex items-center">
        {column.getCanSort() && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full h-fit w-fit p-1"
                onClick={handleSortClick}
              >
                {column.getIsSorted() === "desc" ? (
                  <AArrowDown />
                ) : column.getIsSorted() === "asc" ? (
                  <AArrowUp />
                ) : (
                  <ArrowUpDown />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <Typography type="small">排序</Typography>
            </TooltipContent>
          </Tooltip>
        )}
        {column.getCanFilter() && (
          <>
            <Popover open={popOverOpen} onOpenChange={handlePopOverChange}>
              <PopoverTrigger>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`rounded-full h-fit w-fit p-1 ${column.getIsFiltered() ? "text-orange-500" : ""}`}
                    >
                      <Filter />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <Typography type="small">篩選</Typography>
                  </TooltipContent>
                </Tooltip>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-50 flex flex-row gap-1 items-center justify-center"
              >
                <Field>
                  {customFilter ? (
                    customFilter({
                      filterValue,
                      setFilterValue,
                      setPopOverOpen,
                    })
                  ) : (
                    <FilterField
                      filterFn={column.columnDef.filterFn as string}
                      value={filterValue as TValue}
                      onChange={(value) => setFilterValue(value as TValue)}
                      onSubmit={() => setPopOverOpen(false)}
                    />
                  )}
                  <FieldDescription className="flex flex-row justify-end gap-1">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={handleFilterReset}
                    >
                      <XIcon />
                      清除
                    </Button>
                    <Button size="xs" onClick={handleFilterSubmit}>
                      <CornerDownLeftIcon />
                      提交
                    </Button>
                  </FieldDescription>
                </Field>
              </PopoverContent>
            </Popover>
          </>
        )}
      </div>
    </div>
  );
}

interface FilterFieldProps {
  filterFn?: string;
  value?: unknown;
  onChange?: (value?: unknown) => void;
  onSubmit?: (value?: unknown) => void;
}

function FilterField({
  filterFn,
  value,
  onChange,
  onSubmit,
}: FilterFieldProps) {
  if (filterFn === "inNumberRange") {
    return (
      <NumberRangeFilter
        value={value as NumberRange}
        onChange={onChange}
        onSubmit={onSubmit}
      />
    );
  }
  return (
    <StringFilter
      value={value as string}
      onChange={onChange}
      onSubmit={onSubmit}
    />
  );
}
