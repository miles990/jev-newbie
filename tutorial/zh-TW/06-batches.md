# 第 6 課：一次處理多則訊息

先用專案附帶的八則訊息，再換成自己的純文字檔。一行是一筆資料。

```sh
node bin/jev.mjs filter examples/cli/inbox-messages.txt "Does the sender expect me to reply?" --min 0.5
node bin/jev.mjs classify examples/cli/inbox-messages.txt "What kind of message is this?" --options "bill,scam,invite,appointment,ad,personal,other"
node bin/jev.mjs run examples/cli/inbox.questions.json examples/cli/inbox-messages.txt
```

- `filter`：每行顯示機率，用勾號標出達門檻的項目，**預設仍顯示全部項目**。
- `classify`：每行顯示類別，低於 `--min-conf` 的項目顯示 `unsure`。
- `run`：從問題檔一次讀取多個問題，輸出每筆一列、每題一欄的表格。

要把通過篩選的原文存成下一步能讀的檔案，用：

```sh
node bin/jev.mjs filter examples/cli/inbox-messages.txt "Does the sender expect me to reply?" --only-kept > kept.txt
```

JSONL 檔也可以使用：每行一個 JSON 物件，整個物件會作為輸入。篩選 JSONL 後也請保存成 `.jsonl`。

每筆一次 API 請求，CLI 預設最多四筆同時處理。可用 `--concurrency 2` 降低併發；每次請求預設 30 秒逾時。先試少量資料，再評估用量與速度。

下一課：[用標準答案檢查結果](07-golden-set.md)

## 同一則訊息，同時問幾題

上面的 `run` 指令對每則訊息一次詢問問題檔中的所有問題，不是每題各送一次。這正是 Jev 適合的用法：共用輸入、各自回答，再由你把答案組合起來。例如「是邀約」加上「要回覆」，就列入待回覆清單。

[實測速度與限制](../../docs/zh-TW/14-speed-and-computer-use.md) · [用 Jev 整理研究資料](../../docs/zh-TW/17-use-case-research.md)
