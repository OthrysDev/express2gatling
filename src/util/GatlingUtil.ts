

export default class GatlingUtil {

    public static header(key: string, value: string): string {
        return `.header("${key}", "${value}")`;
    }

    public static varHeader(key: string, value: string): string {
        return `.header("${key}", "\$\{${GatlingUtil.var(value)}\}")`;
    }

    public static jsonBody(body: any): string {
        return `.body(StringBody("""${JSON.stringify(body)}""")).asJson`;
    }

    public static formParam(key: string, value: string): string {
        return `.formParam("${key}", "${value}")`;
    }

    public static saveHeaderVar(varName: string): string {
        return `.check(header("${varName}").saveAs("${GatlingUtil.var(varName)}"))`;
    }

    public static saveBodyVar(varName: string): string {
        return `.check(jsonPath("$.${varName}").saveAs("${GatlingUtil.var(varName)}"))`;
    }

    // ================================================================================
    // ================================================================================
    // ================================================================================
    
    public static var(varName: string): string {
        return `__${varName.replace(new RegExp('%', 'g'), '').toUpperCase()}__`;
    }

}