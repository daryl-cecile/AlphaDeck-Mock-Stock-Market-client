import {RouterSet} from "../../config/RouterSet";
import {StockResponseError, StockService} from "../../Services/StockService";
import {oResponse} from "../../config/JSONResponse";
import {SharesService} from "../../Services/ShareService";
import {Passport} from "../../Services/Passport";
import {isNullOrUndefined, isVoid} from "../../config/convenienceHelpers";
import {TransactionService} from "../../Services/TransactionService";
import {ReservedShareModel} from "../../models/ReservedShareModel";
import {StockRepository} from "../../Repository/StockRepository";
import {ReservedSharesRepository} from "../../Repository/ReservedSharesRepository";

export const SharesEndpointController = new RouterSet( (router) => {

    router.get("/stock/query", async function(req, res){
        let query = req.query['term'];
        let filters = {
            nativeCurrencyOnly: ( isVoid(req.query['nativeCurrency']) ? false : Boolean(req.query['nativeCurrency'])),
            availableOnly: ( isVoid(req.query['availableOnly']) ? false : Boolean(req.query['availableOnly']))
        };
        let sessionKey = req.header("sessionKey");
        let user = await Passport.getCurrentUserFromSession( sessionKey );

        try{
            let result = await StockService.queryStock(query);

            if (filters.nativeCurrencyOnly === true){
                result = result.filter(stock => {
                    return stock.currency === user.creditCurrency
                });
            }

            if (filters.availableOnly === true){
                result = result.filter(stock => {
                    return stock.volume > 0
                });
            }

            res.json( oResponse(true, "Success", result) )
        }
        catch(x){
            res.json( oResponse(false, "Error", x) );
        }
    });

    router.get("/stock/single", async function(req, res){
        let symbol = req.query['symbol'];
        let sessionKey = req.header("sessionKey");
        let acc = await Passport.getCurrentUserFromSession(sessionKey);

        let uncachedResult = undefined;

        try{
            uncachedResult = await StockService.getStock(symbol, true);
            let result = await StockService.getStock(symbol, false);

            let quantityToReserve = 0;
            let reserves = await ReservedSharesRepository.getAll();

            for (let reserve of reserves){
                if (reserve.stockInfo.symbol === symbol && reserve.owner.id !==  acc?.id){
                    if (reserve.IsValid) quantityToReserve += reserve.quantity;
                }
            }

            result.volume -= quantityToReserve;
            if (result.volume < 0) result.volume = 0;

            res.json( oResponse(true, "Success", result) );
        }
        catch(x){
            if ((<StockResponseError>x).message.indexOf("Invalid API call") > -1){
                res.json( oResponse(true, "Success", {}) );
            }
            else if (x.message.indexOf("Requested resource not in cache") > -1){
                if (isNullOrUndefined(uncachedResult) === false){
                    res.json( oResponse(true, "Success", uncachedResult) );
                }
                else{
                    res.json( oResponse(false, "Error", "Retry in a few minutes") );
                }
            }
            else{
                res.json( oResponse(false, "Error", x) );
            }
        }
    });

    router.get("/shares/query", async function(req, res){
        let query = req.query['term'];
        let sessionKey = req.header("sessionKey");

        try{
            let acc = await Passport.getCurrentUserFromSession(sessionKey);
            let result = await SharesService.queryShares(acc, query);

            result = result.map(share => {
                delete share.owner;
                return share;
            });

            res.json( oResponse(true, "Success", result) )
        }
        catch(x){
            res.json( oResponse(false, "Error", x) );
        }
    });

    router.get("/shares/first", async function(req, res){
        let symbol = req.query['symbol'];
        let sessionKey = req.header("sessionKey");

        try{
            let acc = await Passport.getCurrentUserFromSession(sessionKey);
            let result = await SharesService.singleBySymbol(acc, symbol);

            if (result?.stockInfo?.isOutdated === true){
                try{
                    await StockService.getStock(symbol, false);
                    result = await SharesService.singleBySymbol(acc, symbol);
                }
                catch(x){ /*noop*/ }
            }

            if (result) delete result.owner;

            res.json( oResponse(true, "Success", result) )
        }
        catch(x){
            res.json( oResponse(false, "Error", x) );
        }
    });

    router.get("/shares/single", async function(req, res){
        let ref = req.query['ref'];
        let sessionKey = req.header("sessionKey");

        try{
            let acc = await Passport.getCurrentUserFromSession(sessionKey);
            let result = await SharesService.singleByIdentifier(ref);

            if (result.owner && result.owner.id !== acc?.id){
                res.json( oResponse(false, "No Access", "This share is not accessible by current user") );
                return;
            }

            if (result?.stockInfo?.isOutdated === true){
                try{
                    await StockService.getStock(result.stockInfo.symbol, false);
                    result = await SharesService.singleByIdentifier(ref);
                }
                catch(x){ /*noop*/ }
            }

            if (result) delete result.owner;

            res.json( oResponse(true, "Success", result) )
        }
        catch(x){
            res.json( oResponse(false, "Error", x) );
        }
    });

    router.get("/shares/list", async function(req, res){
        let symbol = req.query['symbol'];
        let sessionKey = req.header("sessionKey");

        try{
            let acc = await Passport.getCurrentUserFromSession(sessionKey);
            let result = await SharesService.listShares(acc, symbol);

            result = result.map(share => {
                delete share.owner;
                return share;
            });

            res.json( oResponse(true, "Success", result) )
        }
        catch(x){
            res.json( oResponse(false, "Error", x) );
        }
    });


    router.post("/transaction/reserve", async function(req, res){

        let sessionKey = req.header("sessionKey");
        let symbol = req.body['symbol'];
        let quantity = req.body['quantity'];
        let acc = await Passport.getCurrentUserFromSession(sessionKey);

        if ( isNullOrUndefined(acc) ){
            res.json( oResponse(false, 'Not Authenticated', 'You are not logged in. Please log in and try again') );
        }
        else {

            let reserve = new ReservedShareModel();
            reserve.owner = acc;
            reserve.quantity = quantity;
            reserve.stockInfo = await StockRepository.findBySymbol(symbol);
            await ReservedSharesRepository.update(reserve);

            res.json( oResponse(true, `Success`,'Reserved ${quantity} shares for ${symbol}') );

        }

    });

    router.post("/transaction/make", async function(req, res){

        let sessionKey = req.header("sessionKey");
        let symbol = req.body['symbol'];
        let quantity = req.body['quantity'];
        let session = await Passport.getSessionIfValid(sessionKey);

        if ( isNullOrUndefined(session) ){
            res.json( oResponse(false, 'Not Authenticated', 'You are not logged in. Please log in and try again') );
        }
        else{

            let acc = session.owner;
            let stock = await StockService.getStock(symbol, false);

            if ( isNullOrUndefined(stock) ){
                res.json( oResponse(false, 'Stock unavailable', 'This stock has either ran out of shares or is no longer available') );
            }
            else{
                try{
                    await TransactionService.processPurchase(acc, stock, quantity);
                    res.json( oResponse(true, 'Success', 'Purchase complete') );
                }
                catch (x) {
                    res.json( oResponse(false, 'Purchase Failed', x.message, x) );
                }
            }

        }

    });

    router.post("/transaction/sell", async function(req, res){

        let sessionKey = req.header("sessionKey");
        let identifier = req.body['hash'];

        let session = await Passport.getSessionIfValid(sessionKey);

        if ( isNullOrUndefined(session) ){
            res.json( oResponse(false, 'Not Authenticated', 'You are not logged in. Please log in and try again') );
        }
        else{

            let acc = session.owner;
            let share = await SharesService.singleByIdentifier(identifier);

            if ( isNullOrUndefined(share) ){
                res.json( oResponse(false, 'Share unavailable', 'The share could not be sold.') );
            }
            else{
                try{
                    await TransactionService.processSale(acc, share);
                    res.json( oResponse(true, 'Success', 'Sale complete') );
                }
                catch (x) {
                    res.json( oResponse(false, 'Sale Failed', x.message, x) );
                }
            }

        }

    });

    return router;

});
