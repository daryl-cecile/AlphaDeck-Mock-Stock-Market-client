import {BaseRepository} from "./BaseRepository";
import {ShareModel} from "../models/ShareModel";
import {UserModel} from "../models/UserModel";

class repo extends BaseRepository<ShareModel>{

    constructor() {
        super(ShareModel);
    }

    async findByIdentifier(hash:string){
        return await this.repo.findOne({
            where : {
                identifier : hash
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