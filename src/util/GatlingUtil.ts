import Options from '../Options';


export default class GatlingUtil {

    public static header(key: string, value: string): string {
        return `.header("${key}", "${value}")`;
    }

    public static varHeader(key: string, value: string): string {
        return `.header("${key}", "\${${GatlingUtil.var(value)}}")`;
    }

    public static jsonBody(body: any): string {
        return `.body(StringBody("""${JSON.stringify(body)}""")).asJson`;
    }

    public static formParam(key: string, value: string): string {
        return `.formParam("${key}", StringBody("""${value}"""))`;
    }

    public static formUpload(key: string, fileName: string, options: Options): string {
        let fileFullPath = fileName;
        if(options.assetsFolder?.length > 0){
            if(options.assetsFolder.charAt(options.assetsFolder.length - 1) === "/") fileFullPath = options.assetsFolder + fileName;
            else fileFullPath = options.assetsFolder + "/" + fileName;
        }

        return `.formUpload("${key}", StringBody("""${fileFullPath}"""))`;
    }

    public static saveHeaderVar(varName: string): string {
        return `.check(header("${varName}").saveAs("${GatlingUtil.var(varName)}"))`;
    }

    public static saveBodyVar(varPath: string, varName?: string): string {
        if(!varName) varName = varPath;
        return `.check(jsonPath("$.${varPath}").saveAs("${GatlingUtil.var(varName)}"))`;
    }

    // ================================================================================
    // ================================================================================
    // ================================================================================
    
    public static var(varName: string): string {
        return `__${varName.replace(new RegExp('%', 'g'), '').toUpperCase()}__`;
    }

}