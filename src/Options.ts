


type Options = {
    verbose: boolean;

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

    // Naming (files, scripts etc.)
    rootFolder: "./gatling/simulations",
    simulationFolder: "simulation1",
    simulationName: "Simulation1",
    scenarioName: "Scenario1",
    packageName: "scenario1",
    requestsFile: "Requests",

    // Dynamic namings
    methodsNamePattern: "%method%_%pathStart%_%iterator%",
    methodsDescPattern: "%METHOD% %pathStart%",

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