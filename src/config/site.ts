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
  pitch:
    'Upload an orbital image of Mars and see the places on Earth that look the same, with the research to back it up.',

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
    /** Leave empty to hide. */
    name: '',
    location: 'Jordan',
    members: [
      {
        name: 'Mohammad Huseen Malkawi',
        role: 'Creator · Model, data and web',
        github: 'https://github.com/malkawi06',
        linkedin: '',
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
    { to: '/', label: 'Home' },
    { to: '/analyze', label: 'Analyze' },
    { to: '/analogs', label: 'Earth Analogs' },
    { to: '/compare', label: 'Compare' },
    { to: '/about', label: 'About' },
  ] satisfies NavItem[],

  home: {
    primaryCta: { label: 'Analyze a Mars image', to: '/analyze' },
    secondaryCta: { label: 'Browse Earth analogs', to: '/analogs' },
    /** Hero comparison: a Mars image next to the Earth analog site with this id (src/data/analogs.ts). */
    compare: {
      mars: {
        url: 'https://images-assets.nasa.gov/image/PIA08813/PIA08813~small.jpg',
        label: 'Victoria Crater, Mars',
        credit: 'NASA/JPL-Caltech/University of Arizona (HiRISE)',
        page: 'https://images.nasa.gov/details/PIA08813',
      },
      earthSiteId: 'meteor-crater',
      earthLabel: 'Meteor Crater, Arizona',
    },
    steps: [
      {
        title: 'Upload a Mars image',
        body: 'Drop an orbital image of Mars. It is analyzed in your browser and never leaves your device.',
      },
      {
        title: 'Name the landform',
        body: 'A model trained on 16,150 NASA images recognises 15 landforms: dunes, craters, gullies, channels and more.',
      },
      {
        title: 'Find it on Earth',
        body: 'See the places on Earth with the same landform on a satellite map, each backed by published research.',
      },
    ],
    stats: [
      { value: '16,150', label: 'NASA Mars images used for training' },
      { value: '93.8%', label: 'Accuracy on images the model never saw' },
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
  analyze: {
    title: 'Analyze a Mars image',
    intro:
      'Upload an orbital image of Mars. A model trained on 16,150 NASA images names the landform, then we show the places on Earth that look like it, with sources.',
    scaleNote:
      'Works best on grayscale orbital images about 1 km across (the model learned from 200 × 200 px MRO Context Camera tiles, ~6 m per pixel). Other scales or cameras can be misread.',
    samplesTitle: 'No image? Try one of these',
    samplesNote:
      'Context Camera tiles from the DoMars16k test set: the model never saw them during training.',
    lowConfidence:
      'The model is not sure about this image. It may not be a Mars orbital image, or it may be at a very different scale from the training data.',
  },

  analogs: {
    title: 'Earth Analogs',
    intro:
      'Places on Earth that look like landforms on Mars, each backed by published sources. Pick a landform to filter, then select a site to fly to it.',
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
      'Scientists test rovers, instruments and crews at places on Earth that resemble Mars, called terrestrial analogs. Finding the right analog for a given Martian landscape usually means searching scattered research papers by hand.',
    solution:
      'Mars Among Us turns a Mars orbital image into a list of places on Earth that look like it. A ConvNeXt-Nano image classifier, fine-tuned on 16,150 labelled Context Camera images (DoMars16k), names the landform with 93.8% accuracy on held-out test images. The site then shows Earth analog sites for that landform on a satellite map, each with the published sources that compare it with Mars. The model runs entirely in the browser with ONNX Runtime Web, so images are never uploaded. Built with React, TypeScript, Tailwind CSS and Leaflet; the model was trained with PyTorch on a free Kaggle GPU.',
    nasaData: [
      {
        name: 'Mars Reconnaissance Orbiter Context Camera (via DoMars16k)',
        url: 'https://doi.org/10.5281/zenodo.4291940',
        howWeUseIt:
          'The 16,150 labelled CTX image tiles the landform model was trained and tested on.',
      },
      {
        name: 'NASA Earth Observatory',
        url: 'https://science.nasa.gov/earth/earth-observatory/',
        howWeUseIt: 'Images of Earth analog sites such as Meteor Crater, Haughton and Holuhraun.',
      },
      {
        name: 'HiRISE, via the NASA Image and Video Library',
        url: 'https://images.nasa.gov/details/PIA08813',
        howWeUseIt: 'The Victoria Crater image on the home page.',
      },
      {
        name: 'NASA GIBS (Global Imagery Browse Services)',
        url: 'https://nasa-gibs.github.io/gibs-api-docs/',
        howWeUseIt: 'Daily satellite imagery tiles on the satellite explorer.',
      },
      {
        name: 'Astronomy Picture of the Day (APOD)',
        url: 'https://api.nasa.gov',
        howWeUseIt: 'Shown on the live NASA data page to verify the api.nasa.gov connection.',
      },
    ] satisfies NasaDataSource[],
    ai: 'List each AI tool you used (code assistants, image or text generators) and what you used it for. Check the current Space Apps rules on AI before submitting, for example how to label AI-generated images, video, and text.',
  },

  footer: {
    tagline: 'Built for NASA Space Apps Challenge 2026',
    disclaimer: 'This project is not affiliated with or endorsed by NASA.',
    /** Extra pages kept out of the main menu. */
    more: [
      { to: '/explore', label: 'Satellite explorer' },
      { to: '/data', label: 'Live NASA data' },
    ] satisfies NavItem[],
  },
}

export type Site = typeof site
