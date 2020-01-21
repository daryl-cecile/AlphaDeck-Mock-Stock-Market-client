import {BaseRepository} from "./BaseRepository";
import {StockModel} from "../models/StockModel";
import {Like} from "typeorm";

class repo extends BaseRepository<StockModel>{

    constructor() {
        super(StockModel);
    }

    async findBySymbol(symbol:string){
        return await this.repo.findOne({
            where : {
                symbol : symbol
            },
            relations: ['soldShares']
        })
    }

    async queryByTerms(term:string){
        return await this.repo.find({
            where : [
                { company : Like(`%${term}%`) },
                { symbol : Like(`%${term}%`) }
            ],
            relations: ['soldShares']
        });
    }

}

export const StockRepository = new repo();