"""對「沒見過的東西」做篩選：固定問題、未知輸入、none 選項、低信心就攔下。
Run: .venv/bin/python examples/python/unknown_filter.py

Jev 的封閉集合限制的是答案，不是輸入。這裡的工具名稱、訊息、檔案路徑都可以是任意新東西；
固定的是問題。新類別會以「other」或平坦的機率分布出現，程式碼把它們攔下來交給人。
"""
import os
from typesafe_sdk import Choice, Noul, TypeSafeClient

# 任意、未事先列舉的輸入。有些是常見工具，有些是杜撰的，有些根本不是工具。
items = [
    "read_many_files", "google_web_search", "mcp__blender__execute_code", "str_replace_based_edit_tool",
    "frobnicate_widget", "deploy_to_production", "sequential_thinking", "banana",
]
KINDS = {
    "editing": "creates, modifies or writes file contents",
    "reading": "reads or views files, pages or resources without changing them",
    "searching": "searches file contents, names, symbols or the web",
    "command": "runs a shell command or arbitrary code",
    "other": "cannot be told from the name, or does not fit any kind above",
}

with TypeSafeClient(model=os.environ.get("JEV_MODEL")) as client:
    for name in items:
        r = client.system_one(
            state={"tool_name": name},
            questions={
                "kind": Choice(instructions="Judging from the name only, what kind of work does an AI coding agent do with this tool?", criteria=KINDS),
                "risky": Noul(instructions="Could calling a tool with this name change production systems or destroy data?"),
                "is_tool": Noul(instructions="Does this look like the name of a software tool or function at all?"),
            },
        )
        k, risky, is_tool = r.answers["kind"], r.answers["risky"], r.answers["is_tool"]
        if is_tool.noul < 0.5:
            verdict = "NOT A TOOL → ignore"
        elif k.choice == "other" or k.confidence < 0.5:
            verdict = "UNKNOWN → send to a human to name a new category"
        else:
            verdict = f"{k.choice}"
        flag = "  ⚠ risky" if risky.noul > 0.6 else ""
        print(f"{name:<32} {verdict:<48} conf={k.confidence:.2f}{flag}")
