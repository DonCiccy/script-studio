# Script Studio

**AI-powered video script generator for founders and content creators.**

Platform → objective → ideas → structured script → teleprompter. Two versions: a standalone HTML file that works anywhere, and a React artifact for Claude.ai.

**[→ Live demo](https://donciccy.github.io/script-studio)**

---

## What it does

- **16 narrative structures** — each platform × objective combination has its own script architecture (HOOK / PROBLEM / WORSE / RELEASE for Meta Ads problem agitation; OPENING / ARGUMENT / CLOSE for LinkedIn POV; etc.)
- **Knowledge Base** — stores your background, your product/service, proof points with real numbers, content pillars, and reference scripts. The AI uses this instead of generating generic copy.
- **Idea generation** — generates 8 specific ideas per session, grounded in your KB, without repeating previous ones.
- **Teleprompter** — fullscreen autoscroll with 5 speed levels. Space to play/pause, ← → for speed, R to restart.
- **History** — save and delete scripts.

---

## Versions

### `script-studio.html` — Standalone file

Works in any browser from `file://`. No installation, no server, no account.

Supports three AI providers:
| Provider | Cost | Key from |
|---|---|---|
| Google Gemini | Free · 1000 req/day | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| Claude Sonnet | ~€1/month | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| GPT-4o | ~€1–2/month | [platform.openai.com](https://platform.openai.com/api-keys) |

**Setup:** Open the file → choose provider → paste key → enter your name and brand → done.

**Recommendation:** Start with Gemini (free, no credit card). Switch to Claude Sonnet or GPT-4o when you need better script quality.

### `script-studio.jsx` — Claude.ai Artifact

For use inside Claude.ai. Uses Claude Sonnet directly — no API key needed, covered by your Claude subscription.

**Setup:**
1. Open Claude.ai → Artifacts section → **New Artifact**
2. Choose type: **React**
3. Paste the contents of `script-studio.jsx`
4. The tool opens directly in the artifact viewer

Storage persists between sessions via Claude's artifact storage API.

---

## Customization

### Making it yours

The tool asks for your name and brand on first launch. This gets injected into every prompt — scripts are written as if you're speaking, not as generic marketing copy.

For best results, fill in the Knowledge Base:

**About you** — Write as if briefing a ghostwriter: your background (the interesting version), how you talk, what you'd never say.

**Brand / Product** — What it does, who it's for, what makes it different from alternatives. Be specific.

**Proof Points** — At least 5 specific results with real numbers. These are the single most important thing you can add.

**My Style** — Paste 2–3 of your best existing scripts. The AI will match your voice instead of guessing at it.

### Adding platforms or objectives

Edit the `PL` array in the source. Each objective needs a `key`, `label`, `desc`, and `guide`. Add a matching entry in `STRUCT` to give it a labeled section structure.

### Changing the AI model

In the HTML version: open settings (model indicator, top right) → switch provider and model.

In the JSX version: change `model:"claude-sonnet-4-6"` in the `callClaude` function to any available model string.

---

## Quality notes

The tool generates scripts, not marketing copy. There's a difference: copy is written to be read on a screen; a script is what someone will say aloud while looking at a camera.

The prompts enforce this: no taglines, no "Stop X. Start Y." patterns, no third-person brand voice ("At [Brand], we..."), no bullet-point structures. The model is explicitly instructed to write like the person actually talks.

**Quality ceiling:** Even well-prompted models generate generic output when the Knowledge Base is empty. A specific proof point ("A client in Hamburg reduced month-end close from 3 days to 4 hours") produces a different quality of script than a vague one ("clients save time"). Fill the KB before judging the output.

---

## License

MIT — use, modify, distribute freely.
