# Watch Vault

## Technical Overview

`watch-vault` is a high-performance cinema discovery application and streaming catalog built on **TanStack Start (Nitro server runtime)**, **React 19**, and **TailwindCSS v4**. It integrates the TMDB REST API for real-time metadata, cast graphs, and rich media, alongside an autonomous **AI Concierge** that uses multi-step tool calls to query live movie data rather than relying on static model memory.

## Technical Architecture & Agent Flow

```
User Query ("Recommend a 90s sci-fi like Blade Runner")
                    │
                    ▼
[ TanStack Start SSR Server Route ]
                    │
          ┌─────────▼────────────────────────┐
          │  Pi Agent Runtime (pi-ai)        │
          │  - Conversation history buffer   │
          │  - Rate-limit & content filter   │
          └─────────┬────────────────────────┘
                    │ (Determines Tool Call: discover_movies / similar_titles)
                    ▼
         [ TMDB REST Client ] (Cached API queries)
                    │
                    ▼ (JSON response fed back as tool_result)
          ┌──────────────────────────────────┐
          │  Token Streaming Engine (SSE)    │
          └─────────┬────────────────────────┘
                    │ Token deltas
                    ▼
[ Client UI (React 19 + TanStack Query) ] ──▶ Links straight to /movies/:id
```

1. **Full-Stack SSR Foundation:** Built on **TanStack Start** with Vite 8. Leverages server functions for TMDB proxying and AI execution, keeping API secrets strictly server-side.
2. **State & URL Synchronization:** Discovery filters, sort order, and search queries are synchronized with URL search params. The UI uses **TanStack Query** for infinite scrolling, automatically prefetching the next page of results before the user hits the bottom threshold.
3. **Tool-Using AI Concierge Agent:** Built using `@earendil-works/pi-coding-agent` and `@earendil-works/pi-ai`:
   - Rather than answering from training weights, the model acts as an agent equipped with strict TMDB tools (`search_tmdb`, `discover_titles`, `get_details`, `get_similar`).
   - The agent inspects the prompt, executes relevant TMDB API queries in the background, ingests verified JSON results, and streams grounded recommendations with clickable route links back to the browser.
   - Eliminates release year, director, and cast hallucinations entirely.
4. **Client-Side Persistence:** Local watchlists, custom collections, and user star ratings are stored in local storage with immediate optimistic UI updates.
5. **Edge Rate Limiting & Safety:** Incorporates sliding-window IP rate limiting and prompt safety guards on the concierge endpoint to prevent API quota exhaustion.
