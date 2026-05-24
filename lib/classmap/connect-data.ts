// Static directory data for /classmap/connect. No API keys; external links open in a new tab. Curated, not exhaustive — parents should also search locally.

export interface DirectoryEntry {
  id: string;
  name: string;
  blurb: string;
  url: string;
  coverage: string;
  cost: string;
}

export const COOP_DIRECTORIES: DirectoryEntry[] = [
  {
    id: "hslda",
    name: "HSLDA",
    blurb:
      "The Home School Legal Defense Association is the largest legal-advocacy and community network for US homeschool families; their group directory and state pages help you locate co-ops, support groups, and field-trip partners in all 50 states.",
    url: "https://hslda.org",
    coverage: "All 50 states",
    cost: "Free directory; HSLDA membership $130/yr (optional)",
  },
  {
    id: "local-homeschool",
    name: "Local Homeschool",
    blurb:
      "A volunteer-run aggregator that lists thousands of US co-ops, hybrid academies, and homeschool support groups searchable by state and city — a good first stop when you don't yet know what's nearby.",
    url: "https://localhomeschool.com",
    coverage: "Nationwide directory",
    cost: "Free directory",
  },
  {
    id: "classical-conversations",
    name: "Classical Conversations",
    blurb:
      "A nationwide network of weekly classical-Christian homeschool communities. Use their Find a Community tool to locate a Foundations, Essentials, or Challenge program near you.",
    url: "https://classicalconversations.com",
    coverage: "Nationwide (classical-Christian focus)",
    cost: "Tuition varies by program (~$400–$1,800/yr per child)",
  },
  {
    id: "homeschool-life",
    name: "Homeschool-Life Co-op Hub",
    blurb:
      "Hosting platform used by hundreds of US homeschool co-ops for their member sites and public landing pages. Browsing their public group list is one of the easiest ways to find an active, organized co-op in your state.",
    url: "https://www.homeschool-life.com",
    coverage: "Nationwide directory",
    cost: "Free directory; individual co-op dues vary",
  },
  {
    id: "wild-and-free",
    name: "Wild + Free",
    blurb:
      "A Charlotte Mason–inspired community network of local homeschool groups focused on nature study, literature, and gentle rhythms. Their member map lists hundreds of small, parent-led groups across the US.",
    url: "https://bewildandfree.org",
    coverage: "Nationwide (Charlotte Mason / nature-based)",
    cost: "Membership $40/yr",
  },
];

export const CHARTER_DIRECTORIES: DirectoryEntry[] = [
  {
    id: "k12",
    name: "K12",
    blurb:
      "The largest national network of tuition-free online public charter schools, serving K–12 students in most US states. A common pairing for families who want homeschool flexibility with a public-school structure and accredited diploma.",
    url: "https://k12.com",
    coverage: "Public charter in ~30+ states",
    cost: "Tuition-free where available (public charter)",
  },
  {
    id: "connections-academy",
    name: "Connections Academy",
    blurb:
      "Tuition-free online K–12 public charter program available in most US states, with state-certified teachers, structured courses, and standardized testing handled for you.",
    url: "https://connectionsacademy.com",
    coverage: "Public charter in ~30+ states",
    cost: "Tuition-free where available (public charter)",
  },
  {
    id: "greatschools",
    name: "GreatSchools",
    blurb:
      "Nationwide search-and-rate directory covering district, charter, and magnet schools. Filter by charter type and ratings to scout brick-and-mortar or hybrid charters near your address.",
    url: "https://greatschools.org",
    coverage: "All 50 states",
    cost: "Free directory",
  },
  {
    id: "education-com-charters",
    name: "Education.com Charter Hub",
    blurb:
      "A general K–12 resource site with a state-by-state index of cyber and brick-and-mortar charter schools — useful as a backup directory when your state doesn't publish a clean list of its own.",
    url: "https://www.education.com",
    coverage: "Nationwide directory",
    cost: "Free directory",
  },
];

export function makeMapsSearchUrl(query: string): string {
  const q = encodeURIComponent(`homeschool co-op near ${query}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}
