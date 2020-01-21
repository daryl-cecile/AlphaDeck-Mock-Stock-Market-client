import {BaseRepository} from "./BaseRepository";
import {ShareModel} from "../models/ShareModel";
import {UserModel} from "../models/UserModel";

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

    async findByUser(user:UserModel){
        return await this.repo.find({
            where : {
                owner: user
            },
            relations: ['stockInfo','owner']
        })
    }

}

export const SharesRepository = new repo();