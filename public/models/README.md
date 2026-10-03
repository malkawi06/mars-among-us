# Model files

- `planet_landforms.int8.onnx`: the model the site uses. Moon + Mars, 19 classes (15 Mars landforms from
  DoMars16k, 4 Moon classes from LROCNet and lunar rockfalls), from `ml/train_moon_mars_landforms.ipynb`.
  Its classes and test results are in `planet_landforms.labels.json`.
- `mars_landforms.int8.onnx`: the earlier Mars-only model (15 classes), from
  `ml/train_mars_landforms.ipynb`. Kept as a fallback; the site does not load it.
