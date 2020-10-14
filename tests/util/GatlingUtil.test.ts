import GatlingUtil from 'src/util/GatlingUtil';
import TestUtil from 'tests/TestUtil';


describe('GatlingUtil', () => {

    describe('header()', () => {

        test('Standard header', () => {
            const result = GatlingUtil.header("foo", "bar");

            TestUtil.expectEqualCleansed(result, `.header("foo", "bar")`);
        });

    });

    describe('varHeader()', () => {

        test('Standard var header', () => {
            const result = GatlingUtil.varHeader("foo", "bar");

            TestUtil.expectEqualCleansed(result, `.header("foo", "\${__BAR__}")`);
        });

    });

    describe('var()', () => {

        test('Standard var', () => {
            const result = GatlingUtil.var("foo");

            TestUtil.expectEqualCleansed(result, `__FOO__`);
        });

    });

    describe('jsonBody()', () => {

        test('Standard json body', () => {
            const result = GatlingUtil.jsonBody({ foo: "bar", oof: "rab" });

            TestUtil.expectEqualCleansed(result, `.body(StringBody("""{"foo":"bar","oof":"rab"}""")).asJson`);
        });

    });

    describe('formParam()', () => {

        test('Standard form param', () => {
            const result = GatlingUtil.formParam("foo", "bar");

            TestUtil.expectEqualCleansed(result, `.formParam("foo", "bar")`);
        });

    });

});