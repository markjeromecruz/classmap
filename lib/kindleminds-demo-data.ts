import type { Room, Thread } from "./kindleminds-types";

export const ROOMS: Room[] = [
  {
    slug: "classical",
    name: "The Classical Room",
    tradition: "Classical · trivium / quadrivium",
    blurb:
      "Grammar, logic, rhetoric. Great Books, Latin, formal recitation. Parents teaching toward the permanent things.",
    members: 1842,
    accent: "ink",
  },
  {
    slug: "charlotte-mason",
    name: "Charlotte Mason Room",
    tradition: "Charlotte Mason · living books, narration, nature",
    blurb:
      "Short lessons, copywork, narration after a single reading, and long unhurried afternoons outdoors with a sketchbook.",
    members: 2204,
    accent: "sage",
  },
  {
    slug: "unschooling",
    name: "The Unschoolers' Room",
    tradition: "Unschooling · child-led inquiry",
    blurb:
      "No curriculum. Just real life, deep interests, and a parent who can answer 'I wonder why…' for the seventh time today.",
    members: 1117,
    accent: "clay",
  },
  {
    slug: "eclectic",
    name: "The Eclectic Bench",
    tradition: "Eclectic · piece together what works",
    blurb:
      "Saxon math, Story of the World, a little Waldorf, a lot of pragmatism. The room for parents who don't pick a team.",
    members: 1503,
    accent: "ink",
  },
  {
    slug: "montessori",
    name: "Montessori at Home",
    tradition: "Montessori · prepared environment, multi-age",
    blurb:
      "Practical life, sensorial materials, the famous shelves. For families running a Montessori day inside a regular house.",
    members: 869,
    accent: "sage",
  },
];

export const THREADS: Thread[] = [
  {
    id: "th-cls-01",
    roomSlug: "classical",
    title: "When did you start formal Latin?",
    author: "@helena_p",
    postedAt: "2026-05-19T14:12:00.000Z",
    body: "We have a 7yo who's been doing English grammar and is asking for Latin. I had planned to wait until 4th grade per the standard trivium schedule. Is starting earlier going to confuse, or am I overthinking this?",
    views: 318,
    replies: [
      {
        id: "rp-1",
        author: "@thomasr",
        postedAt: "2026-05-19T15:42:00.000Z",
        body: "We started at 6 with Song School Latin and never regretted it. Grammar stage kids love memorizing weird words.",
      },
      {
        id: "rp-2",
        author: "@meganhs",
        postedAt: "2026-05-19T20:01:00.000Z",
        body: "Started ours at 8. Honestly it was fine. Either path works as long as it's consistent.",
      },
    ],
  },
  {
    id: "th-cls-02",
    roomSlug: "classical",
    title: "Memory Master year — which spine?",
    author: "@danielw",
    postedAt: "2026-05-21T09:30:00.000Z",
    body: "Going into the third year of CC. Looking for opinions on a history spine to read alongside — Story of the World vs Mystery of History vs just primary sources.",
    views: 142,
    replies: [],
  },
  {
    id: "th-cm-01",
    roomSlug: "charlotte-mason",
    title: "Narration with a child who is shy",
    author: "@kerrigan",
    postedAt: "2026-05-20T11:08:00.000Z",
    body: "My 8yo reads beautifully but freezes during oral narration. Tried written narration — also freezes. Drawing helps a little. Anyone navigated this?",
    views: 256,
    replies: [
      {
        id: "rp-3",
        author: "@laurenj",
        postedAt: "2026-05-20T13:22:00.000Z",
        body: "We did 'tell it to the cat' for a year. No joke. The pressure-free audience worked wonders.",
      },
    ],
  },
  {
    id: "th-cm-02",
    roomSlug: "charlotte-mason",
    title: "Nature journal — paper, paint, what works",
    author: "@frankie",
    postedAt: "2026-05-22T06:14:00.000Z",
    body: "Tried watercolor on cheap sketchbooks and the pages buckled. What does everyone use that isn't $40 a notebook?",
    views: 410,
    replies: [],
  },
  {
    id: "th-us-01",
    roomSlug: "unschooling",
    title: "Six months in and grandparents are nervous",
    author: "@oliver",
    postedAt: "2026-05-18T19:00:00.000Z",
    body: "How do you explain to a worried grandparent that 'doing nothing' is actually doing something? Looking for a script that doesn't sound defensive.",
    views: 622,
    replies: [
      {
        id: "rp-4",
        author: "@petra",
        postedAt: "2026-05-18T22:15:00.000Z",
        body: "I keep a notebook of what the kids actually do each day. When grandma asks, I read three entries. Stops the conversation cold.",
      },
    ],
  },
  {
    id: "th-us-02",
    roomSlug: "unschooling",
    title: "Math without a curriculum?",
    author: "@nadia_r",
    postedAt: "2026-05-21T16:45:00.000Z",
    body: "I'm comfortable with reading-as-it-comes, but math worries me. Anyone genuinely unschooling math through middle school?",
    views: 281,
    replies: [],
  },
  {
    id: "th-ec-01",
    roomSlug: "eclectic",
    title: "Pulling the best from three programs",
    author: "@sammie",
    postedAt: "2026-05-22T10:30:00.000Z",
    body: "We're using Saxon for math, Story of the World for history, and bits of Brave Writer for writing. Anyone running a similar mash and want to compare?",
    views: 188,
    replies: [],
  },
  {
    id: "th-ec-02",
    roomSlug: "eclectic",
    title: "When to drop something that isn't working",
    author: "@isabelm",
    postedAt: "2026-05-19T08:00:00.000Z",
    body: "Spent six weeks pushing through a grammar program both kids hate. How long do you give a curriculum before swapping?",
    views: 339,
    replies: [
      {
        id: "rp-5",
        author: "@reece",
        postedAt: "2026-05-19T08:55:00.000Z",
        body: "Two weeks of genuine effort. If it's still a fight, it's the wrong book for the kid.",
      },
    ],
  },
  {
    id: "th-mo-01",
    roomSlug: "montessori",
    title: "Apartment-sized prepared environment",
    author: "@coraline",
    postedAt: "2026-05-20T17:20:00.000Z",
    body: "We have 850 square feet and two kids under six. How do you set up shelves without losing the living room?",
    views: 192,
    replies: [],
  },
  {
    id: "th-mo-02",
    roomSlug: "montessori",
    title: "Three-period lesson — when does it click?",
    author: "@beatrice",
    postedAt: "2026-05-21T14:00:00.000Z",
    body: "I'm trained but still get tripped up on the rhythm. Any tips for getting the three-period lesson to feel natural rather than scripted?",
    views: 145,
    replies: [],
  },
];

export function getRoom(slug: string): Room | undefined {
  return ROOMS.find((r) => r.slug === slug);
}

export function getThreadsForRoom(slug: string): Thread[] {
  return THREADS.filter((t) => t.roomSlug === slug);
}

export function getThread(id: string): Thread | undefined {
  return THREADS.find((t) => t.id === id);
}
