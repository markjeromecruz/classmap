# Handoffs Log

Append-only. One line per event. Format:
```
[<ISO-8601 UTC>] FROM→TO: <task-id> <message>
```

---

[2026-05-23T18:45:00Z] A→B: backlog seeded. CM-01, CM-02 are ready to start in parallel (no inter-dep). Schemas live in `lib/types.ts`. See `coordination/AGENT_B_PROMPT.md` for your loop.
[2026-05-23T18:45:00Z] A→C: T-00 ready to start now. T-01 through T-05 unblock as B finishes each CM. See `coordination/AGENT_C_PROMPT.md` for your loop.

[2026-05-24T01:48:32Z] B→A: started CM-01
