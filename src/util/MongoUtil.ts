import flat from 'flat';
import Util from './Util';
import IRecordedRequest from '../types/IRecordedRequest';
import GatlingUtil from './GatlingUtil';


export default class VarUtil {

    public static addMongoObjectIdMatching(requests: IRecordedRequest[]): void {
        const objectIds: Record<string, { key: string, request: IRecordedRequest, id: number }> = {};
        let varIterator = 0;
        
        for(const request of requests){
            if(request.originalResBody){
                const responseBodyFlat: Record<string, any> = flat(request.originalResBody);
    
                for(const key of Object.keys(responseBodyFlat as object)){
                    // The server has sent us an ObjectId
                    if(Util.isMongooseObjectId(responseBodyFlat[key])){
                        // Keep only first ref
                        if(!objectIds[responseBodyFlat[key]]) objectIds[responseBodyFlat[key]] = { key, request, id: varIterator++ };
                    }
                }
            }

            // Fix path
            for(const p of request.url.split("/")){
                // The server has sent us an ObjectId
                if(Util.isMongooseObjectId(p) && objectIds[p]){
                    // Save the var value
                    const saveStr = GatlingUtil.saveBodyVar(objectIds[p].key, `MONGO_OBJID_${objectIds[p].id}`);
                    if(!objectIds[p].request.varsToSave.includes(saveStr)) objectIds[p].request.varsToSave.push(saveStr);

                    // Parametrize the path
                    request.url = request.url.replace(p, `\${__MONGO_OBJID_${objectIds[p].id}__}`);
                }
            }
        }
    }

}