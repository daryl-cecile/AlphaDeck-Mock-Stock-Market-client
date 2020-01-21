import {RouterSet} from "../../config/RouterSet";
import {StockService} from "../../Services/StockService";
import {oResponse} from "../../config/JSONResponse";

export const SharesEndpointController = new RouterSet( (router) => {

    router.get("/shares/query", async function(req, res){
        let query = req.query['term'];

        try{
            let result = await StockService.queryStock(query);
            res.json( oResponse(true, "Success", result) )
        }
        catch(x){
            res.json( oResponse(false, "Error", x) );
        }
    });

    return router;

});
