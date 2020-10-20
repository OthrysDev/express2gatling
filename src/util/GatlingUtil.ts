import Options from '../Options';
import Util from './Util';

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
        const fileExtension = Util.extension(fileName);
        const stubFile = Util.shuffle(options.files).find(file => Util.extension(file) === fileExtension);

        return `.formUpload("${key}", StringBody("""${stubFile || fileName}"""))`;
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