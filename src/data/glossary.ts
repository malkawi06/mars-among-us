/**
 * Plain-English meaning of every rock/surface and landform tag used on the Compare page, each
 * paraphrased from the source it links to. `onMarsOrMoon` is only set when a NASA, USGS or
 * peer-reviewed source says where the material or landform occurs there.
 */

export interface GlossaryEntry {
  name: string
  meaning: string
  source: { title: string; url: string }
  onMarsOrMoon?: { text: string; source: { title: string; url: string } }
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  anorthosite: {
    name: 'Anorthosite',
    meaning:
      'An igneous rock that formed underground and is made mostly of calcium-rich plagioclase feldspar.',
    source: {
      title: 'Anorthosite (Britannica)',
      url: 'https://www.britannica.com/print/article/26651',
    },
  },
  basalt: {
    name: 'Basalt',
    meaning:
      'A dark grey to black volcanic rock, rich in iron and magnesium; the most common rock in Earth’s crust.',
    source: {
      title: 'Basalt (USGS Volcano Hazards Program glossary)',
      url: 'https://volcanoes.usgs.gov/vsc/glossary/basalt.html',
    },
  },
  sand: {
    name: 'Sand',
    meaning: 'Loose grains between 1/16 mm and 2 mm across: bigger than silt, smaller than gravel.',
    source: {
      title: 'Sediment nomenclature (USGS Open-File Report 2006-1195)',
      url: 'https://pubs.usgs.gov/of/2006/1195/htmldocs/nomenclature.htm',
    },
  },
  sulfate: {
    name: 'Sulfate',
    meaning:
      'Minerals that are natural salts of sulfuric acid, such as gypsum; often left behind when salty water evaporates.',
    source: {
      title: 'Sulfate mineral (Britannica)',
      url: 'https://britannica.com/print/article/572471',
    },
    onMarsOrMoon: {
      text: 'Curiosity found magnesium and calcium sulfates, including gypsum, in a salty region of Mount Sharp in Gale Crater.',
      source: {
        title: 'NASA’s Curiosity Mars rover reaches long-awaited salty region (NASA JPL, 2022)',
        url: 'https://www.jpl.nasa.gov/news/nasas-curiosity-mars-rover-reaches-long-awaited-salty-region/',
      },
    },
  },
  salt: {
    name: 'Salt (halite)',
    meaning:
      'Natural sodium chloride, or rock salt, deposited where salty water evaporated in closed basins.',
    source: { title: 'Halite (Britannica)', url: 'https://www.britannica.com/science/halite' },
    onMarsOrMoon: {
      text: 'Orbital data show about 200 chloride salt deposits in the southern highlands of Mars.',
      source: {
        title: 'Salt deposits found in Martian highlands (ASU THEMIS)',
        url: 'https://themis.mars.asu.edu/news/salt-deposits-found-martian-highlands',
      },
    },
  },
  clay: {
    name: 'Clay minerals',
    meaning:
      'Very fine, sheet-like minerals that hold water in their structure; usually formed when rock is weathered by water.',
    source: {
      title: 'Clay mineral (Britannica)',
      url: 'https://www.britannica.com/science/clay-mineral',
    },
    onMarsOrMoon: {
      text: 'In Gale Crater, water altered the sediment of ancient lakes and left lots of clay minerals.',
      source: {
        title: 'New finds for Mars rover, seven years after landing (NASA)',
        url: 'https://www.nasa.gov/feature/jpl/new-finds-for-mars-rover-seven-years-after-landing',
      },
    },
  },
  carbonate: {
    name: 'Carbonate',
    meaning:
      'Minerals built around the carbonate ion, such as calcite and dolomite; the main minerals of limestone.',
    source: {
      title: 'Carbonate mineral (Britannica)',
      url: 'https://www.britannica.com/print/article/95132',
    },
    onMarsOrMoon: {
      text: 'A carbonate-rich band runs along the inner edge of Jezero Crater’s western rim; how it formed is still debated.',
      source: {
        title: 'Reading the rocks: the margin carbonate unit on Mars (NASA Science)',
        url: 'https://science.nasa.gov/blog/reading-the-rocks-the-importance-of-the-margin-carbonate-unit-on-mars',
      },
    },
  },
  sandstone: {
    name: 'Sandstone',
    meaning: 'A sedimentary rock made of sand-sized grains (0.06–2 mm) that have turned to stone.',
    source: { title: 'Arenite (Britannica)', url: 'https://www.britannica.com/science/arenite' },
    onMarsOrMoon: {
      text: 'In Gale Crater, Curiosity found a wind-laid sandstone, the Stimson formation, on top of old lake deposits.',
      source: {
        title: 'Banham et al. (2018), Sedimentology: the Stimson formation (USGS record)',
        url: 'https://pubs.usgs.gov/publication/70196324',
      },
    },
  },
  ice: {
    name: 'Ground ice (permafrost)',
    meaning: 'Ground that stays at or below 0 °C for at least two years, often holding ice.',
    source: { title: 'Frozen ground and permafrost (NSIDC)', url: 'https://nsidc.org/node/18236' },
  },
  impact: {
    name: 'Impact crater',
    meaning: 'A bowl-shaped hollow made when a fast-moving body hits a solid surface.',
    source: {
      title: 'NASA technical report on lunar impact craters (1966, NTRS)',
      url: 'https://ntrs.nasa.gov/api/citations/19660006136/downloads/19660006136.pdf',
    },
  },
  massif: {
    name: 'Massif',
    meaning:
      'A large mountain mass: a compact block of high ground with one or more peaks, moved as a whole by the forces that shaped it.',
    source: { title: 'Massif (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Massif' },
    onMarsOrMoon: {
      text: 'Malapert massif near the lunar south pole is thought to be a remnant of the rim of the South Pole–Aitken basin.',
      source: {
        title: 'Malapert Massif (NASA, LROC image)',
        url: 'https://www.nasa.gov/image-detail/malapert-massif-m1432398306-lroc',
      },
    },
  },
  plain: {
    name: 'Plain',
    meaning: 'A broad, fairly level area with gentle slopes and little change in height.',
    source: { title: 'Plain (Britannica)', url: 'https://www.britannica.com/science/plain' },
    onMarsOrMoon: {
      text: 'Plains near the lunar south pole are mostly material thrown out by large impact basins, not lava.',
      source: {
        title: 'Qiao, Head et al. (2024), Nature Communications',
        url: 'https://www.nature.com/articles/s41467-024-50155-w',
      },
    },
  },
  dunes: {
    name: 'Sand dunes',
    meaning: 'Ever-changing hills of loose sand piled up by wind and water against a barrier.',
    source: {
      title: 'Dunes: formed by wind and water (US National Park Service)',
      url: 'https://www.nps.gov/subjects/dunes/',
    },
    onMarsOrMoon: {
      text: 'Curiosity’s crossing of the Bagnold Dunes was the first close-up study of an active dune field on another planet.',
      source: {
        title: 'MSL Bagnold Dunes campaign (NASA NTRS)',
        url: 'https://ntrs.nasa.gov/citations/20180007625',
      },
    },
  },
  'lake-sediment': {
    name: 'Lake sediments',
    meaning: 'Rock fragments and minerals that settled out of the water at the bottom of a lake.',
    source: {
      title: 'Glossary of soil science terms (Soil Science Society of America)',
      url: 'https://www.agronomy.org/publications/soils-glossary/browse/l',
    },
  },
  channel: {
    name: 'Flood channel',
    meaning:
      'Valleys carved by huge, short floods; the large outflow channels of Mars look like the Channeled Scabland of Washington State.',
    source: {
      title: 'Baker & Milton (1974), Icarus: erosion by catastrophic floods on Mars and Earth',
      url: 'https://pubs.usgs.gov/publication/70009751',
    },
  },
  landslide: {
    name: 'Landslide',
    meaning: 'A mass of rock, debris or earth moving down a slope.',
    source: {
      title: 'What is a landslide? (USGS)',
      url: 'https://www.usgs.gov/faqs/what-landslide-and-what-causes-one',
    },
    onMarsOrMoon: {
      text: 'Valles Marineris on Mars has many landslides that ran out more than 50 km.',
      source: {
        title: 'Watkins, Ehlmann & Yin (2020), Icarus',
        url: 'https://doi.org/10.1016/j.icarus.2020.113836',
      },
    },
  },
  'lava-tube': {
    name: 'Lava tube',
    meaning:
      'A tunnel that carried lava under a crusted-over flow; when the lava drains it can leave an empty cave.',
    source: {
      title: 'Lava tube (USGS Volcano Hazards Program glossary)',
      url: 'https://volcanoes.usgs.gov/vsc/glossary/lava_tube.html',
    },
  },
  polygons: {
    name: 'Polygons (patterned ground)',
    meaning:
      'A honeycomb of cracks that forms when frozen, ice-cemented ground contracts in the cold.',
    source: {
      title: 'Large polygons in Deuteronilus Mensae (HiRISE, University of Arizona)',
      url: 'https://hirise.lpl.arizona.edu/PSP_007492_2265',
    },
    onMarsOrMoon: {
      text: 'Polygons like these on Mars most likely mean ice-rich permafrost is, or was, present.',
      source: {
        title: 'Large polygons in Deuteronilus Mensae (HiRISE, University of Arizona)',
        url: 'https://hirise.lpl.arizona.edu/PSP_007492_2265',
      },
    },
  },
}
