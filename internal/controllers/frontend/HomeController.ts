import {RouterSet} from "../../config/RouterSet";
import {Passport} from "../../Services/Passport";
import {StockService} from "../../Services/StockService";
import {StockRepository} from "../../Repository/StockRepository";
import {ForexService} from "../../Services/ForexService";
import {SharesRepository} from "../../Repository/SharesRepository";
import {isNullOrUndefined} from "../../config/convenienceHelpers";
import {System} from "../../config/System";

export const HomeController = new RouterSet( (router) => {

    router.get("/home", async function(req, res, next){

        let authCheck = await Passport.isAuthenticated(req, res);
        if (authCheck.object.isSuccessful){
            let acc = authCheck.object.payload['user'];
            let shares = isNullOrUndefined(acc) ? [] : await SharesRepository.findByUser(acc);
            res.render("pages/homepage", { user: acc, shares:shares });

            for (let share of shares){
                try{ StockService.getStockInfo(share.stockInfo.symbol, false); }catch(x){
                    /*noop*/
                    await System.log("Cache Update","Failed to update a cache entry", System.ERRORS.PROMISE_ERR, x.toString())
                }
            }
        }
        else{
            res.redirect("/login");
        }

    });

    router.get("/account", async function(req, res, next){

        let authCheck = await Passport.isAuthenticated(req, res);
        if (authCheck.object.isSuccessful){
            let acc = authCheck.object.payload['user'];
            res.render("pages/account", { user: acc });
        }
        else{
            res.redirect("/login");
        }

    });

    router.get("/about", async function(req, res, next){

        let authCheck = await Passport.isAuthenticated(req, res);
        if (authCheck.object.isSuccessful){
            let acc = authCheck.object.payload['user'];
            res.render("pages/about", { user: acc });
        }
        else{
            res.redirect("/login");
        }

    });

    router.get("/market", async function(req, res, next){

        let col = await StockRepository.getAll();
        let authCheck = await Passport.isAuthenticated(req, res);
        if (authCheck.object.isSuccessful){
            let acc = authCheck.object.payload['user'];
            res.render("pages/market", { user: acc , collection: col, ForexService });
        }
        else{
            res.redirect("/login");
        }

    });

    router.get("/help", async function(req, res, next){

        let authCheck = await Passport.isAuthenticated(req, res);
        if (authCheck.object.isSuccessful){
            let acc = authCheck.object.payload['user'];
            res.render("pages/help", { user: acc });
        }
        else{
            res.redirect("/login");
        }

    });

    router.use(function(req, res){
        res.status(404);
        res.render("pages/not_found");
    });

    return router;
});