import { FormBlock } from "@/components/custom/form";
import { VariablesEditor } from "../../../components/custom/VariablesEditor";
import type { VariableItem } from "@/types/api";
import Typography from "@/components/custom/Typography";

interface ProjectFormVariableBlockProps {
  variables: Record<string, VariableItem>;
  onChange: (variables: Record<string, VariableItem>) => void;
}

export default function ProjectFormVariableBlock({
  variables,
  onChange,
}: ProjectFormVariableBlockProps) {
  const handleVariableChange = (variables: Record<string, VariableItem>) => {
    onChange(variables);
  };

  return (
    <FormBlock
      label="環境變數"
      description={
        <>
          設定專案級環境變數，這些變數將會在該專案下的所有測試案例執行時自動替換。
          子層同名變數將會覆蓋父層。使用格式：在步驟、Storage 或預期結果中輸入{" "}
          <Typography type="inlineCode" className="text-emerald-400">
            {"{{變數名稱}}"}
          </Typography>{" "}
          即可進行替換。
        </>
      }
      showSubmitButton={false}
    >
      <VariablesEditor variables={variables} onChange={handleVariableChange} />
    </FormBlock>
  );
}
