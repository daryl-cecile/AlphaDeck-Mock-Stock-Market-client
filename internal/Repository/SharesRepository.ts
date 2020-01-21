import {BaseRepository} from "./BaseRepository";
import {ShareModel} from "../models/ShareModel";

class repo extends BaseRepository<ShareModel>{

    constructor() {
        super(ShareModel);
    }

    async findById(id:number){
        return await this.repo.findOne({
            where : {
                id : id
            },
            relations: ['stockInfo','owner']
        })
    }

}

export const SharesRepository = new repo();