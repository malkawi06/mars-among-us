/**
 * Every piece of project-specific text in the app lives here.
 * On hackathon day, edit this file first: pages and components only read from it.
 *
 * Keep this file free of browser-only code. vite.config.ts also imports it to fill
 * the <title> and <meta description> in index.html.
 */

export interface TeamMember {
  name: string
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
  pitch: 'One sentence that says what your project does and who it helps.',

  event: {
    name: 'NASA Space Apps Challenge 2026',
    dates: 'November 14–15, 2026',
    url: 'https://www.spaceappschallenge.org',
  },

  challenge: {
    name: 'Challenge name goes here',
    /** Link to the challenge page on spaceappschallenge.org. */
    url: 'https://www.spaceappschallenge.org',
  },

  team: {
    name: 'Team Name',
    location: 'City, Country',
    members: [
      { name: 'Member One', role: 'Team lead · Frontend', github: '', linkedin: '' },
      { name: 'Member Two', role: 'Data & science', github: '', linkedin: '' },
      { name: 'Member Three', role: 'Design & storytelling', github: '', linkedin: '' },
      { name: 'Member Four', role: 'Backend & deployment', github: '', linkedin: '' },
    ] satisfies TeamMember[],
  },

  /** External links. Empty strings are hidden in the UI. */
  links: {
    repo: 'https://github.com/malkawi06/mars-among-us',
    /** Live Vercel URL, once deployed. */
    demo: 'https://marc-amoung-u.netlify.app',
    /** 30-second demo video (Space Apps asks for one). */
    video: '',
    /** Slide deck or project page on spaceappschallenge.org. */
    slides: '',
  },

  nav: [
    { to: '/', label: 'Home' },
    { to: '/explore', label: 'Explore' },
    { to: '/data', label: 'Data' },
    { to: '/about', label: 'About' },
  ] satisfies NavItem[],

  home: {
    primaryCta: { label: 'Start exploring', to: '/explore' },
    secondaryCta: { label: 'About the project', to: '/about' },
    highlights: [
      {
        title: 'Explore',
        body: 'Browse NASA satellite imagery by date and compare it with a time series.',
        to: '/explore',
      },
      {
        title: 'Live NASA data',
        body: 'Pull live data from api.nasa.gov. This starter shows the Astronomy Picture of the Day.',
        to: '/data',
      },
      {
        title: 'About',
        body: 'The challenge, our solution, the NASA data we used, and the team.',
        to: '/about',
      },
    ],
  },

  explore: {
    title: 'Explore',
    intro:
      'Pick a date to load NASA GIBS satellite imagery for that day. The chart shows sample data until you connect a real source.',
    mapTitle: 'Satellite imagery',
    chartTitle: 'Sample time series',
    chartSubtitle: 'Synthetic daily values for the 30 days ending on the selected date.',
    unit: 'units',
    /** Initial map view: [latitude, longitude] and zoom level. */
    mapCenter: [20, 0] as [number, number],
    mapZoom: 2,
  },

  data: {
    title: 'Data',
    intro:
      'Live responses from NASA APIs. Use this page to confirm your API key and network setup.',
  },

  /** Sections match the Space Apps project submission form. */
  about: {
    challenge:
      'Summarize the challenge in your own words: the problem, who it affects, and why it matters. Link to the official challenge page.',
    solution:
      'Describe what you built, how it works, and what makes it useful. Mention the tools, languages, and hardware you used.',
    nasaData: [
      {
        name: 'NASA GIBS (Global Imagery Browse Services)',
        url: 'https://nasa-gibs.github.io/gibs-api-docs/',
        howWeUseIt: 'Daily satellite imagery tiles on the Explore map.',
      },
      {
        name: 'Astronomy Picture of the Day (APOD)',
        url: 'https://api.nasa.gov',
        howWeUseIt: 'Shown on the Data page to verify the api.nasa.gov connection.',
      },
    ] satisfies NasaDataSource[],
    ai: 'List each AI tool you used (code assistants, image or text generators) and what you used it for. Check the current Space Apps rules on AI before submitting, for example how to label AI-generated images, video, and text.',
  },

  footer: {
    tagline: 'Built for NASA Space Apps Challenge 2026',
    disclaimer: 'This project is not affiliated with or endorsed by NASA.',
  },
}

export type Site = typeof site
