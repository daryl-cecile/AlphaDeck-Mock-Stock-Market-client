import {BaseRepository} from "./BaseRepository";
import {ApiCacheModel} from "../models/ApiCacheModel";
import {isNullOrUndefined, loadProperties, ObjectProperties} from "../config/convenienceHelpers";


class repo extends BaseRepository<ApiCacheModel>{

    constructor() {
        super(ApiCacheModel);
    }

    async getFirst(endpointPath:string){
        return await this.repo.findOne({
            where: {
                apiPath : endpointPath
            }
        });
    }

}

export const ApiCacheRepository = new repo();
