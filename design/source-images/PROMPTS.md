# NOCTURNE image set — batch 1 ("Nocturne Fresco")

All images are AI-generated for this project (no stock, no scraped art). They contain no logos, real brands, famous paintings or real people.
Art direction: original oil-painting chiaroscuro, a single warm ember light (#c8864a), umber/ink shadow, bone highlights, fine canvas texture, lifted blacks.
Pipeline: `npm run images` turns these sources into AVIF/WebP srcsets (`public/images/nocturne/`), legacy 960w JPEGs (`public/images/enigma/`, still referenced by live API rows) and `src/lib/imageManifest.json` (sizes + LQIP).

| File | Use | Aspect | Prompt summary |
|---|---|---|---|
| hero-sky-desktop | Home hero LCP (wide) | 16:9 | Painted night cumulus; one break lets ember light fall like a descending passage; low horizon; dark space for type |
| hero-sky-mobile | Home hero LCP (portrait) | 9:16 | Same sky, vertical; a column of ember light descending; calm top third |
| cloud-sprite-a / -b | Future WebGL cloud field (PR 2) | 1:1 | Isolated painted cloud puff / wispy bank on flat black, ember-lit |
| grail-sneaker-obsidian | Product | 3:4 | Unbranded black leather high-top, bone sole, on dark marble plinth |
| grail-leather-bomber | Product | 3:4 | Worn black horsehide bomber on invisible form, plinth |
| grail-trench-monolith | Product | 3:4 | Charcoal wool trench, monolithic silhouette, plinth |
| grail-chronograph-relic | Product | 3:4 | Unbranded skeleton watch, brass bridge, basalt + marble |
| grail-hoodie-shadow | Product | 3:4 | Washed-black heavyweight hoodie folded on plinth |
| grail-cargo-vanguard | Product | 3:4 | Unbranded charcoal cargo trousers stacked on plinth |
| grail-runner-bone | Product | 3:4 | Unbranded bone/stone runner on plinth |
| mystery-chest | Mystery Vault | 4:3 | Carved chest, lid ajar with ember glow, umber curtains |
| reborn-atelier | Afterlife atelier | 4:3 | Craftsman's hands re-stitching a leather upper by candlelight |
| manifesto-cherub | Manifesto collage (PR 2) | 3:4 | Original Baroque-style cherub offering an unbranded sneaker into a beam of light |
| manifesto-noble | Manifesto collage (PR 2) | 3:4 | Invented nobleman in fur coat over a hoodie, holding a skeleton watch |
| manifesto-roundel | Manifesto collage (PR 2) | 1:1 | Original fresco roundel; bomber floating in an opening of ember light |
| lookbook-01 | Lookbook (PR 2) | 3:4 | Invented model in charcoal trench + black tailoring, Baroque portrait pose |

Generator output is 864–1280 px on the long edge; hero variants are upscaled at most 1.5× (lanczos3) by the pipeline. Regenerate at higher resolution if a larger master becomes available.
