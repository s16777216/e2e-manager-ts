import { Input } from "@/components/ui/input";
import { useRef } from "react";

export type NumberRange = [number | undefined, number | undefined];

export interface NumberRangeFilterProps {
  value?: NumberRange;
  onChange?: (value: NumberRange) => void;
  onSubmit?: (value: NumberRange) => void;
}

const numberRegex = /^[0-9]+$/;

export default function NumberRangeFilter({
  value = [undefined, undefined],
  onChange,
  onSubmit,
}: NumberRangeFilterProps) {
  const inputMaxRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-row gap-1">
      <style>
        {`
          input.no-spin-button::-webkit-outer-spin-button,
          input.no-spin-button::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }

          input.no-spin-button {
            -moz-appearance: textfield;
          }`}
      </style>
      <Input
        type="number"
        placeholder="最小值"
        className="w-full no-spin-button"
        value={value[0]}
        onChange={(event) => {
          onChange?.([Number(event.target.value), value[1]]);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            inputMaxRef.current?.focus();
          }
        }}
      />
      <Input
        ref={inputMaxRef}
        placeholder="最大值"
        className="w-full no-spin-button"
        value={value[1]}
        onChange={(event) => {
          const input = event.target.value;
          if (!numberRegex.test(input) && input !== "") {
            return;
          }

          onChange?.([value[0], Number(input)]);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onSubmit?.(value);
          }
        }}
      />
    </div>
  );
}
