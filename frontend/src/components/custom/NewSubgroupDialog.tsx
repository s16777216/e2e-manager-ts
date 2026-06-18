import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { JsonEditorAccordion } from "./JsonEditorAccordion"
import type { TestGroup } from "@/types/api"
import { BaseDialog } from "./BaseDialog"

interface NewSubgroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parentId: string | null
  groupToEdit?: TestGroup | null
  onCreateGroup: (name: string, parentId: string | null, initCookies?: unknown, initLocalStorage?: unknown) => Promise<unknown>
  onUpdateGroup?: (name: string, initCookies?: unknown, initLocalStorage?: unknown) => Promise<unknown>
}

export function NewSubgroupDialog({
  open,
  onOpenChange,
  parentId,
  groupToEdit = null,
  onCreateGroup,
  onUpdateGroup,
}: NewSubgroupDialogProps) {
  const [name, setName] = useState(groupToEdit ? groupToEdit.name : "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initCookies, setInitCookies] = useState<unknown>(groupToEdit ? groupToEdit.initCookies : null)
  const [initLocalStorage, setInitLocalStorage] = useState<unknown>(groupToEdit ? groupToEdit.initLocalStorage : null)
  const [isJsonValid, setIsJsonValid] = useState(true)

  const handleSubmit = async () => {
    if (!name.trim() || !isJsonValid) return
    setIsSubmitting(true)
    try {
      if (groupToEdit) {
        if (onUpdateGroup) {
          await onUpdateGroup(name.trim(), initCookies, initLocalStorage)
        }
      } else {
        await onCreateGroup(name.trim(), parentId, initCookies, initLocalStorage)
      }
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const dialogTitle = groupToEdit ? "編輯群組" : parentId ? "新增子群組" : "新增根群組";

  const dialogFooter = (
    <div className="flex justify-end gap-2 w-full">
      <Button
        variant="outline"
        onClick={() => onOpenChange(false)}
        className="border-zinc-800 text-zinc-300 hover:bg-zinc-950"
      >
        取消
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !name.trim() || !isJsonValid}
        className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-semibold"
      >
        {isSubmitting ? "儲存中..." : "確定"}
      </Button>
    </div>
  );

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={dialogTitle}
      footer={dialogFooter}
      className="max-w-[425px]"
      height="auto"
    >
      <div className="flex flex-col gap-4 py-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="newSubgroupName" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            群組名稱
          </label>
          <Input
            id="newSubgroupName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如: 帳戶中心"
            className="bg-zinc-950 border-zinc-800 text-zinc-100"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        <JsonEditorAccordion
          key={groupToEdit ? `edit-${groupToEdit.id}` : "new-group"}
          initCookies={groupToEdit?.initCookies}
          initLocalStorage={groupToEdit?.initLocalStorage}
          onChange={({ cookies, localStorage, isValid }) => {
            setInitCookies(cookies)
            setInitLocalStorage(localStorage)
            setIsJsonValid(isValid)
          }}
        />
      </div>
    </BaseDialog>
  )
}

