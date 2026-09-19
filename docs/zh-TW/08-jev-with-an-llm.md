# 把 Jev 和文字生成搭配

可以在同一流程中分工：Jev 判斷是否需要擬稿與適合的語氣，LLM 寫草稿，Jev 再檢查是否回應問題。這些都是輔助訊號，不能把分類結果包裝成「可信事實」。

```sh
npm ci
node examples/js/jev-then-llm.mjs
```

需要 `TYPESAFE_API_KEY`。LLM 部分若有 `ANTHROPIC_API_KEY`，也必須設定帳號可用的 `ANTHROPIC_MODEL`；沒有該 key 時，使用已安裝且登入的 `claude -p`。兩種服務或 CLI 都可能產生用量。

範例先分流，再產生草稿，最多嘗試兩次；成功也只顯示 `REVIEW DRAFT (not sent)`，不會發送訊息。第二次檢查未通過會顯示需人工處理。紀錄在 `runs/jev-then-llm.jsonl`，格式與 `jev view` 不同。

擬稿時應連同原始訊息與已知事實一起提供。模型標籤可能錯，另一個模型的複查也不是獨立真相；實際使用仍需核對來源與適合的人工覆核。
