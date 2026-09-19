# 把 Jev 接到 LLM

Jev 負責判，LLM 負責寫。問題是接縫放哪裡。有四個位置，多數真實系統同時用兩到三個。

## 1. Jev 在 LLM 前面：先決定要不要呼叫它

大多數輸入根本不需要 LLM。詐騙不需要幫它擬回覆；廣告不需要摘要；明顯安全的工具呼叫不需要審查。每個輸入一次 Jev 請求，回答「這需要昂貴的那一步嗎」，需要的話是哪一步。

```js
const j = await jev.systemOne({ state: { message }, questions: {
  kind: choice("What kind of message is this?", { scam: "...", ad: "...", invite: "...", other: "..." }),
  needsReply: noul("Does the sender expect a reply?"),
}});
if (j.answers.kind.choice === "scam") return junk(message);          // 不呼叫 LLM
if (j.answers.needsReply.noul < 0.7) return readLater(message);      // 不呼叫 LLM
```

社群的模型路由器（用哪個模型、多少推理力度）與 guardrail（輸入安不安全）都是這一種。我們的收件匣範例裡，四則訊息有兩則從未到達 LLM。

## 2. Jev 進入 LLM：傳型別化的事實，不傳原始猜測

Jev 決定的東西以「可信事實」的形式進 prompt：種類、語言、語氣、急迫度。LLM 只做 Jev 做不到的那件事，寫文字，不必再重新推導分類。

```text
Facts decided by a classifier (trust them): kind=invite, language=Traditional Chinese, tone=warm.
Rules: answer exactly what the sender asked; do not promise money, dates or personal data beyond ...
```

兩件事會發生：prompt 更短更穩定（對快取好），LLM 的輸出更容易驗證，因為你知道它被要求做什麼。

## 3. Jev 在 LLM 後面：驗證，再把判決回饋

LLM 的草稿連同原文回到 Jev：有沒有回答問題、有沒有過度承諾、語言對不對、有沒有禮貌。型別化判決，門檻在程式碼。失敗的草稿帶著失敗原因重試一次；第二次失敗交給人。

```js
const v = await jev.systemOne({ state: { original, draft, situation }, questions: {
  answers: noul("Does `draft` answer what the sender in `original` actually asked?"),
  overcommits: noul("Does `draft` promise money, a date or personal data that `situation` does not support?"),
}});
const ok = v.answers.answers.noul > 0.7 && v.answers.overcommits.noul < 0.3;
```

這是官方 cookbook 的 SDE 級聯與引用檢查模式，也是 jev-review、limpet、Foreman 對程式碼做的事。

## 4. LLM 在 Jev 後面：替 Jev 說不出的東西命名

Jev 回 `other` 或平坦分布時，那個項目是新的。這正是 LLM 上場的時刻：替類別命名、解釋異常、寫人需要的摘要。然後新類別回到 Jev 的問題裡，接下來一千筆又便宜了。

## 範例

`examples/js/jev-then-llm.mjs` 對四則收件匣訊息跑位置 1 到 3：Jev 設關卡，LLM 替需要回覆的兩則擬稿，Jev 檢查每份草稿、失敗就帶原因重試一次。LLM 那一步在有 `ANTHROPIC_API_KEY` 時用 Anthropic SDK，沒有時退回本機的 `claude -p` 指令，所以有 Claude Code 的人都能跑。每個階段都記到 `runs/jev-then-llm.jsonl`。因為 LLM 的文字不是決定性的，這個範例不在 `npm run verify` 裡；每份草稿的 Jev 判決就是檢查。

## 經驗法則

- 接縫保持型別化。從 Jev 過去 LLM 的是幾個欄位；回來的是文字，再交給 Jev 判。永遠不要讓 LLM 的散文變成程式碼分支的依據。
- Jev 不會向 LLM 要它自己能產生的標籤。如果你發現自己在從 LLM 的回答裡解析類別，那一步就是偽裝的 Jev 呼叫。
- 兩邊都記錄。一份草稿的 log 要帶著塑造它的 Jev 事實與評判它的 Jev 判決；這樣才能分辨壞回覆是來自事實、prompt 還是模型。
