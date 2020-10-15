import express from 'express';
import ScriptUtil from 'src/util/ScriptUtil';
import Options, { defaultOptions } from 'src/Options';
import TestUtil from 'tests/TestUtil';
import VarUtil from 'src/util/VarUtil';
import { Script } from 'vm';


const REQ_MOCK = {
    method: "GET",
    path: "/foo/bar"
} as express.Request;

const JSON_REQ_MOCK = {
    ...REQ_MOCK,
    headers: { "content-type": "application/json" }
} as express.Request;

const URL_ENCODED_REQ_MOCK = {
    ...REQ_MOCK,
    headers: { "content-type": "application/x-www-form-urlencoded" }
} as express.Request;

const HEADERS_REQ_MOCK = {
    headers: {
        foo: "bar",
        oof: "rab"
    }
} as unknown as express.Request;

const RES_MOCK = {
    getHeaders: () => ({ foo: "bar" })
} as unknown as express.Response;


describe('ScriptUtil', () => {

    afterEach(() =>  jest.restoreAllMocks());

    // ================================================================================================
    // ================================================================================================
    // ================================================================================================

    describe('buildRequest()', () => {

        test('Testing a standard request', () => {
            jest.spyOn(ScriptUtil, 'buildHeaders').mockImplementation(() => '.mockedHeaders')
            jest.spyOn(ScriptUtil, 'buildBody').mockImplementation(() => '.mockedBody');
            jest.spyOn(VarUtil, 'saveVars').mockImplementation(() => '.mockedSaveVars');
            jest.spyOn(ScriptUtil, 'getPause').mockImplementation(() => 777);

            const result = ScriptUtil.buildRequest(REQ_MOCK, RES_MOCK, {}, defaultOptions, 0);

            expect(result.name).toEqual("get_foo_0");
            TestUtil.expectEqualCleansed(result.script, `val get_foo_0 = exec(http("GET foo").get("/foo/bar").mockedHeaders.mockedBody.mockedSaveVars)`);
            expect(result.pause).toEqual(777);
        });

        test('Request with no body', () => {
            jest.spyOn(ScriptUtil, 'buildHeaders').mockImplementation(() => '.mockedHeaders')
            jest.spyOn(ScriptUtil, 'buildBody').mockImplementation(() => undefined);
            jest.spyOn(VarUtil, 'saveVars').mockImplementation(() => '.mockedSaveVars');
            jest.spyOn(ScriptUtil, 'getPause').mockImplementation(() => 777);

            const result = ScriptUtil.buildRequest(REQ_MOCK, RES_MOCK, {}, defaultOptions, 0);

            expect(result.name).toEqual("get_foo_0");
            TestUtil.expectEqualCleansed(result.script, `val get_foo_0 = exec(http("GET foo").get("/foo/bar").mockedHeaders.mockedSaveVars)`);
            expect(result.pause).toEqual(777);
        });

        test('Request with no headers', () => {
            jest.spyOn(ScriptUtil, 'buildHeaders').mockImplementation(() => undefined)
            jest.spyOn(ScriptUtil, 'buildBody').mockImplementation(() => '.mockedBody');
            jest.spyOn(VarUtil, 'saveVars').mockImplementation(() => '.mockedSaveVars');
            jest.spyOn(ScriptUtil, 'getPause').mockImplementation(() => 777);

            const result = ScriptUtil.buildRequest(REQ_MOCK, RES_MOCK, {}, defaultOptions, 0);

            expect(result.name).toEqual("get_foo_0");
            TestUtil.expectEqualCleansed(result.script, `val get_foo_0 = exec(http("GET foo").get("/foo/bar").mockedBody.mockedSaveVars)`);
            expect(result.pause).toEqual(777);
        });

        test('Request with no saved vars', () => {
            jest.spyOn(ScriptUtil, 'buildHeaders').mockImplementation(() => '.mockedHeaders')
            jest.spyOn(ScriptUtil, 'buildBody').mockImplementation(() => '.mockedBody');
            jest.spyOn(VarUtil, 'saveVars').mockImplementation(() => undefined)
            jest.spyOn(ScriptUtil, 'getPause').mockImplementation(() => 777);

            const result = ScriptUtil.buildRequest(REQ_MOCK, RES_MOCK, {}, defaultOptions, 0);

            expect(result.name).toEqual("get_foo_0");
            TestUtil.expectEqualCleansed(result.script, `val get_foo_0 = exec(http("GET foo").get("/foo/bar").mockedHeaders.mockedBody)`);
            expect(result.pause).toEqual(777);
        });

        test('Testing a standard request with verbose mode on', () => {
            jest.spyOn(ScriptUtil, 'buildHeaders').mockImplementation(() => '.mockedHeaders')
            jest.spyOn(ScriptUtil, 'buildBody').mockImplementation(() => '.mockedBody');
            jest.spyOn(VarUtil, 'saveVars').mockImplementation(() => '.mockedSaveVars');
            jest.spyOn(ScriptUtil, 'getPause').mockImplementation(() => 777);

            const result = ScriptUtil.buildRequest(REQ_MOCK, RES_MOCK, {}, { ...defaultOptions, verbose: true }, 0);

            expect(result.name).toEqual("get_foo_0");
            TestUtil.expectEqualCleansed(result.script, `val get_foo_0 = exec(http("GET foo").get("/foo/bar")
                .mockedHeaders
                .mockedBody
                .mockedSaveVars
                .check(bodyString.saveAs("__BODY__"))).exec(session => {
                    println("GET foo")
                    println(session("__BODY__").as[String])
                    session
                })`);
            expect(result.pause).toEqual(777);
        });

    });

    describe('buildBody()', () => {

        test('Testing an empty body', () => {
            // JSON
            const jsonResult = ScriptUtil.buildBody(JSON_REQ_MOCK);
            expect(jsonResult).toEqual(undefined);

            // URL encoded
            const urlEncResult = ScriptUtil.buildBody(URL_ENCODED_REQ_MOCK);
            expect(urlEncResult).toEqual(undefined);
        });

        test('Testing a JSON request', () => {
            const body = { foo: "bar" };
            const result = ScriptUtil.buildBody({ ...JSON_REQ_MOCK, body} as express.Request);

            TestUtil.expectEqualCleansed(result, `.body(StringBody("""{"foo":"bar"}""")).asJson`);
        });

        test('Testing a JSON request with multiple keys', () => {
            const body = { foo: "bar", array: ["one", "two", "three"], bool: true };
            const result = ScriptUtil.buildBody({ ...JSON_REQ_MOCK, body} as express.Request);

            TestUtil.expectEqualCleansed(result, `.body(StringBody("""{"foo":"bar","array":["one","two","three"],"bool":true}""")).asJson`);
        });

        test('Testing an URL-encoded request', () => {
            const body = { foo: "bar" };
            const result = ScriptUtil.buildBody({ ...URL_ENCODED_REQ_MOCK, body} as express.Request);

            TestUtil.expectEqualCleansed(result, `.formParam("foo", "bar")`);
        });

        test('Testing an URL-encoded request with multiple keys', () => {
            const body = { foo: "bar", array: ["one", "two", "three"], bool: true };
            const result = ScriptUtil.buildBody({ ...URL_ENCODED_REQ_MOCK, body } as express.Request);

            TestUtil.expectEqualCleansed(result, `.formParam("foo", "bar").formParam("array", "one,two,three").formParam("bool", "true")`);
        });

    });

    describe('buildHeaders()', () => {

        test('No options, no saved vars', () => {
            const options = {
                variables: {
                    inject: {
                        headers: []
                    }
                }
            } as unknown as Options;

            const result = ScriptUtil.buildHeaders(HEADERS_REQ_MOCK, options);

            TestUtil.expectEqualCleansed(result, `.header("foo", "bar").header("oof", "rab")`);
        });

        test('Options specify to include only targeted headers', () => {
            const options = {
                includeHeaders: [ "foo" ],
                variables: {
                    inject: {
                        headers: []
                    }
                }
            } as unknown as Options;

            const result = ScriptUtil.buildHeaders(HEADERS_REQ_MOCK, options);

            TestUtil.expectEqualCleansed(result, `.header("foo", "bar")`);
        });

        // Workaround
        test('[Workaround] Options specify content-type : make sure it has the right case', () => {
            const result = ScriptUtil.buildHeaders({ headers: { "content-type": "bar" } } as unknown as express.Request, defaultOptions);

            TestUtil.expectEqualCleansed(result, `.header("Content-Type", "bar")`);
        });

        test('Options specify to include no header at all', () => {
            const options = {
                includeHeaders: [],
                variables: {
                    inject: {
                        headers: []
                    }
                }
            } as unknown as Options;

            const result = ScriptUtil.buildHeaders(HEADERS_REQ_MOCK, options);

            expect(result).toEqual(undefined);
        });

        test('Options specify to include multiple headers', () => {
            const options = {
                includeHeaders: [ "foo", "oof" ],
                variables: {
                    inject: {
                        headers: []
                    }
                }
            } as unknown as Options;

            const result = ScriptUtil.buildHeaders(HEADERS_REQ_MOCK, options);

            TestUtil.expectEqualCleansed(result, `.header("foo", "bar").header("oof", "rab")`);
        });

        test('Options specify to include non-existing headers - should not crash', () => {
            const options = {
                includeHeaders: [ "foo", "not" ],
                variables: {
                    inject: {
                        headers: []
                    }
                }
            } as unknown as Options;

            const result = ScriptUtil.buildHeaders(HEADERS_REQ_MOCK, options);

            TestUtil.expectEqualCleansed(result, `.header("foo", "bar")`);
        });

        test('Options specify to inject hardcoded values', () => {
            const options = {
                variables: {
                    inject: {
                        headers: [
                            { name: "foo", value: "hard" },
                            { name: "oof", value: "drah" }
                        ]
                    }
                }
            } as unknown as Options;

            const result = ScriptUtil.buildHeaders(HEADERS_REQ_MOCK, options);

            TestUtil.expectEqualCleansed(result, `.header("foo", "hard").header("oof", "drah")`);
        });

        test('Options specify to inject one hardcoded value', () => {
            const options = {
                variables: {
                    inject: {
                        headers: [
                            { name: "foo", value: "hard" }
                        ]
                    }
                }
            } as unknown as Options;

            const result = ScriptUtil.buildHeaders(HEADERS_REQ_MOCK, options);

            TestUtil.expectEqualCleansed(result, `.header("foo", "hard").header("oof", "rab")`);
        });

        test("Options specify to inject one dynamic value, but the var hasn't been saved yet", () => {
            const options = {
                variables: {
                    inject: {
                        headers: [
                            { name: "foo", value: "%dyn%" }
                        ]
                    }
                }
            } as unknown as Options;

            const result = ScriptUtil.buildHeaders(HEADERS_REQ_MOCK, options);

            TestUtil.expectEqualCleansed(result, `.header("foo", "bar").header("oof", "rab")`);
        });

        test("Options specify to inject one dynamic value and one hardcoded value", () => {
            VarUtil.addVar("dyn");

            const options = {
                variables: {
                    inject: {
                        headers: [
                            { name: "foo", value: "%dyn%" }
                        ]
                    }
                }
            } as unknown as Options;

            const result = ScriptUtil.buildHeaders(HEADERS_REQ_MOCK, options);

            TestUtil.expectEqualCleansed(result, `.header("foo", "\${__DYN__}").header("oof", "rab")`);
        });

        test("Options specify to inject two dynamic values", () => {
            VarUtil.addVar("dyn");
            VarUtil.addVar("nyd");

            const options = {
                variables: {
                    inject: {
                        headers: [
                            { name: "foo", value: "%dyn%" },
                            { name: "oof", value: "%nyd%" }
                        ]
                    }
                }
            } as unknown as Options;

            const result = ScriptUtil.buildHeaders(HEADERS_REQ_MOCK, options);

            TestUtil.expectEqualCleansed(result, `.header("foo", "\${__DYN__}").header("oof", "\${__NYD__}")`);
        });

    });

    describe('getPause()', () => {

        test("First invocation should return 0", () => {
            const result = ScriptUtil.getPause();

            expect(result).toEqual(0);
        });

        test("Second invocation should a positive number", () => {
            const result = ScriptUtil.getPause();

            expect(result).toBeGreaterThanOrEqual(0);
        });

    });

});