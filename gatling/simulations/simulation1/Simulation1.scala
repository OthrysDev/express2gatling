package scenario1

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._
import scala.util.Random
import scala.concurrent.duration.FiniteDuration

import scenario1.Requests


class Simulation1 extends Simulation {

    val HOST = "undefined"

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

    val Scenario1 = scenario("Scenario1").exec(
        
    )

    // ==========================================================================================
    // ======================================== SETUP ===========================================
    // ==========================================================================================

    // Run scenario
    setUp(Scenario1.inject(atOnceUsers(1)).protocols(httpProtocol))
}

