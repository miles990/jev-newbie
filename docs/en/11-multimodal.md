# Multimodal: images, audio, video

Jev reads text and JSON only. The official docs say images, audio and video are "not supported (yet)". So a multimodal pipeline with Jev has one shape:

```text
perception model (vision LLM, OCR, ASR, a detector)  →  text or structured fields  →  Jev judges the text
```

The perception step produces words; Jev decides what the words mean for your policy. Every place Jev appears in the earlier chapters still applies, one step to the right.

## Where Jev still earns its place around media

- **Before the expensive vision call.** Most decisions about a file can be made from what surrounds it: filename, folder, sender, caption, EXIF, the message it came with. "Is this attachment likely a receipt?" over that metadata costs a hundredth of a cent; the vision call costs a hundred times more and a second or two. Gate first.
- **On the perception model's text.** A vision model writes "the invoice total is 12,480 and the due date is the 25th" or a defect report on a generated clip. Jev classifies those findings into your fixed categories, checks whether the report actually concludes pass or fail, and flags contradictions between the text and the verdict. This is exactly how the production repo behind this kit splits the work: a vision model reviews frames, Jev structures the review.
- **Choosing among candidates.** OCR gives three readings of a line; ASR gives an n-best list; a captioner gives five captions. Jev picks the one consistent with the context. Selection, not generation.
- **Verifying a claim about media without seeing it.** "Does the transcript support the summary?" "Does the alt text describe what the caption says the image shows?" Text against text.
- **Turning a transcript into decisions.** Meeting audio → transcript → per-segment Jev questions: is this an action item, who owns it, is it a decision or an open question. The audio model hears; Jev sorts.

## What does not work

- Sending base64 or a URL and hoping. The API accepts only string, object or array-of-text state. An image URL is just a string to it.
- Asking Jev about pixels through description. "Is the hair edge clean?" cannot be answered from a filename. If the judgment is visual, a vision model makes it; Jev can only judge what that model wrote.
- Numbers extracted from images. OCR digits are text, but comparing, summing and date arithmetic still belong in code.

## A concrete recipe

1. Perception: run the vision or audio model with a prompt that asks for **findings, not verdicts**: what it sees, listed plainly.
2. Structure: one Jev request over the findings with your fixed questions: category per finding, severity, does it block, does it contradict the stated verdict.
3. Policy: code decides pass, retry or escalate from the typed answers, and logs the findings, the answers and the decision together.

Step 2 is cheap enough to run on every file and stable enough to test with a golden set of past findings. Step 1 stays expensive and stays with the model that can see.
