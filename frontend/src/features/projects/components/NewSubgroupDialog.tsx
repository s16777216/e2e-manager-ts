import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { JsonEditorAccordion } from "../../../components/custom/JsonEditorAccordion";
import type { TestGroup, VariableItem } from "@/types/api";
import { VariablesEditor } from "../../../components/custom/VariablesEditor";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";

interface NewSubgroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId: string | null;
  groupToEdit?: TestGroup | null;
  onCreateGroup: (
    name: string,
    parentId: string | null,
    initCookies?: unknown,
    initLocalStorage?: unknown,
    variables?: Record<string, VariableItem>,
  ) => Promise<unknown>;
  onUpdateGroup?: (
    name: string,
    initCookies?: unknown,
    initLocalStorage?: unknown,
    variables?: Record<string, VariableItem>,
  ) => Promise<unknown>;
}

export function NewSubgroupDialog({
  open,
  onOpenChange,
  parentId,
  groupToEdit = null,
  onCreateGroup,
  onUpdateGroup,
}: NewSubgroupDialogProps) {
  const [name, setName] = useState(groupToEdit ? groupToEdit.name : "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initCookies, setInitCookies] = useState<unknown>(
    groupToEdit ? groupToEdit.initCookies : null,
  );
  const [initLocalStorage, setInitLocalStorage] = useState<unknown>(
    groupToEdit ? groupToEdit.initLocalStorage : null,
  );
  const [variables, setVariables] = useState<Record<string, VariableItem>>(
    groupToEdit?.variables || {},
  );
  const [isJsonValid, setIsJsonValid] = useState(true);

  const handleSubmit = async () => {
    if (!name.trim() || !isJsonValid) return;
    setIsSubmitting(true);
    try {
      if (groupToEdit) {
        if (onUpdateGroup) {
          await onUpdateGroup(
            name.trim(),
            initCookies,
            initLocalStorage,
            variables,
          );
        }
      } else {
        await onCreateGroup(
          name.trim(),
          parentId,
          initCookies,
          initLocalStorage,
          variables,
        );
      }
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dialogTitle = groupToEdit
    ? "編輯群組"
    : parentId
      ? "新增子群組"
      : "新增根群組";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg overflow-y-auto bg-zinc-950 border-zinc-900 text-zinc-100 p-6 flex flex-col justify-between"
      >
        <div className="flex flex-col gap-6">
          <SheetHeader className="text-left">
            <SheetTitle>{dialogTitle}</SheetTitle>
            <SheetDescription className="text-zinc-400 text-xs">
              {groupToEdit
                ? "修改群組設定，這些設定會套用到此群組及其子群組底下的所有測試案例。"
                : "在當前位置新增一個子群組，用來分類管理測試案例。"}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-5 py-2">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="newSubgroupName"
                className="text-xs font-bold text-zinc-400 uppercase tracking-wider"
              >
                群組名稱 <span className="text-red-500">*</span>
              </label>
              <Input
                id="newSubgroupName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如: 帳戶中心"
                className="bg-zinc-950 border-zinc-850 text-zinc-100"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                autoFocus
              />
            </div>

            <JsonEditorAccordion
              key={groupToEdit ? `edit-${groupToEdit.id}` : "new-group"}
              initCookies={groupToEdit?.initCookies}
              initLocalStorage={groupToEdit?.initLocalStorage}
              onChange={({ cookies, localStorage, isValid }) => {
                setInitCookies(cookies);
                setInitLocalStorage(localStorage);
                setIsJsonValid(isValid);
              }}
            />

            <VariablesEditor variables={variables} onChange={setVariables} />
          </div>
        </div>

        <SheetFooter className="border-t border-zinc-900/60 pt-4 flex sm:justify-end gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-900"
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim() || !isJsonValid}
            className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-semibold"
          >
            {isSubmitting ? "儲存中..." : "儲存設定"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
