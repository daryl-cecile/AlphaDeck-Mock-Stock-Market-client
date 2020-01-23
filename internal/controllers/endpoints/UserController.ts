import {RouterSet} from "../../config/RouterSet";
import {Passport} from "../../Services/Passport";
import {isNullOrUndefined} from "../../config/convenienceHelpers";
import {oResponse} from "../../config/JSONResponse";

export const UserEndpointController = new RouterSet((router)=>{

    router.get("/account/info", async function (req, res) {
        let sessionKey = req.header("sessionKey");

        let session = await Passport.getSessionIfValid(sessionKey);

        if ( isNullOrUndefined(session) ){
            res.json( oResponse(false, 'Incorrect Token') );
        }
        else{
            res.json( oResponse(true, 'Success', session.owner.toJSON() ) )
        }
    });

    return router;
});


