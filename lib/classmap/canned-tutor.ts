// Canned exchanges for demo mode (GitHub Pages). The live build calls `claude -p` instead via /classmap/api/tutor.

export interface CannedExchange {
  /** Case-insensitive substring or RegExp matched against the user message. */
  trigger: string | RegExp;
  /** 2–4 sentences. Plain text. No markdown headers. No emoji. */
  reply: string;
}

export const CANNED_TUTOR_EXCHANGES: CannedExchange[] = [
  {
    trigger: /stuck|don'?t know|don'?t get/i,
    reply:
      "Okay, let's slow down for a second. Tell me the part you can actually see clearly first — even one piece of it. What did you try last, and what happened when you tried it?",
  },
  {
    trigger: /answer|just tell me/i,
    reply:
      "I'm not going to hand you the answer — that's not the deal we're working under. But I'll get you there fast if you stay with me. What does the very first step look like to you?",
  },
  {
    trigger: /why|when am i ever|what'?s the point/i,
    reply:
      "Fair question, and I'd rather you ask it than fake interest. Where do you think a grown-up actually uses this in real life? Throw out one example, even a silly one, and we'll work from there.",
  },
  {
    trigger: /explain|how does this work/i,
    reply:
      "Sure, but I want to start from the right spot. Pick the smallest piece of this you don't get — not the whole thing, just the one blurry word or step. Read me that piece and we'll go from there.",
  },
  {
    trigger: /bored|boring|hate this/i,
    reply:
      "Boring is a clue, not a verdict — usually it means the work isn't matched to you yet. What would make this less boring in the next 60 seconds? Want to race the clock, or turn it into a challenge?",
  },
  {
    trigger: /check|did i get it right|is this right/i,
    reply:
      "Walk me through how you got there, step by step. If you can teach it back to me out loud, you've actually got it — and if you stumble somewhere, that's the spot we'll look at together.",
  },
  {
    trigger: /hint|clue|help me/i,
    reply:
      "I can give you a nudge, not a shove. What's the very next thing you'd try if I weren't here? Say it out loud first, then we'll see if it holds up.",
  },
  {
    trigger: /give up|quit|i can'?t/i,
    reply:
      "Hold on — quitting and resting are different things. Are you actually stuck, or just tired? Tell me which one, and we'll decide what to do next together.",
  },
];

/** Returns the first matching reply, or a polite fallback when nothing matches. */
export function matchTutorReply(userInput: string): string {
  const lowered = userInput.toLowerCase();
  for (const exchange of CANNED_TUTOR_EXCHANGES) {
    if (typeof exchange.trigger === "string") {
      if (lowered.includes(exchange.trigger.toLowerCase())) {
        return exchange.reply;
      }
    } else {
      if (exchange.trigger.test(userInput)) {
        return exchange.reply;
      }
    }
  }
  return 'I\'m running in demo mode, so I\'m replying from a small script. Try "I\'m stuck" or "can you explain" to see a real tutor exchange. Run the app locally to chat live.';
}
