import {UserModel} from "../models/UserModel";
import {Passport} from "../Services/Passport";
import {UserRepository} from "../Repository/UserRepository";
import {StockService} from "../Services/StockService";
import {StockModel} from "../models/StockModel";
import {StockRepository} from "../Repository/StockRepository";
import {System} from "./System";
import {TimeHelper} from "./TimeHelper";


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

    async function seedStockInfo(symbol:string, companyName:string){
        let stock = new StockModel();
        stock.company = companyName;
        stock.symbol = symbol;
        stock.price = 0;
        stock.volume = 0;
        stock.volumeAtSync = 0;
        stock.lastTradingDate = TimeHelper.minutesFromNow(1);

        let existingStock = await StockRepository.findBySymbol(symbol);
        if (existingStock === undefined){
            return await StockRepository.save(stock);
        }
        return existingStock;
    }

    await seedUser("Test User","testUser1","test123");
    await seedUser("Admin User","root","admin", true);

    let possibleResults = [
        ... await StockService.queryStock("google", true),
        ... await StockService.queryStock("apple", true),
        ... await StockService.queryStock("amd", true),
        ... await StockService.queryStock("qcom", true),
        ... await StockService.queryStock("csco", true),
        ... await StockService.queryStock("ge", true)
    ].filter( (value, index, array) => {
        return array.indexOf(value) === index && parseFloat(value.matchScore) >= 0.5 ; // unique and high confidence only
    } );

    await System.log("Syncing",`Syncing ${possibleResults.length} items..`);

    for (const info of possibleResults) {
        try{
            let extraInfo = await StockService.getStockInfo(info.symbol, true);

            console.log("Syncing",info.name,"->",info.symbol,'@',extraInfo.price,'per 1 of',extraInfo.volume,`[${extraInfo.latest_trading_day}]`);

            let rec = await seedStockInfo(info.symbol, info.name);
            rec.currency = info.currency;
            rec.price = parseFloat(extraInfo.price);
            rec.lastTradingDate = new Date(extraInfo.latest_trading_day);
            rec.volume = parseInt(extraInfo.volume);
            rec.volumeAtSync = rec.volume;

            await StockRepository.save(rec);

        }
        catch(v){
            await System.error(v, System.ERRORS.SEED_ERROR);
            break;
        }
    }

})();