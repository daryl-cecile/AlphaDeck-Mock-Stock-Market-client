import {BaseService} from "./BaseService";
import {UserModel} from "../models/UserModel";
import {UserRepository} from "../Repository/UserRepository";

class service extends BaseService{

    async isUserStaffMember(userAccount:UserModel){
        if (userAccount){
            return userAccount.isSuperUser;
        }
        return false;
    }

}

export const UserService = new service();