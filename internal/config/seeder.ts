import {UserModel} from "../models/UserModel";
import {Passport} from "../Services/Passport";
import {UserRepository} from "../Repository/UserRepository";
import {StockService} from "../Services/StockService";
import {System} from "./System";
import {TransactionService} from "../Services/TransactionService";
import {CurrencyInfoModel} from "../models/CurrencyInfoModel";
import {CurrencyInfoRepository} from "../Repository/CurrencyInfoRepository";
import {JsonObject} from "./convenienceHelpers";

let superAgent = require("superagent");

(async function(){

    let seedCache = {};

    async function seedShares(){
        let googleStock = await StockService.getStock("GOOGL");
        let appleStock = await StockService.getStock("AAPL");
        let qcomStock = await StockService.getStock("QCOM");
        let msftStock = await StockService.getStock("MSFT");
        let amdStock = await StockService.getStock("AMD");

        let msftStock2 = await StockService.getStock("MSFT");
        let amdStock2 = await StockService.getStock("AMD");

        await TransactionService.processPurchase(baseUser, googleStock, 12);
        await TransactionService.processPurchase(baseUser, appleStock, 50);
        await TransactionService.processPurchase(baseUser, qcomStock, 50);
        await TransactionService.processPurchase(baseUser, msftStock, 50);
        await TransactionService.processPurchase(baseUser, amdStock, 50);

        await TransactionService.processPurchase(rootUser, msftStock2, 50);
        await TransactionService.processPurchase(rootUser, amdStock2, 50);
    }

    async function seedStocks(){
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

                await System.log('Cache',`Caching [${entriesCached}/ ${maxEntriesToCache}] ${ (entriesCached/maxEntriesToCache) * 100 }% ${rec.company} -> ${rec.symbol} @ ${rec.price} per 1 of ${rec.volume} [${rec.lastTradingDate}]`);

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
    }

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

    async function seedCurrency(code:string, prop:JsonObject){
        if (!seedCache['currency']){
            seedCache['currency'] = await CurrencyInfoRepository.getAll();
        }

        let matches = seedCache['currency'].filter(k => {
            return k.code === code;
        });
        let existingCurrencyInfo = matches?.[0];
        if (existingCurrencyInfo === undefined ){
            let c = new CurrencyInfoModel();
            Object.keys(prop).forEach(k => {
                c[k] = prop[k];
            });
            return await CurrencyInfoRepository.save(c);
        }
        return existingCurrencyInfo;
    }

    let baseUser = await seedUser("Test User","testUser1","test123");
    let rootUser = await seedUser("Admin User","root","admin", true);

    // await seedStocks();

    // await seedShares();

    // superAgent.get("https://gist.githubusercontent.com/soubhikchatterjee/7972a069d478acd891c9ab27b87a87e2/raw/44c7f50435402d0b0ba3d14e7fd9ca5eb5a0de70/Country%2520Currency%2520Codes%2520JSON").end(async (err, res) => {
    //     try{
    //         let val:CurrencyInfoModel[] = JSON.parse(res.text)[0];
    //         for (const v of Object.values(val)) {
    //             await seedCurrency(v.code, v);
    //         }
    //     }
    //     catch(e){ /* noop */ }
    // });

    await System.log("Seed","SEEDING COMPLETE", System.ERRORS.NORMAL);

})();