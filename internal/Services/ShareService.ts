import {BaseService} from "./BaseService";
import {System} from "../config/System";
import {ShareModel} from "../models/ShareModel";
import {SharesRepository} from "../Repository/SharesRepository";
import {UserModel} from "../models/UserModel";
import {isNullOrUndefined} from "../config/convenienceHelpers";

class service extends BaseService{

    public serviceClass = service;

    public async queryShares(owner:UserModel, term:string=""):Promise<ShareModel[]>{
        await System.log("Task",`queryShares - term: ${term}`);

        if (isNullOrUndefined(owner)) return [];

        let allOwnedShares:ShareModel[] = await SharesRepository.findByUser(owner);
        let finalResults:ShareModel[] = [];

        for (let share of allOwnedShares){
            if (
                share.stockInfo.symbol.toLowerCase().indexOf(term.toLowerCase().trim()) > -1 ||
                share.stockInfo.company.toLowerCase().indexOf(term.toLowerCase().trim()) > -1
            ){
                finalResults.push(share);
            }
        }

        return finalResults;

    }

    public async singleBySymbol(owner:UserModel, symbol:string=""):Promise<ShareModel>{
        await System.log("Task",`singleBySymbol - term: ${symbol}`);

        if (isNullOrUndefined(owner)) return undefined;

        let allOwnedShares:ShareModel[] = await SharesRepository.findByUser(owner);

        for (let share of allOwnedShares){
            if ( share.stockInfo.symbol.toLowerCase() === symbol.toLowerCase().trim() ){
                return share;
            }
        }
        return undefined;

    }

}

export const SharesService = new service();