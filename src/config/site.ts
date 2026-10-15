/**
 * Every piece of project-specific text in the app lives here.
 * On hackathon day, edit this file first: pages and components only read from it.
 *
 * Keep this file free of browser-only code. vite.config.ts also imports it to fill
 * the <title> and <meta description> in index.html.
 */

export interface TeamMember {
  name: string
  /** Leave empty to hide. */
  role: string
  /** Optional profile links. Leave empty to hide. */
  github?: string
  linkedin?: string
}

export interface NasaDataSource {
  name: string
  url: string
  /** One or two sentences on how the project uses this data. */
  howWeUseIt: string
}

export interface Photo {
  /** File name in public/photos, without the -1280/-2560 width and .jpg. */
  file: string
  alt: string
  /** Title from the NASA page; where that is only a photo number, a short description from the same page. */
  title: string
  credit: string
  page: string
}

export interface NavItem {
  to: string
  label: string
  /** Shorter label for the phone tab bar. */
  shortLabel?: string
  /** One sentence on what the page does. */
  description: string
}

export const site = {
  /** Project name: navbar, hero, browser tab. */
  name: 'Mars Among Us',
  /** One-line pitch: hero subtitle and <meta description>. */
  pitch:
    'Find the places on Earth that resemble the Moon and Mars, scored factor by factor with the research to back up every number.',

  event: {
    name: 'NASA Space Apps Challenge 2026',
    dates: 'November 14–15, 2026',
    url: 'https://www.spaceappschallenge.org',
  },

  challenge: {
    /** Leave empty to hide. */
    name: 'Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars',
    /** Link to the challenge page on spaceappschallenge.org. */
    url: 'https://www.spaceappschallenge.org/2026/challenges/identify-earth-locations-that-analog-the-permanent-moon-base-locations-and-mars/',
  },

  team: {
    /** Leave empty to hide. */
    name: 'Mars Among Us',
    location: 'Jordan',
    members: [
      {
        name: 'Mohammad Huseen Malkawi',
        role: 'Creator · Data, web and submission',
        github: 'https://github.com/malkawi06',
        linkedin: 'https://www.linkedin.com/in/mohammad-h-malkawi/',
      },
      {
        name: 'Nour Oqaily',
        role: 'Website testing',
        linkedin: 'https://www.linkedin.com/in/nour-oqaily-4310b6440/',
      },
      {
        name: 'Mohammad Kilany',
        role: 'Presentation',
        linkedin: 'https://www.linkedin.com/in/mohammad-kilani-413317366/',
      },
      {
        name: 'Aisha',
        role: 'Source review',
        linkedin: 'https://www.linkedin.com/in/aisha-mohammad-202907416/',
      },
      {
        name: 'Hadeel Abughazleh',
        role: 'Research and ideas',
        linkedin: 'https://www.linkedin.com/in/hadeel-abughazleh-89aa0a32b/',
      },
      {
        name: 'Hadeel Qamar',
        role: 'Research and ideas',
        linkedin: 'https://www.linkedin.com/in/hadeel-qamar-779241311/',
      },
    ] satisfies TeamMember[],
  },

  /** External links. Empty strings are hidden in the UI. */
  links: {
    repo: 'https://github.com/malkawi06/mars-among-us',
    /** Live site URL. */
    demo: 'https://malkawi06.github.io/mars-among-us/',
    /** 30-second demo video (Space Apps asks for one). */
    video: '',
    /** Slide deck or project page on spaceappschallenge.org. */
    slides: '',
  },

  nav: [
    { to: '/', label: 'Home', description: 'What the site does and how.' },
    {
      to: '/analyze',
      label: 'Analyze',
      description:
        'Upload a Moon or Mars image. The landform model is being retrained, so this page does not analyze images yet.',
    },
    {
      to: '/compare',
      label: 'Compare',
      description:
        'Pick a place on the Moon or Mars and a purpose, and see which Earth sites match it best, factor by factor.',
    },
    {
      to: '/analogs',
      label: 'Earth Analogs',
      shortLabel: 'Analogs',
      description:
        'A map of places on Earth that look like Moon and Mars landforms, each with its published source.',
    },
    {
      to: '/about',
      label: 'About',
      description: 'The challenge, the team and every NASA data source used.',
    },
  ] satisfies NavItem[],

  /** Full-screen NASA photos: behind each Home section and at the top of each page. */
  photos: {
    hero: {
      file: 'mars-mount-sharp',
      alt: 'Layered slopes of Mount Sharp on Mars, seen by the Curiosity rover',
      title: "A Dramatic View of Mars' Mount Sharp",
      credit: 'NASA/JPL-Caltech/MSSS',
      page: 'https://images.nasa.gov/details/PIA23898',
    },
    analyze: {
      file: 'mars-jezero',
      alt: 'Rocks on the floor of Jezero Crater on Mars, seen by the Perseverance rover',
      title: "Perseverance's Mastcam-Z First High-Resolution Panorama",
      credit: 'NASA/JPL-Caltech/ASU/MSSS',
      page: 'https://images.nasa.gov/details/PIA23727',
    },
    compare: {
      file: 'moon-hadley',
      alt: 'Astronaut David Scott at the lunar rover on the edge of Hadley Rille, Apollo 15',
      title: 'Apollo 15 lunar panorama',
      credit: 'NASA',
      page: 'https://images.nasa.gov/details/jsc2011e118359',
    },
    analogs: {
      file: 'earth-haughton',
      alt: 'Two NASA K10 rovers surveying Haughton Crater on Devon Island, Canada',
      title: 'K10 rovers surveying Haughton Crater, Devon Island (Haughton-Mars Project, 2007)',
      credit: 'NASA/Matt Deans',
      page: 'https://images.nasa.gov/details/ARC-2007-ACD07-0170-005',
    },
    method: {
      file: 'earth-haughton-camp',
      alt: 'A NASA K10 rover above the Haughton-Mars Project base camp on Devon Island, Canada',
      title: 'K10 rover descending toward base camp, Haughton Crater (Haughton-Mars Project, 2007)',
      credit: 'NASA/Lorenzo Flueckiger (CMU West)',
      page: 'https://images.nasa.gov/details/ARC-2007-ACD07-0170-006',
    },
  } satisfies Record<string, Photo>,

  home: {
    primaryCta: { label: 'Analyze a Moon or Mars image', to: '/analyze' },
    secondaryCta: { label: 'Compare with the Moon and Mars', to: '/compare' },
    /** Title of the Home section on how scores are worked out. */
    methodTitle: 'A source for every number',
    scoring:
      'Each factor scores 3 (strong), 2 (partial) or 1 (weak), and all factors count the same. The match is the average turned into a percentage: all 3s give 100%, all 1s give 0%. The method follows the NASA-led analog framework of Stern et al. (2025).',
    noData:
      'Some values are not published yet, such as the mean temperature at most Mars sites. Those factors are left out of the score instead of guessed, and the page says so. When fewer than two factors can be scored, the page warns that the result is rough.',
  },

  analyze: {
    title: 'Analyze a Moon or Mars image',
    intro:
      'Upload an orbital image of the Moon or Mars. A landform model will name what it shows and find the places on Earth that look like it, with sources.',
    /** Shown in a pop-up when the page opens, until the landform model is ready. */
    comingSoon: {
      title: 'Hold on! 🛠️',
      body: "Malkawi isn't a robot. He's still working on this page, so check back soon. Meanwhile, Compare already works.",
    },
    notReady:
      'The landform model is being retrained on the Space Apps challenge data, so this page does not analyze images yet. Your image stays in your browser.',
    steps: [
      {
        title: 'Upload a Moon or Mars image',
        body: 'Drop an orbital image. It stays in your browser and is never uploaded.',
      },
      {
        title: 'Name the landform',
        body: 'An image model trained on labelled NASA Moon and Mars images names the landform it sees.',
      },
      {
        title: 'Find it on Earth',
        body: 'See the places on Earth with the same landform, next to their satellite images and the research behind them.',
      },
    ],
  },

  analogs: {
    title: 'Earth Analogs',
    intro:
      'Places on Earth that look like landforms on Mars or the Moon, each backed by published sources. Pick a landform, then select a site on the list or the map to see why it counts and where that comes from.',
  },

  compare: {
    title: 'Compare with the Moon and Mars',
    intro:
      'Pick a place on the Moon or Mars and what you need an Earth analog for. Every Earth site is scored factor by factor, so you can see exactly where it matches and where it does not.',
    method:
      'Each factor scores 1 (weak), 2 (partial) or 3 (strong), and all factors count equally, following the NASA-led framework of Stern et al. (2025). Factors without sourced data for the target are left out. Earth climate: NASA POWER 2001–2020; Earth slope and elevation: ASTER 30 m elevation model.',
    methodSource: 'https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2024JE008803',
  },

  about: {
    challenge:
      'Scientists test rovers, instruments and crews at places on Earth that resemble the Moon or Mars, called terrestrial analogs. Finding the right analog for a given landing site and purpose usually means searching scattered research papers by hand.',
    solution:
      'Mars Among Us ranks places on Earth by how well they match a place on the Moon or Mars for a given purpose. Pick one of the nine Artemis landing regions or a Mars landing site, and a purpose such as rover testing, a base or astronaut training. Every Earth analog site is scored factor by factor (slope, rock type, temperature, dryness, ice), following the NASA-led analog framework of Stern et al. (2025), with a source for every number; factors without sourced data are left out rather than guessed. Real orbital images of the target and the Earth site are shown side by side at the same scale, and the Earth Analogs map groups sourced analog sites by landform. Built with React, TypeScript, Tailwind CSS and Leaflet.',
    nasaData: [
      {
        name: 'NASA Earth Observatory',
        url: 'https://science.nasa.gov/earth/earth-observatory/',
        howWeUseIt: 'Images of Earth analog sites such as Meteor Crater, Haughton and Holuhraun.',
      },
      {
        name: 'Artemis candidate landing regions',
        url: 'https://www.nasa.gov/news-release/nasa-provides-update-on-artemis-iii-moon-landing-regions/',
        howWeUseIt:
          'The nine Moon south-pole regions on the Compare page: NASA’s candidate regions for the first crewed Artemis landing.',
      },
      {
        name: 'LRO LROC NAC south-pole mosaic (via NASA Moon Trek)',
        url: 'https://trek.nasa.gov/moon/',
        howWeUseIt: 'Orbital images of the Artemis regions on the Compare page.',
      },
      {
        name: 'LROC NAC controlled mosaics of the Artemis candidate sites',
        url: 'https://data.lroc.im-ldi.com/lroc/rdr_product_select',
        howWeUseIt:
          'Orbital images of the five Artemis regions north of 85.5°S, where the south-pole mosaic ends.',
      },
      {
        name: 'Global CTX Mosaic of Mars (NASA/JPL/MSSS/The Murray Lab)',
        url: 'https://murray-lab.caltech.edu/CTX/',
        howWeUseIt: 'Orbital images of the Mars targets on the Compare page.',
      },
      {
        name: 'NASA POWER',
        url: 'https://power.larc.nasa.gov',
        howWeUseIt: 'Temperature and rainfall (2001–2020) at every Earth analog site.',
      },
      {
        name: 'ASTER Global Digital Elevation Model (NASA/METI)',
        url: 'https://asterweb.jpl.nasa.gov/gdem.asp',
        howWeUseIt: 'Slope and local relief at every Earth analog site.',
      },
    ] satisfies NasaDataSource[],
    /** Each AI tool used and what for (the Space Apps form asks). Leave empty to hide the section. */
    ai: '',
  },

  footer: {
    tagline: 'Built for NASA Space Apps Challenge 2026',
    disclaimer: 'This project is not affiliated with or endorsed by NASA.',
  },
}

export type Site = typeof site
