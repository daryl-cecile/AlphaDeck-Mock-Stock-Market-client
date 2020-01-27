import {BaseRepository} from "./BaseRepository";
import {UserModel} from "../models/UserModel";
import {ReservedShareModel} from "../models/ReservedShareModel";

class repo extends BaseRepository<ReservedShareModel>{

    constructor() {
        super(ReservedShareModel);
    }

    async findByUser(user:UserModel){
        return await this.repo.find({
            where : {
                owner : user
            },
            relations: ['stockInfo','owner']
        })
    }

}

export const ReservedSharesRepository = new repo();