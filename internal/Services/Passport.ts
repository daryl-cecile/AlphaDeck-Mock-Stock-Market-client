import {JSONResp} from "../config/JSONResponse";
import {SessionModel} from "../models/SessionModel";
import {UserModel} from "../models/UserModel";
import {UserRepository} from "../Repository/UserRepository";
import {SessionRepository} from "../Repository/SessionRepository";
import {TimeHelper} from "../config/TimeHelper";
import {System} from "../config/System";
import {isNullOrUndefined} from "../config/convenienceHelpers";

const Crypto = require("crypto");
const uuid = require("uuid/v4");

export namespace Passport{

    export async function getCurrentUser(req, res):Promise<UserModel>{
        let authCheck = await Passport.isAuthenticated(req, res);
        if (authCheck.object.isSuccessful) {
            return authCheck.object.payload['user'];
        }
        return undefined;
    }

    export async function getCurrentUserFromSession(sessionKey:string):Promise<UserModel>{
        let authCheck = await Passport.getSessionIfValid(sessionKey);
        return authCheck?.owner;
    }

    export function createSaltine(){
        let salt = Crypto.createHash("sha256").update(Crypto.randomBytes(128)).digest('hex');
        let iter = Math.random() * (32 - 8) + 8; // min 8 max 32
        return `${salt}::${iter}`;
    }

    export async function hashPassword(password:string,saltine?:string){
        return new Promise<string>(resolve => {

            let salt:string = saltine.split("::")[0];
            let iter:number = parseInt(saltine.split("::")[1]);

            if (iter < 0 || iter > 32) iter = 16;

            Crypto.scrypt(password, salt, 64, (err, key)=>{
                let k = key.toString('hex');
                while (iter > 0){
                    k = Crypto.createHash("sha256").update(k).digest('hex');
                    iter --;
                }
                resolve(k);
            });

        });
    }

    export async function authenticate(username:string, password:string, req, res){

        let result:JSONResp = await this.isStaffCredentialsValid(username,password);

        let acc = await UserRepository.getByUsername(username);

        if (acc === undefined) return result;

        let sesh = acc.currentSession;

        if (sesh){
            sesh.invalid = true;
            await SessionRepository.save(sesh);
        }

        if (result.object.isSuccessful){

            sesh = new SessionModel();
            sesh.expiry = TimeHelper.minutesFromNow(30);
            sesh.sessionKey = uuid();
            sesh.invalid = false;

            acc.currentSession = sesh;
            await UserRepository.save(acc);

            System.cookieStore.set("_passport", sesh.sessionKey,{expires: sesh.expiry});

            return new JSONResp(true, "Success", {
                token: sesh.sessionKey
            });

        }
        else{
            return result;
        }

    }

    export async function isStaffCredentialsValid(username:string, password:string){
        let user = await UserRepository.getByUsername(username);

        if (user === undefined){
            return new JSONResp(false,"Incorrect username","No users with that username was found",{
                username: username
            });
        }

        let hashedPassword = await this.hashPassword(password, user.saltine);
        if ( user.passHash === hashedPassword ){
            return new JSONResp(true);
        }
        return new JSONResp(false, "Incorrect password", "Password incorrect. Please try again");
    }

    export async function isAuthenticated(req, res){

        let passportToken = System.cookieStore.get("_passport");

        if (passportToken){
            let session = await SessionRepository.getBySessionKey(passportToken);

            if (session && session.IsValid){
                return new JSONResp(true,"Authenticated",{ user: session.owner });
            }
            return new JSONResp(false);
        }
        else{
            return new JSONResp(false);
        }

    }

    export async function getSessionIfValid(sessionKey:string){

        let session = await SessionRepository.getBySessionKey(sessionKey);

        if (session && session.IsValid){
            return session;
        }
        return undefined;

    }

    export async function voidSession(req, res){

        let authCheck = await this.isAuthenticated(req, res);

        if (authCheck.object.isSuccessful){
            // user is authenticated, void session
            let user:UserModel = authCheck.object.payload['user'];
            await voidSessionBySessionKey(user.currentSession.sessionKey);
        }

    }

    export async function voidSessionBySessionKey(sessionKey:string){

        let session = await getSessionIfValid(sessionKey);

        if ( isNullOrUndefined(session) === false ){
            session.owner.currentSession.invalid = true;
            await SessionRepository.save(session.owner.currentSession);
        }

    }

}

module.exports.default = Passport; // for tests