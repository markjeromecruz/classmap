import type {
  Devotional,
  FamilyAltar,
  JournalEntry,
} from "./patriarch-types";

export const DEVOTIONALS: Devotional[] = [
  {
    id: "dev-courage",
    date: "Monday",
    theme: "Quiet courage",
    scriptureReference: "Joshua 1:9",
    scriptureText:
      "Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go.",
    reflection:
      "Courage in a household is rarely loud. It is the steady decision to be present at dinner, to apologize first, to keep your voice low when your son spills the milk for the third time, to show up to the small things on the day you would rather not. Joshua was being handed a generation's work. You are being handed today.",
    prompt:
      "Where in your home today is fear telling you to disappear or get loud? What would steady, quiet courage look like in that moment instead?",
    prayer:
      "Father, give me the courage that does not need to be seen. Make me reliable in the small rooms of my house. Strengthen me to lead in the moments no one is filming.",
  },
  {
    id: "dev-presence",
    date: "Tuesday",
    theme: "On being interruptible",
    scriptureReference: "Mark 10:14",
    scriptureText:
      "Let the children come to me; do not hinder them, for to such belongs the kingdom of God.",
    reflection:
      "Jesus was interruptible. The disciples were managing his calendar; he stopped for children. The men we admire most in our families were rarely too busy for them. Today, the kingdom is in the toddler tugging on your work shirt.",
    prompt:
      "What is the next thing your child will interrupt you with? Decide now how you want to respond when it happens.",
    prayer:
      "Lord, make me a father who can be interrupted. Soften my reflex to push away the small voice. Let my children find me available.",
  },
  {
    id: "dev-cover",
    date: "Wednesday",
    theme: "What it means to cover",
    scriptureReference: "Ephesians 5:25",
    scriptureText:
      "Husbands, love your wives, as Christ loved the church and gave himself up for her.",
    reflection:
      "The Christian word for husbandship is sacrifice, not management. To 'cover' your wife is not to control her week — it is to absorb cost so that her load is lighter. It looks like the dishes you do without comment, the appointment you reschedule, the apology you offer before she asks.",
    prompt:
      "What is one weight your wife is carrying this week that you could quietly take off her plate?",
    prayer:
      "Christ, you gave yourself for the bride. Teach me, in much smaller ways, to do the same. Show me the load you would have me carry today.",
  },
];

export const FAMILY_ALTARS: FamilyAltar[] = [
  {
    id: "altar-thankful",
    title: "Thankful Three",
    ageRange: "Ages 4–10",
    minutes: 10,
    scripture: {
      reference: "1 Thessalonians 5:18",
      text: "Give thanks in all circumstances; for this is the will of God in Christ Jesus for you.",
    },
    openingQuestion:
      "What is one small thing today that made you smile?",
    activity:
      "Pass an unlit candle around the table. Whoever holds it names three things they are thankful for today — one person, one place, one small thing. After the last person, light the candle together and let it burn through the rest of dinner.",
    closingPrayer:
      "Father, thank you for these three names, this place, and the small good things we forget to notice. Train our eyes to see them tomorrow too.",
  },
  {
    id: "altar-courage",
    title: "Quiet Courage",
    ageRange: "Ages 6–12",
    minutes: 15,
    scripture: {
      reference: "Joshua 1:9",
      text: "Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go.",
    },
    openingQuestion:
      "What is one thing you were afraid of this week — even a small one?",
    activity:
      "On a slip of paper, each person writes one fear and one small brave act they can do tomorrow because of it. Fold the papers and put them in a jar. Open them next Sunday and tell each other what happened.",
    closingPrayer:
      "Lord, you go with us wherever we go. Make us steady tomorrow. Help us do the small brave thing.",
  },
  {
    id: "altar-apology",
    title: "The Apology Practice",
    ageRange: "Ages 5+",
    minutes: 12,
    scripture: {
      reference: "Colossians 3:13",
      text: "Bearing with one another and, if one has a complaint against another, forgiving each other; as the Lord has forgiven you, so you also must forgive.",
    },
    openingQuestion:
      "Has anyone in this family had to forgive you this week? Has anyone needed your forgiveness?",
    activity:
      "Parent goes first. Name one thing you did or did not do this week that you want to apologize for, name it specifically, ask for forgiveness without excuses. Invite anyone else who would like to do the same. Receive each apology with the words: 'I forgive you.'",
    closingPrayer:
      "Father, you forgive us thoroughly. Teach us to do the same in this house. Give us short memories for each other's failures and long memories for each other's good.",
  },
];

export const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: "j-eli-01",
    childName: "Elijah",
    date: "Spring 2026",
    title: "On the day you turned six",
    body: "You woke up before the rest of us today and made your sister laugh until she snorted juice. I want you to remember that you have always been able to do that. The first job of a brother is to make the people around him brave. You are very good at it.",
  },
  {
    id: "j-eli-02",
    childName: "Elijah",
    date: "Spring 2026",
    title: "Things I want you to know about your name",
    body: "We chose Elijah because we wanted you to grow up unafraid to say true things even when the room would prefer comfort. You won't always feel brave. You don't have to. The name is a promise to you about who you are, not a measure of how loud you are.",
  },
];

export function getTodayDevotional(): Devotional {
  return DEVOTIONALS[0];
}

export function getDevotionalById(id: string): Devotional | undefined {
  return DEVOTIONALS.find((d) => d.id === id);
}

export function getFamilyAltarById(id: string): FamilyAltar | undefined {
  return FAMILY_ALTARS.find((a) => a.id === id);
}
