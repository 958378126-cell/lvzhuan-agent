import "server-only";

import OpenAI from "openai";
import { z } from "zod";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

function configuredValue(...values: Array<string | undefined>) {
  return values.find((value) => value?.trim())?.trim();
}

export function getAIConfig() {
  const deepseekKey = configuredValue(process.env.DEEPSEEK_API_KEY);
  const openAIKey = configuredValue(process.env.OPENAI_API_KEY);
  const apiKey = configuredValue(process.env.AI_API_KEY, deepseekKey, openAIKey);

  if (!apiKey) {
    throw new Error(
      "AI 服务未配置。请设置 AI_API_KEY，或使用页面上的“离线演示”按钮。"
    );
  }

  const usingDeepSeek = Boolean(process.env.AI_API_KEY ? false : deepseekKey);
  return {
    apiKey,
    baseURL: configuredValue(
      process.env.AI_BASE_URL,
      usingDeepSeek ? "https://api.deepseek.com" : process.env.OPENAI_BASE_URL
    ),
    model: configuredValue(
      process.env.AI_MODEL,
      usingDeepSeek ? "deepseek-chat" : process.env.OPENAI_MODEL,
      "gpt-4o-mini"
    )!,
  };
}

export function createAIClient() {
  const config = getAIConfig();
  return {
    client: new OpenAI({ apiKey: config.apiKey, baseURL: config.baseURL }),
    model: config.model,
  };
}

function extractJSONObject(raw: string) {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const source = fenced ?? raw;
  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("模型没有返回 JSON");
  return JSON.parse(source.slice(start, end + 1)) as unknown;
}

export async function requestValidatedJSON<T>(options: {
  schema: z.ZodType<T>;
  messages: ChatMessage[];
  maxTokens: number;
}) {
  const { client, model } = createAIClient();
  let messages = [...options.messages];
  let lastError = "模型返回格式不正确";

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const completion = await client.chat.completions.create({
      model,
      max_tokens: options.maxTokens,
      response_format: { type: "json_object" },
      messages,
    });
    const raw = completion.choices[0]?.message?.content ?? "";

    try {
      return options.schema.parse(extractJSONObject(raw));
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      messages = [
        ...messages,
        { role: "assistant", content: raw },
        {
          role: "user",
          content:
            "上一次输出无法通过数据校验。请修正字段、类型与缺失项，只返回完整合法 JSON，不要解释。",
        },
      ];
    }
  }

  throw new Error(`模型输出校验失败：${lastError}`);
}
