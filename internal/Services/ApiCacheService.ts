import {BaseService} from "./BaseService";
import {ApiCacheModel} from "../models/ApiCacheModel";
import {isNullOrUndefined, loadProperties, ObjectProperties} from "../config/convenienceHelpers";
import {ApiCacheRepository} from "../Repository/ApiCacheRepository";
import {System} from "../config/System";

class service extends BaseService{

    async getEntry(endpointPath:string):Promise<ApiCacheModel>{
        return await ApiCacheRepository.getFirst(endpointPath);
    }

    async hasEntry(endpointPath:string){
        return !isNullOrUndefined(await this.getEntry(endpointPath));
    }

    async setEntry(properties:ObjectProperties<ApiCacheModel>){
        let existingOption = await this.getEntry(properties.apiPath);

        if ( !isNullOrUndefined(existingOption) ) {
            loadProperties(existingOption,properties);
            return await ApiCacheRepository.save(existingOption);
        }

        let option = new ApiCacheModel();
        loadProperties(option, properties);
        return await ApiCacheRepository.save(option);
    }

}

export const ApiCacheService = new service();