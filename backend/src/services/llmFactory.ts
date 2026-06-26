import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import type { AiConfig } from "./settingsService.js";

/**
 * 依據 aiConfig.provider 動態實例化並回傳 Executor 模型（已綁定工具）。
 * provider="google" → ChatGoogleGenerativeAI
 * 其他任何值   → ChatOpenAI（OpenAI Compatible 格式）
 */
export function getExecutorModel(aiConfig: AiConfig, tools: any[]) {
  if (aiConfig.executorProvider === "google") {
    return new ChatGoogleGenerativeAI({
      model: aiConfig.geminiModel || "gemini-2.0-flash",
      temperature: 0.0,
      apiKey: aiConfig.apiKey || undefined,
    }).bindTools(tools);
  }

  return new ChatOpenAI({
    model: aiConfig.openaiModel || "gpt-4o",
    temperature: 0.0,
    apiKey: aiConfig.openaiApiKey || "ollama",
    configuration: {
      baseURL: aiConfig.baseUrl || "http://localhost:11434/v1",
    },
  }).bindTools(tools);
}

/**
 * 依據 aiConfig.asserterProvider 動態實例化 Asserter 模型，
 * 並套用 withStructuredOutput + { includeRaw: true }，
 * 確保 invoke 回傳 { parsed, raw } 結構以同時相容兩種 provider 的 token 統計。
 */
export function getAsserterModel<T extends z.ZodTypeAny>(
  aiConfig: AiConfig,
  schema: T
) {
  if (aiConfig.asserterProvider === "google") {
    return new ChatGoogleGenerativeAI({
      model: aiConfig.asserterModel || "gemini-2.0-flash",
      temperature: 0.0,
      apiKey: aiConfig.apiKey || undefined,
    }).withStructuredOutput(schema, { includeRaw: true });
  }

  return new ChatOpenAI({
    model: aiConfig.openaiAsserterModel || "gpt-4o",
    temperature: 0.0,
    apiKey: aiConfig.openaiApiKey || "ollama",
    configuration: {
      baseURL: aiConfig.baseUrl || "http://localhost:11434/v1",
    },
  }).withStructuredOutput(schema, { includeRaw: true });
}
