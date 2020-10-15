import VarUtil from 'src/util/VarUtil';
import Options from 'src/Options';
import TestUtil from 'tests/TestUtil';


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

            expect(result).toEqual(undefined);
            expect(VarUtil.hasVar("foo")).toEqual(false);
        });

        test('Options specify to save one var', () => {
            const options = {
                variables: {
                    save: { headers: [ "foo" ] }
                }
            } as unknown as Options;

            const result = VarUtil.saveHeadersVars(OBJ1, options);

            TestUtil.expectEqualCleansed(result, `.check(header("foo").saveAs("__FOO__"))`);
            expect(VarUtil.hasVar("foo")).toEqual(true);
        });

        test('Options specify to save a var that is not in headers', () => {
            const options = {
                variables: {
                    save: { headers: [ "not" ] }
                }
            } as unknown as Options;

            const result = VarUtil.saveHeadersVars(OBJ1, options);

            expect(result).toEqual(undefined);
            expect(VarUtil.hasVar("not")).toEqual(false);
        });

        test('Options specify to save two vars', () => {
            const options = {
                variables: {
                    save: { headers: [ "foo", "baz" ] }
                }
            } as unknown as Options;

            const result = VarUtil.saveHeadersVars(OBJ1, options);

            TestUtil.expectEqualCleansed(result, `.check(header("foo").saveAs("__FOO__")).check(header("baz").saveAs("__BAZ__"))`);
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

            expect(result).toEqual(undefined);
            expect(VarUtil.hasVar("foo")).toEqual(false);
        });

        test('Options specify to save one var', () => {
            const options = {
                variables: {
                    save: { body: [ "foo" ] }
                }
            } as unknown as Options;

            const result = VarUtil.saveBodyVars(OBJ1, options);

            TestUtil.expectEqualCleansed(result, `.check(jsonPath("$.foo").saveAs("__FOO__"))`);
            expect(VarUtil.hasVar("foo")).toEqual(true);
        });

        test('Options specify to save a var that is not in body', () => {
            const options = {
                variables: {
                    save: { body: [ "not" ] }
                }
            } as unknown as Options;

            const result = VarUtil.saveBodyVars(OBJ1, options);

            expect(result).toEqual(undefined);
            expect(VarUtil.hasVar("not")).toEqual(false);
        });

        test('Options specify to save two vars', () => {
            const options = {
                variables: {
                    save: { body: [ "foo", "baz" ] }
                }
            } as unknown as Options;

            const result = VarUtil.saveBodyVars(OBJ1, options);

            TestUtil.expectEqualCleansed(result, `.check(jsonPath("$.foo").saveAs("__FOO__")).check(jsonPath("$.baz").saveAs("__BAZ__"))`);
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

            expect(result).toEqual(undefined);
        });

        test('Options specify to save only headers vars', () => {
            const options = {
                variables: {
                    save: { body: [], headers: [ "foo", "baz" ] }
                }
            } as unknown as Options;

            const result = VarUtil.saveVars(OBJ1, OBJ2, options);

            TestUtil.expectEqualCleansed(result, `.check(header("foo").saveAs("__FOO__")).check(header("baz").saveAs("__BAZ__"))`);
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

            TestUtil.expectEqualCleansed(result, `.check(jsonPath("$.oof").saveAs("__OOF__")).check(jsonPath("$.zab").saveAs("__ZAB__"))`);
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

            TestUtil.expectEqualCleansed(result, `.check(header("foo").saveAs("__FOO__")).check(header("baz").saveAs("__BAZ__")).check(jsonPath("$.oof").saveAs("__OOF__")).check(jsonPath("$.zab").saveAs("__ZAB__"))`);
            expect(VarUtil.hasVar("foo")).toEqual(true);
            expect(VarUtil.hasVar("baz")).toEqual(true);
            expect(VarUtil.hasVar("oof")).toEqual(true);
            expect(VarUtil.hasVar("zab")).toEqual(true);
        });

    });

    describe('injectHeaderVar()', () => {

        test('Inject hardcoded value', () => {
            const result = VarUtil.injectHeaderVar("foo", "bar", "baz");

            TestUtil.expectEqualCleansed(result, `.header("foo", "baz")`);
        });

        test('Inject dynamic value not available in cache', () => {
            const result = VarUtil.injectHeaderVar("foo", "bar", "%baz%");

            TestUtil.expectEqualCleansed(result, `.header("foo", "bar")`);
        });

        test('Inject dynamic value available in cache', () => {
            VarUtil.addVar("baz");

            const result = VarUtil.injectHeaderVar("foo", "bar", "%baz%");

            TestUtil.expectEqualCleansed(result, `.header("foo", "\${__BAZ__}")`);
        });

        test('Inject a mix of hardcoded values and dynamic values', () => {
            VarUtil.addVar("baz");

            const result = VarUtil.injectHeaderVar("foo", "bar", "hard %baz%");

            TestUtil.expectEqualCleansed(result, `.header("foo", "hard \${__BAZ__}")`);
        });

        test('Inject a big combination of hardcoded values and dynamic values', () => {
            VarUtil.addVar("baz");
            VarUtil.addVar("oof");
            VarUtil.addVar("zab");

            const result = VarUtil.injectHeaderVar("foo", "bar", "hard %baz%_%oof%_%baz%-drah-%zab% hard0");

            TestUtil.expectEqualCleansed(result, `.header("foo", "hard \${__BAZ__}_\${__OOF__}_\${__BAZ__}-drah-\${__ZAB__} hard0")`);
        });

        test('Inject a big combination of hardcoded values and dynamic values but one dynamic var is missing - fallback to original value', () => {
            VarUtil.addVar("baz");
            VarUtil.addVar("oof");

            const result = VarUtil.injectHeaderVar("foo", "bar", "hard %baz%_%oof%_%baz%-drah-%zab% hard0");

            TestUtil.expectEqualCleansed(result, `.header("foo", "bar")`);
        });

    });


});