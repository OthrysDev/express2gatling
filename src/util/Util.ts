import mongoose from 'mongoose';
import express from 'express';
import Options from '../Options';


export default class Util {

    public static getMethodName(req: express.Request, options: Options, iterator: number): string {
        return Util.buildString(req, options.methodsNamePattern, iterator);
    }

    public static getMethodDesc(req: express.Request, options: Options, iterator: number): string {
        return Util.buildString(req, options.methodsDescPattern, iterator);
    }

    public static buildString(req: express.Request, patternedString: string, iterator: number): string {
        return patternedString
            .replace(/%method%/g, req.method.toLowerCase())
            .replace(/%METHOD%/g, req.method)
            .replace(/%pathStart%/g, req.path.split("/")[1])
            .replace(/%PATHSTART%/g, req.path.split("/")[1].toUpperCase())
            .replace(/%iterator%/g, new Number(iterator).toString());
    }

    public static isJson (obj: any): boolean{
        return (typeof obj === "object" && !Array.isArray(obj));  
    }

    public static stringIsJson (obj: any): boolean{
        if(typeof obj !== "string") return false;

        try{
            JSON.parse(obj);
            return true;
        }catch(e){
            return false;
        }
    }

    public static removeNonAlphaNumChars(str: string): string {
        return str.replace(/\W/g, '');
    }

    public static isMongooseObjectId(obj: any): boolean {
        return Boolean(obj && mongoose.Types.ObjectId.isValid(obj));
    }
}