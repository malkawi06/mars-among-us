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

export interface NavItem {
  to: string
  label: string
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
        role: 'Creator · Data and web',
        github: 'https://github.com/malkawi06',
        linkedin: '',
      },
      { name: 'Nour Oqaily', role: '' },
      { name: 'Mohammad Kilany', role: '' },
      { name: 'Aisha', role: '' },
      { name: 'Hadeel Abuqhazleh', role: '' },
      { name: 'Hadeel Qamar', role: '' },
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
    { to: '/', label: 'Home' },
    { to: '/analyze', label: 'Analyze' },
    { to: '/analogs', label: 'Earth Analogs' },
    { to: '/compare', label: 'Compare' },
    { to: '/about', label: 'About' },
  ] satisfies NavItem[],

  home: {
    primaryCta: { label: 'Compare with the Moon and Mars', to: '/compare' },
    secondaryCta: { label: 'Browse Earth analogs', to: '/analogs' },
    steps: [
      {
        title: 'Pick a place on the Moon or Mars',
        body: 'One of the nine Artemis III landing regions near the lunar south pole, or a landing site on Mars.',
      },
      {
        title: 'Say what the analog is for',
        body: 'Rover testing, a base, local resources, the search for life or astronaut training: each purpose compares its own factors.',
      },
      {
        title: 'See the closest places on Earth',
        body: 'Earth sites are scored factor by factor, with a source for every number, next to real orbital images at the same scale.',
      },
    ],
  },

  analyze: {
    title: 'Analyze a Moon or Mars image',
    intro:
      'Upload an orbital image of the Moon or Mars. A landform model will name what it shows and find the places on Earth that look like it, with sources.',
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
      'Places on Earth that look like landforms on Mars or the Moon, each backed by published sources. Pick a landform to filter, then select a site to fly to it.',
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
      'Mars Among Us ranks places on Earth by how well they match a place on the Moon or Mars for a given purpose. Pick one of the nine Artemis III landing regions or a Mars landing site, and a purpose such as rover testing, a base or astronaut training. Every Earth analog site is scored factor by factor (slope, rock type, temperature, dryness, ice), following the NASA-led analog framework of Stern et al. (2025), with a source for every number; factors without sourced data are left out rather than guessed. Real orbital images of the target and the Earth site are shown side by side at the same scale, and the Earth Analogs map groups sourced analog sites by landform. Built with React, TypeScript, Tailwind CSS and Leaflet.',
    nasaData: [
      {
        name: 'NASA Earth Observatory',
        url: 'https://science.nasa.gov/earth/earth-observatory/',
        howWeUseIt: 'Images of Earth analog sites such as Meteor Crater, Haughton and Holuhraun.',
      },
      {
        name: 'Artemis III candidate landing regions',
        url: 'https://www.nasa.gov/news-release/nasa-provides-update-on-artemis-iii-moon-landing-regions/',
        howWeUseIt: 'The nine Moon south-pole regions on the Compare page.',
      },
      {
        name: 'LRO LROC NAC south-pole mosaic (via NASA Moon Trek)',
        url: 'https://trek.nasa.gov/moon/',
        howWeUseIt: 'Orbital images of the Artemis III regions on the Compare page.',
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
