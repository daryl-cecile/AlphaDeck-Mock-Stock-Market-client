import {BaseService} from "./BaseService";
import {UserRepository} from "../Repository/UserRepository";
import {UserModel} from "../models/UserModel";

type UserFinderShape = { username?:string, email?:string };

class service extends BaseService{

    public async doesUserExist(finderShape:UserFinderShape){
        let matchUsername = false;
        let matchEmail = false;

        if (finderShape.username) matchUsername = (await UserRepository.getByUsernameOrEmail(finderShape.username)) !== undefined;
        if (finderShape.email) matchEmail = (await UserRepository.getByUsernameOrEmail(finderShape.email)) !== undefined;

        return (matchUsername || matchEmail);
    }

    public async registerUser(user:UserModel){
        return await UserRepository.update(user);
    }

}

export const UserService = new service();