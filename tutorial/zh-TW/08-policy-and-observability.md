# 第 8 課：程式碼裡的政策與看 log

## 情境

問題量過了。現在它們每天早上要自己跑。信心 55% 的訊息該怎麼辦？誰決定「詐騙」直接刪、「帳單」只標記？下個月一張真的帳單掉進垃圾桶，有人看得到模型當時看到什麼嗎？

**原因：** 機率不是決定，沒寫下來的決定無法被審。**這一課改變什麼：** 政策變成集中一處的十行程式碼，每次呼叫留下一行打得開的 log。

**目標：** 把機率變成決定，而且是看得懂、改得動、查得到的方式。

## 做

```sh
.venv/bin/python examples/python/quickstart.py     # 或：node examples/js/quickstart.mjs
jev view                                            # 打開 runs/report.html
```

## 你應該看到（2026-09-19 錄，jev-1.13.0）

```text
kind        = scam  (confidence 1.00)  {'appointment': 0.0, 'bill': 0.0, 'other': 0.0, 'personal': 0.0, 'scam': 1.0}
needs_reply = 0.49
urgency     = 0.39 of 2
action      = move to junk and block the sender
```

以及 `quickstart.py` 最後幾行，那就是整個政策：

```python
if kind.confidence < 0.5:
    action = "show it to me: the model is not sure what this is"
elif kind.choice == "scam":
    action = "move to junk and block the sender"
elif kind.choice == "bill" and urg.score > 1.5:
    action = "put 'pay today' at the top of my list"
elif reply.noul > 0.7:
    action = "remind me to reply tonight"
else:
    action = "file under read-later"
```

## 注意

- **三段，不是一刀切。** 信心低於 0.5 程式碼拒絕猜，把訊息拿給你看。高於就做。中間可以加 `review` 狀態；`jev` 指令用 `unsure` 做這件事。
- **門檻隨風險變。** 刪除的門檻要比標記高。往便宜方向錯可以回頭，往昂貴方向錯不行。
- **政策勝過字面真相。** 記得那則因為「今晚截止」被判「急」的廣告嗎？加一行：`elif kind.choice == "ad": action = "promotions"`，放在急迫度檢查*之前*。不用新問題，不用新呼叫。
- **政策是同一處的十行。** 改門檻是 code review，不是改模型，也不需要 API 呼叫：log 裡已經有機率。
- **每次呼叫一行 log。** 打開 `jev view` 產生的報告。最上面的直方圖是健康檢查：答案堆在 0 與 1 表示問題清楚；中間有一坨表示問題或資料不清楚。先修問題，再動門檻。

## 練習

加上 `ad` 那條規則，然後把 0.7 改成 0.9 再跑。然後改一題，看 `jev view` 裡的直方圖怎麼動。注意哪個改動需要新的 API 呼叫、哪個不需要。

下一課：[第 9 課：未知事物，以及放進你的程式碼](09-unknown-and-integration.md)
