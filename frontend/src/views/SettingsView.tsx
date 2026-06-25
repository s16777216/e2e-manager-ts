import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Trash2, ShieldAlert, Monitor, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { BaseDialog } from "@/components/custom/BaseDialog";

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface OutletContextType {
  setBreadcrumbs: (crumbs: BreadcrumbItem[]) => void;
}

export default function SettingsView() {
  const { setBreadcrumbs } = useOutletContext<OutletContextType>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

  // Settings state
  const [headless, setHeadless] = useState(true);
  const [viewportWidth, setViewportWidth] = useState(1280);
  const [viewportHeight, setViewportHeight] = useState(800);
  const [slowMo, setSlowMo] = useState(0);
  const [defaultTimeout, setDefaultTimeout] = useState(10000);

  useEffect(() => {
    setBreadcrumbs([{ label: "系統設定" }]);
    fetchSettings();
    return () => setBreadcrumbs([]);
  }, [setBreadcrumbs]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("無法載入設定");
      const data = await res.json();
      setHeadless(data.headless);
      setViewportWidth(data.viewportWidth);
      setViewportHeight(data.viewportHeight);
      setSlowMo(data.slowMo);
      setDefaultTimeout(data.defaultTimeout);
    } catch (err: any) {
      toast.error(err.message || "載入設定失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headless,
          viewportWidth: Number(viewportWidth),
          viewportHeight: Number(viewportHeight),
          slowMo: Number(slowMo),
          defaultTimeout: Number(defaultTimeout),
        }),
      });
      if (!res.ok) throw new Error("無法儲存設定");
      toast.success("設定儲存成功");
    } catch (err: any) {
      toast.error(err.message || "儲存設定失敗");
    } finally {
      setSaving(false);
    }
  };

  const handleClearHistory = async () => {
    setClearing(true);
    try {
      const res = await fetch("/api/settings/history", { method: "DELETE" });
      if (!res.ok) throw new Error("無法清除歷史紀錄");
      toast.success("歷史紀錄已成功清除");
      setShowClearDialog(false);
    } catch (err: any) {
      toast.error(err.message || "清除歷史紀錄失敗");
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950 text-zinc-400">
        <Loader2 className="animate-spin mr-2" size={20} />
        載入全域設定中...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 text-zinc-100 p-8 overflow-y-auto select-none">
      <h1 className="text-2xl font-bold tracking-tight mb-8">系統全域設定</h1>
      
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        {/* Bento Card 1: 瀏覽器執行參數 */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:border-zinc-700/60 transition-all duration-300 backdrop-blur-sm shadow-xl">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
                <Settings2 size={18} />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">瀏覽器執行參數</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="headless-switch" className="text-sm font-medium">Headless 無頭模式</Label>
                  <p className="text-xs text-zinc-500">啟用時會在背景默默執行，停用時會彈出實體 Chrome 視窗</p>
                </div>
                <Switch
                  id="headless-switch"
                  checked={headless}
                  onCheckedChange={setHeadless}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slowmo-input" className="text-sm font-medium">SlowMo 動作延遲 (毫秒)</Label>
                <Input
                  id="slowmo-input"
                  type="number"
                  min={0}
                  max={3000}
                  value={slowMo}
                  onChange={(e) => setSlowMo(Number(e.target.value))}
                  placeholder="每個步驟之間的延遲毫秒數"
                  className="bg-zinc-950 border-zinc-800 focus:border-zinc-700 focus:ring-zinc-700/20"
                />
                <p className="text-xs text-zinc-500">限制上限 3000ms，以防測試超時</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeout-input" className="text-sm font-medium">預設等待超時 (毫秒)</Label>
                <Input
                  id="timeout-input"
                  type="number"
                  min={1000}
                  value={defaultTimeout}
                  onChange={(e) => setDefaultTimeout(Number(e.target.value))}
                  placeholder="Playwright 操作等待超時"
                  className="bg-zinc-950 border-zinc-800 focus:border-zinc-700 focus:ring-zinc-700/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bento Card 2: 瀏覽器 Viewport 尺寸 */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:border-zinc-700/60 transition-all duration-300 backdrop-blur-sm shadow-xl">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
                <Monitor size={18} />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">瀏覽器 Viewport 尺寸</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="width-input" className="text-sm font-medium">視窗寬度 (Width)</Label>
                <Input
                  id="width-input"
                  type="number"
                  min={320}
                  max={3840}
                  value={viewportWidth}
                  onChange={(e) => setViewportWidth(Number(e.target.value))}
                  placeholder="例如 1280"
                  className="bg-zinc-950 border-zinc-800 focus:border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height-input" className="text-sm font-medium">視窗高度 (Height)</Label>
                <Input
                  id="height-input"
                  type="number"
                  min={240}
                  max={2160}
                  value={viewportHeight}
                  onChange={(e) => setViewportHeight(Number(e.target.value))}
                  placeholder="例如 800"
                  className="bg-zinc-950 border-zinc-800 focus:border-zinc-700"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Button
              id="save-settings-btn"
              type="submit"
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-500 text-zinc-100 gap-2 cursor-pointer shadow-lg shadow-emerald-600/10"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              儲存設定
            </Button>
          </div>
        </div>

        {/* Bento Card 3: 危險區域 */}
        <div className="bg-red-950/10 border border-red-900/30 hover:border-red-900/50 transition-all duration-300 rounded-xl p-6 md:col-span-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 backdrop-blur-sm">
          <div className="flex gap-4">
            <div className="p-3 rounded-lg bg-red-950/40 text-red-400 flex-shrink-0">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-red-200 tracking-tight">危險區域</h2>
              <p className="text-sm text-zinc-400 mt-1 max-w-xl">
                一鍵清除資料庫中的所有測試執行歷史、步驟截圖與日誌。
                此操作不可逆，將會徹底釋放資料庫儲存空間。
              </p>
            </div>
          </div>
          <Button
            id="clear-history-btn"
            type="button"
            variant="destructive"
            onClick={() => setShowClearDialog(true)}
            className="bg-red-950/40 border border-red-800/60 hover:bg-red-900 hover:text-white cursor-pointer self-end md:self-auto"
          >
            <Trash2 size={16} className="mr-2" />
            清除歷史紀錄
          </Button>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <BaseDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        title={<span className="text-red-400 flex items-center gap-2"><ShieldAlert size={20} /> 清除所有執行歷史紀錄</span>}
        description="此操作是不可逆的破壞性變更。"
        height="220px"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => setShowClearDialog(false)}
              className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-100 cursor-pointer"
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearHistory}
              disabled={clearing}
              className="cursor-pointer"
            >
              {clearing ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              確定清除
            </Button>
          </div>
        }
      >
        <p className="text-sm text-zinc-300 py-2">
          您確定要刪除資料庫中的所有測試運行紀錄（TestRun）、步驟明細與截圖資料嗎？這將會清空所有歷史資料。
        </p>
      </BaseDialog>
    </div>
  );
}
