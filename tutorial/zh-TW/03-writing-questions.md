# 第 3 課：寫出模型答得了的問題

## 情境

你設了一個過濾器：「標出又急又跟錢有關的」。房東說明天早上停水的訊息完全沒被標到。你是在水龍頭沒水的時候才知道的。

**原因：** 問題把兩個判斷綁在一起；訊息很急但跟錢無關，所以綁在一起的答案是「否」。**這一課改變什麼：** 你學會從數字看出這種失敗，並把問題拆開，讓每個答案只代表一件事。

**目標：** 親眼看到複合問題為什麼失敗，以及拆開後怎麼修好。

## 做

```sh
M="房東說明天早上八點到十點停水，要我今晚先把水存好。"
jev ask "Is this message urgent and about money?"              --text "$M"
jev ask "Does this message need action from me within a day?"  --text "$M"
jev ask "Is this message about money, bills or payments?"      --text "$M"
```

## 你應該看到（2026-09-19 錄，jev-1.13.0）

```text
█···················   7%  no         ← 複合：「又急又跟錢有關」
███████████████████·  94%  yes        ← 拆開 1：一天內要處理
█···················   5%  no         ← 拆開 2：跟錢有關？
```

## 注意

複合問題很有把握地回了「否」，而且*字面上是對的*：這則訊息跟錢無關。但你要的不是字面的 AND，你要的是急事被提醒。拆開的兩題分別給你兩個事實，怎麼用由程式碼決定：

```js
const urgent = a.needsActionSoon.noul > 0.7;
const money  = a.aboutMoney.noul > 0.65;
const flag = urgent ? (money ? "pay today" : "do today") : money ? "bill" : "later";
```

這是用 Jev 最常見的錯，修法是機械式的：**一題一個判斷，在程式碼裡合併。**

## 再三個習慣

1. **寫字面的條件。** Jev 回答你寫的字。如果錯的答案讓你想說「我的意思是……」，把那句話寫進問題。
2. **描述選項。** `--options "bill:a payment I owe,scam:phishing or fraud,other"` 勝過光禿禿的名字。
3. **邊界案例寫進 criteria。** 「房東的提醒算帳單」在爭議發生前就把它定下來。

## 練習

找一個你自然會用「和」或「或」寫的問題，拆開，用三則訊息跑兩個版本比較。

下一課：[第 4 課：state 與脈絡](04-state-and-context.md)
