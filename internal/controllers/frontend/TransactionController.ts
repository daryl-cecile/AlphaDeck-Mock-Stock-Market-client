import {RouterSet} from "../../config/RouterSet";
import {Passport} from "../../Services/Passport";
import {isVoid} from "../../config/convenienceHelpers";

export const TransactionController = new RouterSet( (router) => {

    router.get("/confirm", async function(req, res){
        res.render("pages/confirm_transaction");
    });

    router.get("/transaction", async function(req, res){

        let authCheck = await Passport.isAuthenticated(req, res);
        if (authCheck.object.isSuccessful){

            if ( ( req.query['intent'] !== "SELL" && req.query['intent'] !== "BUY" ) || isVoid(req.query['symbol']) ){
                res.render("pages/not_found");
            }
            else{
                let acc = authCheck.object.payload['user'];
                res.render("pages/transaction", { user: acc , intent: req.query['intent'], symbol: req.query['symbol'] });
            }

        }
        else{
            res.redirect("/login");
        }

    });

    return router;

});
