import { convertToPageSlug } from "./utils";
import { getDB, PAGES_STORE, ENTRIES_STORE } from "./db";
const entries = [
  {
    id: crypto.randomUUID(),
    content:
      "The sun dipped below the horizon, casting long shadows across the quiet meadow. Birds chirped their evening songs as a gentle breeze rustled through the tall grass. In the distance, mountains stood silently against the darkening sky. A small stream gurgled nearby, its clear waters reflecting the first stars appearing above. Moments like these reminded me why I loved this peaceful corner of the world.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: crypto.randomUUID(),
    content:
      "The city lights twinkled like stars beneath the cloudy night sky. Traffic hummed in the distance as I sipped my coffee on the balcony. A stray cat wandered along the alley below, pausing occasionally to investigate something of interest. The faint melody from a neighbor's piano drifted through the air, creating a perfect urban soundtrack. Despite the chaos of city life, there was a strange comfort in these quiet moments of observation.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: crypto.randomUUID(),
    content:
      "The rain tapped gently against the window as I sat with my journal. The soft glow of my desk lamp created a cozy atmosphere in the otherwise dark room. Steam rose from my tea cup, carrying the scent of chamomile through the air. My thoughts flowed onto the page, sometimes clear as day, other times jumbled and confused. Writing had always been my way of making sense of the world.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: crypto.randomUUID(),
    content:
      "The old bookstore smelled of paper and dust, a comforting scent that welcomed me like an old friend. Sunlight filtered through the tall windows, illuminating dancing dust particles. Each book on the shelves held worlds waiting to be discovered. I ran my fingers along the spines, feeling the texture of different bindings. There's something magical about finding the perfect book on a lazy afternoon.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: crypto.randomUUID(),
    content:
      "Waves crashed rhythmically against the shore as I walked barefoot along the beach. The sand was cool between my toes, still damp from the morning tide. Seagulls circled overhead, their calls mixing with the ocean's roar. A child's laughter echoed from a nearby sandcastle construction site. These simple pleasures of a beach day always managed to wash away my worries.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: crypto.randomUUID(),
    content:
      "The forest was alive with autumn colors - reds, oranges, and golds painting a breathtaking canvas. Leaves crunched satisfyingly beneath my hiking boots. A squirrel darted up a nearby oak, pausing to watch me curiously. The air was crisp and carried the earthy scent of fallen leaves and pine. These woodland trails always felt like stepping into another world, one where time moved more slowly.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: crypto.randomUUID(),
    content:
      "Steam rose from the cup of freshly brewed coffee, its rich aroma filling the kitchen. Morning sunlight streamed through the window, warming the wooden table where I sat with my thoughts. Outside, birds were having animated conversations in the garden. The neighbor's cat watched them intently from the fence. These quiet morning rituals centered me before the day's chaos began.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: crypto.randomUUID(),
    content:
      "The night sky above the desert was a masterpiece of stars, more than I'd ever seen in the city. The Milky Way stretched across the darkness like spilled paint. A coyote howled somewhere in the distance, its call echoing across the silent landscape. The campfire crackled beside me, providing warmth against the desert's surprising chill. I felt small yet connected to everything under that vast cosmic display.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: crypto.randomUUID(),
    content:
      "The old vinyl record crackled to life, filling the room with jazz from another era. Rain pattered against the windows, creating a perfect backdrop for the melancholy saxophone. The armchair embraced me like an old friend as I closed my eyes to listen. A cup of tea cooled on the side table, forgotten in the moment. Music had always been my time machine, transporting me to places I'd never been.",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const pages = [
  {
    id: crypto.randomUUID(),
    slug: convertToPageSlug(new Date(Date.now() - 48 * 60 * 60 * 1000)),
    entries: entries.slice(0, 3).map((entry) => entry.id),
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    id: crypto.randomUUID(),
    slug: convertToPageSlug(new Date(Date.now() - 24 * 60 * 60 * 1000)),
    entries: entries.slice(3, 6).map((entry) => entry.id),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    id: crypto.randomUUID(),
    slug: convertToPageSlug(new Date()),
    entries: entries.slice(6, 9).map((entry) => entry.id),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export async function loadEntriesAndPages() {
  const db = await getDB();

  // delete the existing entries and pages
  await db.clear(ENTRIES_STORE);
  await db.clear(PAGES_STORE);

  for (const entry of entries) {
    await db.put(ENTRIES_STORE, entry);
  }

  for (const page of pages) {
    await db.put(PAGES_STORE, page);
  }

  console.log("Entries and pages loaded");
}
