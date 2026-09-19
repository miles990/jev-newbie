# 第 7 課：用標準答案檢查結果

「看起來合理」不等於知道準確率。先準備你自己判斷過的資料，再拿模型答案來比較。這份資料常稱為「黃金測試集」。

```sh
node bin/jev.mjs check examples/cli/inbox.questions.json examples/cli/inbox.cases.jsonl
```

[案例檔](../../examples/cli/inbox.cases.jsonl)每行都有輸入 `state` 與預期答案 `expect`，例如：

```json
{"state":{"item":"提醒你週六聚餐，請回覆是否參加。"},"expect":{"kind":"invite","needs_reply":true}}
```

`expect` 的名稱必須存在於問題檔中。是非題用 JSON 的 `true`／`false`，不要寫成字串。單選用選項名稱，程度用整數等級。只比較列出的預期，不代表所有題都測過。

## 看哪些數字

結果顯示各題命中數與總數。附帶資料只有八筆，適合展示操作；即使全對，也不能證明真實收件匣同樣準確。低信心另外列出，不會單憑低信心使 `--strict` 失敗。

```sh
node bin/jev.mjs check examples/cli/inbox.questions.json examples/cli/inbox.cases.jsonl --strict
```

`--strict` 在答案不符時回傳失敗；空測試集、錯誤標籤格式、缺少回答也會失敗。是非題以大於 0.5 作為「是」，與 `ask` 的三段顯示門檻不同。

## 遇到不一致

先判斷是問題模糊、標籤有誤，還是模型判錯。不要只為了全對刪掉失敗案例。若改了問題含義，記下原因、更新標籤，並保留一批沒有拿來調整問題的資料作最後評估。

練習：從二三十筆開始，加入容易混淆與不屬於任何類別的案例。資料量只是起點，是否足夠取決於錯誤代價與實際分布。

下一課：[把判斷變成建議，並留下紀錄](08-policy-and-observability.md)
