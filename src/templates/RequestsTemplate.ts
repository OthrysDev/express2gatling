import Options from '../Options';

const RequestsTemplate = (
    options: Options, 
    requests: { name: string; script: string; pause: number }[]
): string => `package ${options.packageName}

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._
import scala.util.Random


object ${options.requestsFile.split(".")[0]} {
${requests.map(r => r.script).join("")}
}
`

export default RequestsTemplate;