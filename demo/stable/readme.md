# dwv-simplistic

Simple medical viewer using [DWV](https://github.com/ivmartel/dwv) (DICOM Web Viewer). Provides
the `<dwv-simple>` web component and related app code.

Simple usage: in an HTML document, import the library and add `<dwv-simple urls="..."></dwv-simple>` to
its body. This will display the image and a toolbar with basic tools (scroll, zoom, window level...). See it live in the [demo page](https://ivmartel.github.io/dwv-simplistic/).

All coding/implementation contributions and comments are welcome. Releases should be ready for deployment.

dwv-simplistic is not certified for diagnostic use. Released under GNU GPL-3.0 license (see [license.txt](license.txt)).

[![Node.js CI](https://github.com/ivmartel/dwv-simplistic/actions/workflows/nodejs-ci.yml/badge.svg)](https://github.com/ivmartel/dwv-simplistic/actions/workflows/nodejs-ci.yml)

## Available Scripts

 - `install`: install dependencies
 - `start`: serve at localhost:8080 with live reload
 - `lint`: lint js code

## Steps to run the viewer from scratch

```sh
# get the code
git clone https://github.com/ivmartel/dwv-simplistic.git

# move to its folder
cd dwv-simplistic

# install dependencies
yarn install

# call the start script to launch the viewer on a local server
yarn run start
```

You can now open a browser at http://localhost:8080 and enjoy!
