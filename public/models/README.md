# Model files

- `mars_landforms.int8.onnx`: the model the site uses now. 15 Mars landforms (DoMars16k), from
  `ml/train_mars_landforms.ipynb`. The Analyze page loads it from `/models/mars_landforms.int8.onnx`.
- `planet_landforms.int8.onnx`: Moon + Mars model, 19 classes (15 Mars landforms from DoMars16k, 4 Moon
  classes from LROCNet and lunar rockfalls), from `ml/train_moon_mars_landforms.ipynb`. Its classes and
  test results are in `planet_landforms.labels.json`. Not wired into the site yet.
