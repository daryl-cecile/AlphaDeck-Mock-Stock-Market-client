import {BaseData} from "./BaseData";
import {JsonObject} from "../config/convenienceHelpers";

export class StockInfoData extends BaseData{

    protected parse(json: JsonObject): this {
        for (let k in json){
            if (json.hasOwnProperty(k)){
                this[k.split(". ")[1].replace(/ /g, "_")] = json[k];
            }
        }
        return this;
    }

    public symbol: string;
    public open: string;
    public high: string;
    public low: string;
    public price: string;
    public volume: string;
    public latest_trading_day: string;
    public previous_close: string;
    public change: string;
    public change_percent: string;

}

export type StockInfoCollection = {
    bestMatches : StockInfoData[]
}