# 找到用法

不要從「AI 能做什麼」出發。從自己的程式碼出發，找三種味道。找到了，把判斷寫成封閉問題，用真實資料試，再把門檻寫進程式碼。

## 味道一：對字串做 `if`／`else`

關鍵字表、正規表達式分類、`name.endsWith("_hold")`、`error.includes("timeout")`。每加一個案例就要改程式碼，清單漏掉時程式碼會靜靜地退回預設值。

```js
// 之前
const kind = ["read","read_file","view_image"].includes(name) ? "reading" : "tool";
// 之後：一個 choice，對沒見過的名稱也有效
choice("Judging from the name only, what kind of work does the agent do with this tool?",
       { editing: "...", reading: "...", searching: "...", command: "...", tool: "cannot tell from the name" })
```

用 55 個真實工具名稱實測：手寫表對 31 個，Jev 對 50 個。

## 味道二：顯示了但沒有用的自由文字

agent 的訊息、審查備註、退件理由、使用者輸入。印出來就忘了。問下一步真正需要的兩三個問題：「這是在問使用者嗎？」「這是在宣稱完成嗎？」「屬於哪類缺陷？」

## 味道三：散在多處的人工分類清單

同一批東西在六個檔案裡各標一份。改成註冊時用一組問題一次標好，把答案寫進資料，程式碼讀欄位而不是讀清單。

## 味道四：「呼叫 LLM，然後解析它的散文」

如果一次 LLM 呼叫你只留下一個標籤、一個是非或一個等級，那其實是一次偽裝的 Jev 呼叫。把 fetch、正規表達式、JSON 抽取和 fallback 換成一個型別化的問題。

## 未知

Jev 的封閉集合限制的是**答案**，不是**輸入**。輸入可以是任何新東西，固定的是問題。新事物會以四種方式浮現：

1. **固定問題、未知輸入。** 對沒見過的程式碼問「可疑嗎？」，對任何工具輸出問「跟目前任務有關嗎？」。
2. **`none` 加上平坦分布。** 一定放 `other`／`none`。答案落在 `none`、分布平坦、或信心低於門檻，就是「這是新東西」。交給人或 LLM 命名，再把新類別加回問題。
3. **投機式廣撒。** 不知道要問什麼，就一次問五十個屬性，每個項目得到一個機率向量，分群與排序在程式碼裡做。用 `jev run` 配一個問題檔試試。
4. **用例子取代類別。** 把十個接受、十個退件的樣本放進 state，問新項目像哪一邊。類別不需要名字，只需要例子。

Jev 在這裡做不到的：發明新標籤。發現是人或生成模型的工作；Jev 負責把值得看的候選挑出來，標籤存在之後再大規模驗證。可靠的形狀是級聯：Jev 篩全部，低信心交給 LLM，Jev 再用新問題回頭驗證 LLM 的答案。

## 五分鐘試一次

```sh
printf '%s\n' "第一行" "第二行" > items.txt
jev filter items.txt "這一行跟帳務有關嗎？"
jev classify items.txt "這是什麼？" --options bug,billing,feature,other
cp examples/cli/support.questions.json my.questions.json   # 改成你的問題
jev run my.questions.json items.txt && jev view
```

下一篇：[03 可靠性](03-reliability.md)
