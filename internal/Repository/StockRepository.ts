import {BaseRepository} from "./BaseRepository";
import {StockModel} from "../models/StockModel";

class repo extends BaseRepository<StockModel>{

    constructor() {
        super(StockModel);
    }

    async findBySymbol(symbol:string){
        return await this.repo.findOne({
            where : {
                symbol : symbol
            }
        })
    }

}

export const StockRepository = new repo();