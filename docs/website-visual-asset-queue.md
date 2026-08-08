# Website Visual Asset Requirements Queue

This queue is a creative-production handoff derived from the current public routes and existing repository assets. It does not authorize image generation, asset replacement, or publication. Every final asset still requires visual review, rights confirmation, responsive crops, and performance preparation.

## Queue summary

- Total assessed requirements: 18
- P0: 3
- P1: 8
- P2: 7
- `EXISTING ASSET CANDIDATE`: 4
- `READY FOR ART`: 6
- `NEEDS SPEC`: 3
- `NO IMAGE REQUIRED`: 5

Text should not be baked into new imagery unless a later brand-specific request explicitly requires it. Web headings must remain real HTML text.

## P0 — highest public impact

### 1. Homepage hero

- Route: `/`
- Placement: first full-viewport hero behind the primary brand statement
- Purpose: establish FAFO Nation identity immediately
- Aspect ratio: 16:9 master; separate 4:5 mobile crop recommended
- Master dimensions: 3840×2160 desktop; 2160×2700 mobile crop
- Desktop crop: focal subject can sit center/right; preserve dark negative space for copy
- Mobile crop: subject must remain legible without relying on extreme side content
- Focal subject: existing FAFO hero subject and visual identity
- Negative space: left or upper-left, depending on approved layout
- Baked-in text: no
- Existing candidate: `assets/hero/hero-banner.jpg` (1920×1080)
- Remastering suitability: yes; current file is correctly shaped but only 1920×1080 and 2.76 MB
- Alt purpose: decorative background; empty alt is correct in current implementation
- Performance: produce AVIF/WebP delivery variants and a dedicated mobile crop without modifying the source master
- Status: `EXISTING ASSET CANDIDATE`

### 2. Loading-entry artwork and crest

- Route: global homepage entry experience
- Placement: loading entry and crest-impact sequence
- Purpose: preserve the approved entry ritual and brand recognition
- Aspect ratio: current 3:2 entry artwork and 1:1 crest
- Master dimensions: existing 1536×1024 entry artwork and 1024×1024 crest
- Desktop/mobile crop: preserve current complete artwork; do not crop without animation review
- Focal subject: centered entry control and crest
- Negative space: current composition
- Baked-in text: existing artwork may retain its approved treatment; do not add more
- Existing candidates: `public/assets/ui/enter-fafo-nation.png`; `public/assets/logos/FAFO Heritage Crest.png`
- Remastering suitability: possible only with side-by-side timing and layout validation
- Alt purpose: decorative because the button already has an accessible name
- Performance: current PNGs exceed 2 MB; any delivery optimization requires exact visual regression review
- Status: `EXISTING ASSET CANDIDATE`

### 3. Sgt Swagger key art

- Route: `/about/sgt-swagger`
- Placement: hero, opposite or behind the title without changing heading readability
- Purpose: give the official Brand Ambassador a recognizable approved visual identity
- Aspect ratio: 4:5 character master; optional transparent-background cutout
- Master dimensions: at least 2400×3000
- Desktop crop: full or three-quarter figure with space toward the title side
- Mobile crop: centered portrait/torso must remain recognizable at 320 px
- Focal subject: Sgt Swagger only after character design is owner-approved
- Negative space: one side for responsive headline placement
- Baked-in text: no
- Existing candidate: none identified
- Remastering suitability: not applicable
- Alt purpose: identify Sgt Swagger as the FAFO Nation Brand Ambassador
- Performance: deliver responsive sizes; target a compressed display asset well below the source-master size
- Status: `READY FOR ART`

## P1 — major landing-page identity

### 4. About landing heritage visual

- Route: `/about`
- Placement: current crest position in the hero
- Purpose: reinforce history and identity
- Aspect ratio: 1:1
- Master dimensions: 2048×2048 or larger
- Crop: maintain full crest on all viewports
- Focal subject: Heritage Crest
- Negative space: transparent or black-safe perimeter
- Baked-in text: no additional text
- Existing candidate: `public/assets/logos/FAFO Heritage Crest.png` (1024×1024)
- Remastering suitability: yes
- Alt purpose: identify the FAFO Nation Heritage Crest
- Performance: current file is 2.37 MB; a lossless-looking web derivative is desirable
- Status: `EXISTING ASSET CANDIDATE`

### 5. Our Story historical atmosphere

- Route: `/about/our-story`
- Placement: supporting visual between the hero and narrative section
- Purpose: communicate origin, continuity, community, and the 2016 foundation without inventing events
- Aspect ratio: 3:2
- Master dimensions: 3000×2000
- Desktop crop: broad environmental composition
- Mobile crop: central symbolic subject; no faces unless approved and consented
- Focal subject: approved brand artifacts, workspace, or heritage symbolism
- Negative space: enough for optional adjacent copy, not baked-in text
- Existing candidate: crest or logo materials may inform the composition, but no finished candidate exists
- Alt purpose: describe the approved historical/brand subject
- Performance: one responsive image below the fold; lazy load
- Status: `READY FOR ART`

### 6. Join hero crest

- Route: `/join`
- Placement: existing hero crest position
- Purpose: represent joining without inventing member imagery
- Aspect ratio: 1:1
- Master dimensions: 2048×2048 or larger
- Crop: full crest at every breakpoint
- Focal subject: Heritage Crest
- Negative space: transparent edge or black-compatible background
- Baked-in text: no
- Existing candidate: `public/assets/logos/FAFO Heritage Crest.png`
- Remastering suitability: yes
- Alt purpose: identify the crest
- Performance: provide a smaller responsive delivery asset
- Status: `EXISTING ASSET CANDIDATE`

### 7. Community landing image

- Route: `/community`
- Placement: hero or first major section, after owner visual review
- Purpose: communicate different backgrounds and shared standards without presenting fake members
- Aspect ratio: 16:9 desktop; 4:5 mobile crop
- Master dimensions: 3840×2160
- Crop: avoid placing important people at extreme edges
- Focal subject: approved real community imagery or symbolic group composition
- Negative space: title-safe region
- Baked-in text: no
- Existing candidate: none suitable
- Alt purpose: describe the approved community subject without inferring identities
- Performance: responsive sizes and lazy loading if below the hero
- Status: `READY FOR ART`

### 8. Media landing key art

- Route: `/media`
- Placement: hero or media-area lead
- Purpose: unify video, streaming, audio, interview, and creator concepts
- Aspect ratio: 16:9
- Master dimensions: 3840×2160
- Crop: central equipment/content focal point for mobile
- Focal subject: approved studio, broadcast, or content-production environment
- Negative space: left-side or top copy area
- Baked-in text: no
- Existing candidate: none suitable
- Alt purpose: describe the production environment, not claim active programs
- Performance: responsive modern format
- Status: `READY FOR ART`

### 9. Custom Shop process image

- Route: `/custom-shop`
- Placement: hero or process introduction
- Purpose: communicate concept-to-gear craftsmanship without promising current submission capability
- Aspect ratio: 3:2 or 16:9
- Master dimensions: 3000×2000 minimum
- Crop: retain hands/tools/product-development focal area on mobile
- Focal subject: approved design/workbench process
- Negative space: heading-safe side
- Baked-in text: no
- Existing candidate: product photos are outputs, not a process image
- Alt purpose: describe the approved custom-design process scene
- Performance: responsive sizes; lazy load if below fold
- Status: `READY FOR ART`

### 10. Store lifestyle/category image

- Route: `/store`
- Placement: hero or existing-storefront card
- Purpose: visually introduce gear while keeping availability claims in HTML copy
- Aspect ratio: 16:9 hero or 4:3 card
- Master dimensions: 3200×1800
- Crop: keep featured gear centered and avoid text-bearing mockups becoming unreadable
- Focal subject: approved existing merchandise
- Negative space: sufficient for layout copy
- Baked-in text: no new promotional text
- Existing candidates: `assets/products/*` are individual product-photo candidates, not a finished landing composition
- Alt purpose: identify only the products actually shown
- Performance: combine no more assets than needed; responsive delivery and accurate dimensions
- Status: `READY FOR ART`

### 11. FAFO Cares visual language

- Route: `/fafo-cares`
- Placement: potential hero/supporting section
- Purpose: support the community-care theme without implying an active charity, beneficiary, or emergency service
- Aspect ratio: undecided pending program identity
- Master dimensions: undecided
- Crop/focal/negative space: requires approved operational and content direction
- Baked-in text: no
- Existing candidate: none established
- Alt purpose: must describe only an approved non-sensitive subject
- Performance: decide after creative scope
- Status: `NEEDS SPEC`

## P2 — supporting or intentionally image-free

### 12. Recently Deployed

- Route: `/recently-deployed`
- Placement: current deployment-card grid
- Purpose: data clarity is stronger than decorative imagery
- Existing candidate: FAFO World itself is the supporting visual experience
- Alt purpose/performance: not applicable
- Status: `NO IMAGE REQUIRED`

### 13. FAFO World

- Route: `/fafo-world`
- Placement: interactive map
- Purpose: the map is already the primary visual
- Existing candidate: MapLibre visualization
- Status: `NO IMAGE REQUIRED`

### 14. Contact

- Route: `/contact`
- Placement: informational status panel
- Purpose: no approved contact subject exists; imagery would add little clarity
- Status: `NO IMAGE REQUIRED`

### 15. Long-Term Vision

- Route: `/about/long-term-vision`
- Placement: current concept cards
- Purpose: abstract imagery is not necessary until initiatives are approved
- Status: `NO IMAGE REQUIRED`

### 16. Generic planned/status routes

- Routes: Community, Media, Custom Shop, and Store pages rendered through `PublicStatusPage`
- Placement: current status panels
- Purpose: truthful availability language is more important than decorative imagery
- Status: `NO IMAGE REQUIRED`

### 17. Member Spotlight imagery

- Route: `/community/member-spotlights`
- Placement: future spotlight cards or hero
- Purpose: accompany approved member stories
- Aspect ratio: 4:5 portrait and 16:9 story crop
- Master dimensions: 2400×3000 portrait
- Focal subject: actual consenting member
- Negative space: optional quote/title region in layout, not baked into image
- Existing candidate: none
- Alt purpose: identify only what the member has approved for publication
- Performance: responsive thumbnails; strip unnecessary metadata from delivery copies
- Status: `NEEDS SPEC`

### 18. Featured Artist imagery

- Route: `/media/featured-artist`
- Placement: future artist hero and cards
- Purpose: identify an approved artist and their work
- Aspect ratio: 4:5 portrait plus 1:1 artwork/thumb
- Master dimensions: 2400×3000 portrait; 2400×2400 square
- Focal subject: approved artist or licensed artwork
- Negative space: title-safe area
- Existing candidate: none
- Alt purpose: accurate artist/artwork attribution
- Performance: rights-approved derivatives and responsive sizes
- Status: `NEEDS SPEC`

## Creative workflow requirements

Before an item moves from `READY FOR ART` or `NEEDS SPEC` into the repository, confirm:

1. Ownership or publication rights.
2. Exact desktop and mobile crops.
3. Whether the image is informative or decorative.
4. Final alt text for informative imagery.
5. No unsupported people, products, programs, partnerships, or claims.
6. Delivery format, dimensions, and byte-size budget.
7. Visual review at 320, 375, 768, 1024, and wide desktop widths.
