import VarUtil from 'src/util/VarUtil';
import Options from 'src/Options';
import GatlingUtil from 'src/util/GatlingUtil';


const OBJ1 = {
    "foo": "bar",
    "baz": "bam"
};

const OBJ2 = {
    "oof": "rab",
    "zab": "mab",
};

describe('VarUtil', () => {

    beforeEach(() => VarUtil.reset());

    // ================================================================================================
    // ================================================================================================
    // ================================================================================================

    describe('saveHeadersVars()', () => {

        test('Options specify not to save any header var', () => {
            const options = {
                variables: {
                    save: { headers: [] }
                }
            } as unknown as Options;

            const result = VarUtil.saveHeadersVars(OBJ1, options);

            expect(result).toEqual([]);
            expect(VarUtil.hasVar("foo")).toEqual(false);
        });

        test('Options specify to save one var', () => {
            const options = {
                variables: {
                    save: { headers: [ "foo" ] }
                }
            } as unknown as Options;

            const result = VarUtil.saveHeadersVars(OBJ1, options);

            expect(result).toContain(GatlingUtil.saveHeaderVar("foo"));
            expect(VarUtil.hasVar("foo")).toEqual(true);
        });

        test('Options specify to save a var that is not in headers', () => {
            const options = {
                variables: {
                    save: { headers: [ "not" ] }
                }
            } as unknown as Options;

            const result = VarUtil.saveHeadersVars(OBJ1, options);

            expect(result).toEqual([]);
            expect(VarUtil.hasVar("not")).toEqual(false);
        });

        test('Options specify to save two vars', () => {
            const options = {
                variables: {
                    save: { headers: [ "foo", "baz" ] }
                }
            } as unknown as Options;

            const result = VarUtil.saveHeadersVars(OBJ1, options);

            expect(result).toContain(GatlingUtil.saveHeaderVar("foo"));
            expect(result).toContain(GatlingUtil.saveHeaderVar("baz"));
            expect(VarUtil.hasVar("foo")).toEqual(true);
            expect(VarUtil.hasVar("baz")).toEqual(true);
        });

    });

    describe('saveBodyVars()', () => {

        test('Options specify not to save any body var', () => {
            const options = {
                variables: {
                    save: { body: [] }
                }
            } as unknown as Options;

            const result = VarUtil.saveBodyVars(OBJ1, options);

            expect(result).toEqual([]);
            expect(VarUtil.hasVar("foo")).toEqual(false);
        });

        test('Options specify to save one var', () => {
            const options = {
                variables: {
                    save: { body: [ "foo" ] }
                }
            } as unknown as Options;

            const result = VarUtil.saveBodyVars(OBJ1, options);

            expect(result).toContain(GatlingUtil.saveBodyVar("foo"));
            expect(VarUtil.hasVar("foo")).toEqual(true);
        });

        test('Options specify to save a var that is not in body', () => {
            const options = {
                variables: {
                    save: { body: [ "not" ] }
                }
            } as unknown as Options;

            const result = VarUtil.saveBodyVars(OBJ1, options);

            expect(result).toEqual([]);
            expect(VarUtil.hasVar("not")).toEqual(false);
        });

        test('Options specify to save two vars', () => {
            const options = {
                variables: {
                    save: { body: [ "foo", "baz" ] }
                }
            } as unknown as Options;

            const result = VarUtil.saveBodyVars(OBJ1, options);

            expect(result).toContain(GatlingUtil.saveBodyVar("foo"));
            expect(result).toContain(GatlingUtil.saveBodyVar("baz"));
            expect(VarUtil.hasVar("foo")).toEqual(true);
            expect(VarUtil.hasVar("baz")).toEqual(true);
        });

    });

    describe('saveVars()', () => {

        test('Options specify not to save any var', () => {
            const options = {
                variables: {
                    save: { body: [], headers: [] }
                }
            } as unknown as Options;

            const result = VarUtil.saveVars(OBJ1, OBJ2, options);

            expect(result).toEqual([]);
        });

        test('Options specify to save only headers vars', () => {
            const options = {
                variables: {
                    save: { body: [], headers: [ "foo", "baz" ] }
                }
            } as unknown as Options;

            const result = VarUtil.saveVars(OBJ1, OBJ2, options);

            expect(result).toContain(GatlingUtil.saveHeaderVar("foo"));
            expect(result).toContain(GatlingUtil.saveHeaderVar("baz"));
            expect(VarUtil.hasVar("foo")).toEqual(true);
            expect(VarUtil.hasVar("baz")).toEqual(true);
        });

        test('Options specify to save only body vars', () => {
            const options = {
                variables: {
                    save: { body: [ "oof", "zab" ], headers: [  ] }
                }
            } as unknown as Options;

            const result = VarUtil.saveVars(OBJ1, OBJ2, options);

            expect(result).toContain(`.check(jsonPath("$.oof").saveAs("__OOF__"))`);
            expect(result).toContain(`.check(jsonPath("$.zab").saveAs("__ZAB__"))`);
            expect(VarUtil.hasVar("oof")).toEqual(true);
            expect(VarUtil.hasVar("zab")).toEqual(true);
        });

        test('Options specify to save headers & body vars', () => {
            const options = {
                variables: {
                    save: { body: [ "oof", "zab" ], headers: [ "foo", "baz" ] }
                }
            } as unknown as Options;

            const result = VarUtil.saveVars(OBJ1, OBJ2, options);

            expect(result).toContain(GatlingUtil.saveHeaderVar("foo"));
            expect(result).toContain(GatlingUtil.saveHeaderVar("baz"));
            expect(result).toContain(GatlingUtil.saveBodyVar("oof"));
            expect(result).toContain(GatlingUtil.saveBodyVar("zab"));
            expect(VarUtil.hasVar("foo")).toEqual(true);
            expect(VarUtil.hasVar("baz")).toEqual(true);
            expect(VarUtil.hasVar("oof")).toEqual(true);
            expect(VarUtil.hasVar("zab")).toEqual(true);
        });

    });

    describe('injectHeaderVar()', () => {

        test('Inject hardcoded value', () => {
            const result = VarUtil.injectHeaderVar("foo", "bar", "baz");

            expect(result).toContain(`.header("foo", "baz")`);
        });

        test('Inject dynamic value not available in cache', () => {
            const result = VarUtil.injectHeaderVar("foo", "bar", "%baz%");

            expect(result).toContain(`.header("foo", "bar")`);
        });

        test('Inject dynamic value available in cache', () => {
            VarUtil.addVar("baz");

            const result = VarUtil.injectHeaderVar("foo", "bar", "%baz%");

            expect(result).toContain(`.header("foo", "\${__BAZ__}")`);
        });

        test('Inject a mix of hardcoded values and dynamic values', () => {
            VarUtil.addVar("baz");

            const result = VarUtil.injectHeaderVar("foo", "bar", "hard %baz%");

            expect(result).toContain(`.header("foo", "hard \${__BAZ__}")`);
        });

        test('Inject a big combination of hardcoded values and dynamic values', () => {
            VarUtil.addVar("baz");
            VarUtil.addVar("oof");
            VarUtil.addVar("zab");

            const result = VarUtil.injectHeaderVar("foo", "bar", "hard %baz%_%oof%_%baz%-drah-%zab% hard0");

            expect(result).toContain(`.header("foo", "hard \${__BAZ__}_\${__OOF__}_\${__BAZ__}-drah-\${__ZAB__} hard0")`);
        });

        test('Inject a big combination of hardcoded values and dynamic values but one dynamic var is missing - fallback to original value', () => {
            VarUtil.addVar("baz");
            VarUtil.addVar("oof");

            const result = VarUtil.injectHeaderVar("foo", "bar", "hard %baz%_%oof%_%baz%-drah-%zab% hard0");

            expect(result).toContain(`.header("foo", "bar")`);
        });

    });


    // describe('matchObjectIds()', () => {

    //     test('Options specify not to do any matching', () => {
    //         const body = { foo: "5f71a00f9e93912e30ada343" };

    //         const result = VarUtil.matchObjectIds(body, { activateObjectIdMatching: false } as Options);

    //         expect(result).toEqual(undefined);
    //     });

    //     test('One objectId is in the body', () => {
    //         const body = { foo: "5f71a00f9e93912e30ada343" };

    //         const result = VarUtil.matchObjectIds(body, { activateObjectIdMatching: true } as Options);

    //         expect(result).toEqual({ "5f71a00f9e93912e30ada343": "foo" });
    //     });

    //     test('Mix of objectIds and non-objectIds in the body', () => {
    //         const body = { foo: "5f71a00f9e93912e30ada343", bar: "rab", baz: { foo: "5f71a9109214f31bf8e949da", bar: "rab", oof: [ "one", "5f72dd25aa57b32730ff62b9" ] } };

    //         const result = VarUtil.matchObjectIds(body, { activateObjectIdMatching: true } as Options);

    //         expect(result).toEqual({ "5f71a00f9e93912e30ada343": "foo", "5f71a9109214f31bf8e949da": "baz.foo", "5f72dd25aa57b32730ff62b9": "baz.oof.1" });
    //     });

    // });

});