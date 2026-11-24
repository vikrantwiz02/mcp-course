# MCP, Visually

An interactive, visual course on the **Model Context Protocol (MCP)**, from first principles to authorization and security. Every concept is an animated isometric diagram you step through, with the exact JSON on the wire, inline quizzes, and a playground that simulates a real MCP server.

Content follows the MCP specification **2026-07-28**, the current version at the time of writing, including how it interoperates with older (2025-11-25 and earlier) clients and servers.

## What's inside

- **28 lessons in 9 chapters, 243 steps.** Foundations, JSON-RPC messages and `_meta`, error codes, stateless design and `server/discover`, stdio and Streamable HTTP, tools, resources, prompts and completion, multi round-trip requests, elicitation, subscriptions, progress and cancellation, pagination and caching, deprecated features, extensions and tasks, OAuth authorization, security threats, and server design.
- **Step-through diagrams.** Animated packets show requests, responses, notifications and errors moving between host, client and server. Metric chips update as you go.
- **`{ }` JSON panel.** Shows the exact message behind every arrow.
- **34 inline quizzes** with instant explanations.
- **Playground.** You act as the client against a simulated modern server. Toggle `_meta`, protocol versions, capabilities, header mismatches and tampered `requestState`, then see the spec-correct response and why.
- **Missions, Cheatsheet and Glossary.** Hover any dotted term in a lesson for its definition.

## Run it

No build step. Open `index.html` in a browser. A local server works too:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

Keyboard: `←` `→` step · `J` toggle JSON · `R` replay · `Space` pause.

## Structure

```
index.html          page shell
base.css, extra.css styles (light and dark)
engine.js           isometric renderer, step player, quizzes, views
playground.js       simulated MCP server
content/            lessons, glossary and cheatsheet (one file per chapter group)
```

## Source

All protocol facts are taken from the official specification at https://modelcontextprotocol.io/specification/2026-07-28.
