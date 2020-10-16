import Options from '../Options';

const SimulationTemplate = (
    options: Options, 
    host: string | undefined, 
    requests: { name: string; script: string; pause: number }[]
): string => {
    
    const requestsFileNameNoExtension = options.requestsFile.split(".")[0];
    
    return `package ${options.packageName}

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._
import scala.util.Random
import scala.concurrent.duration.FiniteDuration

import ${options.packageName}.${requestsFileNameNoExtension}


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
    // ======================================= SCENARIO =========================================
    // ==========================================================================================

    val ${options.scenarioName} = scenario("${options.scenarioName}").exec(
        ${requests.map((r, i) => `${(i !== 0) ? "\n\t\t" : ""}${requestsFileNameNoExtension}.${r.name},${Array(Math.max(0, 75 - `${requestsFileNameNoExtension}.${r.name}`.length)).join(" ")}pause(${r.pause} milliseconds)`)}
    )

    // ==========================================================================================
    // ======================================== SETUP ===========================================
    // ==========================================================================================

    // Run scenario
    setUp(${options.scenarioName}.inject(atOnceUsers(1)).protocols(httpProtocol))
}

`
};

export default SimulationTemplate;