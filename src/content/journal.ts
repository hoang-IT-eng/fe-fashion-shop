/** Afterlife journal: editorial stories shipped with the storefront (no CMS). */
export interface JournalStory {
  slug: string
  kicker: string
  title: string
  excerpt: string
  readTime: string
  publishedAt: string
  imageUrl: string
  author: string
  body: string[]
}

export const REBORN_JOURNAL_STORIES: JournalStory[] = [
  {
    slug: 'horsehide-alchemists-of-tokyo',
    kicker: 'AFTERLIFE ATELIER · DOSSIER 04',
    title: 'Horsehide Patina & The Architecture of Scarred Leather',
    excerpt:
      'Inside the subterranean workshop reconstructing 1990s Japanese flight shells with oxidized Riri hardware and hand-waxed storm seams.',
    readTime: '06 MIN READ',
    publishedAt: 'NOV 2026',
    imageUrl: '/images/enigma/reborn-atelier.jpg',
    author: 'Curator S. Moreau',
    body: [
      'Mass luxury polishes away every trace of friction. Inside the Afterlife Atelier, hides are selected precisely for grain density, natural striation, and decades of earned creases.',
      'Each 1-of-12 Flight Bomber undergoes forty-two hours of disassembly, vegetable re-tanning, and cold-wax sealing before an engraved titanium provenance plate is riveted inside the lining.',
      'Wear does not diminish an archival piece—it completes the pattern.',
    ],
  },
  {
    slug: 'anti-snipe-auction-theory',
    kicker: 'GRAIL DESK · PROTOCOL',
    title: 'Why Every NOCTURNE Lot Enforces the 60-Second Anti-Snipe Rule',
    excerpt:
      'Algorithmic bots ruined sneaker drops and timed auctions. Our open-book +120s extension restores collector conviction.',
    readTime: '04 MIN READ',
    publishedAt: 'NOV 2026',
    imageUrl: '/images/enigma/grail-chronograph-relic.jpg',
    author: 'Kaelen Vinh',
    body: [
      'True valuation occurs in daylight—or rather, under museum spotlights—never in millisecond script wars.',
      'Whenever a verified collector places a bid inside the final sixty seconds of an NOCTURNE lot, the clock extends by two full minutes, giving rival vaults a transparent window to respond.',
    ],
  },
  {
    slug: 'anatomy-of-650gsm-loopwheel',
    kicker: 'MATERIAL ARCHIVE · 09',
    title: '650gsm Loopwheel Jersey: Slow Looms Against Disposable Fast Fashion',
    excerpt:
      'Knitted at just one meter per hour on vintage Wakayama cylinder frames, suspended without tension.',
    readTime: '05 MIN READ',
    publishedAt: 'OCT 2026',
    imageUrl: '/images/enigma/grail-hoodie-shadow.jpg',
    author: 'Atelier Research',
    body: [
      'Modern high-speed sinker machines stretch cotton yarn under violent tension. Loopwheel cylinders let gravity feed the yarn, yielding a dense 650gsm fleece that holds architectural volume for decades.',
      'Sun-faded in small mineral baths, no two Shadow Archive hoodies share the exact same charcoal gradient.',
    ],
  },
]
