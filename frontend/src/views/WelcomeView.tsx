import { FolderOpen } from "lucide-react"

export default function WelcomeView() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 max-w-lg mx-auto text-center gap-4">
      <div className="h-16 w-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
        <FolderOpen size={32} />
      </div>
      <div>
        <h3 className="text-base font-bold text-foreground">歡迎使用 Antigravity E2E</h3>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
          請在左側下拉選單中選擇一個測試專案，或點擊右側的按鈕建立全新專案，以開始進行群組劇本管理。
        </p>
      </div>
    </div>
  )
}
