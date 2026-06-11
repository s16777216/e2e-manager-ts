import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface NewSubgroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parentId: string | null
  onCreateGroup: (name: string, parentId: string | null) => Promise<any>
}

export function NewSubgroupDialog({ open, onOpenChange, parentId, onCreateGroup }: NewSubgroupDialogProps) {
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) return
    setIsSubmitting(true)
    try {
      await onCreateGroup(name, parentId)
      setName("")
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {parentId ? "新增子群組" : "新增根群組"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="newSubgroupName" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">群組名稱</label>
            <Input
              id="newSubgroupName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如: 帳戶中心"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "建立中..." : "確定建立"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
