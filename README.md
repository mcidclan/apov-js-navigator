# apov-js-navigator
```
Interactive streaming of pre-rendered voxels region written in javascript.

Please see atomic-point-of-view project to generate the atoms.apov file.
Note that the header should be exported as in the following example:
./bin/apov space-block-size:256 vertical-pov-count:12 \
    horizontal-pov-count:12 ray-step:256 max-ray-depth:192 \
    projection-depth:300 export-header

Make sure to have the needed node modules installed:
npm install; cd client; npm install

Then simply run the project from the root directory with:
npm run both

This part of the APoV project is under development