import GatlingUtil from './GatlingUtil';
import Options from '../Options';


export default class VarUtil {

    private static varsCache: Set<string> = new Set();

    public static reset(): void {
        this.varsCache.clear();
    }

    public static addVar(varName: string): void {
        VarUtil.varsCache.add(`%${varName}%`);
    }

    public static hasVar(varName: string): boolean {
        return VarUtil.varsCache.has(`%${varName}%`);
    }

    public static saveVars (resHeaders: any, parsedBody: any | undefined, options: Options): string | undefined {
        let headers = VarUtil.saveHeadersVars(resHeaders, options);
        let body = VarUtil.saveBodyVars(parsedBody, options);
        
        // Careful with the concatenation : both variables can be undefined
        let result;
        if(headers) result = headers;
        if(body){
            if(!headers) result = body;
            else result += `\n\t\t\t${body}`;
        } 

        return result;
    }

    public static saveHeadersVars (resHeaders: any, options: Options): string | undefined {
        let headers;

        if(resHeaders && Object.keys(resHeaders).length > 0){
            // Shall we save variables?
            let varsToSave = [];
            if(options.variables.save.headers && options.variables.save.headers.length > 0){
                for(let h of options.variables.save.headers){
                    if(Object.keys(resHeaders).includes(h)) varsToSave.push(h);
                }
            }
            
            if(varsToSave.length > 0){
                // Remember which vars were saved
                for(let v of varsToSave) VarUtil.addVar(v);
                
                // Modify the request script so that it saves the variable
                headers = '';

                for(let v of varsToSave){
                    headers += GatlingUtil.saveHeaderVar(v);
                }
            }
        }

        return headers;
    }

    public static saveBodyVars (parsedBody: any | undefined, options: Options): string | undefined {
        let body;

        if(parsedBody && Object.keys(parsedBody).length > 0){
            // Shall we save variables?
            let varsToSave = [];
            if(options.variables.save.body && options.variables.save.body.length > 0){
                for(let b of options.variables.save.body){
                    if(Object.keys(parsedBody).includes(b)) varsToSave.push(b);
                }
            }
            
            if(varsToSave.length > 0){
                // Remember which vars were saved
                for(let v of varsToSave) VarUtil.addVar(v);
                
                // Modify the request script so that it saves the variable
                body = '';

                for(let v of varsToSave){
                    body += GatlingUtil.saveBodyVar(v);
                }
            }
        }
        
        return body;
    }

    public static injectHeaderVar(key: string, originalValue: string, valueToInject: string): string {
        let newValue = valueToInject;

        // Variable to inject contains previously saved variable(s)
        if(newValue.includes("%")) {
            VarUtil.varsCache.forEach((cachedVar) => {
                newValue = newValue.replace(new RegExp(cachedVar, 'g'), `\${${GatlingUtil.var(cachedVar)}}`);
            });

            // Var replacement hasn't fully worked (some vars have not been saved yet, most likely)
            // Use original value
            if(newValue.includes("%")) newValue = originalValue;
        }
        
        return GatlingUtil.header(key, newValue);
    }
}