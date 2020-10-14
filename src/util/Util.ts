import express from 'express';
import Options from '../Options';


export default class Util {

    public static getMethodName = (req: express.Request, options: Options, iterator: number): string => {
        return Util.buildString(req, options.methodsNamePattern, iterator);
    }

    public static getMethodDesc = (req: express.Request, options: Options, iterator: number): string => {
        return Util.buildString(req, options.methodsDescPattern, iterator);
    }

    public static buildString = (req: express.Request, patternedString: string, iterator: number): string => {
        return patternedString
            .replace(/%method%/g, req.method.toLowerCase())
            .replace(/%METHOD%/g, req.method)
            .replace(/%pathStart%/g, req.path.split("/")[1])
            .replace(/%PATHSTART%/g, req.path.split("/")[1].toUpperCase())
            .replace(/%iterator%/g, new Number(iterator).toString());
    }

}