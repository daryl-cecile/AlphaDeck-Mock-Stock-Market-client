import {Passport} from "../../Services/Passport";
import {RouterSet} from "../../config/RouterSet";

export const LoginEndpointController = new RouterSet((router)=>{

    router.post("/do-login", async function (req, res) {

        let username = req.body['username'];    // set using form data
        let password = req.body['password'];    // set using form data

        let result = await Passport.authenticate(username, password, req, res);

        res. json( result.object );
        res.end();

    });

    return router;
});


