import {Passport} from "../../Services/Passport";
import {RouterSet} from "../../config/RouterSet";

export const LoginController = new RouterSet( (router) => {

    router.get("/", async function (req, res) {

        let authCheck = await Passport.isAuthenticated(req, res);
        if (authCheck.object.isSuccessful){
            res.redirect("/home");
        }
        else{
            res.redirect("/login");
        }

    });

    router.get("/login", async function(req, res){
        res.render("pages/login");
    });

    router.get("/logout", async function(req, res){
        await Passport.voidSession(req, res);
        res.redirect("/");
    });

    router.get("/signup", async function(req, res){
        res.render("pages/signup");
    });

    return router;

});



