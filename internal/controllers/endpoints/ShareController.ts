import {RouterSet} from "../../config/RouterSet";
import {StockResponseError, StockService} from "../../Services/StockService";
import {oResponse} from "../../config/JSONResponse";
import {SharesService} from "../../Services/ShareService";
import {Passport} from "../../Services/Passport";
import {isNullOrUndefined} from "../../config/convenienceHelpers";

export const SharesEndpointController = new RouterSet( (router) => {

    router.get("/stock/query", async function(req, res){
        let query = req.query['term'];

        try{
            let result = await StockService.queryStock(query);

            res.json( oResponse(true, "Success", result) )
        }
        catch(x){
            res.json( oResponse(false, "Error", x) );
        }
    });

    router.get("/stock/single", async function(req, res){
        let symbol = req.query['symbol'];

        let uncachedResult = undefined;

        try{
            uncachedResult = await StockService.getStock(symbol, true);
            let result = await StockService.getStock(symbol, false);
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
        let sessionKey = req.query['sessionKey'] ?? req.header("sessionKey");

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

    router.get("/shares/single", async function(req, res){
        let symbol = req.query['symbol'];
        let sessionKey = req.query['sessionKey'] ?? req.header("sessionKey");

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

    return router;

});
