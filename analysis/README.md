# Analysis data

Sourced data behind the Compare page (`/compare`). `src/data/compare.ts` is generated from it:

```bash
python3 analysis/build_compare_data.py
```

| File                             | What it is                                                                             | How it was made                                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `data/power.csv`                 | Mean temperature, day–night range, precipitation and grid elevation per Earth site     | NASA POWER climatology API v2.10 (MERRA-2, 2001–2020), one request per site's coordinates              |
| `data/dem.csv`                   | Site elevation, slope and local relief per Earth site                                  | ASTER GDEM 30 m via OpenTopoData: 3×3 samples 300 m apart, slope by Horn's method, relief = max − min  |
| `data/moon_centroids.json`       | Centre of each Artemis III candidate region                                            | Mean of the candidate landing sites published in JGR Planets 2025 (doi 10.1029/2025JE009434, Table A1) |
| `mars-among-us-analog-data.xlsx` | Everything above in one workbook, with sources, method and a review of rejected claims | Built from the same data                                                                               |

## Scoring method

Each purpose (rover testing, base, local resources, search for life, astronaut training) compares its own
set of factors. Every factor scores 1 (weak), 2 (partial or unknown on the Earth side) or 3 (strong) and all
factors count equally, after Stern et al. 2025, JGR Planets (doi 10.1029/2024JE008803). Factors with no
sourced value for the target are left out and shown as "no data". The thresholds are in
`src/lib/similarity.ts`.

## Known limits

- NASA POWER values describe a ~50 km grid cell, not the exact point.
- Slope and relief describe a 0.6 km window around the coordinates. For Lonar and Mistastin the
  coordinates fall on a lake, for Tuktoyaktuk on the sea, so slope and relief are left unmeasured there
  (neutral in the score) rather than using the water surface.
- Moon and Mars targets have no sourced site temperature or sunlight values yet, so those factors are
  left out. The planet-wide average is not used as a site value.
