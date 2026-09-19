# 第 6 課：你自己的資料，批次處理

*第二部分從這裡開始。第 1 到 5 課用的是每個人都會收到的訊息。從現在起資料是你的：你的收件匣匯出、你的筆記、你的書籤、你團隊的工單。*

## 情境

你匯出了一週的通知：300 行。你要三張清單：要回的、有日期的帳單、可以刪的。一則一則做要花一個下午。

**原因：** 一次一則對單一訊息沒問題，對一堆沒用。**這一課改變什麼：** 你把同一組問題指向整個檔案，平行跑，花幾美分拿回一張表。

**目標：** 把一題套到整個檔案，再把一整組題套到整個檔案。

## 做

```sh
jev filter   examples/cli/inbox-messages.txt "Does the sender expect me to reply?" --min 0.5
jev classify examples/cli/inbox-messages.txt "What kind of message is this?" \
             --options "bill:a payment I owe,scam:phishing or fraud,invite:an invitation,appointment:a booking or delivery notice,ad:marketing,personal:someone I know asks me something,other"
jev run      examples/cli/inbox.questions.json examples/cli/inbox-messages.txt
```

## 你應該看到（2026-09-19 錄，jev-1.13.0）

`filter` 依機率排序並標出過門檻的：

```text
✓  95%  週六晚上小美生日，七點在市中心那家餐廳聚餐，來的話回我一聲～
✓  94%  媽：你上次說的那個電鍋是哪個牌子？我想買一個給阿姨。
✓  93%  Hi, this is the clinic. Your appointment is tomorrow at 10:30. Reply Y to confirm or call to reschedule.
   46%  您的包裹因地址不完整無法投遞，請點擊連結補填資料：http://parcel-redelivery.co/x9
   28%  這個月房租記得在 5 號前匯，謝謝。
   ...
3/8 kept at p ≥ 0.5.
```

`classify` 每行給標籤（8/8 與人的判斷一致）。`run` 每則訊息一列、每題一欄：

```text
item                                           kind    urgency needs_repl asks_to_cl
你的信用卡帳單這期 12,480 元…                       bill       0.90       0.23       0.02
您的包裹因地址不完整無法投遞…                       scam       0.98       0.46       0.97
週六晚上小美生日…                                 invite       1.10       0.96       0.01
【限時】全館服飾 3 折起…                             ad       1.97       0.12       0.04
Hi, this is the clinic…                     appointmen       1.86       0.94       0.01
```

## 注意

- 項目就是純文字行。`.jsonl` 也可以：每行的物件整個變成 `state`，這就是替每筆加 `sender` 或 `today` 的方法（第 4 課）。
- 每個項目一次請求，平行送出。每次請求在 `runs/jev-log.jsonl` 留一行。
- `run` 的問題檔就是完整的 API 格式：任何 `type`、`instructions`、`criteria`。複製 `examples/cli/inbox.questions.json` 來改。問多一點沒關係，多的題幾乎免費。
- 看廣告的急迫度：1.97，「今天」，因為它寫「只到今晚 12 點」。字面上對，實際上錯。第 8 課會教你修：廣告永遠不急，這條規則屬於程式碼，不屬於問題。

## 練習

從你手上的東西（通知、書籤、待辦、commit 訊息）匯出二十行真實資料。寫一個合適的問題與選項。跑 `classify`。認真看那些 `unsure` 的。

下一課：[第 7 課：黃金測試集](07-golden-set.md)
