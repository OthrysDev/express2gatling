


type Options = {
    verbose: boolean;

    // Run requests sequentially? (or concurrently?)
    runSequentially: boolean;

    // Whether (or not) to try & match Mongo ObjectIds together
    activateObjectIdMatching: boolean;

    // Naming (files, scripts etc.)
    rootFolder: string;
    simulationFolder: string;
    simulationName: string;
    scenarioName: string;
    packageName: string;
    requestsFile: string;

    // Dynamic namings
    methodsNamePattern: string;
    methodsDescPattern: string;

    // Filter out unwanted requests
    excludeRequests: {
        // "POST" | "GET" | "PUT" | "DELETE" | "OPTIONS" | "HEAD" | "TRACE" | "CONNECT" | "PATCH"
        methods: string[]
    },

    // Filter out unwanted headers : keep only those included
    includeHeaders: string[] | undefined,

    // Save / inject variables
    variables: {
        save: {
            headers?: string[],
            body?: string[]
        },
        inject: {
            queryParams?: { name: string, value: string }[],
            headers?: { name: string, value: string }[],
            body?: { name: string, value: string }[],
        }
    },

    // Feeders
    feeders: { name: string, value: string}[];

    // Folder containing all assets (for file uploads)
    assetsFolder: string;
};

export const defaultOptions: Options = {
    verbose: false,

    // Run requests sequentially? (or concurrently?)
    runSequentially: false,

    // Whether (or not) to try & match Mongo ObjectIds together
    activateObjectIdMatching: false,

    // Naming (files, scripts etc.)
    rootFolder: "./gatling/simulations",
    simulationFolder: "simulation1",
    simulationName: "Simulation1",
    scenarioName: "Scenario1",
    packageName: "scenario1",
    requestsFile: "Requests",

    // Dynamic namings
    methodsNamePattern: "%method%_%urlStart%_%iterator%",
    methodsDescPattern: "%METHOD% %urlStart%",

    // Filter out unwanted requests
    excludeRequests: {
        methods: [ "OPTIONS" ]
    },

    // Filter out unwanted headers : keep only those included
    includeHeaders: undefined,

    // Save / inject variables
    variables: {
        save: {
            headers: [],
            body: []
        },
        inject: {
            queryParams: [],
            headers: [],
            body: []
        }
    },

    // Feeders
    feeders: [],
    
    // Folder containing all assets (for file uploads)
    assetsFolder: ""
};



export default Options;