import express from 'express';
import ScriptUtil from 'src/util/ScriptUtil';
import Options, { defaultOptions } from 'src/Options';
import TestUtil from 'tests/TestUtil';
import VarUtil from 'src/util/VarUtil';
import fileUpload from 'express-fileupload';


const REQ_MOCK = {
    method: "GET",
    url: "/foo/bar"
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

const URL_PARAMS_REQ_MOCK = {
    method: "GET",
    path: "/foo/bar",
    url: "/foo/bar?baz=zab",
    query: { baz: "zab" }
} as unknown as express.Request;

const RES_MOCK = {
    getHeaders: () => ({ foo: "bar" })
} as unknown as express.Response;


describe('ScriptUtil', () => {

    afterEach(() =>  {
        jest.restoreAllMocks()
        VarUtil.reset();
    });

    // ================================================================================================
    // ================================================================================================
    // ================================================================================================

    describe('buildRequest()', () => {

        test('Testing a standard request', () => {
            jest.spyOn(ScriptUtil, 'buildHeaders').mockImplementation(() => ['.mockedHeaders'])
            jest.spyOn(ScriptUtil, 'buildBody').mockImplementation(() => ['.mockedBody']);
            jest.spyOn(VarUtil, 'saveVars').mockImplementation(() => ['.mockedSaveVars']);
            jest.spyOn(ScriptUtil, 'getPause').mockImplementation(() => 777);

            const result = ScriptUtil.buildRequest(REQ_MOCK, RES_MOCK, {}, defaultOptions, 0);

            expect(result.name).toEqual("get_foo_0");
            expect(result.method).toEqual("GET");
            expect(result.desc).toEqual("GET foo");
            expect(result.url).toEqual("/foo/bar");
            expect(result.headers).toEqual([".mockedHeaders"]);
            expect(result.body).toEqual([".mockedBody"]);
            expect(result.varsToSave).toEqual([".mockedSaveVars"]);
            expect(result.pause).toEqual(777);
        });

        test('Request with no body', () => {
            jest.spyOn(ScriptUtil, 'buildHeaders').mockImplementation(() => ['.mockedHeaders'])
            jest.spyOn(ScriptUtil, 'buildBody').mockImplementation(() => []);
            jest.spyOn(VarUtil, 'saveVars').mockImplementation(() => ['.mockedSaveVars']);
            jest.spyOn(ScriptUtil, 'getPause').mockImplementation(() => 777);

            const result = ScriptUtil.buildRequest(REQ_MOCK, RES_MOCK, {}, defaultOptions, 0);

            expect(result.name).toEqual("get_foo_0");
            expect(result.method).toEqual("GET");
            expect(result.desc).toEqual("GET foo");
            expect(result.url).toEqual("/foo/bar");
            expect(result.headers).toEqual([".mockedHeaders"]);
            expect(result.body).toEqual([]);
            expect(result.varsToSave).toEqual([".mockedSaveVars"]);
            expect(result.pause).toEqual(777);
        });

        test('Request with no headers', () => {
            jest.spyOn(ScriptUtil, 'buildHeaders').mockImplementation(() => [])
            jest.spyOn(ScriptUtil, 'buildBody').mockImplementation(() => ['.mockedBody']);
            jest.spyOn(VarUtil, 'saveVars').mockImplementation(() => ['.mockedSaveVars']);
            jest.spyOn(ScriptUtil, 'getPause').mockImplementation(() => 777);

            const result = ScriptUtil.buildRequest(REQ_MOCK, RES_MOCK, {}, defaultOptions, 0);

            expect(result.name).toEqual("get_foo_0");
            expect(result.method).toEqual("GET");
            expect(result.desc).toEqual("GET foo");
            expect(result.url).toEqual("/foo/bar");
            expect(result.headers).toEqual([]);
            expect(result.body).toEqual([".mockedBody"]);
            expect(result.varsToSave).toEqual([".mockedSaveVars"]);
            expect(result.pause).toEqual(777);
        });

        test('Request with no saved vars', () => {
            jest.spyOn(ScriptUtil, 'buildHeaders').mockImplementation(() => ['.mockedHeaders'])
            jest.spyOn(ScriptUtil, 'buildBody').mockImplementation(() => ['.mockedBody']);
            jest.spyOn(VarUtil, 'saveVars').mockImplementation(() => [])
            jest.spyOn(ScriptUtil, 'getPause').mockImplementation(() => 777);

            const result = ScriptUtil.buildRequest(REQ_MOCK, RES_MOCK, {}, defaultOptions, 0);

            expect(result.name).toEqual("get_foo_0");
            expect(result.method).toEqual("GET");
            expect(result.desc).toEqual("GET foo");
            expect(result.url).toEqual("/foo/bar");
            expect(result.headers).toEqual([".mockedHeaders"]);
            expect(result.body).toEqual([".mockedBody"]);
            expect(result.varsToSave).toEqual([]);
            expect(result.pause).toEqual(777);
        });

    });

    describe('buildUrl()', () => {

        test('No url injection', () => {
            const jsonResult = ScriptUtil.buildUrl(JSON_REQ_MOCK, defaultOptions);

            expect(jsonResult).toEqual(JSON_REQ_MOCK.url);
        });

        test(`Injecting a var that hasn't been saved yet`, () => {
            const options = {
                variables: {
                    inject: {
                        queryParams: [
                            { name: "baz", value: "%bar%" }
                        ]
                    }
                }
            } as unknown as Options;

            const result = ScriptUtil.buildUrl(URL_PARAMS_REQ_MOCK, options);

            expect(result).toEqual("/foo/bar?baz=zab");
        });

        test('Injecting a previously saved var', () => {
            VarUtil.addVar("bar");

            const options = {
                variables: {
                    inject: {
                        queryParams: [
                            { name: "baz", value: "%bar%" }
                        ]
                    }
                }
            } as unknown as Options;

            const result = ScriptUtil.buildUrl(URL_PARAMS_REQ_MOCK, options);

            expect(result).toEqual("/foo/bar?baz=${__BAR__}");
        });

        test('Injecting a hardcoded value', () => {
            const options = {
                variables: {
                    inject: {
                        queryParams: [
                            { name: "baz", value: "hard" }
                        ]
                    }
                }
            } as unknown as Options;

            const result = ScriptUtil.buildUrl(URL_PARAMS_REQ_MOCK, options);

            expect(result).toEqual("/foo/bar?baz=hard");
        });

        test('Injecting a mix of dynamic & hardcoded value', () => {
            VarUtil.addVar("bar");

            const options = {
                variables: {
                    inject: {
                        queryParams: [
                            { name: "baz", value: "hard%bar%" }
                        ]
                    }
                }
            } as unknown as Options;

            const result = ScriptUtil.buildUrl(URL_PARAMS_REQ_MOCK, options);

            expect(result).toEqual("/foo/bar?baz=hard${__BAR__}");
        });

        test(`Injecting a mix of dynamic & hardcoded value but value hasn't been saved yet`, () => {
            const options = {
                variables: {
                    inject: {
                        queryParams: [
                            { name: "baz", value: "hard%bar%" }
                        ]
                    }
                }
            } as unknown as Options;

            const result = ScriptUtil.buildUrl(URL_PARAMS_REQ_MOCK, options);

            expect(result).toEqual("/foo/bar?baz=zab");
        });

        test(`Injecting multiple hadcorded and dynamic values`, () => {
            VarUtil.addVar("cachedParam1");
            VarUtil.addVar("cachedParam3");

            const URL_PARAMS_REQ_MOCK = {
                method: "GET",
                path: "/foo/bar",
                url: "/foo/bar?param1=value1&param2=value2&param3=value3&param4=value4",
                query: { param1: "value1", param2: "value2", param3: "value3", param4: "value4" }
            } as unknown as express.Request;

            const options = {
                variables: {
                    inject: {
                        queryParams: [
                            { name: "param1", value: "hard%cachedParam1%" },
                            { name: "param2", value: "drad" },
                            { name: "param3", value: "bla%cachedParam3%bla" },
                            { name: "param4", value: "%cachedParam4%" },
                        ]
                    }
                }
            } as unknown as Options;

            const result = ScriptUtil.buildUrl(URL_PARAMS_REQ_MOCK, options);

            expect(result).toEqual("/foo/bar?param1=hard${__CACHEDPARAM1__}&param2=drad&param3=bla${__CACHEDPARAM3__}bla&param4=value4");
        });

    });

    describe('buildBody()', () => {

        test('Testing an empty body', () => {
            // JSON
            const jsonResult = ScriptUtil.buildBody(JSON_REQ_MOCK, defaultOptions);
            expect(jsonResult).toEqual([]);

            // URL encoded
            const urlEncResult = ScriptUtil.buildBody(URL_ENCODED_REQ_MOCK, defaultOptions);
            expect(urlEncResult).toEqual([]);
        });

        test('Testing a JSON request', () => {
            const body = { foo: "bar" };
            const result = ScriptUtil.buildBody({ ...JSON_REQ_MOCK, body} as express.Request, defaultOptions);

            expect(result).toEqual([`.body(StringBody("""{"foo":"bar"}""")).asJson`]);
        });

        test('Testing a JSON request with multiple keys', () => {
            const body = { foo: "bar", array: ["one", "two", "three"], bool: true };
            const result = ScriptUtil.buildBody({ ...JSON_REQ_MOCK, body} as express.Request, defaultOptions);

            expect(result).toEqual([`.body(StringBody("""{"foo":"bar","array":["one","two","three"],"bool":true}""")).asJson`]);
        });

        test('Testing a JSON request with a feeder', () => {
            const body = { foo: "bar" };
            const result = ScriptUtil.buildBody({ ...JSON_REQ_MOCK, body } as express.Request, { ...defaultOptions, feeders: [{ name: "foo", value: "" }]});

            expect(result).toEqual([`.body(StringBody("""{"foo":"\${foo}"}""")).asJson`]);
        });

        test('Testing a JSON request with a mix of feeders and regular params', () => {
            const body = { foo: "bar", oof: "rab", baz: "zab" };
            const result = ScriptUtil.buildBody({ ...JSON_REQ_MOCK, body } as express.Request, { ...defaultOptions, feeders: [{ name: "foo", value: "" }, { name: "baz", value: "" }]});

            expect(result).toEqual([`.body(StringBody("""{"foo":"\${foo}","oof":"rab","baz":"\${baz}"}""")).asJson`]);
        });

        test('Testing an URL-encoded request', () => {
            const body = { foo: "bar" };
            const result = ScriptUtil.buildBody({ ...URL_ENCODED_REQ_MOCK, body} as express.Request, defaultOptions);

            expect(result).toEqual([`.formParam("foo", StringBody("""bar"""))`]);
        });

        test('Testing an URL-encoded request with multiple keys', () => {
            const body = { foo: "bar", array: ["one", "two", "three"], bool: true };
            const result = ScriptUtil.buildBody({ ...URL_ENCODED_REQ_MOCK, body } as express.Request, defaultOptions);

            expect(result).toEqual([`.formParam("foo", StringBody("""bar"""))`, `.formParam("array", StringBody("""one,two,three"""))`, `.formParam("bool", StringBody("""true"""))`]);
        });

        test('Testing an URL-encoded request with a feeder', () => {
            const body = { foo: "bar" };
            const result = ScriptUtil.buildBody({ ...URL_ENCODED_REQ_MOCK, body } as express.Request, { ...defaultOptions, feeders: [{ name: "foo", value: "" }]});

            expect(result).toEqual([`.formParam("foo", StringBody("""\${foo}"""))`]);
        });

        test('Testing an URL-encoded request with a mix of feeders and regular params', () => {
            const body = { foo: "bar", oof: "rab", baz: "zab" };
            const result = ScriptUtil.buildBody({ ...URL_ENCODED_REQ_MOCK, body } as express.Request, { ...defaultOptions, feeders: [{ name: "foo", value: "" }, { name: "baz", value: "" }]});

            expect(result).toEqual([`.formParam("foo", StringBody("""\${foo}"""))`, `.formParam("oof", StringBody("""rab"""))`, `.formParam("baz", StringBody("""\${baz}"""))`]);
        });

        test('Testing a multipart request with one uploaded file', () => {
            const body = { foo: "bar" };
            const files = { picture: { name: "picture.png" } } as unknown as fileUpload.UploadedFile[];
            const result = ScriptUtil.buildBody({ ...URL_ENCODED_REQ_MOCK, body, files } as unknown as express.Request, defaultOptions);

            expect(result).toEqual([`.formParam("foo", StringBody("""bar"""))`, `.formUpload("picture", StringBody("""picture.png"""))`]);
        });

        test('Testing a multipart request with multiple uploaded files', () => {
            const body = { foo: "bar" };
            const files = { picture: { name: "picture.png" }, video: { name: "video.png" } } as unknown as fileUpload.UploadedFile[];
            const result = ScriptUtil.buildBody({ ...URL_ENCODED_REQ_MOCK, body, files } as unknown as express.Request, defaultOptions);

            expect(result).toEqual([`.formParam("foo", StringBody("""bar"""))`, `.formUpload("picture", StringBody("""picture.png"""))`, `.formUpload("video", StringBody("""video.png"""))`]);
        });

        test('Testing a multipart request with a json as a FormData param', () => {
            const body = { foo: { baz: "bar" } };
            const result = ScriptUtil.buildBody({ ...URL_ENCODED_REQ_MOCK, body } as unknown as express.Request, defaultOptions);

            expect(result).toEqual([`.formParam("foo", StringBody("""{"baz":"bar"}"""))`]);
        });

        test('Testing a multipart request with a stringified json as a FormData param', () => {
            const body = { foo: `{"baz":"bar"}` };
            const result = ScriptUtil.buildBody({ ...URL_ENCODED_REQ_MOCK, body } as unknown as express.Request, defaultOptions);

            expect(result).toEqual([`.formParam("foo", StringBody("""{"baz":"bar"}"""))`]);
        });
        
        test('Testing a multipart request with a stringified json as a FormData param plus feeders', () => {
            const body = { foo: `{"baz":"bar"}` };
            const result = ScriptUtil.buildBody({ ...URL_ENCODED_REQ_MOCK, body } as unknown as express.Request, { ...defaultOptions, feeders: [{ name: "baz", value: "" } ]});

            expect(result).toEqual([`.formParam("foo", StringBody("""{"baz":"\${baz}"}"""))`]);
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

            expect(result).toEqual([`.header("foo", "bar")`, `.header("oof", "rab")`]);
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

            expect(result).toEqual([`.header("foo", "bar")`]);
        });

        // Workaround
        test('[Workaround] Options specify content-type : make sure it has the right case', () => {
            const result = ScriptUtil.buildHeaders({ headers: { "content-type": "bar" } } as unknown as express.Request, defaultOptions);

            expect(result).toEqual([`.header("Content-Type", "bar")`]);
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

            expect(result).toEqual([]);
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

            expect(result).toEqual([`.header("foo", "bar")`, `.header("oof", "rab")`]);
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

            expect(result).toEqual([`.header("foo", "bar")`]);
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

            expect(result).toEqual([`.header("foo", "hard")`, `.header("oof", "drah")`]);
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

            expect(result).toEqual([`.header("foo", "hard")`, `.header("oof", "rab")`]);
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

            expect(result).toEqual([`.header("foo", "bar")`, `.header("oof", "rab")`]);
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

            expect(result).toEqual([`.header("foo", "\${__DYN__}")`, `.header("oof", "rab")`]);
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

            expect(result).toEqual([`.header("foo", "\${__DYN__}")`, `.header("oof", "\${__NYD__}")`]);
        });

        test("Options specify a feeder", () => {
            const options = {
                feeders: [{ name: "foo", value: "" }]
            } as unknown as Options;

            const result = ScriptUtil.buildHeaders(HEADERS_REQ_MOCK, options);

            expect(result).toEqual([`.header("foo", "\${foo}")`, `.header("oof", "rab")`]);
        });

        test("Options specify multiple feeders", () => {
            const options = {
                feeders: [{ name: "foo", value: "" }, { name: "oof", value: "" }]
            } as unknown as Options;

            const result = ScriptUtil.buildHeaders(HEADERS_REQ_MOCK, options);

            expect(result).toEqual([`.header("foo", "\${foo}")`, `.header("oof", "\${oof}")`]);
        });

        test("Options specify a feeder with non-standard case", () => {
            const options = {
                feeders: [{ name: "foo-bar", value: "" }]
            } as unknown as Options;

            const result = ScriptUtil.buildHeaders({
                headers: {
                    "foo-bar": "bar"
                }
            } as unknown as express.Request, options);

            expect(result).toEqual([`.header("foo-bar", "\${foo-bar}")`]);
        });

        test("Options specify a mix of variable to inject and feeders", () => {
            VarUtil.addVar("dyn");

            const options = {
                variables: {
                    inject: {
                        headers: [
                            { name: "foo", value: "%dyn%" }
                        ]
                    }
                },
                feeders: [{ name: "foo-bar", value: "" }]
            } as unknown as Options;

            const result = ScriptUtil.buildHeaders({
                headers: {
                    "foo": "hard",
                    "foo-bar": "bar"
                }
            } as unknown as express.Request, options);

            expect(result).toEqual([`.header("foo", "\${__DYN__}")`, `.header("foo-bar", "\${foo-bar}")`]);
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