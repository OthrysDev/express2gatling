# express2gatling &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/OthrysDev/express2gatling/blob/master/LICENSE)

**express2gatling** is a library written in Typescript that records incoming HTTP calls within Express and exports them into Gatling scripts.

Gatling is a major stress-testing tool written in Scala that can ramp up millions of users and generate high-resolution metrics.

Gatling's website : https://gatling.io

> **/!\ Please note that this library is at its early stages and shall be considered as highly limited and unstable. Lots of features are to be added. Feel free to contribute!**

## Introduction

While Gatling is one of the best tools there is to perform stress-tests on a server, it also comes with its difficulties and can be tedious to handle. This library aims at providing a very simple tool to auto-generate Gatling scripts. It works the following way : 
- You add the library's recorder as a middleware in your express stack
- An end user manipulates the client-side of the application (Postman, website, mobile app etc.)
- The recorder analyses every incoming HTTP request
- When the end user is done, the recorder generates scala files that that are directly compatible with Gatling.

###Limitations

This library only works with Node / Express, and for the time being it is most suited to the JSON format regarding the request / responses bodies.

## Installation

To install the library simply do : 

```javascript
npm i --save-dev express2gatling
```

## Usage 

The simplest snippet to use the library is the following (in your app.js) : 

```javascript
import { Recorder } from 'express2gatling';

[...]

const app = express();

// Mandatory for the recorder to watch req/res bodies !!! (see https://github.com/expressjs/body-parser)
app.use(BodyParser.json());

// Initialize the recorder and inject it into express
const options = {}; // Recording options
const recorder = new Recorder(options);
app.use((req, res, next) => recorder.rec(req, res, next));

// You can call recorder.write() anytime : here we'll invoke it on user manual shutdown
process.on('SIGINT', () => recorder.write());
```

### Output

Once you call `recorder.write()`, the library will generate a folder (defaults to `/gatling`) containing two files : 
- **Requests.scala** : contains all the HTTP requests, scripted in the scala / Gatling fashion
- **Simulation1.scala** : contains the main entry point for Gatling, with scenario definitions

Whatever the features and limitations of the library, feel free to modify those scripts manually.

## Running an actual stress test

For the scripts to be run you shall install Gatling : https://gatling.io/open-source

Follow the procedures & documentation provided on Gatling's website. Normally you should download a zip file containing the sources to run Gatling in standalone mode. You might have to install a JDK to have it run.

Once Gatling is operationnl, point it to your scripts by modifying the `galting.conf` file : 
```yaml
[...]
directory {
    simulations = "/path/to/your/generated/folder/simulations"
}
[...]
```

Follow the instructions prompted in the console that shall eventually lead the stress test being ran and HTML reports being generated.

For more info about Gatling please refer to their website.

## Documentation

TODO