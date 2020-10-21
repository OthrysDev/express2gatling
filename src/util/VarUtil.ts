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

    public static saveVars (resHeaders: any, parsedBody: any | undefined, options: Options): string[] {
        const headers = VarUtil.saveHeadersVars(resHeaders, options);
        const body = VarUtil.saveBodyVars(parsedBody, options);
        
        return [ ...headers, ...body ];
    }

    public static saveHeadersVars (resHeaders: any, options: Options): string[] {
        const headers: string[] = [];

        if(resHeaders && Object.keys(resHeaders).length > 0){
            // Shall we save variables?
            const varsToSave = [];
            if(options.variables.save.headers && options.variables.save.headers.length > 0){
                for(const h of options.variables.save.headers){
                    if(Object.keys(resHeaders).includes(h)) varsToSave.push(h);
                }
            }
            
            if(varsToSave.length > 0){
                // Remember which vars were saved
                for(const v of varsToSave) VarUtil.addVar(v);
                
                for(const v of varsToSave){
                    headers.push(GatlingUtil.saveHeaderVar(v));
                }
            }
        }

        return headers;
    }

    public static saveBodyVars (parsedBody: any | undefined, options: Options): string[] {
        const body: string[] = [];

        if(parsedBody && Object.keys(parsedBody).length > 0){
            // Shall we save variables?
            const varsToSave = [];
            if(options.variables.save.body && options.variables.save.body.length > 0){
                for(const b of options.variables.save.body){
                    if(Object.keys(parsedBody).includes(b)) varsToSave.push(b);
                }
            }
            
            if(varsToSave.length > 0){
                // Remember which vars were saved
                for(const v of varsToSave) VarUtil.addVar(v);
                
                for(const v of varsToSave){
                    body.push(GatlingUtil.saveBodyVar(v));
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