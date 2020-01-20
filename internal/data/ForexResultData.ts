import {BaseData} from "./BaseData";
import {JsonObject} from "../config/convenienceHelpers";

export class ForexResultData extends BaseData{

    protected parse(json: JsonObject): this {
        for (let k in json){
            if (json.hasOwnProperty(k)){
                this[k.split(". ")[1].replace(/ /g, "_")] = json[k];
            }
        }
        return this;
    }

    public From_Currency_Code: string;
    public From_Currency_Name: string;
    public To_Currency_Code: string;
    public To_Currency_Name: string;
    public Exchange_Rate: string;
    public Last_Refreshed: string;
    public Time_Zone: string;
    public Bid_Price: string;
    public Ask_Price: string;

}

export type ForexResultCollection = {
    "Realtime Currency Exchange Rate" : ForexResultData[]
}