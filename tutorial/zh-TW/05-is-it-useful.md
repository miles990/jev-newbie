# 第 5 課：這對我有用嗎？

## 情境

你想睡得好一點。一個晚上你遇到一篇文章、一則床墊廣告、朋友的建議、一段研究摘要、一個有免費試用的 App、一篇講褪黑激素的論壇貼文，還有，因為網路就是這樣，一份香蕉蛋糕食譜。「這有用嗎？」是你一整天對每樣東西都在問的問題，而你用直覺回答。

**原因：** 「有用」不是一個判斷。它是相關性、可執行性、可信度、安全性、成本、以及對方是不是在賣東西，再依*你*在乎的比重加權。**這一課改變什麼：** Jev 逐個維度判斷；你的程式碼用你能改的權重加總，不必再問一次。

**目標：** 把「有用嗎」變成可重複、可解釋的排序。

## 做

```sh
node examples/js/usefulness.mjs
```

候選在 `examples/usefulness/candidates.jsonl`，每筆同樣的 `goal`、不同的 `item`。六個問題在 `examples/usefulness/usefulness.questions.json`。

## 你應該看到（2026-09-19 錄，jev-1.13.0）

```text
0.90  worth trying       Research summary: a 2023 meta-analysis of 20 trials found that a fixed…
      relevance=0.93  actionable=0.95  credible=0.91  safe=0.93  cheap=0.68  notPitch=0.96
0.90  worth trying       Article: '10 tips for better sleep' on a lifestyle site…
      relevance=0.98  actionable=0.96  credible=0.76  safe=0.93  cheap=0.79  notPitch=0.91
0.84  worth trying       A friend's message: 'Honestly the only thing that worked for me was no…
      relevance=0.98  actionable=0.97  credible=0.50  safe=0.92  cheap=0.66  notPitch=0.97
0.63  REJECT: unsafe     Forum post: 'Try taking 10 mg of melatonin every night, it knocks me o…
      relevance=0.92  actionable=0.71  credible=0.16  safe=0.33  cheap=0.51  notPitch=0.93
0.59  maybe              App listing: 'Calm Nights: guided meditations, 7-day free trial, then…
      relevance=0.89  actionable=0.30  credible=0.25  safe=0.86  cheap=0.85  notPitch=0.03
0.39  skip               Ad: 'The SmartSleep mattress uses AI to adapt to your body. Only $1,29…
      relevance=0.82  actionable=0.08  credible=0.13  safe=0.57  cheap=0.00  notPitch=0.02
0.31  ignore: unrelated  A recipe for banana bread.
      relevance=0.01  actionable=0.59  credible=0.05  safe=0.87  cheap=0.50  notPitch=0.88
```

## 注意

- **每個數字都有看得懂的理由。** 朋友的建議可執行性高、可信度低；研究摘要兩者都高。床墊廣告相關但在推銷、又貴。你可以跟任何一行吵，而且吵的是某個具體的維度。
- **權重是你的。** 打開 `usefulness.mjs`，`W` 物件就是整個政策。更在乎可信度？把 0.2 改成 0.4 重跑；不需要新的 API 呼叫，因為六個答案已經在 log 裡。
- **硬規則永遠不走加權。** 褪黑激素貼文得 0.63，但因為 `safe` 回 0.33 被拒絕。安全是關卡，不是權重。
- **「無關」由相關性抓，不靠 `other`。** 問「這多直接地對應我的目標」，香蕉蛋糕食譜自己就回答了。

官方文件把這個模式叫複合評分。任何你會反覆判斷的東西都適用：職缺、房子、課程、工具、文章、pull request。

## 練習

把 `candidates.jsonl` 的 `goal` 改成你真的想要的（「學會三道平日晚餐」、「找一台一千美元以下能剪影片的筆電」），把你今天看到的五樣東西貼成 `item`。跑一次。再改一個權重看什麼動了。

下一課：[第 6 課：你自己的資料，批次處理](06-batches.md)
