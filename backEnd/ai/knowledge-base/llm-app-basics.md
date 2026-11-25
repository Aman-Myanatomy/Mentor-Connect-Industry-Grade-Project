# Building LLM apps
Use system instructions for rules and role, and user messages for the task. Ask for structured JSON output and validate it in code. Never trust model output blindly.

## RAG basics
Retrieval augmented generation means: split documents into chunks, search the most relevant chunks for a question, and place them in the prompt so the model answers from your data. Cite sources and say "I don't know" when nothing relevant is found.

## Prompt injection
Treat retrieved documents and user text as untrusted data. Fence them in tags, restrict what the model can do, and verify every output before acting on it.
