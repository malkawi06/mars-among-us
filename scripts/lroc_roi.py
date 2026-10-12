"""Close-up images of the Artemis regions outside the LROC south-pole mosaic (north of 85.5°S).

Source: LROC NAC controlled mosaics of the candidate Artemis III landing sites, 5 m/px browse
GeoTIFFs (NASA/GSFC/Arizona State University; Henriksen et al. 2023, European Lunar Symposium).
Only the window around each target is read over HTTP (GDAL /vsicurl/), not the whole file.

Usage: python scripts/lroc_roi.py OUT_DIR
Writes OUT_DIR/<target id>.jpg (SIZE x SIZE at TARGET_M_PER_PX, like the other orbital images) and
prints, for each target, how much of the image has no data.
Needs rasterio and pyproj.
"""

import sys
from pathlib import Path

import numpy as np
import rasterio
from PIL import Image
from pyproj import CRS, Transformer
from rasterio.enums import Resampling
from rasterio.windows import Window

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fetch_earth_images import SIZE, TARGET_M_PER_PX, sites  # noqa: E402

BROWSE = 'https://pds.lroc.im-ldi.com/data/LRO-L-LROC-5-RDR-V1.0/LROLRC_2001/EXTRAS/BROWSE/NAC_ROI'
# Target id in src/data/compare.ts -> LROC NAC ROI composite mosaic that covers it.
PRODUCTS = {
    'moon-1': 'CABEUSPKLO1/NAC_ROI_CABEUSPKLO1_P836S2912',  # Peak near Cabeus B
    'moon-4': 'MOUTNPLTLO1/NAC_ROI_MOUTNPLTLO1_P843S0306',  # Mons Mouton Plateau
    'moon-5': 'MTMOUTONLO1/NAC_ROI_MTMOUTONLO1_P854S0353',  # Nobile Rim 1 and Mons Mouton
    'moon-6': 'MTMOUTONLO1/NAC_ROI_MTMOUTONLO1_P854S0353',
    'moon-7': 'NOBILE02LO1/NAC_ROI_NOBILE02LO1_P839S0587',  # Nobile Rim 2
}


def url(target_id):
    return f'{BROWSE}/{PRODUCTS[target_id]}_5M.PYR.TIF'


def roi_image(target_id, lat, lon):
    """(image, metres per pixel, share of pixels with no data) centred on lat, lon."""
    with rasterio.open('/vsicurl/' + url(target_id)) as src:
        crs = CRS.from_wkt(src.crs.to_wkt())
        x, y = Transformer.from_crs(crs.geodetic_crs, crs, always_xy=True).transform(lon, lat)
        row, col = src.index(x, y)
        window_px = round(SIZE * TARGET_M_PER_PX / abs(src.transform.a))
        window = Window(col - window_px / 2, row - window_px / 2, window_px, window_px)
        band = src.read(
            1,
            window=window,
            out_shape=(SIZE, SIZE),
            resampling=Resampling.average,
            boundless=True,
            fill_value=0,
        )
    empty = float(np.mean(band == 0))
    if band.dtype != np.uint8:
        valid = band[band > 0]
        low, high = np.percentile(valid, (0.5, 99.5)) if valid.size else (0, 1)
        band = np.clip((band - low) / max(high - low, 1) * 255, 0, 255).astype(np.uint8)
    return Image.fromarray(band).convert('RGB'), TARGET_M_PER_PX, empty


def main(out_dir):
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    for sid, _body, lat, lon in sites('TARGETS'):
        if sid not in PRODUCTS:
            continue
        image, m_per_px, empty = roi_image(sid, lat, lon)
        image.save(out / f'{sid}.jpg', quality=85)
        print(f'{sid}: {m_per_px} m/px, {SIZE * m_per_px / 1000:.1f} km across, {empty:.0%} no data')


if __name__ == '__main__':
    main(sys.argv[1])
