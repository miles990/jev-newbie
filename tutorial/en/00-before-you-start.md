# Lesson 0: before you start

This tutorial assumes nothing except that you can open a terminal and paste a line into it. If you have never done that, this page is for you.

## What you are about to use

**Jev** is a service on the internet. You send it a short piece of text and a question; it sends back a number between 0 and 1, or a pick from options you gave it, in under a second. It costs about two hundredths of a cent per question. You use it through an **API key**, which is a long password that identifies you.

**The `jev` command** in this repo is a small program that sends the question for you and prints the answer, so you never have to write code to try things.

## Do, once

1. **Get a key.** Go to <https://console.typesafe.ai>, sign up, create a key. It looks like `apikey_...`. Treat it like a password.
2. **Open a terminal.** macOS: press ⌘ Space, type `Terminal`. Windows: install [Git for Windows](https://gitforwindows.org) and open "Git Bash". Linux: you know.
3. **Install Node.js 20 or newer** from <https://nodejs.org> if `node -v` prints nothing.
4. **Get this repo and set it up:**

   ```sh
   git clone https://github.com/miles990/jev-newbie
   cd jev-newbie
   export TYPESAFE_API_KEY=apikey_...      # paste your key
   ./scripts/setup.sh
   jev doctor
   ```

   `jev doctor` should print a line ending in `✓`. If it complains about the key, the `export` line did not run in this terminal; run it again.

5. **Make the key permanent** by adding the `export TYPESAFE_API_KEY=...` line to `~/.zshrc` (macOS) or `~/.bashrc` (Linux, Git Bash), so you do not paste it every time.

## Three words you will see

- **state**: the thing being judged. A message, a paragraph, or a small JSON object with named parts.
- **question**: what you want to know about it. Yes/no, pick one, or rate.
- **probability / confidence**: how sure the answer is. 0.95 is very sure; 0.5 is a coin flip. You will decide what to do with those numbers; the model never acts on its own.

## The story the lessons follow

Your own inbox: email, group chats, notifications. Bills hide among ads, a fake parcel notice looks like a real one, your mother's question sits under a clinic reminder. Each lesson takes one real frustration from that pile and shows the Jev capability that fixes it, with the real output it produced.

Next: [Lesson 1: your first call](01-first-call.md)
