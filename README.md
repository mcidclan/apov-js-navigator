# apov-js-navigator
```
Interactive streaming of pre-rendered rasterized voxels region project
written in javascript.

Please see atomic-point-of-view project to generate the atoms.apov file.
Note that the header should be exported as shown below:

./bin/apov space-block-size:256 vertical-pov-count:12 \
    horizontal-pov-count:12 ray-step:256 max-ray-depth:192 \
    projection-depth:300 export-header

Once the file is generated, copy paste it at the root directory.

Make sure you have the needed node modules installed:
npm install; cd client; npm install

Then simply run the project from the root directory with:
npm run both

Please keep in mind that the APoV project is still under development.
