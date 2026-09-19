# 第 0 課：開始之前

這份教程只假設一件事：你會打開終端機並貼一行指令進去。如果你從來沒做過，這一頁就是為你寫的。

## 你即將使用的東西

**Jev** 是網路上的一個服務。你送它一小段文字和一個問題，它在一秒內回你一個 0 到 1 之間的數字，或從你給的選項裡挑一個。每問一題大約 0.00002 美元。你透過一把 **API key** 使用它，那是一串代表你身分的長密碼。

這個 repo 裡的 **`jev` 指令**是一支小程式，替你把問題送出去、把答案印出來，所以你完全不必寫程式就能試。

## 只做一次

1. **拿一把 key。** 到 <https://console.typesafe.ai> 註冊、建立 key。長得像 `apikey_...`。當成密碼保管。
2. **打開終端機。** macOS：按 ⌘ 空白鍵，輸入 `Terminal`。Windows：安裝 [Git for Windows](https://gitforwindows.org) 後打開「Git Bash」。Linux：你已經會了。
3. **安裝 Node.js 20 以上**：<https://nodejs.org>。輸入 `node -v` 沒印出版本就表示要裝。
4. **抓這個 repo 並設定：**

   ```sh
   git clone https://github.com/miles990/jev-newbie
   cd jev-newbie
   export TYPESAFE_API_KEY=apikey_...      # 貼上你的 key
   ./scripts/setup.sh
   jev doctor
   ```

   `jev doctor` 應該印出一行結尾是 `✓`。如果它抱怨沒有 key，表示 `export` 那行沒在這個終端機裡執行，再跑一次。

5. **把 key 設成永久的**：把 `export TYPESAFE_API_KEY=...` 那行加進 `~/.zshrc`（macOS）或 `~/.bashrc`（Linux、Git Bash），以後不用每次貼。

## 你會一直看到的三個詞

- **state**：被判斷的東西。一則訊息、一段文字，或一個有具名欄位的小 JSON。
- **問題**：你想知道它的什麼。是非、單選、程度。
- **機率／信心**：答案有多確定。0.95 很確定；0.5 是丟銅板。拿這些數字做什麼由你決定，模型從不自己行動。

## 教程跟著的故事

你自己的收件匣：email、群組、通知。帳單藏在廣告裡，假的包裹通知長得跟真的一樣，媽媽的問題壓在診所提醒下面。每一課從那堆東西裡挑一個真實的煩惱，展示能解決它的 Jev 能力，以及它真實產生的輸出。

下一課：[第 1 課：第一次呼叫](01-first-call.md)
