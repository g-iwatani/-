/**
 * Anthropic Messages API の最小 fetch ラッパ。
 * @anthropic-ai/sdk を入れずに済ませているのは:
 *   - Cloudflare Workers ランタイムにのせる必要がない (script は GH Actions 上で実行)
 *   - 依存物を増やさず npm install サイクルを軽く保ちたい
 *
 * 使い方:
 *   const reply = await callMessages({
 *     system: "You are ...",
 *     userText: "...",
 *     model: "claude-sonnet-4-6",
 *     maxTokens: 4096,
 *   });
 *
 * Prompt caching: system プロンプトは固定なので cache_control を付けて
 * 2 回目以降の API 呼び出しコストを下げる (公式推奨)。
 */

const API_URL = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";

export async function callMessages({
  system,
  userText,
  model = "claude-sonnet-4-6",
  maxTokens = 4096,
  cacheSystem = true,
}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY が未設定です。GitHub Secrets / .env で設定してください。",
    );
  }
  // system は文字列でも渡せるが、cache_control を付けるなら配列形式が必要。
  const systemBlock = cacheSystem
    ? [{ type: "text", text: system, cache_control: { type: "ephemeral" } }]
    : system;
  const body = {
    model,
    max_tokens: maxTokens,
    system: systemBlock,
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: userText }],
      },
    ],
  };
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": API_VERSION,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${errText.slice(0, 500)}`);
  }
  const data = await res.json();
  // text block を結合して返す。tool_use 等は今回スコープ外。
  const text = (data.content ?? [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  return {
    text,
    usage: data.usage,
    cache_read: data.usage?.cache_read_input_tokens ?? 0,
    cache_create: data.usage?.cache_creation_input_tokens ?? 0,
  };
}
