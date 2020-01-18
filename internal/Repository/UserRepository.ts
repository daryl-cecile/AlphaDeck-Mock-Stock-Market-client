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
            ]
        });

    }

    async getByUsername(username:string){

        return await this.repo.findOne({
            where : {username: username}
        });

    }

    async getByUsernameOrEmail(usernameOrEmail:string){

        return await this.repo.findOne({
            where : [
                {username: usernameOrEmail},
                {email: usernameOrEmail}
            ]
        });

    }

}

export const UserRepository = new repo();