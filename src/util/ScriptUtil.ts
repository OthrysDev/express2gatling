import express from 'express';
import Options from '../Options';
import VarCache from '../cache/VarCache';
import GatlingUtil from '../util/GatlingUtil';
import Util from '../util/Util';


export default class ScriptUtil {

    private static dateMarker: Date | undefined;

    public static buildRequest(req: express.Request, res: express.Response, resBody: any, options: Options, iterator: number): { name: string, script: string, pause: number} {
        const requestName = Util.getMethodName(req, options, iterator);

        const headers = ScriptUtil.buildHeaders(req, options);
        const body = ScriptUtil.buildBody(req);
        const varsToSave = VarCache.saveVars(res.getHeaders(), resBody, options);

        let request =  `
        val ${requestName} = 
        exec(
            http("${Util.getMethodDesc(req, options, iterator)}")
            .${req.method.toLowerCase()}("${req.path}")`;

        if(headers) request += `\n\t\t\t${headers}`;
        if(body) request += `\n\t\t\t${body}`;
        if(varsToSave) request +=  `\n\t\t\t${varsToSave}`;

        // Verbose : save the body
        if(options.verbose){
            request += `\n\t\t\t.check(bodyString.saveAs("__BODY__"))`;
        }

        request += `\n\t\t)`;

        // Verbose: print the body
        if(options.verbose){
            request += `
            .exec(session => {
                println("${Util.getMethodDesc(req, options, iterator)}")
                println(session("__BODY__").as[String])
                session
            })
            `;
        }

        return { name: requestName, script: request, pause: ScriptUtil.getPause() };
    }

    public static buildBody (req: express.Request): string | undefined {
        let body;

        if(req.body && Object.keys(req.body).length > 0){
            // Initialize body
            body = '';

            // URL encoded
            if(req.headers["content-type"] && req.headers["content-type"] === "application/x-www-form-urlencoded"){
                for(let k of Object.keys(req.body)) body += GatlingUtil.formParam(k, req.body[k]);
            } 
            // Default (JSON)
            else {
                body = GatlingUtil.jsonBody(req.body);;
            }
        }
        
        return body;
    }

    public static buildHeaders (req: express.Request, options: Options): string | undefined {
        let headers;

        if(req && req.headers){
            for(let key of Object.keys(req.headers)){
                // Options : includes. Accept only those included
                if(options.includeHeaders && !options.includeHeaders.map(i => i.toLowerCase()).includes(key.toLowerCase().trim())) continue;

                // Initialize the headers var 
                if(!headers) headers = '';

                // If the variable has been saved by a previous request, use saved value
                let h:string = '';
                // Shall we inject a value for this particular header?
                if(options.variables.inject.headers && options.variables.inject.headers.length > 0){
                    const varToInject = options.variables.inject.headers.find(h => h.name.toLowerCase() === key.toLowerCase());

                    if(varToInject){
                        // Variable to inject is a previously saved variable
                        if(varToInject.value.startsWith("$")) {
                            if(VarCache.hasVar(varToInject.value.substring(1))) {
                                h = GatlingUtil.varHeader(key, varToInject.value.substring(1));
                            } else {
                                h = GatlingUtil.header(key, req.headers[key] as string);
                            }
                        }
                        // Variable to inject is a harcoded value
                        else h = GatlingUtil.header(key, varToInject.value);
                    } else {
                        h = GatlingUtil.header(key, req.headers[key] as string);
                    }                  
                } else {
                    h = GatlingUtil.header(key, req.headers[key] as string);
                }

                if(headers.length === 0) headers += `${h}`;
                else headers += `\n\t\t\t${h}`;
            }
        }

        return headers;
    }
    
    public static getPause(): number {
        let pause = 0;

        if(ScriptUtil.dateMarker) pause = new Date().getTime() - ScriptUtil.dateMarker.getTime();
        ScriptUtil.dateMarker = new Date();

        return pause;
    }

}