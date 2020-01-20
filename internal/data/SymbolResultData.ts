import {BaseData} from "./BaseData";
import {JsonObject} from "../config/convenienceHelpers";

export class SymbolResultData extends BaseData{

    protected parse(json: JsonObject): this {
        for (let k in json){
            if (json.hasOwnProperty(k)){
                this[k.split(". ")[1].replace(/ /g, "_")] = json[k];
            }
        }
        return this;
    }

    public symbol: string;
    public name: string;
    public type: string;
    public region: string;
    public marketOpen: string;
    public marketClose: string;
    public timezone: string;
    public currency: string;
    public matchScore: string;

}

export type SymbolResultCollection = {
    bestMatches : SymbolResultData[]
}