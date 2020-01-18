import {RouterSet} from "../../config/RouterSet";
import {Passport} from "../../Services/Passport";

export const HomeController = new RouterSet( (router) => {

    router.get("/home", async function(req, res, next){

        let authCheck = await Passport.isAuthenticated(req, res);
        if (authCheck.object.isSuccessful){
            let acc = authCheck.object.payload['user'];
            res.render("pages/homepage", { user: acc });
        }
        else{
            res.redirect("/login");
        }

    });

    return router;
});