import IRecordedRequest from "src/types/IRecordedRequest";
import GatlingUtil from "src/util/GatlingUtil";
import MongoUtil from "src/util/MongoUtil";


describe('MongoUtil', () => {

    describe('addMongoObjectIdMatching() - PATH', () => {

        test('Nothing has an ObjectId', () => {
            const REQUESTS = [
                { originalResBody: { foo: "5f72dd25aa57b32730ff62b9" }, url: "/foo/bar", varsToSave: [] },
                { url: "/foo/bar", varsToSave: [] },
                { url: "/foo/baz", varsToSave: [] }
            ] as unknown as IRecordedRequest[];

            MongoUtil.addMongoObjectIdMatching(REQUESTS);

            expect(REQUESTS[0].varsToSave).toEqual([]);
        });

        test('Path contains a previously responsed ObjectId', () => {
            const REQUESTS = [
                { originalResBody: { foo: "5f72dd25aa57b32730ff62b9" }, url: "/foo/bar", varsToSave: [] },
                { url: "/foo/bar/5f72dd25aa57b32730ff62b9", varsToSave: [] },
                { url: "/foo/baz", varsToSave: [] }
            ] as unknown as IRecordedRequest[];

            MongoUtil.addMongoObjectIdMatching(REQUESTS);

            expect(REQUESTS[0].varsToSave).toEqual([ GatlingUtil.saveBodyVar("foo", "MONGO_OBJID_0") ]);
            expect(REQUESTS[1].url).toEqual("/foo/bar/${__MONGO_OBJID_0__}");
        });

        test('Path at n+1 contains a previously responsed ObjectId', () => {
            const REQUESTS = [
                { originalResBody: { foo: "5f72dd25aa57b32730ff62b9" }, url: "/foo/bar", varsToSave: [] },
                { url: "/foo/baz", varsToSave: [] },
                { url: "/foo/bar/5f72dd25aa57b32730ff62b9", varsToSave: [] },
            ] as unknown as IRecordedRequest[];

            MongoUtil.addMongoObjectIdMatching(REQUESTS);

            expect(REQUESTS[0].varsToSave).toEqual([ GatlingUtil.saveBodyVar("foo", "MONGO_OBJID_0") ]);
            expect(REQUESTS[2].url).toEqual("/foo/bar/${__MONGO_OBJID_0__}");
        });

        test('2 requests paths need a previous ObjectId', () => {
            const REQUESTS = [
                { originalResBody: { foo: "5f72dd25aa57b32730ff62b9" }, url: "/foo/bar", varsToSave: [] },
                { url: "/foo/baz/5f72dd25aa57b32730ff62b9", varsToSave: [] },
                { url: "/foo/bar/5f72dd25aa57b32730ff62b9", varsToSave: [] },
            ] as unknown as IRecordedRequest[];

            MongoUtil.addMongoObjectIdMatching(REQUESTS);

            expect(REQUESTS[0].varsToSave).toEqual([ GatlingUtil.saveBodyVar("foo", "MONGO_OBJID_0") ]);
            expect(REQUESTS[1].url).toEqual("/foo/baz/${__MONGO_OBJID_0__}");
            expect(REQUESTS[2].url).toEqual("/foo/bar/${__MONGO_OBJID_0__}");
        });

        test('Requests paths need previous ObjectIds', () => {
            const REQUESTS = [
                { originalResBody: { foo: "5f72dd25aa57b32730ff62b9", baz: { bar: "5f7447c8717f9116c0b61c1d" } }, url: "/foo/bar", varsToSave: [] },
                { url: "/foo/baz/5f72dd25aa57b32730ff62b9", varsToSave: [] },
                { url: "/foo/bar/5f7447c8717f9116c0b61c1d", varsToSave: [] },
            ] as unknown as IRecordedRequest[];

            MongoUtil.addMongoObjectIdMatching(REQUESTS);

            expect(REQUESTS[0].varsToSave).toContain(GatlingUtil.saveBodyVar("foo", "MONGO_OBJID_0"));
            expect(REQUESTS[0].varsToSave).toContain(GatlingUtil.saveBodyVar("baz.bar", "MONGO_OBJID_1"));
            expect(REQUESTS[1].url).toEqual("/foo/baz/${__MONGO_OBJID_0__}");
            expect(REQUESTS[2].url).toEqual("/foo/bar/${__MONGO_OBJID_1__}");
        });

        test(`Path contains an ObjectId but it's not in any previous request`, () => {
            const REQUESTS = [
                { originalResBody: { foo: "bar" }, url: "/foo/bar", varsToSave: [] },
                { url: "/foo/bar/5f72dd25aa57b32730ff62b9", varsToSave: [] }
            ] as unknown as IRecordedRequest[];

            MongoUtil.addMongoObjectIdMatching(REQUESTS);

            expect(REQUESTS[0].varsToSave).toEqual([]);
            expect(REQUESTS[1].url).toEqual("/foo/bar/5f72dd25aa57b32730ff62b9");
        });

        test(`Path contains an ObjectId but it's in a next request`, () => {
            const REQUESTS = [
                { url: "/foo/bar/5f72dd25aa57b32730ff62b9", varsToSave: [] },
                { originalResBody: { foo: "5f72dd25aa57b32730ff62b9" }, url: "/foo/bar", varsToSave: [] },
            ] as unknown as IRecordedRequest[];

            MongoUtil.addMongoObjectIdMatching(REQUESTS);

            expect(REQUESTS[0].url).toEqual("/foo/bar/5f72dd25aa57b32730ff62b9");
            expect(REQUESTS[1].varsToSave).toEqual([]);
        });

    });

});