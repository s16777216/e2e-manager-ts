import { AppDataSource } from "../db.js";
import { SystemSetting } from "../entities/SystemSetting.js";

/**
 * 取得全域系統設定。若無設定則會自動寫入並回傳預設值。
 */
export async function getSettings(): Promise<SystemSetting> {
  const settingRepo = AppDataSource.getRepository(SystemSetting);
  let setting = await settingRepo.findOne({ where: { id: "default" } });

  if (!setting) {
    setting = new SystemSetting();
    await settingRepo.save(setting);
  }
  return setting;
}

/**
 * 儲存/更新全域系統設定。
 */
export async function saveSettings(settings: Partial<SystemSetting>): Promise<SystemSetting> {
  const settingRepo = AppDataSource.getRepository(SystemSetting);
  const current = await getSettings();

  // 覆寫更動的欄位值，排除主鍵 id
  const { id, ...updateFields } = settings;
  Object.assign(current, updateFields);

  return await settingRepo.save(current);
}
