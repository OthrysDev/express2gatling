/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';
import Recorder from 'src/Recorder';
import Options from 'src/Options';
import ScriptUtil from 'src/util/ScriptUtil';
import fs from 'fs';
import IRecordedRequest from 'src/types/IRecordedRequest';
import MongoUtil from 'src/util/MongoUtil';


const REQ_MOCK = {
    protocol: "http",
    method: "GET",
    url: "/foo/bar",
    headers: {
        host: "domain.com:8080"
    }
} as express.Request;

const RES_MOCK = {
    on: (event: string, cbk: Function): void => cbk(),
    getHeaders: () => ({})
} as unknown as express.Response;

const RES_MOCK_WITH_BODY = {
    write: function (chunk?: any) {},
    end: function (chunk?: any) {},
    on: function (event: string, cbk: Function): void { 
        if(event === 'finish' && this._body){
            this.write(Buffer.from(this._body.slice(0, Math.floor(this._body.length/2))));
            this.end(Buffer.from(this._body.slice(Math.floor(this._body.length/2), this._body.length)));
        }
        cbk();
    },
    getHeaders: function (){},
    _body: `{"foo":"bar"}`
};

const NEXT_MOCK = () => ({}) as express.NextFunction;

const RECORDER_REQUEST: IRecordedRequest = { 
    name: "get_foo_1", 
    desc: "GET foo",
    method: "GET",
    url: "/foo",
    headers: [],
    body: [],
    varsToSave: [],
    pause: 777 
};


describe('Recorder', () => {

    afterEach(() =>  jest.restoreAllMocks());

    // ================================================================================================
    // ================================================================================================
    // ================================================================================================

    describe('rec()', () => {

        test('Request without body', () => {
            jest.spyOn(ScriptUtil, 'buildRequest').mockImplementation(() => RECORDER_REQUEST);

            const recorder = new Recorder();
            recorder.rec(REQ_MOCK, RES_MOCK, () => ({}) as express.NextFunction);

            expect(recorder.recording.host).toEqual("http://domain.com:8080");
            expect(recorder.recording.requests).toContain(RECORDER_REQUEST);
        });

        test('Request with body', () => {
            const buildRequestMock = jest.fn((req: express.Request, res: express.Response, resBody: any, options: Options, iterator: number) => RECORDER_REQUEST);
            jest.spyOn(ScriptUtil, 'buildRequest').mockImplementation(buildRequestMock);

            const recorder = new Recorder();
            recorder.rec(REQ_MOCK, RES_MOCK_WITH_BODY as unknown as express.Response, NEXT_MOCK);

            expect(buildRequestMock).toBeCalledTimes(1);
            expect(buildRequestMock.mock.calls[0][2]).toEqual({ foo: "bar" });
            
            expect(recorder.recording.host).toEqual("http://domain.com:8080");
            expect(recorder.recording.requests).toContain(RECORDER_REQUEST);
        });

        test('Request with malformed body - use {} instead', () => {
            const buildRequestMock = jest.fn((req: express.Request, res: express.Response, resBody: any, options: Options, iterator: number) => (RECORDER_REQUEST));
            jest.spyOn(ScriptUtil, 'buildRequest').mockImplementation(buildRequestMock);

            const recorder = new Recorder();
            recorder.rec(REQ_MOCK, { ...RES_MOCK_WITH_BODY, _body: `{"foo":` } as unknown as express.Response, NEXT_MOCK);

            expect(buildRequestMock).toBeCalledTimes(1);
            expect(buildRequestMock.mock.calls[0][2]).toEqual({});
        });

        test('Options specify to exclude request with method GET', () => {
            const options = {
                excludeRequests: {
                    methods: [ "GET" ]
                },
            } as unknown as Options;

            const buildRequestMock = jest.fn((req: express.Request, res: express.Response, resBody: any, options: Options, iterator: number) => RECORDER_REQUEST);
            jest.spyOn(ScriptUtil, 'buildRequest').mockImplementation(buildRequestMock);

            const recorder = new Recorder(options);
            recorder.rec(REQ_MOCK, RES_MOCK_WITH_BODY as unknown as express.Response, NEXT_MOCK);

            expect(buildRequestMock).toBeCalledTimes(0);

            expect(recorder.recording.host).toEqual(undefined);
            expect(recorder.recording.requests).toHaveLength(0);
        });

    });

    describe('write()', () => {

        test('Request without body', () => {
            const mkdirSyncMock = jest.fn((path: fs.PathLike, options?: string | number | fs.MakeDirectoryOptions | null | undefined) => undefined);
            jest.spyOn(fs, 'mkdirSync').mockImplementation(mkdirSyncMock);

            const createWriteStreamMock = jest.fn((path: fs.PathLike, options?: string | {
                flags?: string;
                encoding?: BufferEncoding;
                fd?: number;
                mode?: number;
                autoClose?: boolean;
                emitClose?: boolean;
                start?: number;
                highWaterMark?: number;
            }) => ({ write: () => ({}) } as unknown as fs.WriteStream));
            jest.spyOn(fs, 'createWriteStream').mockImplementation(createWriteStreamMock);

            const recorder = new Recorder();
            recorder.write();

            expect(mkdirSyncMock).toBeCalledTimes(1);
            expect(mkdirSyncMock.mock.calls[0][0]).toEqual("./gatling/simulations/simulation1");

            expect(createWriteStreamMock).toBeCalledTimes(2);
            expect(createWriteStreamMock.mock.calls[0][0]).toEqual("./gatling/simulations/simulation1/Simulation1.scala");
            expect(createWriteStreamMock.mock.calls[1][0]).toEqual("./gatling/simulations/simulation1/Requests.scala");
        });

        test('Options specify to add mongo objectId matching', () => {
            const mkdirSyncMock = jest.fn((path: fs.PathLike, options?: string | number | fs.MakeDirectoryOptions | null | undefined) => undefined);
            jest.spyOn(fs, 'mkdirSync').mockImplementation(mkdirSyncMock);

            const addMongoObjectIdMatchingMock = jest.fn((requests: IRecordedRequest[]) => undefined);
            jest.spyOn(MongoUtil, 'addMongoObjectIdMatching').mockImplementation(addMongoObjectIdMatchingMock);

            const createWriteStreamMock = jest.fn((path: fs.PathLike, options?: string | {
                flags?: string;
                encoding?: BufferEncoding;
                fd?: number;
                mode?: number;
                autoClose?: boolean;
                emitClose?: boolean;
                start?: number;
                highWaterMark?: number;
            }) => ({ write: () => ({}) } as unknown as fs.WriteStream));
            jest.spyOn(fs, 'createWriteStream').mockImplementation(createWriteStreamMock);

            const recorder = new Recorder({ activateObjectIdMatching: true });
            recorder.write();

            expect(mkdirSyncMock).toBeCalledTimes(1);
            expect(addMongoObjectIdMatchingMock).toBeCalledTimes(1);
        });

    });

});