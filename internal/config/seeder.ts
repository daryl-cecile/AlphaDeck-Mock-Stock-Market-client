import {UserModel} from "../models/UserModel";
import {Passport} from "../Services/Passport";
import {UserRepository} from "../Repository/UserRepository";
import {StockResponseError, StockService} from "../Services/StockService";
import {StockModel} from "../models/StockModel";
import {StockRepository} from "../Repository/StockRepository";
import {System} from "./System";
import {TimeHelper} from "./TimeHelper";
import {ForexService} from "../Services/ForexService";


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

    System.log("SKIP","SKIPPED SEEDING...");
    return;

    let possibleResults = [
        ... await StockService.queryStockInfo("google", true),
        ... await StockService.queryStockInfo("apple", true),
        ... await StockService.queryStockInfo("amd", true),
        ... await StockService.queryStockInfo("qcom", true),
        ... await StockService.queryStockInfo("csco", true),
        ... await StockService.queryStockInfo("ge", true)
    ].filter( (value, index, array) => {
        return array.indexOf(value) === index && parseFloat(value.matchScore) >= 0.5 ; // unique and high confidence only
    } );

    await System.log("Cache",`Caching ${possibleResults.length} items..`);

    let maxEntriesToCache = possibleResults.length;
    let entriesCached = 0;

    for (const info of possibleResults) {
        try{

            entriesCached = possibleResults.indexOf(info) + 1;

            let rec = await StockService.getStock(info.symbol, info.name, info.currency);

            await System.log('Cache',`Caching [${entriesCached}/ ${maxEntriesToCache}] ${ (entriesCached/maxEntriesToCache) * 100 }% ${rec.name} -> ${rec.symbol} @ ${rec.price} per 1 of ${rec.volume} [${rec.latest_trading_day}]`);

        }
        catch(v){
            await System.error(v, System.ERRORS.SEED_ERROR);

            if ( v.originalError.constructor.name === "StockResponseError" ){
                if (v.originalError.rateLimitReached) {
                    await System.log("Cache",`Successfully cached ${entriesCached} of ${maxEntriesToCache} before rate limit`, System.ERRORS.STATUS_CHANGE);
                    break;
                }
            }
            else{
                await System.log("Cache",`Successfully cached ${entriesCached} of ${maxEntriesToCache} before error [${StockService.serviceClass.lastEndpointUsed}]`, System.ERRORS.STATUS_CHANGE);
                break;
            }
        }
    }


})();