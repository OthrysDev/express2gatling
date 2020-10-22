import Options from '../Options';
import IRecordedRequest from '../types/IRecordedRequest';

const RequestsTemplate = (
    options: Options, 
    requests: IRecordedRequest[]
): string => `package ${options.packageName}

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._
import scala.util.Random


object ${options.requestsFile} {
${requests.map((r, i) => {
    return `
    ${(!options.runSequentially || i === 0) ? 
        `val ${(options.runSequentially) ? 'all_requests_seq' : r.name } =
            exec(` 
        : 
        `\t.pause(${r.pause} milliseconds)
        .exec(`
    }
            http("${r.desc}")
            .${r.method.toLowerCase()}("${r.url}") \
            ${(r.headers && r.headers.length > 0) ? `\n\t\t\t${r.headers.join("\n\t\t\t")}` : ""} \
            ${(r.body && r.body.length > 0) ? `\n\t\t\t${r.body.join("\n\t\t\t")}` : ""} \
            ${(r.varsToSave && r.varsToSave.length > 0) ? `\n\t\t\t${r.varsToSave.join("\n\t\t\t")}` : ""} \
            ${(options.verbose) ? `\n\t\t\t.check(bodyString.saveAs("__BODY__"))` : ""}
        )
        ${(options.verbose) && `.exec(session => {
            println("${r.desc}")
            println(session("__BODY__").as[String])
            session
        })`}`;
}).join("")}
}
`

export default RequestsTemplate;