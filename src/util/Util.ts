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

    public static extension(fileName: string): string {
        if(!fileName || !fileName.includes(".")) return "";

        const splittedFileName = fileName.split(".");
        const fileExtension = splittedFileName[splittedFileName.length - 1];

        return fileExtension.toUpperCase();
    }

    //https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    public static shuffle(array: any[]): any[]{
        let currentIndex = array.length, temporaryValue, randomIndex;
        
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
        
            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        
        return array;
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
}