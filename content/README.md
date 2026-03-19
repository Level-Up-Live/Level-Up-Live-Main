# Content

Central place for all site content and assets.

## Folder structure

```
content/
├── images/
│   ├── hero/           Hero section imagery
│   ├── promos/         Promo/carousel card images
│   ├── nav/            Nav & dropdown thumbnails (e.g. Play mega menu)
│   ├── brand/          "It's gaming. It's sport." section (3 images)
│   ├── locations/      Per-venue images for the Find a location page
│   │   ├── evike/      Evike (Alhambra CA) – add card.jpg for the location card
│   │   ├── cube-vr/    The CUBE (Santa Monica CA) – add card.jpg for the location card
│   │   └── lake-erie-arms/  Lake Erie Arms (Milan OH) – add card.jpg for the location card
│   └── global/         Logos, icons, shared images
├── games/              Game-related content (assets, copy, data)
├── documents/          PDFs, brochures, downloadable files
└── README.md           This file
```

## Usage

- **images/hero** – Background or featured images for the main hero block.
- **images/promos** – Images for the promo carousel cards.
- **images/nav** – Thumbnails for the Play dropdown cards (Find a location, The experience, Games).
- **images/brand** – Logo and brand section images: `lul-secondary-marks.png`, `lul-logo-horizontal.png`, `brand-hero.jpg`, `brand-2.jpg`, `brand-3.jpg`.
- **images/locations** – One folder per venue (evike, cube-vr, lake-erie-arms). Use lowercase, hyphenated filenames for GitHub/cross-platform compatibility.
- **images/global** – Logo files, favicons, and other site-wide assets.
- **games** – Game-related assets, descriptions, or data for the Games section.
- **documents** – Any PDFs or other files linked for download.

Reference assets in HTML/CSS with paths like `content/images/hero/your-file.jpg`.
