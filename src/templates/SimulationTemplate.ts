import Options from '../Options';
import Util from '../util/Util';
import IRecorderRequest from '../types/IRecordedRequest';


const SimulationTemplate = (
    options: Options, 
    host: string | undefined, 
    requests: IRecorderRequest[]
): string => {
    return `package ${options.packageName}

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._
import scala.util.Random
import scala.concurrent.duration.FiniteDuration


class ${options.simulationName} extends Simulation {

    val HOST = "${host}"

    // ==========================================================================================
    // ====================================== PROTOCOL ==========================================
    // ==========================================================================================

    val httpProtocol = http
        .baseUrl(HOST)
        .contentTypeHeader("application/json")

    def pause = (pause:FiniteDuration) => exec().pause(pause);
    
    // ==========================================================================================
    // ======================================= FEEDERS ==========================================
    // ==========================================================================================

    ${options.feeders.map(feeder => {
        return `val ${Util.removeNonAlphaNumChars(feeder.name)}Feeder = Iterator.continually(Map("${feeder.name}" -> ("${feeder.value.replace(/%RANDOM_ALPHANUM%/g, '" + Random.alphanumeric.take(10).mkString + "')}")))`;
    }).join("\n\t")}

    // ==========================================================================================
    // ======================================= SCENARIO =========================================
    // ==========================================================================================

    val ${options.scenarioName} = scenario("${options.scenarioName}")
        ${options.feeders.map(feeder => `.feed(${Util.removeNonAlphaNumChars(feeder.name)}Feeder)`).join("\n\t\t")}
        .exec(
            ${(options.runSequentially) ? 
                `${options.requestsFile}.all_requests_seq`
                :
                requests.map((r) => `${options.requestsFile}.${r.name},${Array(Math.max(0, 75 - `${options.requestsFile}.${r.name}`.length)).join(" ")}pause(${r.pause} milliseconds),`).join("\n\t\t\t")}
        )

    // ==========================================================================================
    // ======================================== SETUP ===========================================
    // ==========================================================================================

    // Run scenario
    setUp(${options.scenarioName}.inject(atOnceUsers(1)).protocols(httpProtocol))

    // An example of a ramped up scenario - feel free to modify
    //setUp(${options.scenarioName}.inject(rampUsers(500) during (300 seconds))).protocols(httpProtocol)
}

`
};

export default SimulationTemplate;