import {isNullOrUndefined, JsonObject} from "../config/convenienceHelpers";

export abstract class BaseData{

    constructor(json?:JsonObject) {
        if ( !isNullOrUndefined(json) ) this.parse(json);
    }

    protected parse(json:JsonObject){
        for (let k in json){
            if (json.hasOwnProperty(k)){
                this[k] = json[k];
            }
        }
        return this;
    }

}