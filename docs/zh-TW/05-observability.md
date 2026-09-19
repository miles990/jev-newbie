# 紀錄與報告能告訴你什麼

CLI 的成功判斷與 `examples/js/observe.mjs` 使用相同報告格式，預設寫入 `runs/jev-log.jsonl`：時間、模型、輸入摘要與雜湊、問題、答案、程式決定、延遲與 token。

```sh
node bin/jev.mjs view
node bin/jev.mjs view runs/jev-log.jsonl --no-open
```

第一個指令會嘗試開啟報告；第二個只產生 HTML。`JEV_LOG` 可以改變紀錄位置，報告會生成在該檔案旁。

紀錄只有輸入前 160 個字元與雜湊，不能用它完整重播原始請求。摘要也可能有敏感內容。失敗的 CLI 呼叫目前以錯誤訊息回報，沒有完整失敗事件紀錄。

直方圖混合是非機率與單選／評分信心，是探索線索，不是校準圖或準確率證明。兩端集中可能只是模型自信地判錯。要知道準確度，需要標準答案。

報告的費用欄是依歷史費率估算，不是帳單。LLM 流程的專用 JSONL 格式不同，不要直接交給 `view`。

[showcase](../../showcase/README.md)保留舊展示報告；其中的數字不是本次版本驗證。
