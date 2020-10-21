

interface IRecordedRequest {
    name: string; 
    desc: string;
    method: string;
    path: string;
    headers: string[]; 
    body: string[]; 
    varsToSave: string[]; 
    pause: number;
    originalReqBody?: any;
    originalResBody?: any;
}

export default IRecordedRequest;