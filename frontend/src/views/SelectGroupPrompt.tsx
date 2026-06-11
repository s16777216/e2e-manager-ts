import { Folder } from "lucide-react"

export default function SelectGroupPrompt() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 max-w-lg mx-auto text-center gap-4">
      <div className="h-16 w-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
        <Folder size={32} />
      </div>
      <div>
        <h3 className="text-base font-bold text-foreground">請選取群組</h3>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
          已成功載入專案！請在左側的群組導航樹狀圖中點選特定群組，或點擊樹狀目錄頂端的 + 按鈕來新增根群組。
        </p>
      </div>
    </div>
  )
}
