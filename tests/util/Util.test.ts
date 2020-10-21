import express from 'express';
import Util from 'src/util/Util';
import Options from 'src/Options';


const REQ_MOCK = {
    method: "GET",
    path: "/foo/bar"
} as express.Request;


describe('Util', () => {

    describe('buildString()', () => {

        test('Testing %method% insertion', () => {
            const result = Util.buildString(REQ_MOCK, "%method%_%method%", 0);

            expect(result).toEqual("get_get");
        });

        test('Testing %METHOD% insertion', () => {
            const result = Util.buildString(REQ_MOCK, "%METHOD%_%METHOD%", 0);

            expect(result).toEqual("GET_GET");
        });

        test('Testing %pathStart% insertion', () => {
            const result = Util.buildString(REQ_MOCK, "%pathStart%_%pathStart%", 0);

            expect(result).toEqual("foo_foo");
        });

        test('Testing %PATHSTART% insertion', () => {
            const result = Util.buildString(REQ_MOCK, "%PATHSTART%_%PATHSTART%", 0);

            expect(result).toEqual("FOO_FOO");
        });

        test('Testing %iterator% insertion', () => {
            const result = Util.buildString(REQ_MOCK, "%iterator%_%iterator%", 65);

            expect(result).toEqual("65_65");
        });

        test('Testing a combination of %method%, %METHOD%, %pathStart%, %PATHSTART% & %iterator%', () => {
            const patternedString = "%method%_%METHOD% %pathStart%-%PATHSTART%-%iterator% > %METHOD%/%method%:%PATHSTART%:%iterator%:%pathStart%";
            const result = Util.buildString(REQ_MOCK, patternedString, 77);

            expect(result).toEqual("get_GET foo-FOO-77 > GET/get:FOO:77:foo");
        });

    });

    describe('getMethodName()', () => {

        test('Testing standard pattern', () => {
            const result = Util.getMethodName(REQ_MOCK, { methodsNamePattern: "%method%_%pathStart%_%iterator%" } as Options, 110);

            expect(result).toEqual("get_foo_110");
        });

    });

    describe('getMethodDesc()', () => {

        test('Testing standard pattern', () => {
            const result = Util.getMethodDesc(REQ_MOCK, { methodsDescPattern: "%METHOD% %pathStart%" } as Options, 110);

            expect(result).toEqual("GET foo");
        });

    });

    describe('isJson()', () => {

        test('Testing JSON', () => {
            const result = Util.isJson({ "foo": "bar" });

            expect(result).toEqual(true);
        });

        test('Testing array', () => {
            const result = Util.isJson([ "one", "two"]);

            expect(result).toEqual(false);
        });

        test('Testing boolean', () => {
            const result = Util.isJson(true);

            expect(result).toEqual(false);
        });

        test('Testing string', () => {
            const result = Util.isJson("foo");

            expect(result).toEqual(false);
        });

    });

    describe('stringIsJson()', () => {

        test('Testing JSON', () => {
            const result = Util.stringIsJson(`{ "foo": "bar" }`);

            expect(result).toEqual(true);
        });

        test('Testing non-JSON', () => {
            const result = Util.stringIsJson("test.png");

            expect(result).toEqual(false);
        });

    });

    describe('removeNonAlphaNumChars()', () => {

        test('Testing multiple words', () => {
            const result = Util.removeNonAlphaNumChars("test multiple words");

            expect(result).toEqual("testmultiplewords");
        });

        test('Testing mixup combination', () => {
            const result = Util.removeNonAlphaNumChars("test@ &éàmultiple WoRds");

            expect(result).toEqual("testmultipleWoRds");
        });

    });

});