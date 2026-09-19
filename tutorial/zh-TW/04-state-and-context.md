# 第 4 課：state 與脈絡

## 情境

「這個月房租記得在 5 號前匯，謝謝。」如果是房東寄的，它是帳單。如果是陌生號碼寄的、而且你的房子是自己的，它是詐騙。字一模一樣。

**原因：** 模型只看到訊息；誰寄的、你的處境，都在你腦子裡。**這一課改變什麼：** 你把手機早就知道的事實放進 `state`，同一個問題開始給出對*你*來說才是真的答案。

**目標：** 看到同一句話，在你提供脈絡之後，得到不同但正確的答案。

## 做

```sh
Q="What is this message?"
O="scam:a scam or phishing attempt,legit:a genuine message I should act on,unsure:cannot tell from the message alone"
R="這個月房租記得在 5 號前匯，謝謝。"
jev pick "$Q" --options "$O" --text "$R"
jev pick "$Q" --options "$O" --json "{\"message\":\"$R\",\"sender\":\"unknown number, not in my contacts\",\"my_situation\":\"I have no pending orders and I own my apartment\"}"
jev pick "$Q" --options "$O" --json "{\"message\":\"$R\",\"sender\":\"saved contact: my landlord\",\"my_situation\":\"I rent and pay on the 5th every month\"}"
```

## 你應該看到（2026-09-19 錄，jev-1.13.0）

```text
█████████████████···  84%  legit  ←     confidence 0.76   ← 只有文字：在猜
████████████████████  99%  scam   ←     confidence 0.99   ← 陌生號碼、房子是自己的
████████████████████  99%  legit  ←     confidence 0.98   ← 房東寄的、我在租房
```

## 注意

- 只有文字時模型偏向「真的」但不確定（0.76）。有了脈絡它兩邊都很確定，而且兩邊都對。
- `state` 不只是「那段文字」。它是一個細心的朋友在判斷前想知道的所有事：訊息、誰寄的、你的處境、之前發生過什麼。
- 東西超過一件就用具名欄位的 JSON 物件（`--json`）。需要時在問題裡指欄位：「Given `sender` and `my_situation`, what is this?」
- 回想第 1 課：帳單的急迫度信心只有 0.23，因為模型不知道今天幾號。在 state 加 `"today": "2026-09-19"` 是同一招。
- 不要全倒進去。無關細節會讓答案變差。只送問題需要的。

## 練習

挑一則意思取決於寄件者的訊息。`--json` 裡加與不加 `sender` 各問一次，看答案怎麼移動。

下一課：[第 5 課：這對我有用嗎？](05-is-it-useful.md)
