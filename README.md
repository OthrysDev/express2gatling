# express2gatling &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/OthrysDev/express2gatling/blob/master/LICENSE)

**express2gatling** is a library written in Typescript that records incoming HTTP calls within Express and exports them into Gatling scripts.

Gatling is a major stress-testing tool written in scala that can ramp up millions of users and generate high-resolution metrics.

Gatling's website : https://gatling.io

> **/!\ Please note that this library is at its early stages and shall be considered as highly limited and unstable. Lots of features are to be added. Feel free to contribute!**

## Introduction

While Gatling is one of the best tools there is to perform stress-tests on a server, it also comes with its difficulties and can be tedious to handle. This library aims at providing a very simple tool to auto-generate Gatling scripts. It works the following way : 
- You add the library's recorder as a middleware in your express stack
- An end user manipulates the client-side of the application (Postman, website, mobile app etc.)
- The recorder analyses every incoming HTTP request
- When the end user is done, the recorder generates scala files that that are directly compatible with Gatling.

### Limitations

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
- **Requests.scala** : contains all the HTTP requests, scripted in a scala / Gatling fashion
- **Simulation1.scala** : contains the main entry point for Gatling, with scenarios definitions

Whatever the features and limitations of the library, feel free to modify those scripts manually.

## Running an actual stress test

For the scripts to be run you shall install Gatling : https://gatling.io/open-source

Follow the procedures & documentation provided on Gatling's website. Normally you should download a zip file containing the sources to run Gatling in standalone mode. You might have to install a JDK to have it run.

Once Gatling is operationnal, point it to your scripts by modifying the `gatling.conf` file : 
```yaml
[...]
directory {
    simulations = "/path/to/your/generated/folder/simulations"
}
[...]
```

Follow the instructions prompted in the console that shall eventually lead to the stress test being ran and HTML reports being generated.

For more info about Gatling please refer to their website.

## Documentation

You can can modify the recorder's behaviour by using the **options** param : 

```javascript
const options = { /** put your options here */ };
const recorder = new Recorder(options);
```

Here's the full list of options available : 

| Name | Type | Default value | Description |
| ---- | ---- | ------------- | ----------- |
| verbose | boolean | false | Wether or not to create verbose Gatling scripts, that will output reponse bodies etc. |
| rootFolder | string | "./gatling/simulations" | The folder in which the scripts will be outputted to |
| simulationFolder | string | "simulation1" | The folder within the rootFolder in which your simulation which be outputted to |
| simulationName | string | "Simulation1" | The name of your simulation (will be the name of the main scala file) |
| scenarioName | string | "Scenario1" | The name of your scenario. Please follow scala conventions for classes naming |
| packageName | string | "scenario1" | The name of your package. Please follow scala conventions for package naming conventions |
| requestsFile | string | "Requests" | The name of the scala file containing all the requests. Please follow scala conventions for package naming conventions |
| methodsNamePattern | string | "%method%_%pathStart%_%iterator%" | The name of the scripts methods. You can use any combination of hardcoded values and the following dynamic values : %method% (ex: "get"), %METHOD% (ex: "GET"), %pathStart% (ex: "foo"), %PATHSTART% (ex: "FOO"), %iterator% (ex: 0) |
| methodsDescPattern | string | "%METHOD% %pathStart%" | The description of the scripts methods. You can use any combination of hardcoded values and the following dynamic values : %method% (ex: "get"), %METHOD% (ex: "GET"), %pathStart% (ex: "foo"), %PATHSTART% (ex: "FOO"), %iterator% (ex: 0) |
| excludeRequests.methods | string[] | [ "OPTIONS" ] | HTTP requests you want to exclude by method. Methods should be one or many of the following : "POST", "GET", "PUT", "DELETE", "OPTIONS", "HEAD", "TRACE", "CONNECT", "PATCH" |
| includeHeaders | string[] \| undefined | undefined | Headers that shall be kept in the scripted HTTP requests. If you specify one or more headers, only those will be kept and the others will be discarded in the final script |
| variables.save.headers | string[] | [] | Values sent back by the server in the headers that you might want to catch & save for later. Simply specify the header's name |
| variables.save.body | string[] | [] | Values sent back by the server in the body that you might want to catch & save for later. Simply specify the variable's name |
| variables.inject.headers | { name: string, value: string }[] | [] | Values you want to inject in the headers. Can be a combination of hardcoded values and stored variables, for instance : { name: "foo", value: "foo %bar%" } (given that %bar% is a variable you have previously saved via variables.save. If %bar% has not be captured yet the injection won't work and will default to the initial value) |
| variables.inject.body | { name: string, value: string }[] | [] | Values you want to inject in the body. Can be a combination of hardcoded values and stored variables, for instance : { name: "foo", value: "foo %bar%" } (given that %bar% is a variable you have previously saved via variables.save. If %bar% has not be captured yet the injection won't work and will default to the initial value) |

## People

This library has been created by and is maintained by [Othrys](https://othrys.dev).

[List of all contributors](https://github.com/OthrysDev/express2gatling/graphs/contributors)

## License

[MIT](LICENSE)




