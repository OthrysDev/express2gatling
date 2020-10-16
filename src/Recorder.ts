import express from 'express';
import Options, { defaultOptions } from './Options';
import fs from 'fs';
import SimulationTemplate from './templates/SimulationTemplate';
import RequestsTemplate from './templates/RequestsTemplate';
import ScriptUtil from './util/ScriptUtil';


class Recorder {

    private options: Options;

    private iterator = 0;

    public recording: { host: string | undefined; requests: { name: string; script: string; pause: number }[]; } = {
        host: undefined,
        requests: []
    };

    // ================================================================================
    // ================================================================================
    // ================================================================================
    
    constructor(options: Partial<Options> = {}){
        this.options = Object.assign(defaultOptions, options);
    }

    rec(req: express.Request, res: express.Response, next: express.NextFunction): void {
        // This call has been filtered out by method
        if(this.options.excludeRequests.methods.includes(req.method)) return next();

        const oldWrite: Function = res.write;
        const oldEnd: Function = res.end;
        const chunks: Buffer[] = [];

        res.write = function (chunk: any): boolean {
            chunks.push(Buffer.from(chunk));

            // eslint-disable-next-line prefer-rest-params
            return oldWrite.apply(res, arguments);
        };

        res.end = function (chunk?: any, encodingOrCb?: string | Function, cb?: Function): void {
            if (chunk) chunks.push(Buffer.from(chunk));

            return oldEnd.call(res, chunk, encodingOrCb, cb);
        };

        res.on('finish', () => {
            let resBody;
            try {
                const body: string = Buffer.concat(chunks).toString('utf8');
                
                if(body && body.length > 0) resBody = JSON.parse(body);
            } catch (e) {
                // Will happen if response is a file, for example
                return;
            }

            // Increase iterator. Will help keep things' names unique
            ++this.iterator;
    
            // First iteration ever. Fix host in main simulation script
            if(!this.recording.host) this.recording.host = req.protocol + "://" + req.headers.host;
    
            // The request
            this.recording.requests.push(ScriptUtil.buildRequest(req, res, resBody, this.options, this.iterator));
        });

        return next();
    }

    write(): void {      
        console.log("Exporting recorded request to Gatling scala files...");
        
        const folder = `${this.options.rootFolder}/${this.options.simulationFolder}`;
        const simulationFile = `${folder}/${this.options.simulationName}.scala`;
        const requestsFile = `${folder}/${this.options.requestsFile}.scala`;

        // Create output directory & file
        fs.mkdirSync(folder, { recursive: true });

        // Add main simulation script
        const simulationScriptWS = fs.createWriteStream(simulationFile);
        simulationScriptWS.write(SimulationTemplate(
            this.options,
            this.recording.host, 
            this.recording.requests
        ));

        // Then the scripts file
        const requestsScriptWS = fs.createWriteStream(requestsFile);
        requestsScriptWS.write(RequestsTemplate(
            this.options,
            this.recording.requests
        ));
    }

}


export default Recorder;