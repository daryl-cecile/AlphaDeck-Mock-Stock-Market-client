import {BaseRepository} from "./BaseRepository";
import {CurrencyInfoModel} from "../models/CurrencyInfoModel";
import {Like} from "typeorm";


class repo extends BaseRepository<CurrencyInfoModel>{

    constructor() {
        super(CurrencyInfoModel);
    }

    async getByCode(threeLetterCode:string){
        return await this.repo.findOne({
            where: {
                code : threeLetterCode
            }
        });
    }

    async getByName(name:string){
        return await this.repo.findOne({
            where: {
                name : Like(`%${name}%`)
            }
        });
    }

}

export const CurrencyInfoRepository = new repo();
