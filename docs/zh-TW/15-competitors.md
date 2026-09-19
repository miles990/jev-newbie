# 競品與替代品

2026-09-19 檢視，Jev 發布後第四天。短版：**目前沒有其他公司賣「System One 模型」**，但 Jev 做的每件工作都有成熟的替代品，而且已有誠實的對照測試。依你的工作對應的那一列來選，不要依類別名稱。

## 直接競品：沒找到

搜尋決策模型 API 會找到兩種看似相鄰但不是同一種產品的東西：

- **有決策 API 的規則引擎**（decide.fyi、Entropy0 的 `/v1/decide`）：決定性的規則手冊、查表、嚴重度階梯。沒有學習來的判斷；它們回答「事實是否滿足規則」，規則寫得出來時是對的工具。Jev 回答「這些字是什麼意思」，用在寫不出來的時候。兩者可以組合：Jev 填一個事實（「這是付款步驟嗎」），規則引擎決定。
- **模仿 Jev API 形狀的東西**：一個在 LLM 上假造型別化輸出契約的「冒牌 Jev」gateway，以及 TypeSafe 自己的 `system-one-adapter-python`，用 OpenAI 或 Anthropic 模型支撐同樣的請求格式做相容性測試。可攜性有用；它們繼承 LLM 的成本、延遲與校準。

## 替代品，依它們要你付出什麼

改編自 Arize 的比較（2026-09-18）與獨立測試：

| 做法 | 需要標籤 | 每次決策成本 | 延遲 | 能用的機率 | 解釋 |
| --- | --- | --- | --- | --- | --- |
| embedding 加邏輯迴歸 | 要，數百筆以上 | 每百萬 token 約 0.02–0.12 美元（一次 embedding） | 幾十毫秒 | 有 | 無 |
| 微調編碼器（ModernBERT 級） | 要，數百筆以上 | GPU 時間，每 GPU 約 76k token/s | 個位數毫秒 | 有，需溫度縮放 | 無 |
| NLI 零樣本（bart-large-mnli） | 不要 | 自架 | 幾十毫秒 | 蘊涵分數 | 無 |
| Cross-encoder／reranker（Qwen3-Reranker、Cohere、Voyage） | 不要 | 每次約 100 篇文件的搜尋計價 | 幾十到幾百毫秒 | 只有相關性分數 | 無 |
| 小型微調評審（Selene Mini 級，8B） | 不要 | 自架自迴歸 | 秒級 | 口頭化 | 有 |
| 前沿 LLM 當評審（Sonnet 5、GPT、Gemini） | 不要 | TypeSafe 評測上每次 0.03–0.18 美元 | 3–38 秒 | 口頭化，常過度自信 | 有 |
| Guardrail 模型（Llama Guard、ShieldGemma、審核 API） | 不要 | 便宜到免費 | 幾十毫秒 | 類別分數，只限安全 | 無 |
| **Jev** | 不要 | TypeSafe 評測上每案約 0.0004 美元；短訊息 0.00002 | 0.2–0.6 秒 | 專門訓練並校準 | 無 |

## 對照測試怎麼說

- **Near Here，活動驗證，50 筆真實案例**（2026-09-16）：Jev 96% 對 Gemini 3.5 Flash-Lite 86% 對 Mistral Small 4 84%；Jev 沒拒絕任何一個 13 筆有效活動；中位數 0.58 秒對 2.7–3.4 秒；每千次決策 0.043 美元對 0.37–2.50 美元。他們的但書：任務窄，案例影響了 prompt 選擇。
- **Ben Greenberg，黑客松評審關卡，102 件 × 3 輪**（2026-09-18）：Jev Choice 加四個 Noul 100% 對 Claude Sonnet 5（高推理）99%；Jev 只用 Choice 的兩個錯落在信心 0.2–0.3，Sonnet 的三個錯落在 0.9–1.0；ECE 0.037 對 0.058；378 毫秒對 3,554 毫秒；一萬次評估 2.27 美元對 129.74 美元。信心門檻 0.5 時他能自動化 98% 的決策且其中 100% 正確。
- **Arize 的垃圾郵件測試**：零樣本 98.3%；0.1 以下只有 0.1% 是垃圾，0.9 以上 99.9% 是，0.5–0.6 區間 38%。那條曲線就是產品。
- **一次目錄重排實測，33,047 筆、164 個查詢、9,831 對評分**：回報單靠 Jev 重排沒有打敗現有方案。重排是專用 cross-encoder 最強的主場（Qwen3-Reranker-8B 在 BTZSC 零樣本分類基準以 macro F1 0.72 居首）；Jev 在那裡的位置是短清單上的第二階段，或 reranker 沒訓練過的相關性準則。

## 怎麼選

| 你有 | 用 | 因為 |
| --- | --- | --- |
| 幾千筆標籤與固定任務 | 微調編碼器或 embedding 加邏輯迴歸 | 個位數毫秒、跑在自己硬體、規模化最便宜 |
| 沒標籤、任務用白話定義、需要能用的機率 | **Jev** | 零樣本、校準、快、便宜；黃金測試集是 20 筆不是 2,000 筆 |
| 需要用文字說*為什麼* | 對樣本用 LLM 評審 | Jev 從不解釋；全部用 Jev 跑，失敗的抽樣過 LLM |
| 純粹對大量文件做相關性排序 | 先 reranker，再 Jev | reranker 贏在主場；Jev 補它們沒有的準則 |
| 只要安全類別 | guardrail 模型，或用 Jev 自己寫危害問題 | guardrail 模型是固定分類法；Jev 讓你自己寫危害 |
| 寫得出來的規則 | 規則引擎，Jev 填語意事實 | 能決定性就決定性 |

## 像 `jev-workflow` 這樣的 skill 與 agent 工具

2026-09-19 檢視。五樣東西與本 repo 的 `jev-workflow` 有重疊；沒有一個做同一件事。

| 專案 | 是什麼 | 與 jev-workflow 的重疊 | 差異 |
| --- | --- | --- | --- |
| 官方 `typesafe-ai` skill | API 契約、基本型別、模式、cookbook | 無；它是前提 | 知道*怎麼呼叫* Jev；對黃金測試集、門檻集中、log、失敗放行隻字未提 |
| **Augustus**（24601） | 設計型 skill：把 Choice／Score／Noul 對應到決策理論、MCDA、訊號偵測、失敗放行對失敗封閉；自稱官方 skill 的「夥伴而非替代」 | 精神上最接近：都在談*該不該*與*放哪裡* | Augustus 理論優先、跨領域（商業、生活）；jev-workflow 是對一個程式碼庫的作業程序（找味道 → 問題檔 → `jev check` → 政策 → log）。用 Augustus 決定，用 jev-workflow 交付 |
| **jev-judgment**（HyunjunJeon） | 執行期 skill：agent 在三個時刻呼叫 Jev（問使用者封閉問題前、跑危險指令前、停止前） | 都改變 agent 行為 | 它讓 agent 在自己工作時*使用* Jev；jev-workflow 讓 agent 把 Jev *建進*使用者的程式碼。互補 |
| **jev-code**（devagrawal09） | agent 可委派的 CLI 工具組：找相關檔案、對照任務檢查 diff、分流測試失敗與審查意見 | 都把 agent 的判斷框起來 | 它是四個固定工作流與自己的問題；jev-workflow 替使用者自己的問題產生新問題 |
| **jev-superpowers**（AkashPriyadarshii） | 「superpowers」開發框架換上 Jev 關卡：套件查核、完成關卡 | 都加關卡 | 它是一整套方法論；jev-workflow 是加到你現有方法論上的一個 skill |
| typesafe-mcp、jev-mcp、pi-typesafe-jev、SemDecide | 把 Jev 暴露給 agent 或 shell 的工具 | 無；它們是 jev-workflow 叫 agent 去用的管線 | 沒有工作流、沒有紀律 |

只有這裡有的：六步順序（味道 → 問題檔 → 黃金測試集 → 單一政策 → 安全預設 → 回報）、`jev check --strict` 的 CI 關卡、`jev view` 的 log、以及把同一套順序教給人的雙語教程。只有別處有的：Augustus 的決策理論框架（設計高風險關卡前值得讀）、jev-judgment 的執行期掛鉤（值得裝，讓 agent 自己少猜）。三者都能用 `npx skills add` 並排安裝。

## Jev 的位置最弱的地方

三件事可能很快侵蝕它：LLM 廠商以 Haiku 級價格開放校準的 logprob 加受限解碼；開源 reranker 或編碼器微調成回傳校準判斷；以及競品普遍可用時 Jev 仍有速率上限或早期存取限制。釘住版本、把問題與黃金測試集放在檔案裡，換掉它就只是改客戶端。
