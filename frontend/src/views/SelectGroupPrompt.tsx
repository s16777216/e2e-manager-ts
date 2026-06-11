import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import { Folder, Plus, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { api } from "../lib/api"

interface ProjectDetailContext {
  selectedGroupId: string
  flatGroups: { id: string; name: string; depth: number }[]
  onTestCaseCreated: () => void
}

export default function SelectGroupPrompt() {
  const { selectedGroupId, flatGroups, onTestCaseCreated } = useOutletContext<ProjectDetailContext>()

  // 新增測試案例彈窗狀態
  const [showNewTestCaseModal, setShowNewTestCaseModal] = useState(false)
  const [tcName, setTcName] = useState("")
  const [tcSteps, setTcSteps] = useState<string[]>([""])
  const [tcExpected, setTcExpected] = useState("")
  const [targetGroupId, setTargetGroupId] = useState("")
  const [isSavingTestCase, setIsSavingTestCase] = useState(false)

  // 當 selectedGroupId 改變時，在 render 階段同步更新 targetGroupId 以符合 react-hooks/set-state-in-effect 規範
  const [prevSelectedGroupId, setPrevSelectedGroupId] = useState(selectedGroupId)
  if (selectedGroupId !== prevSelectedGroupId) {
    setPrevSelectedGroupId(selectedGroupId)
    if (selectedGroupId) {
      setTargetGroupId(selectedGroupId)
    }
  }

  // 處理測試案例步驟增減
  const handleAddStepInput = () => {
    setTcSteps([...tcSteps, ""])
  }

  const handleRemoveStepInput = (index: number) => {
    if (tcSteps.length === 1) return
    const newSteps = [...tcSteps]
    newSteps.splice(index, 1)
    setTcSteps(newSteps)
  }

  const handleStepValueChange = (index: number, val: string) => {
    const newSteps = [...tcSteps]
    newSteps[index] = val
    setTcSteps(newSteps)
  }

  // 儲存新測試案例
  const handleSaveTestCase = async () => {
    if (!targetGroupId) {
      toast.error("請選擇所屬群組！")
      return
    }
    if (!tcName.trim() || tcSteps.some((s) => !s.trim()) || !tcExpected.trim()) {
      toast.error("請填寫所有必填欄位，且步驟不可為空！")
      return
    }

    setIsSavingTestCase(true)
    try {
      await api.createTestcase(targetGroupId, {
        name: tcName.trim(),
        steps: tcSteps.map((s) => s.trim()),
        expected: tcExpected.trim()
      })
      toast.success("測試劇本建立成功！")
      
      // 重置 Form 狀態
      setTcName("")
      setTcSteps([""])
      setTcExpected("")
      setShowNewTestCaseModal(false)

      // 呼叫 parent 的 callback
      onTestCaseCreated()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error("建立測試案例失敗：" + msg)
    } finally {
      setIsSavingTestCase(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-2xl mx-auto text-center gap-6 select-none bg-zinc-900/10 rounded-2xl border border-zinc-850 shadow-2xl">
      <div className="h-16 w-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-md">
        <Folder size={32} />
      </div>
      
      <div className="max-w-md">
        <h3 className="text-xl font-bold text-zinc-200">請選取群組</h3>
        <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
          已成功載入專案！請在左側的群組導航樹狀圖中點選特定**測試案例 (📄)** 開始執行或檢視，或者選定一個群組來建立新的測試案例。
        </p>
      </div>

      <div className="w-full flex flex-col gap-3 text-xs text-zinc-400 text-left border border-zinc-900 bg-zinc-950/40 p-5 rounded-xl">
        <div className="flex items-start gap-2">
          <span className="h-2 w-2 rounded-full bg-primary mt-1.5" />
          <p>請點擊群組名稱旁的 <b>+</b> 來快速建立子群組。</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="h-2 w-2 rounded-full bg-primary mt-1.5" />
          <p>在樹狀導航中選定某個群組後，下方的「建立測試案例」按鈕將會啟用。</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 mt-2">
        <Button
          onClick={() => {
            if (selectedGroupId) {
              setTargetGroupId(selectedGroupId)
            }
            setShowNewTestCaseModal(true)
          }}
          disabled={!selectedGroupId}
          className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-all font-semibold gap-1.5 shadow-lg shadow-zinc-100/5 px-6 py-5 rounded-xl disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed"
        >
          <Plus size={16} /> 建立測試案例
        </Button>
        {!selectedGroupId && (
          <p className="text-xs text-zinc-500 italic">
            * 請先在左側選取一個群組，再建立測試案例。
          </p>
        )}
      </div>

      {/* 2. 新測試案例彈窗 (內嵌) */}
      <Dialog open={showNewTestCaseModal} onOpenChange={setShowNewTestCaseModal}>
        <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>建立全新測試劇本</DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              在選定的群組下建立劇本，並提供以自然語言描述的視覺測試步驟。
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 my-2">
            
            {/* 劇本名稱 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                劇本名稱 <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={tcName}
                onChange={(e) => setTcName(e.target.value)}
                placeholder="例如: Wikipedia 搜尋 Gemini 測試"
                className="bg-zinc-950 border-zinc-800 text-zinc-100"
              />
            </div>

            {/* 所屬群組 Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                所屬群組 <span className="text-red-500">*</span>
              </label>
              <Select value={targetGroupId} onValueChange={setTargetGroupId}>
                <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 text-zinc-300">
                  <SelectValue placeholder="選擇群組" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                  {flatGroups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {"\u00A0\u00A0".repeat(g.depth)} {g.depth > 0 ? "├─ " : ""}{g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 測試步驟 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                測試步驟 (自然語言描述) <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {tcSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="flex items-center justify-center bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 rounded px-2 w-7 font-mono">
                      {idx + 1}
                    </span>
                    <Input
                      type="text"
                      value={step}
                      onChange={(e) => handleStepValueChange(idx, e.target.value)}
                      placeholder="例如: 進入 https://zh.wikipedia.org/"
                      className="flex-1 bg-zinc-950 border-zinc-800 text-zinc-100"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveStepInput(idx)}
                      className="border-zinc-800 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 flex-shrink-0"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddStepInput}
                className="self-start text-[10px] border-zinc-850 mt-1"
              >
                <Plus size={10} /> 新增下一步
              </Button>
            </div>

            {/* 預期結果 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                預期結果 <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={tcExpected}
                onChange={(e) => setTcExpected(e.target.value)}
                placeholder="例如: 成功搜尋到維基百科上的 Gemini 相關資料"
                rows={2}
                className="resize-none bg-zinc-950 border-zinc-800 text-zinc-100"
              />
            </div>

          </div>

          <DialogFooter className="border-t border-zinc-850 pt-3">
            <Button
              variant="outline"
              onClick={() => setShowNewTestCaseModal(false)}
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-950"
            >
              取消
            </Button>
            <Button
              onClick={handleSaveTestCase}
              disabled={isSavingTestCase}
              className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
            >
              {isSavingTestCase ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                "儲存劇本"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
