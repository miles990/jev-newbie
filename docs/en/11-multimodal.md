# Working around images and audio

The API used in this kit accepts text and JSON. An image URL or base64 string does not mean Jev has seen the image.

```text
image/audio → OCR, vision, or transcription → text → several Jev questions → code
```

A meeting transcript can be checked for action items, decisions, and topics. Jev can choose among OCR candidates using context, but cannot recover evidence omitted by the perception tool.

Metadata can support preliminary routing, not verification of unseen content. Keep totals, numeric comparisons, and dates in code.

This is an architecture guide; the repository does not include OCR, transcription, or a complete multimodal application.
