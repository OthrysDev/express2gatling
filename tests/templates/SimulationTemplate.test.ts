import SimulationTemplate from "src/templates/SimulationTemplate";
import Options from 'src/Options';
import TestUtil from 'tests/TestUtil';



describe('SimulationTemplate', () => {

    test('Options specify one feeder', () => {
        const result = SimulationTemplate({ scenarioName: "FeederScenario", feeders: [{ name: "email", value: "user.%RANDOM_ALPHANUM%@mail.com" }] } as unknown as Options, "", []);

        TestUtil.expectContainCleansed(result, `val emailFeeder = Iterator.continually(Map("email" -> ("user." + Random.alphanumeric.take(10).mkString + "@mail.com")))`);
        TestUtil.expectContainCleansed(result, `scenario("FeederScenario").feed(emailFeeder)`);
    });

    test('Options specify multiple feeders', () => {
        const result = SimulationTemplate(
            { 
                scenarioName: "FeederScenario", 
                feeders: [
                    { name: "email", value: "user.%RANDOM_ALPHANUM%@mail.com" },
                    { name: "username", value: "User %RANDOM_ALPHANUM%" },
                    { name: "city", value: "CITY %RANDOM_ALPHANUM%" },
                ] 
            } as unknown as Options, 
            "", 
            []
        );

        TestUtil.expectContainCleansed(result, `val emailFeeder = Iterator.continually(Map("email" -> ("user." + Random.alphanumeric.take(10).mkString + "@mail.com")))`);
        TestUtil.expectContainCleansed(result, `val usernameFeeder = Iterator.continually(Map("username" -> ("User " + Random.alphanumeric.take(10).mkString + "")))`);
        TestUtil.expectContainCleansed(result, `val cityFeeder = Iterator.continually(Map("city" -> ("CITY " + Random.alphanumeric.take(10).mkString + "")))`);

        TestUtil.expectContainCleansed(result, `scenario("FeederScenario").feed(emailFeeder).feed(usernameFeeder).feed(cityFeeder)`);
    });

});