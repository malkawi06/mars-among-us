/**
 * Earth analog sites, grouped by landform: the 15 Mars landform classes of DoMars16k (Wilhelm et al.
 * 2020, doi 10.5281/zenodo.4291940), plus the Moon, whose analog sites are compared with it in general.
 *
 * Every site cites at least one source that explicitly compares it with Mars or the Moon.
 * - landforms maps each landform this site is an analog for to a confidence:
 *     'strong'   = peer-reviewed study of this site as an analog for this landform
 *     'moderate' = recognised Mars or Moon analog site; the landform match is general
 *     'weak'     = no close Earth analog exists for this landform; nearest candidate only
 * - precision:  'site'   = coordinates point at the feature itself
 *               'region' = approximate centre of the area, good for a map pin, not for fieldwork
 */

export type LandformCode =
  | 'aec'
  | 'ael'
  | 'cli'
  | 'cra'
  | 'fse'
  | 'fsf'
  | 'fsg'
  | 'fss'
  | 'mix'
  | 'moon'
  | 'rid'
  | 'rou'
  | 'sfe'
  | 'sfx'
  | 'smo'
  | 'tex'

export type Confidence = 'strong' | 'moderate' | 'weak'

/** Display names. */
export const LANDFORM_NAMES: Record<LandformCode, string> = {
  aec: 'Aeolian Curved',
  ael: 'Aeolian Straight',
  cli: 'Cliff',
  cra: 'Crater',
  fse: 'Slope Streaks',
  fsf: 'Channel',
  fsg: 'Gullies',
  fss: 'Mass Wasting',
  mix: 'Mixed Terrain',
  moon: 'Moon',
  rid: 'Ridge',
  rou: 'Rough Terrain',
  sfe: 'Mounds',
  sfx: 'Crater Field',
  smo: 'Smooth Terrain',
  tex: 'Textured Terrain',
}

export interface Source {
  title: string
  url: string
}

export interface AnalogSite {
  id: string
  name: string
  country: string
  lat: number
  lon: number
  precision: 'site' | 'region'
  landforms: Partial<Record<LandformCode, Confidence>>
  climate: string
  /** Why it resembles Mars or the Moon, in one or two sentences, backed by the sources. */
  why: string
  /** Hand-picked NASA image (public domain). The map shows Sentinel-2 imagery for every site. */
  image?: { url: string; credit: string; page: string }
  sources: Source[]
}

export const ANALOG_SITES: AnalogSite[] = [
  // ---- Aeolian bedforms -------------------------------------------------------------------
  {
    id: 'la-joya',
    name: 'Pampa de La Joya barchan field',
    country: 'Peru',
    lat: -16.6,
    lon: -72.0,
    precision: 'region',
    landforms: { aec: 'strong' },
    climate: 'Mean 16.1 °C, 99 mm of precipitation a year (NASA POWER 2001–2020)',
    why: 'One of the best-studied barchan (crescent) dune corridors on Earth; its hyper-arid soils are also studied as Mars-like soil.',
    sources: [
      {
        title: 'Barchan dune corridors: field characterization (JGR Earth Surface)',
        url: 'https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2007JF000767',
      },
      {
        title: 'Pampas de La Joya as a new Mars-like soil analog (Geochim. Cosmochim. Acta, 2011)',
        url: 'https://www.sciencedirect.com/science/article/abs/pii/S0016703711000251',
      },
    ],
  },
  {
    id: 'white-sands',
    name: 'White Sands gypsum dune field',
    country: 'USA (New Mexico)',
    lat: 32.78,
    lon: -106.17,
    precision: 'site',
    landforms: { aec: 'strong' },
    climate: 'Mean 16.3 °C, 274 mm of precipitation a year (NASA POWER 2001–2020)',
    why: 'Gypsum dunes studied as an analog for the gypsum-rich dunes of Olympia Undae near the Martian north pole.',
    sources: [
      {
        title:
          'Origin of terrestrial gypsum dunes: implications for Olympia Undae (Geomorphology, 2009)',
        url: 'https://www.sciencedirect.com/science/article/abs/pii/S0169555X09000786',
      },
    ],
  },
  {
    id: 'namib',
    name: 'Namib Sand Sea linear dunes',
    country: 'Namibia',
    lat: -24.7,
    lon: 15.4,
    precision: 'region',
    landforms: { ael: 'moderate' },
    climate: 'Mean 22.4 °C, 80 mm of precipitation a year (NASA POWER 2001–2020)',
    why: 'Classic linear (longitudinal) dunes. Martian linear dunes grow from a fixed sand source and elongate parallel to their crests, like those on Earth.',
    sources: [
      {
        title: 'Morphology and sediment dynamics of elongating linear dunes on Mars (GRL, 2020)',
        url: 'https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2020GL088456',
      },
    ],
  },

  // ---- Topographic landforms --------------------------------------------------------------
  {
    id: 'mdrs-hanksville',
    name: 'Mars Desert Research Station area, Hanksville',
    country: 'USA (Utah)',
    lat: 38.4064,
    lon: -110.7919,
    precision: 'site',
    landforms: { cli: 'moderate', mix: 'moderate', rid: 'moderate' },
    climate: 'Mean 11.8 °C, 241 mm of precipitation a year (NASA POWER 2001–2020)',
    why: 'Mesas and scarp-bounded surfaces in layered clay and sandstone, concretions like those at Meridiani Planum, and inverted paleochannels.',
    sources: [
      {
        title: 'Utah desert analogue sites for Mars research (LPI Analogues conference, 2011)',
        url: 'https://www.lpi.usra.edu/meetings/analogues2011/pdf/6029.pdf',
      },
      {
        title: 'Practical exogeoconservation of Mars: lessons from MDRS (Planet. Space Sci., 2025)',
        url: 'https://www.sciencedirect.com/science/article/pii/S0032063325000054',
      },
    ],
  },
  {
    id: 'wadi-rum',
    name: 'Wadi Rum',
    country: 'Jordan',
    lat: 29.57,
    lon: 35.42,
    precision: 'region',
    landforms: { cli: 'weak', mix: 'weak' },
    climate: 'Mean 18.1 °C, 40 mm of precipitation a year (NASA POWER 2001–2020)',
    why: 'Red sandstone cliffs and sandy valleys used as a Mars film set and as the site of Mars analog missions. No peer-reviewed landform-analog study was found.',
    sources: [
      {
        title: 'Wadi Rum, Jordan (NASA Earth Observatory)',
        url: 'https://science.nasa.gov/earth/earth-observatory/wadi-rum-jordan-49945/',
      },
      {
        title: 'MENA Analog Mission 2025, Wadi Rum',
        url: 'https://menaorg.com/analog-mission-2025',
      },
    ],
  },
  {
    id: 'green-river',
    name: 'Exhumed paleochannels near Green River',
    country: 'USA (Utah)',
    lat: 38.93,
    lon: -110.24,
    precision: 'region',
    landforms: { rid: 'strong' },
    climate: 'Mean 11.7 °C, 234 mm of precipitation a year (NASA POWER 2001–2020)',
    why: 'Old river channels cemented and left standing as sinuous ridges after the surrounding rock eroded, studied as terrestrial analogs for sinuous ridges on Mars.',
    sources: [
      {
        title:
          'Field guide to exhumed paleochannels near Green River, Utah: analogs for sinuous ridges on Mars (GSA)',
        url: 'https://pubs.geoscienceworld.org/gsa/books/edited-volume/645/chapter/3807016/Field-guide-to-exhumed-paleochannels-near-Green',
      },
      {
        title: 'Formation of sinuous ridges by inversion of river-channel belts (Icarus, 2019)',
        url: 'https://www.sciencedirect.com/science/article/abs/pii/S0019103518305803',
      },
    ],
  },
  {
    id: 'qaidam',
    name: 'Western Qaidam Basin (yardangs, Dalangtan playa)',
    country: 'China',
    lat: 38.3,
    lon: 92.3,
    precision: 'region',
    landforms: { rid: 'strong', tex: 'strong', fsg: 'moderate', smo: 'moderate', fse: 'weak' },
    climate: 'Mean 4.2 °C, 33 mm of precipitation a year (NASA POWER 2001–2020)',
    why: 'Dry, cold, high-UV basin with yardangs, polygons, playas, gullies and dark slope streaks, all with counterparts on Mars.',
    sources: [
      {
        title:
          'A new terrestrial analogue site for Mars research: the Qaidam Basin (Earth-Sci. Rev., 2017)',
        url: 'https://www.sciencedirect.com/science/article/abs/pii/S001282521630174X',
      },
      {
        title:
          'The western Qaidam Basin as a potential Martian environmental analogue (JGR Planets, 2017)',
        url: 'https://agupubs.onlinelibrary.wiley.com/doi/full/10.1002/2017JE005293',
      },
      {
        title: 'Brain-terrain-like features in the Qaidam Basin (Icarus, 2021)',
        url: 'https://www.sciencedirect.com/science/article/abs/pii/S0019103521001184',
      },
      {
        title: 'Slope streaks in the Yingxiong Range, western Qaidam Basin (Geomorphology)',
        url: 'https://www.sciencedirect.com/science/article/abs/pii/S0169555X21004700',
      },
    ],
  },
  {
    id: 'channeled-scablands',
    name: 'Channeled Scablands (Dry Falls)',
    country: 'USA (Washington)',
    lat: 47.607,
    lon: -119.364,
    precision: 'site',
    landforms: { fsf: 'strong' },
    climate: 'Mean 9.7 °C, 310 mm of precipitation a year (NASA POWER 2001–2020)',
    why: 'Carved by what were likely the largest floods in Earth’s history; an often-used analog for the giant outflow channels on Mars.',
    image: {
      url: 'https://science.nasa.gov/wp-content/uploads/2025/10/scablands_oli_2013-2018_render.jpg',
      credit: 'NASA Earth Observatory, Landsat 8 OLI mosaic (2013–2018) over SRTM topography',
      page: 'https://science.nasa.gov/earth/earth-observatory/channeled-scablands-92025/',
    },
    sources: [
      {
        title: 'Channeled Scablands: an analog for Martian outflow channels (Caltech GPS)',
        url: 'https://www.gps.caltech.edu/~mpl/Ge121a_Scablands/Ge121a.htm',
      },
      {
        title: 'Channeled Scablands (Wikipedia)',
        url: 'https://en.wikipedia.org/wiki/Channeled_Scablands',
      },
    ],
  },
  {
    id: 'tuktoyaktuk',
    name: 'Tuktoyaktuk pingos (Ibyuk)',
    country: 'Canada (Northwest Territories)',
    lat: 69.4,
    lon: -133.08,
    precision: 'region',
    landforms: { sfe: 'strong' },
    climate: 'Mean −8.4 °C, 307 mm of precipitation a year (NASA POWER 2001–2020)',
    why: 'Ice-cored mounds (pingos) with summit depressions; used to interpret possible pingos in Utopia Planitia, Mars.',
    sources: [
      {
        title: 'Possible pingos and a periglacial landscape in northwest Utopia Planitia (USGS)',
        url: 'https://www.usgs.gov/publications/possible-pingos-and-a-periglacial-landscape-northwest-utopia-planitia',
      },
      {
        title: 'Pingos on Earth and Mars',
        url: 'https://www.researchgate.net/publication/223774403_Pingos_on_Earth_and_Mars',
      },
    ],
  },

  // ---- Slope features ---------------------------------------------------------------------
  {
    id: 'garwood-valley',
    name: 'Garwood Valley gullies, McMurdo Dry Valleys',
    country: 'Antarctica',
    lat: -78.02,
    lon: 164.13,
    precision: 'region',
    landforms: { fsg: 'strong' },
    climate: 'Mean −25.1 °C, 88 mm of precipitation a year (NASA POWER 2001–2020)',
    why: 'Mars-analog gullies forming rapidly in buried ice, in a cold polar desert.',
    sources: [
      {
        title:
          'Rapid growth of Mars-analog gullies in a buried ice substrate, Garwood Valley (LPSC 2011)',
        url: 'https://www.lpi.usra.edu/meetings/lpsc2011/pdf/1432.pdf',
      },
    ],
  },
  {
    id: 'taylor-valley',
    name: 'Taylor Valley water tracks, McMurdo Dry Valleys',
    country: 'Antarctica',
    lat: -77.62,
    lon: 163.0,
    precision: 'region',
    landforms: { fse: 'weak' },
    climate: 'Mean −21.9 °C, 66 mm of precipitation a year (NASA POWER 2001–2020)',
    why: 'Slope streaks are a specifically Martian phenomenon with no direct Earth analog; water tracks here are among the closest proposed candidates.',
    image: {
      url: 'https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/82000/82524/taylorglacier_pho_2013_studinger.jpg/jcr:content/renditions/cq5dam.web.1280.1280.jpeg',
      credit: 'NASA Earth Observatory (aerial photograph, 2013)',
      page: 'https://science.nasa.gov/earth/earth-observatory/taylor-valley-antarctica-82524/',
    },
    sources: [
      {
        title:
          'Are slope streaks indicative of aqueous processes on contemporary Mars? (Rev. Geophys., 2019)',
        url: 'https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2018RG000617',
      },
    ],
  },
  {
    id: 'blackhawk',
    name: 'Blackhawk Landslide, Lucerne Valley',
    country: 'USA (California)',
    lat: 34.36,
    lon: -116.8,
    precision: 'region',
    landforms: { fss: 'strong' },
    climate: 'Mean 16.1 °C, 164 mm of precipitation a year (NASA POWER 2001–2020)',
    why: 'Long-runout landslide that slid as a nearly monolithic sheet at over 100 km/h; long landslides like it also occur on Mars, where there is almost no air to ride on.',
    sources: [
      {
        title: 'Blackhawk Landslide, California (NASA JPL, PIA21008)',
        url: 'https://www.jpl.nasa.gov/images/pia21008-blackhawk-landslide-california/',
      },
      {
        title: 'The Blackhawk Landslide (The Planetary Society)',
        url: 'https://www.planetary.org/space-images/blackhawk-slide',
      },
    ],
  },

  // ---- Impact landforms -------------------------------------------------------------------
  {
    id: 'meteor-crater',
    name: 'Meteor Crater (Barringer)',
    country: 'USA (Arizona)',
    lat: 35.0275,
    lon: -111.0225,
    precision: 'site',
    landforms: { cra: 'strong' },
    climate: 'Mean 11.4 °C, 416 mm of precipitation a year (NASA POWER 2001–2020)',
    why: 'Impact crater used, with other Arizona sites, to teach the Apollo astronauts planetary geology before they went to the Moon.',
    image: {
      url: 'https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/148000/148384/arizona_oli_2021135.jpg/jcr:content/renditions/cq5dam.web.1280.1280.jpeg',
      credit:
        'NASA Earth Observatory image by Joshua Stevens, using Landsat data from the U.S. Geological Survey',
      page: 'https://science.nasa.gov/earth/earth-observatory/arizonas-meteor-crater-148384/',
    },
    sources: [
      {
        title: 'Terrestrial analogs: using Earth to study space (USGS)',
        url: 'https://www.usgs.gov/science/science-explorer/planetary-science/terrestrial-analogs',
      },
    ],
  },
  {
    id: 'haughton',
    name: 'Haughton impact crater, Devon Island',
    country: 'Canada (Nunavut)',
    lat: 75.367,
    lon: -89.683,
    precision: 'site',
    landforms: { cra: 'strong', mix: 'moderate' },
    climate: 'Mean −14.4 °C, 310 mm of precipitation a year (NASA POWER 2001–2020)',
    why: 'The only known impact structure in a cold, dry, windy, nearly unvegetated polar desert; home of the NASA Haughton-Mars Project.',
    image: {
      url: 'https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/2000/2585/PIA03714.jpg/jcr:content/renditions/cq5dam.web.1280.1280.jpeg',
      credit: 'NASA/JPL MISR (PIA03714), via NASA Earth Observatory',
      page: 'https://science.nasa.gov/earth/earth-observatory/mars-researchers-rendezvous-on-remote-arctic-island-2585/',
    },
    sources: [
      { title: 'Haughton-Mars Project (Mars Institute)', url: 'https://www.marsinstitute.no/hmp' },
      {
        title: 'Haughton Impact Crater (The Planetary Society)',
        url: 'https://www.planetary.org/articles/haughton_crater',
      },
    ],
  },
  {
    id: 'lonar',
    name: 'Lonar crater',
    country: 'India',
    lat: 19.976,
    lon: 76.508,
    precision: 'site',
    landforms: { cra: 'strong' },
    climate: 'Mean 26.0 °C, 843 mm of precipitation a year (NASA POWER 2001–2020)',
    why: 'A 1.88 km bowl-shaped impact crater in Deccan basalt, described as an excellent terrestrial analog of bowl-shaped impact craters on Mars.',
    sources: [
      {
        title:
          'Basalt ejecta boulders at Lonar crater with application to Mars (JGR Planets, 2020)',
        url: 'https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2020JE006593',
      },
    ],
  },
  {
    id: 'henbury',
    name: 'Henbury crater field',
    country: 'Australia (Northern Territory)',
    lat: -24.573,
    lon: 133.148,
    precision: 'site',
    landforms: { sfx: 'strong' },
    climate: 'Mean 22.5 °C, 237 mm of precipitation a year (NASA POWER 2001–2020)',
    why: '13–14 small craters from one fragmented iron meteoroid, including the only rayed crater known on Earth; a similar rayed crater was imaged by HiRISE on Mars.',
    sources: [
      {
        title: 'The geology of Australian Mars analogue sites (UNSW)',
        url: 'https://www.unsw.edu.au/content/dam/pdfs/science/aca/research-reports/2022-01-aca-research/2022-01-West,%20Clarke,%20Thomas,%20Walter%20and%20Pain%20%202010%20_0.pdf',
      },
      {
        title: 'Henbury Craters (Mars Society Australia)',
        url: 'https://marssociety.org.au/project/geology/place/henbury-craters',
      },
    ],
  },

  // ---- Basic terrain ----------------------------------------------------------------------
  {
    id: 'atacama-yungay',
    name: 'Yungay, Atacama Desert hyperarid core',
    country: 'Chile',
    lat: -24.08,
    lon: -70.01,
    precision: 'region',
    landforms: { mix: 'moderate', smo: 'moderate' },
    climate: 'Mean 17.1 °C, 7 mm of precipitation a year (NASA POWER 2001–2020)',
    why: 'One of the driest, most UV-irradiated places on Earth, with highly oxidizing soils, very little organic matter and few microbes; a well-known Mars analog for its hyper-aridity and Mars-like salts and clays.',
    sources: [
      {
        title:
          'Inhabited subsurface wet smectites in the hyperarid core of the Atacama (Sci. Rep., 2020)',
        url: 'https://www.nature.com/articles/s41598-020-76302-z',
      },
    ],
  },
  {
    id: 'salar-de-uyuni',
    name: 'Salar de Uyuni',
    country: 'Bolivia',
    lat: -20.13,
    lon: -67.49,
    precision: 'region',
    landforms: { smo: 'moderate', fse: 'weak' },
    climate: 'Mean 7.5 °C, 332 mm of precipitation a year (NASA POWER 2001–2020)',
    why: 'A vast salt flat high in the Andes; its seasonal brine streaks are studied as an analog for slope streaks on Mars.',
    sources: [
      {
        title: 'Bolivian salt flats (NASA Earth Observatory)',
        url: 'https://earthobservatory.nasa.gov/images/151813/bolivian-salt-flats',
      },
      {
        title:
          'Are slope streaks indicative of aqueous processes on contemporary Mars? (Rev. Geophys., 2019)',
        url: 'https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2018RG000617',
      },
    ],
  },
  {
    id: 'holuhraun',
    name: 'Holuhraun lava flow-field',
    country: 'Iceland',
    lat: 64.87,
    lon: -16.83,
    precision: 'region',
    landforms: { rou: 'strong' },
    climate: 'Mean −2.8 °C, 861 mm of precipitation a year (NASA POWER 2001–2020)',
    why: 'Fresh 2014–2015 rubbly and spiny lava, studied as an analog for the volcanic terrains of Elysium Planitia on Mars.',
    image: {
      url: 'https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/84000/84316/holuhraun_oli_2014249.jpg/jcr:content/renditions/cq5dam.web.1280.1280.jpeg',
      credit:
        'NASA Earth Observatory image by Jesse Allen, using Landsat data from the U.S. Geological Survey',
      page: 'https://science.nasa.gov/earth/earth-observatory/roiling-flows-on-holuhraun-lava-field-84316/',
    },
    sources: [
      {
        title:
          'The 2014–2015 Holuhraun lava flow-field as a planetary analog for Elysium Planitia (PSJ, 2025)',
        url: 'https://iopscience.iop.org/article/10.3847/PSJ/adb5f1',
      },
    ],
  },
  {
    id: 'beacon-valley',
    name: 'Beacon Valley sublimation polygons',
    country: 'Antarctica',
    lat: -77.83,
    lon: 160.6,
    precision: 'region',
    landforms: { tex: 'strong' },
    climate: 'Mean −33.7 °C, 142 mm of precipitation a year (NASA POWER 2001–2020)',
    why: 'Sublimation polygons over buried ice, the dominant polygon type on Mars.',
    sources: [
      {
        title: 'Characterization of Beacon Valley polygon morphology (Mars Polar Conference, 2024)',
        url: 'https://www.hou.usra.edu/meetings/marspolar2024/pdf/6062.pdf',
      },
      {
        title:
          'The high elevation Dry Valleys as analog sites for subsurface ice on Mars (Planet. Space Sci., 2013)',
        url: 'https://www.sciencedirect.com/science/article/abs/pii/S0032063313001360',
      },
    ],
  },
  // ---- Moon ------------------------------------------------------------------------------
  // Recognised Moon analog sites. Their sources compare them with the Moon in general, not with
  // one Moon landform, so they are listed under 'moon' as 'moderate'.
  {
    id: 'ries',
    name: 'Nördlinger Ries crater',
    country: 'Germany',
    lat: 48.88,
    lon: 10.58,
    precision: 'region',
    landforms: { moon: 'moderate' },
    climate: 'Mean 8.7 °C, 748 mm of precipitation a year (NASA POWER 2001–2020)',
    why: 'A 25 km, well-preserved impact crater where the Apollo 14 and 17 crews trained in 1970; ESA astronauts now study its impact rocks to prepare for the Moon.',
    sources: [
      {
        title: 'The astronauts are back! (ESA Pangaea training, 2017)',
        url: 'https://blogs.esa.int/caves/2017/09/18/the-astronauts-are-back/',
      },
    ],
  },
  {
    id: 'mistastin',
    name: 'Mistastin Lake impact structure',
    country: 'Canada (Labrador)',
    lat: 55.88,
    lon: -63.3,
    precision: 'region',
    landforms: { moon: 'moderate' },
    climate: 'Mean −5.9 °C, 949 mm of precipitation a year (NASA POWER 2001–2020)',
    why: 'A 28 km impact crater in anorthosite, the rock of the lunar highlands, studied as a geological analogue for lunar highland craters.',
    sources: [
      {
        title:
          'Mistastin Impact Structure, Labrador: A Geological Analogue for Lunar Highland Craters',
        url: 'https://www.researchgate.net/publication/241208537_Mistastin_Impact_Structure_Labrador_A_Geological_Analogue_for_Lunar_Highland_Craters',
      },
      {
        title: 'Mistastin impact crater (Crater Explorer)',
        url: 'https://craterexplorer.ca/mistastin-impact-crater/',
      },
    ],
  },
  {
    id: 'lofoten',
    name: 'Lofoten anorthosite',
    country: 'Norway',
    lat: 68.1,
    lon: 13.5,
    precision: 'region',
    landforms: { moon: 'moderate' },
    climate: 'Mean 6.0 °C, 1,212 mm of precipitation a year (NASA POWER 2001–2020)',
    why: 'One of the finest exposures of anorthosite on Earth, a rock rare here but common in the bright lunar highlands; ESA astronauts learn Moon geology there.',
    sources: [
      {
        title: 'Astronauts learn Moon geology in a fjord (ESA Pangaea, 2025)',
        url: 'https://blogs.esa.int/caves/2025/07/28/astronauts-learn-moon-geology-in-a-fjord/',
      },
    ],
  },
  {
    id: 'craters-of-the-moon',
    name: 'Craters of the Moon lava field',
    country: 'USA (Idaho)',
    lat: 43.46,
    lon: -113.51,
    precision: 'region',
    landforms: { moon: 'moderate' },
    climate: 'Mean 5.7 °C, 416 mm of precipitation a year (NASA POWER 2001–2020)',
    why: 'Apollo 14 astronauts trained here in 1969 to learn volcanic geology, since much of the Moon is covered by volcanic rock; NASA still uses it as a research site.',
    sources: [
      {
        title: 'Space Exploration Research and Astronaut Training (US National Park Service)',
        url: 'https://www.nps.gov/crmo/learn/historyculture/space-exploration-research-and-astronaut-training.htm',
      },
    ],
  },
]

const RANK: Record<Confidence, number> = { strong: 0, moderate: 1, weak: 2 }

/** Analog sites for a landform with their confidence, strongest first. */
export function analogsFor(code: LandformCode): { site: AnalogSite; confidence: Confidence }[] {
  return ANALOG_SITES.flatMap((site) => {
    const confidence = site.landforms[code]
    return confidence ? [{ site, confidence }] : []
  }).sort((a, b) => RANK[a.confidence] - RANK[b.confidence])
}
