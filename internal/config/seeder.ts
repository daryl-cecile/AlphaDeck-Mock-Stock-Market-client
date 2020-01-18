import {UserModel} from "../models/UserModel";
import {Passport} from "../Services/Passport";
import {UserRepository} from "../Repository/UserRepository";

(async function(){

    async function seedUser(firstLastName:string,username:string,password:string,isSuperUser=false){
        let user = new UserModel();
        user.email = firstLastName.replace(" ",".") + "@example.com";
        user.username = username.replace(" ","_");
        user.saltine = Passport.createSaltine();
        user.passHash = await Passport.hashPassword( password , user.saltine );
        user.firstName = firstLastName.split(" ")[0];
        user.lastName = firstLastName.split(" ")[1];
        user.isSuperUser = isSuperUser;

        let existingUser = await UserRepository.getByUsername(username);
        if (existingUser === undefined ){
            return await UserRepository.save(user);
        }
        return existingUser;
    }

    await seedUser("Test User","testUser1","test123");
    await seedUser("Admin User","root","admin", true);

})();