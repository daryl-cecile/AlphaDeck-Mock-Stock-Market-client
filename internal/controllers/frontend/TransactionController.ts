import {RouterSet} from "../../config/RouterSet";

export const TransactionController = new RouterSet( (router) => {

    router.get("/confirm", async function(req, res){
        res.render("pages/confirm_transaction");
    });

    return router;

});
