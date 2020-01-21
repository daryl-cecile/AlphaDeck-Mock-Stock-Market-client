import {BaseRepository} from "./BaseRepository";
import {UserModel} from "../models/UserModel";

class repo extends BaseRepository<UserModel>{

    constructor() {
        super(UserModel);
    }

    async getUserByUsernameOrEmail(usernameOrEmail:string){

        return await this.repo.findOne({
            where : [
                {username: usernameOrEmail},
                {email: usernameOrEmail}
            ],
            relations : ['ownedShares','transactions']
        });

    }

    async getByUsername(username:string){

        return await this.repo.findOne({
            where : {username: username},
            relations : ['ownedShares','transactions']
        });

    }

    async getByUsernameOrEmail(usernameOrEmail:string){

        return await this.repo.findOne({
            where : [
                {username: usernameOrEmail},
                {email: usernameOrEmail}
            ],
            relations : ['ownedShares','transactions']
        });

    }

}

export const UserRepository = new repo();