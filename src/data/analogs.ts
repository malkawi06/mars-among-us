/**
 * Earth analog sites for the 15 DoMars16k landform classes (see ml/train_mars_landforms.ipynb).
 *
 * Every site cites at least one source that explicitly compares it with Mars.
 * - landforms maps each landform this site is an analog for to a confidence:
 *     'strong'   = peer-reviewed study of this site as an analog for this landform
 *     'moderate' = recognised Mars analog site; the landform match is general
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
  | 'rid'
  | 'rou'
  | 'sfe'
  | 'sfx'
  | 'smo'
  | 'tex'

export type Confidence = 'strong' | 'moderate' | 'weak'

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
  /** Why it resembles Mars, in one or two sentences, backed by the sources. */
  why: string
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
    climate: 'Hyper-arid coastal desert',
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
    climate: 'Arid, semi-desert basin',
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
    climate: 'Hyper-arid coastal desert',
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
    climate: 'Cold desert',
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
    climate: 'Hot desert',
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
    climate: 'Cold desert',
    why: 'Old river channels cemented and left standing as sinuous ridges after the surrounding rock eroded: the reference analog for sinuous ridges on Mars.',
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
    climate: 'Cold, hyper-arid, high-UV plateau desert',
    why: 'Dry, cold, high-UV basin with yardang ridges, polygons, playas, gullies, brain-terrain-like textures and slope streaks, all with counterparts on Mars.',
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
    climate: 'Semi-arid steppe',
    why: 'Carved by the largest known floods on Earth; the standard analog for the giant outflow channels on Mars.',
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
    climate: 'Arctic tundra, permafrost',
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
    climate: 'Polar desert, hyper-arid and below freezing',
    why: 'Gullies forming in buried ice in one of the most Mars-like climates on Earth.',
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
    climate: 'Polar desert',
    why: 'Slope streaks are a specifically Martian phenomenon with no direct Earth analog; water tracks here are among the closest proposed candidates.',
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
    climate: 'Hot desert (Mojave)',
    why: 'Long-runout dry rock avalanche; "Blackhawk-like" landslides are a recognised class on Mars and Ceres.',
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
    climate: 'Semi-arid plateau',
    why: 'Exceptionally well-preserved simple impact crater, used for decades to train astronauts and scientists in planetary geology.',
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
    climate: 'Polar desert: cold, dry, windy, nearly unvegetated',
    why: 'The only known impact structure in a cold, dry, windy, nearly unvegetated polar desert; home of the NASA Haughton-Mars Project.',
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
    climate: 'Tropical semi-arid',
    why: 'Best-preserved bowl-shaped impact crater in basalt, the dominant rock on the Martian surface.',
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
    climate: 'Hot arid',
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
    climate: 'Hyper-arid, the driest non-polar place on Earth',
    why: 'Soils closest in chemistry to Martian soils: nearly sterile, with nitrate and perchlorate build-up like that measured by Phoenix.',
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
    climate: 'High-altitude cold desert',
    why: 'The flattest large surface on Earth (under 1 m relief over 10,000 km²); its seasonal brines are studied as an analog for slope features on Mars.',
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
    climate: 'Subarctic, unvegetated highland',
    why: 'Fresh 2014–2015 rubbly and spiny lava, studied as an analog for Elysium Planitia, the youngest volcanic terrain on Mars.',
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
    climate: 'Polar desert, mean annual temperature below -21 °C',
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
]

const RANK: Record<Confidence, number> = { strong: 0, moderate: 1, weak: 2 }

/** Analog sites for a landform with their confidence, strongest first. */
export function analogsFor(code: LandformCode): { site: AnalogSite; confidence: Confidence }[] {
  return ANALOG_SITES.flatMap((site) => {
    const confidence = site.landforms[code]
    return confidence ? [{ site, confidence }] : []
  }).sort((a, b) => RANK[a.confidence] - RANK[b.confidence])
}
