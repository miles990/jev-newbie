# 第 8 課：把判斷變成建議，並留下紀錄

模型給的是判斷；要不要採取動作，仍由你或程式決定。這課示範把不確定的分類留給人看，並記錄成功的呼叫。

```sh
npm ci
node examples/js/observe.mjs
node bin/jev.mjs view
```

範例會處理三則訊息，把資料寫到 `runs/jev-log.jsonl`，報告則是 `runs/report.html`。它只印出分類建議，不會操作你的收件匣。

[observe.mjs](../../examples/js/observe.mjs) 的 `policy` 使用示範門檻：

```js
const policy = (a) => a.kind.confidence < 0.5 ? "clarify" : a.kind.confidence < 0.8 ? "review" : a.kind.choice;
```

- 低於 0.5：需要更多資訊。
- 0.5 到未滿 0.8：交給人覆核。
- 至少 0.8：顯示選中的分類。

這些門檻未經你的資料驗證，不能直接拿去控制刪除、付款或封鎖。廣告是否一律放促銷區，是你設定的政策；不要把「廣告有截止時間」混成「我必須今天處理」。

報告能讓你看見答案與程式決定，但不會解釋模型內部推理。直方圖集中也不證明準確率。

改了政策再執行本範例仍會呼叫 API。要離線改政策，需另外讀取儲存的答案；第 5 課的 `--reuse` 是已有實作的例子。紀錄包含文字摘要，分享報告前先檢查內容。

下一課：[處理未知，以及請 AI 助手幫忙](09-unknown-and-integration.md)
