import {RouterSet} from "../../config/RouterSet";
import {Passport} from "../../Services/Passport";

export const TransactionController = new RouterSet( (router) => {

    router.get("/confirm", async function(req, res){
        res.render("pages/confirm_transaction");
    });

    router.get("/transaction", async function(req, res){

        let authCheck = await Passport.isAuthenticated(req, res);
        if (authCheck.object.isSuccessful){
            let acc = authCheck.object.payload['user'];
            res.render("pages/transaction", { user: acc });
        }
        else{
            res.redirect("/login");
        }

    });

    return router;

});
