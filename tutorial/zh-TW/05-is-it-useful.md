# 第 5 課：哪個學習資源比較適合我？

你想用手機拍好日常物品，手上有幾篇教學與廣告。這課把「適合我」拆成相關性、可練習程度、是否適合新手，以及是否主要在推銷，再用自己選的權重排序。

這是第一個 JavaScript 範例，需要先在專案資料夾執行一次 `npm ci` 安裝依賴。

```sh
npm ci
node examples/js/usefulness.mjs
```

範例讀取 [候選資源](../../examples/usefulness/candidates.jsonl)與[問題檔](../../examples/usefulness/usefulness.questions.json)，逐筆呼叫 Jev，印出排序，並把答案存到 `runs/usefulness-results.json`。

## 怎麼讀分數

0 到 1 的總分是程式依權重算出的排序分數，**不是「有用的機率」**。分數只能反映輸入描述與你的偏好，不能證明教學內容正確。

## 只改偏好，不重新呼叫

打開 [usefulness.mjs](../../examples/js/usefulness.mjs)，找到 `W`。例如提高 `beginner` 的權重，表示你更重視新手能否跟上。然後執行：

```sh
node examples/js/usefulness.mjs --reuse
```

`--reuse` 讀取儲存的答案，不呼叫 API。未加此參數會重新評估。改了候選文字、問題或指定的模型時，必須重新評估；權重則由程式正規化，不必手動湊成 1。

練習：先調高相關性，再調高可練習程度，看排名有沒有變。排名沒變也是合理結果。

下一課：[一次處理多則訊息](06-batches.md)
