import Options, { defaultOptions } from 'src/Options';
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

        test('Standard var with %', () => {
            const result = GatlingUtil.var("%foo%");

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

            TestUtil.expectEqualCleansed(result, `.formParam("foo", StringBody("""bar"""))`);
        });

    });

    describe('saveHeaderVar()', () => {

        test('Standard form param', () => {
            const result = GatlingUtil.saveHeaderVar("foo");

            TestUtil.expectEqualCleansed(result, `.check(header("foo").saveAs("__FOO__"))`);
        });

    });

    describe('saveBodyVar()', () => {

        test('Standard form param', () => {
            const result = GatlingUtil.saveBodyVar("foo");

            TestUtil.expectEqualCleansed(result, `.check(jsonPath("$.foo").saveAs("__FOO__"))`);
        });

    });

    describe('formUpload()', () => {

        test('No files specified in options', () => {
            const result = GatlingUtil.formUpload("foo", "picture.png", defaultOptions);

            TestUtil.expectEqualCleansed(result, `.formUpload("foo", StringBody("""picture.png"""))`);
        });

        test('Options specify matching files', () => {
            const result = GatlingUtil.formUpload("foo", "picture.png", { ...defaultOptions, files: [ "optionsFile.png" ] });

            TestUtil.expectEqualCleansed(result, `.formUpload("foo", StringBody("""optionsFile.png"""))`);
        });

        test('Options specify files but with different extensions', () => {
            const result = GatlingUtil.formUpload("foo", "picture.png", { ...defaultOptions, files: [ "optionsFile.jpg" ] });

            TestUtil.expectEqualCleansed(result, `.formUpload("foo", StringBody("""picture.png"""))`);
        });

    });

});