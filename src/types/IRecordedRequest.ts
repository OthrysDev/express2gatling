

interface IRecordedRequest {
    name: string; 
    desc: string;
    method: string;
    url: string;
    headers: string[]; 
    body: string[]; 
    varsToSave: string[]; 
    pause: number;
    originalReqBody?: any;
    originalResBody?: any;
}

export default IRecordedRequest;