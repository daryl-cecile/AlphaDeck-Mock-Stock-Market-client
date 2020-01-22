import {Passport} from "../../Services/Passport";
import {RouterSet} from "../../config/RouterSet";
import {UserService} from "../../Services/UserService";
import {oResponse} from "../../config/JSONResponse";
import {UserModel} from "../../models/UserModel";

export const LoginEndpointController = new RouterSet((router)=>{

    router.post("/do-login", async function (req, res) {

        let username = req.body['username'];    // set using form data
        let password = req.body['password'];    // set using form data

        let result = await Passport.authenticate(username, password, req, res);

        res. json( result.object );
        res.end();

    });

    router.post("/do-signup", async function (req, res) {

        let username = (req.body['username'] || "").trim().replace(" ","_");
        let password = (req.body['password'] || "").trim();
        let email = req.body['email'];
        let firstName = req.body['firstName'];
        let lastName = req.body['lastName'];

        if (username.length <= 3){
            res.json(
                oResponse(
                    false,
                    "Username error",
                    "A username is required and must be more than 3 characters in length",
                    {
                        type : "INVALID"
                    }
                )
            );
            res.end();
            return;
        }

        if (password.length <= 5){
            res.json(
                oResponse(
                    false,
                    "Password error",
                    "A password is required and must be more than 5 characters in length",
                    {
                        type : "INVALID"
                    }
                )
            );
            res.end();
            return;
        }

        if (await UserService.doesUserExist({username, email})){

            res.json(
                oResponse(
                    false,
                    "Account already exists",
                    "A user is already registered with this email or username. Please sign in instead",
                    {
                        kind : "UAEXISTS"
                    }
                )
            );
            res.end();
            return;

        }

        let newAccount = new UserModel();
        newAccount.username = username;
        newAccount.email = email;
        newAccount.firstName = firstName;
        newAccount.lastName = lastName;
        newAccount.saltine = Passport.createSaltine();
        newAccount.passHash = await Passport.hashPassword(password, newAccount.saltine);

        await UserService.registerUser(newAccount);

        res. json(
            oResponse(
                true,
                "Successfully signed up",
                "Please sign in to continue"
            )
        );
        res.end();

    });

    router.post("/do-logout", async function(req, res){
        await Passport.voidSessionBySessionKey( req.query['sessionKey'] || req.header('sessionKey') );
        res.json(oResponse(true));
    });

    return router;
});


