# SF-Muni-Bus-Viz

An Angular2 app written using TypeScript to visualize San Francisco map using d3.js with real-time bus data from NextBus API.

## Features
* Route tag filtering with multi-select on SF Map
* Vehicle position refresh every 15 seconds with transition
* Zoom into specific area using double-click (no zoom out unfortunately).


## Pre-requisites
* NPM and Node.js
* `angular-cli` npm package

## Build/run instructions
In root directory:
`npm install`
`ng serve`

## Tests
Implemented 10/10 unit tests in the spec files running successfully. Run `npm test` to see `karma.js` report. Most of the tests are in the service components.











