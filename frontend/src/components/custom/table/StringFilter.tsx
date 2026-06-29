import { Input } from "@/components/ui/input";

export interface StringFilterProps {
  value?: string;
  onChange?: (value?: string) => void;
  onSubmit?: (value?: string) => void;
}

export default function StringFilter({
  value,
  onChange,
  onSubmit,
}: StringFilterProps) {
  return (
    <Input
      placeholder="查詢..."
      className="w-full"
      value={value}
      onChange={(event) => {
        onChange?.(event.target.value);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          onSubmit?.(value);
        }
      }}
    />
  );
}
