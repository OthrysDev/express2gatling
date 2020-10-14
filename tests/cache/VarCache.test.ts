import VarCache from 'src/cache/VarCache';
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

describe('VarCache', () => {

    beforeEach(() => VarCache.reset());

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

            const result = VarCache.saveHeadersVars(OBJ1, options);

            expect(result).toEqual(undefined);
            expect(VarCache.hasVar("foo")).toEqual(false);
        });

        test('Options specify to save one var', () => {
            const options = {
                variables: {
                    save: { headers: [ "foo" ] }
                }
            } as unknown as Options;

            const result = VarCache.saveHeadersVars(OBJ1, options);

            TestUtil.expectEqualCleansed(result, `.check(header("foo").saveAs("__FOO__"))`);
            expect(VarCache.hasVar("foo")).toEqual(true);
        });

        test('Options specify to save a var that is not in headers', () => {
            const options = {
                variables: {
                    save: { headers: [ "not" ] }
                }
            } as unknown as Options;

            const result = VarCache.saveHeadersVars(OBJ1, options);

            expect(result).toEqual(undefined);
            expect(VarCache.hasVar("not")).toEqual(false);
        });

        test('Options specify to save two vars', () => {
            const options = {
                variables: {
                    save: { headers: [ "foo", "baz" ] }
                }
            } as unknown as Options;

            const result = VarCache.saveHeadersVars(OBJ1, options);

            TestUtil.expectEqualCleansed(result, `.check(header("foo").saveAs("__FOO__")).check(header("baz").saveAs("__BAZ__"))`);
            expect(VarCache.hasVar("foo")).toEqual(true);
            expect(VarCache.hasVar("baz")).toEqual(true);
        });

    });

    describe('saveBodyVars()', () => {

        test('Options specify not to save any body var', () => {
            const options = {
                variables: {
                    save: { body: [] }
                }
            } as unknown as Options;

            const result = VarCache.saveBodyVars(OBJ1, options);

            expect(result).toEqual(undefined);
            expect(VarCache.hasVar("foo")).toEqual(false);
        });

        test('Options specify to save one var', () => {
            const options = {
                variables: {
                    save: { body: [ "foo" ] }
                }
            } as unknown as Options;

            const result = VarCache.saveBodyVars(OBJ1, options);

            TestUtil.expectEqualCleansed(result, `.check(jsonPath("$.foo").saveAs("__FOO__"))`);
            expect(VarCache.hasVar("foo")).toEqual(true);
        });

        test('Options specify to save a var that is not in body', () => {
            const options = {
                variables: {
                    save: { body: [ "not" ] }
                }
            } as unknown as Options;

            const result = VarCache.saveBodyVars(OBJ1, options);

            expect(result).toEqual(undefined);
            expect(VarCache.hasVar("not")).toEqual(false);
        });

        test('Options specify to save two vars', () => {
            const options = {
                variables: {
                    save: { body: [ "foo", "baz" ] }
                }
            } as unknown as Options;

            const result = VarCache.saveBodyVars(OBJ1, options);

            TestUtil.expectEqualCleansed(result, `.check(jsonPath("$.foo").saveAs("__FOO__")).check(jsonPath("$.baz").saveAs("__BAZ__"))`);
            expect(VarCache.hasVar("foo")).toEqual(true);
            expect(VarCache.hasVar("baz")).toEqual(true);
        });

    });

    describe('saveVars()', () => {

        test('Options specify not to save any var', () => {
            const options = {
                variables: {
                    save: { body: [], headers: [] }
                }
            } as unknown as Options;

            const result = VarCache.saveVars(OBJ1, OBJ2, options);

            expect(result).toEqual(undefined);
        });

        test('Options specify to save only headers vars', () => {
            const options = {
                variables: {
                    save: { body: [], headers: [ "foo", "baz" ] }
                }
            } as unknown as Options;

            const result = VarCache.saveVars(OBJ1, OBJ2, options);

            TestUtil.expectEqualCleansed(result, `.check(header("foo").saveAs("__FOO__")).check(header("baz").saveAs("__BAZ__"))`);
            expect(VarCache.hasVar("foo")).toEqual(true);
            expect(VarCache.hasVar("baz")).toEqual(true);
        });

        test('Options specify to save only body vars', () => {
            const options = {
                variables: {
                    save: { body: [ "oof", "zab" ], headers: [  ] }
                }
            } as unknown as Options;

            const result = VarCache.saveVars(OBJ1, OBJ2, options);

            TestUtil.expectEqualCleansed(result, `.check(jsonPath("$.oof").saveAs("__OOF__")).check(jsonPath("$.zab").saveAs("__ZAB__"))`);
            expect(VarCache.hasVar("oof")).toEqual(true);
            expect(VarCache.hasVar("zab")).toEqual(true);
        });

        test('Options specify to save headers & body vars', () => {
            const options = {
                variables: {
                    save: { body: [ "oof", "zab" ], headers: [ "foo", "baz" ] }
                }
            } as unknown as Options;

            const result = VarCache.saveVars(OBJ1, OBJ2, options);

            TestUtil.expectEqualCleansed(result, `.check(header("foo").saveAs("__FOO__")).check(header("baz").saveAs("__BAZ__")).check(jsonPath("$.oof").saveAs("__OOF__")).check(jsonPath("$.zab").saveAs("__ZAB__"))`);
            expect(VarCache.hasVar("foo")).toEqual(true);
            expect(VarCache.hasVar("baz")).toEqual(true);
            expect(VarCache.hasVar("oof")).toEqual(true);
            expect(VarCache.hasVar("zab")).toEqual(true);
        });

    });

});