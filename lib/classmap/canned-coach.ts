// Canned exchanges for demo mode (GitHub Pages). The live build calls `claude -p` instead via /classmap/api/coach.

export interface CannedExchange {
  /** Case-insensitive substring or RegExp matched against the user message. */
  trigger: string | RegExp;
  /** 2–4 sentences. Plain text. No markdown headers. No emoji. */
  reply: string;
}

export const CANNED_COACH_EXCHANGES: CannedExchange[] = [
  {
    trigger: /won'?t focus|can'?t focus|distracted/i,
    reply:
      "First question before I suggest anything: is the focus problem worse at a certain time of day, or pretty even across the morning and afternoon? Most families I work with discover the wall hits around 11am, and moving the hardest subject to the first 45 minutes of the day fixes more than any new curriculum would. In live mode I'd pull your child's actual completion data and tell you exactly when their focus drops.",
  },
  {
    trigger: /switch curriculum|change curriculum|new curriculum/i,
    reply:
      "Before you switch, I want to know what specifically isn't working — is it the materials themselves, the pace they're being asked to move at, or the relationship your child has with the subject? Those three problems all look identical from the outside and need completely different fixes. A useful frame: pick one thing to change for two weeks, then judge — full curriculum swaps mid-year usually create more chaos than they solve.",
  },
  {
    trigger: /state|compliance|requirements/i,
    reply:
      "Which state are you in? I want to point you at the right answer rather than a general one — and the State Requirements panel on the Family page has the specifics for hours, subjects, and notification of intent. In live mode this would already know your state from your family profile and give you the exact citation.",
  },
  {
    trigger: /behind|fell behind|catch up/i,
    reply:
      "Gentle pushback first: behind whom? There's no universal pace in homeschool, and most of the time \"behind\" means behind a public-school scope-and-sequence that wasn't designed for one kid anyway. Try a one-week reset — pick the two subjects that matter most, do those well, let the rest breathe — rather than sprinting to catch up and burning everyone out.",
  },
  {
    trigger: /hate (math|reading|writing|science)|won'?t do (math|reading|writing|science)/i,
    reply:
      "Quick clarifying question: is it the subject they hate, or the format you're delivering it in? Those are very different problems. Try one format swap for a single week — a game, a story, or a project instead of a worksheet — and see whether the resistance was about the content or the container it came in.",
  },
  {
    trigger: /screen time|tablet|phone/i,
    reply:
      "Before we talk limits, I want to know which kind of screen time you mean — consumption (watching, scrolling, passive) or creation (building, writing, making something)? Those two things look identical on a timer but do completely different things to a kid's brain. Tell me which one you're worried about and we can talk about what actually helps.",
  },
  {
    trigger: /sibling|siblings|brother|sister/i,
    reply:
      "Are we talking about constant conflict, or one kid pulling focus from the other during school time? Both are normal and both have fixes, but they're different fixes. Tell me which one is louder right now and we'll start there.",
  },
  {
    trigger: /burnout|exhausted|overwhelmed/i,
    reply:
      "Whose burnout — yours or your child's? I ask because the answer changes the prescription completely, and parent burnout is the one nobody talks about. Either way, the move is usually to cut, not add — pick the one subject you can drop for a week and see what comes back.",
  },
];

/** Returns the first matching reply, or a polite fallback when nothing matches. */
export function matchCoachReply(userInput: string): string {
  const lowered = userInput.toLowerCase();
  for (const exchange of CANNED_COACH_EXCHANGES) {
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
  return 'I\'m running in demo mode and answering from a small script. Try "my kid won\'t focus" or "are we behind schedule" to see a real exchange. Run the app locally to chat live.';
}
