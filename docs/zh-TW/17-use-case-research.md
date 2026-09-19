# Jev 可以怎麼用：來源研究與實作取捨

研究日期：2026-09-19。範圍是 **18 個 GitHub 專案、3 則 Reddit 資料、6 則 X 貼文、1 篇作者文章**，共 28 份資料、224 項 Jev 判斷；同源轉述不代表獨立驗證。另讀官方文件與社群索引。這不是全網清單，也沒有重現每個專案的效能。

## 先掌握一個用法

把大工作拆成「看懂這份資料後，回答幾個明確問題」，一起交給 Jev，再用普通程式組合答案。比如收集學習資料後，同時問「適合初學者嗎」「有練習嗎」「主要是廣告嗎」，再決定閱讀順序。

| 想改善什麼 | Jev 負責 | 其他工具／程式負責 | 如何確認有改善 |
| --- | --- | --- | --- |
| 蒐集整理 | 分類、相關性、多維評分 | 搜尋、下載、去重、保存來源 | 人工標記樣本的漏選率與排序品質 |
| 電腦操作 | 挑控制項與動作 | 讀取介面、點擊、觀察結果 | 完整任務成功率、耗時、操作錯誤 |
| 程式開發 | 候選檔案與風險預篩 | 查符號、修改、測試、審查 | 是否少讀無關檔案、是否漏掉真正問題 |
| 長任務 | 路由、保留哪些上下文、是否喚醒 | 保存原始紀錄與執行工作 | 成本與品質一起比較，含漏資訊情況 |
| 寫作與引用 | 依規則標記可疑句子 | 寫文章、取來源、確認引用 | 人工接受率與漏檢率 |
| 組合內容／遊戲 | 選地形參數、策略、候選落點 | 物理、可達性、素材、組裝 | 可玩性與普通演算法基準 |

**平行是重要強項，但前提是問題彼此獨立。**「一請求多題」與「多請求併發」分開測；[本機實測](14-speed-and-computer-use.md)四題一起問的中位數 258 ms，四次依序問 1,018 ms。沒有據此宣稱所有流程都比較快。

## 如何使用 Jev 做這次研究

搜尋與來源擷取使用 GitHub CLI、X／Reddit 讀取工具、網頁工具；Jev 自己不是搜尋引擎。把來源整理成 JSONL，再使用[八題問題檔](../../examples/research/questions.json)做批次判斷。每筆保留網址與 Git revision，模型輸出保存在[研究判斷紀錄](../research/judgments-2026-09-19.json)。

模型不能取代來源核對：它把 MCP 主要類型判成 routing；也低估 Jev-cu 的同請求多題特性，因為 README 沒有充分描述請求形狀。原始判斷保留不改，下面的用途依文件與相關程式人工整理。分數衡量提供的文字，不等於專案真實能力、值得安裝程度或可靠性。

自己試：

```sh
node bin/jev.mjs run examples/research/questions.json examples/research/demo-sources.jsonl --label my-research
node bin/jev.mjs view
```

示範資料是自己撰寫的短教材，非作者原文、效能證據或本次完整研究資料。換成自己的資料時，每行放 `source_id`、`url`、`content`。先保留全部結果、核對引用，再考慮自動篩除低分項目。

## 案例與來源

| 來源 | 用途 | 判讀與限制 |
| --- | --- | --- |
| [0xNatoshi/jev-codex-router](https://github.com/0xNatoshi/jev-codex-router/blob/main/README.md) | 模型路由 | 每回合挑模型與思考程度；作者回放測試不等於你的任務品質保證。 |
| [AboveColin/HA-Jev](https://github.com/AboveColin/HA-Jev/blob/main/README.md) | 家庭自動化 | 把家庭狀態判斷變成 Home Assistant 感測器或動作；需要該環境。 |
| [AkashPriyadarshii/jev-curate](https://github.com/AkashPriyadarshii/jev-curate/blob/main/README.md) | 資料篩選 | 批量篩選 JSONL／Parquet；大型吞吐宣稱未在本機重測。 |
| [DanRWilloughby/snifftest](https://github.com/DanRWilloughby/snifftest/blob/main/README.md) | 寫作檢查 | 可數規則用程式、主觀規則用 Jev；是風格提示，不是可靠 AI 作者偵測。 |
| [MarissaFamularo/citation-verifier](https://github.com/MarissaFamularo/citation-verifier/blob/main/README.md) | 引用檢查 | 先取得被引用資料，再判斷句子是否有支持；另用生成模型。 |
| [Sac-Y/Jev-cu](https://github.com/Sac-Y/Jev-cu/blob/main/README.md) | 電腦操作 | 從無障礙文字挑元素與動作；本次已安裝並測快照。 |
| [dbreunig/building-with-jev-skill](https://github.com/dbreunig/building-with-jev-skill/blob/main/README.md) | 開發知識 | 教 agent 設計問題與整合程式；不是新增模型能力。 |
| [devagrawal09/jev-code](https://github.com/devagrawal09/jev-code/blob/main/README.md) | 程式開發 | 找檔案、檢查差異、整理失敗與評論；輸出僅供審查。 |
| [hev/reranker](https://github.com/hev/reranker/blob/main/README.md) | 資料排序 | 一份輸入含多篇候選，每篇各問一個相關性問題；已安裝實測。 |
| [itsmostafa/typesafe-mcp](https://github.com/itsmostafa/typesafe-mcp/blob/main/README.md) | 呼叫介面 | 讓 agent 直接問 Jev；不是模型路由器。 |
| [komikat/jev-bfs](https://github.com/komikat/jev-bfs/blob/main/README.md) | 搜尋導航 | 以 Jev 排序 Wikipedia 出站連結，由程式控制找路。 |
| [leepokai/jev-guard](https://github.com/leepokai/jev-guard/blob/main/README.md) | 工具關卡 | 判斷工具呼叫與輸入風險；不能據此取消原本權限邊界。 |
| [moritzkremb/jev-voice-browser](https://github.com/moritzkremb/jev-voice-browser/blob/main/README.md) | 語音操作 | 語音轉文字後判斷意圖與目標，由 Playwright 操作。 |
| [mrnugget/jev-shell-history](https://github.com/mrnugget/jev-shell-history/blob/main/README.md) | 命令提示 | 從既有 shell 歷史挑選補全；會送出歷史內容。 |
| [shitianfang/wakegate](https://github.com/shitianfang/wakegate/blob/main/README.md) | 喚醒篩選 | 判斷事件是否值得喚醒完整 agent；必須衡量漏掉重要事件。 |
| [superagents-lab/jev-search](https://github.com/superagents-lab/jev-search/blob/main/README.md) | 搜尋整理 | Search1API 取得搜尋結果，Jev 選來源與排序；需要額外服務設定。 |
| [tamaratran/fast-jev-compaction](https://github.com/tamaratran/fast-jev-compaction/blob/main/README.md) | 上下文整理 | 刪除或縮短舊工具輸出；保留內容不改寫，但刪除仍可能失去資訊。 |
| [teyhouse/jev-secret-detection](https://github.com/teyhouse/jev-secret-detection/blob/main/README.md) | 偵測評測 | 對片段是否含憑證做標記測試；不可拿真實私密金鑰當教材。 |
| [reddit-1wiw6tk](https://www.reddit.com/r/SideProject/comments/1wiw6tk/i_built_a_side_project_to_test_typesafes_jev/) | 多維評分 | killmyidea：多題評分後用程式加權；沒有證明能預測創業成敗。 |
| [reddit-1whsav6](https://www.reddit.com/r/PiCodingAgent/comments/1whsav6/anyone_else_testing_out_typesafe_ais_new_system/) | 關卡／路由討論 | Pi 社群想法與實作討論，不當成效果 benchmark。 |
| [reddit-1wiu1ej](https://www.reddit.com/r/LLMDevs/comments/1wiu1ej/typesafe_jev_secret_detection_test/) | 偵測評測 | 與 secret-detection 同源案例，不重複計算成獨立驗證。 |
| [x-sac](https://x.com/Saccc_c/status/2101152089598791845) | 電腦操作 | Jev-cu 展示，與 GitHub 同源。 |
| [x-kagerou](https://x.com/shiromacKagerou/status/2100827466059444311) | 介面觀點 | 強調型別化輸出容易整合；不能由此推論所有 LLM 結構化輸出都較差。 |
| [x-tetris](https://x.com/J_niwacis/status/2100791658346676691) | 遊戲決策 | 候選落點由程式計算，Jev 選擇；作者報告普通演算法基準仍較好。 |
| [x-hugo](https://x.com/HugoDuprez/status/2100953089003921543) | 組合關卡 | Sprite Fusion 展示，與作者文章同源。 |
| [x-berman](https://x.com/TheMattBerman/status/2100654891756589230) | 廣告批次分析 | 作者稱 724 則／37 品牌／40 秒／$0.09；回覆補充 Gemini pipeline 與 embedding，總管線成本範圍未明。 |
| [x-yyyole](https://x.com/yyyole/status/2100879695017632025) | 廣告批次分析 | 轉述 Berman 同一影片；landing page mismatch 是內容落差，不等同檢查連結是否正常。 |
| [spritefusion-levels](https://www.spritefusion.com/blog/generating-game-level-in-real-time-with-jev) | 組合關卡 | 多個 choice 決定地形參數，由程式組裝；作者五次測量，無傳統方法對照。 |

## 你分享的展示，能證明到哪裡？

- **廣告分析**：Berman 原文說 724 則廣告、37 品牌、40 秒、$0.09 tokens，並在回覆提到 Gemini pipeline 與 embedding。這是作者報告，未提供本次可重跑的資料和完整成本拆帳。Jev 的型別化分類可用於廣告面向分析，影像／影片理解須看前處理。沐陽貼文是同源轉述。
- **即時關卡**：Sprite Fusion 用多個選擇組合四個平台，再由程式建立地形。這是內容組合，而非輸出完整地圖程式或美術素材。跨平台的可達性仍需程式驗證。
- **Tetris**：作者十局對照報告 Jev 通關 8/10、Haiku 9/10、普通演算法 10/10；Jev 較 Haiku 快不代表勝過專用演算法。本次未重跑。

## 工具選擇

本次本機已配置 `jev` CLI、既有 evaluate MCP、`jev-rerank`、`jev-code` 與 Jev-cu 的 `jev-use` skill。操作與驗證邊界見[工具實測紀錄](../local-tools-2026-09-19.md)。這是這台電腦的配置，不是 clone 本教學就會自動安裝的內容。

暫不全域啟用 compaction、router、guard、shell-history：它們改變常駐工作方式，現階段沒有這台電腦上「品質不下降而且更快」的對照結果。Search1API、Home Assistant、語音瀏覽器各有額外服務或環境需求。列入案例不等於每個都值得疊加安裝。

原 `jev-workflow` 只有一般整合步驟，與教程及官方 TypeSafe skill 重複，已改為[普通整合指南](16-agent-integration.md)。Jev-cu 的 `jev-use` 則有具體操作迴圈、本地執行腳本與 policy；它有不同的實際角色。

## 繼續探索

[Logicrw 的 Awesome Jev](https://logicrw.github.io/awesome-jev-projects/)與[來源倉庫](https://github.com/logicrw/awesome-jev-projects)適合找專案；[作者介紹](https://x.com/0xLogicrw/status/2100861912590205411)提到當时 130+，本次讀取 README 已標 260+，數字會變動。索引的「已核驗」或速度敘述不能代替你自己的端到端測試。先依需求挑候選，再讀原始碼和測試，無需把幾百個工具都安裝。

[官方 use-case map](https://docs.typesafe.ai/concepts/use-case-map)用來理解模式；社群索引用來找實作；本地對照測試用來決定是否採用。
