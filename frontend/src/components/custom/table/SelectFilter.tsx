import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CustomFilterContext } from "./ColumnHeader";

interface SelectFilterProps {
  context: CustomFilterContext;
  items: {
    label?: string;
    value: string;
  }[];
}

export default function SelectFilter(props: SelectFilterProps) {
  const { context, items } = props;

  return (
    <Select
      value={context.filterValue as string}
      onValueChange={(value) => {
        context.setFilterValue(value);
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="選擇..." />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label || item.value}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
