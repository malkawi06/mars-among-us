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
    'Upload an orbital image of the Moon or Mars and see the places on Earth that look the same, with the research to back it up.',

  event: {
    name: 'NASA Space Apps Challenge 2026',
    dates: 'November 14–15, 2026',
    url: 'https://www.spaceappschallenge.org',
  },

  challenge: {
    /** Leave empty to hide. */
    name: '',
    /** Link to the challenge page on spaceappschallenge.org. */
    url: '',
  },

  team: {
    /** Leave empty to hide. */
    name: 'Mars Among Us',
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
    primaryCta: { label: 'Analyze an image', to: '/analyze' },
    secondaryCta: { label: 'Browse Earth analogs', to: '/analogs' },
    steps: [
      {
        title: 'Upload a Moon or Mars image',
        body: 'Drop an orbital image of the Moon or Mars. It is analyzed in your browser and never leaves your device.',
      },
      {
        title: 'Name the landform',
        body: 'A model trained on 19,971 NASA images tells the Moon from Mars and recognises 19 landforms: dunes, craters, gullies, channels and more.',
      },
      {
        title: 'Find it on Earth',
        body: 'See the places on Earth with the same landform on a satellite map, each backed by published research.',
      },
    ],
    stats: [
      {
        value: '19,971',
        label: 'Labelled NASA Moon and Mars images used to train and test the model',
      },
      { value: '89.4%', label: 'Accuracy on 2,430 test images the model never saw' },
    ],
  },

  /** Sections match the Space Apps project submission form. */
  analyze: {
    title: 'Analyze a Moon or Mars image',
    intro:
      'Upload an orbital image of the Moon or Mars. A model trained on 19,971 NASA images names the landform, then we show the places on Earth that look like it, with sources.',
    scaleNote:
      'Works best on grayscale orbital images like the training data: Mars Context Camera tiles about 1 km across (~6 m per pixel) and Lunar Reconnaissance Orbiter Narrow Angle Camera images of the Moon. Other scales or cameras can be misread.',
    samplesTitle: 'No image? Try one of these',
    samplesNote:
      'Images from the DoMars16k and LROCNet test sets: the model never saw them during training.',
    lowConfidence:
      'The model is not sure about this image. It may not be a Moon or Mars orbital image, or it may be at a very different scale from the training data.',
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
      'Scientists test rovers, instruments and crews at places on Earth that resemble Mars, called terrestrial analogs. Finding the right analog for a given Martian landscape usually means searching scattered research papers by hand.',
    solution:
      'Mars Among Us does two things. Analyze turns a Moon or Mars orbital image into the places on Earth that look like it: a ConvNeXt-Nano image classifier, fine-tuned on 19,971 labelled NASA images (16,150 Mars Context Camera tiles from DoMars16k and 3,821 Lunar Reconnaissance Orbiter images from LROCNet and a lunar rockfall dataset), tells the Moon from Mars and names one of 19 landforms with 89.4% accuracy on 2,430 held-out test images, then scans satellite images of every Earth analog site and boxes the areas that look most alike. Compare starts from a place on the Moon (the nine Artemis III landing regions) or Mars and ranks Earth analog sites for a purpose such as rover testing or a base, factor by factor (slope, rock type, temperature, aridity), following the NASA-led analog framework of Stern et al. (2025), with a source for every number and the orbital image of the target next to the Earth site. The model runs entirely in the browser with ONNX Runtime Web, so images are never uploaded. Built with React, TypeScript, Tailwind CSS and Leaflet; the model was trained with PyTorch on a free Kaggle GPU.',
    nasaData: [
      {
        name: 'Mars Reconnaissance Orbiter Context Camera (via DoMars16k)',
        url: 'https://doi.org/10.5281/zenodo.4291940',
        howWeUseIt:
          'The 16,150 labelled CTX image tiles of Mars the landform model was trained and tested on.',
      },
      {
        name: 'Lunar Reconnaissance Orbiter Camera NAC images (via LROCNet and a lunar rockfall dataset)',
        url: 'https://doi.org/10.5281/zenodo.7041842',
        howWeUseIt:
          'The 3,821 labelled Moon images (fresh craters, old craters, plain surface, rockfalls) the model was trained and tested on.',
      },
      {
        name: 'NASA Earth Observatory',
        url: 'https://science.nasa.gov/earth/earth-observatory/',
        howWeUseIt: 'Images of Earth analog sites such as Meteor Crater, Haughton and Holuhraun.',
      },
      {
        name: 'NASA GIBS (Global Imagery Browse Services)',
        url: 'https://nasa-gibs.github.io/gibs-api-docs/',
        howWeUseIt: 'Satellite imagery layer on the Earth analog maps.',
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
