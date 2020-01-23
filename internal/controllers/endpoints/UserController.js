"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RouterSet_1 = require("../../config/RouterSet");
const Passport_1 = require("../../Services/Passport");
const convenienceHelpers_1 = require("../../config/convenienceHelpers");
const JSONResponse_1 = require("../../config/JSONResponse");
exports.UserEndpointController = new RouterSet_1.RouterSet((router) => {
    router.get("/account/info", async function (req, res) {
        let sessionKey = req.header("sessionKey");
        let session = await Passport_1.Passport.getSessionIfValid(sessionKey);
        if (convenienceHelpers_1.isNullOrUndefined(session)) {
            res.json(JSONResponse_1.oResponse(false, 'Incorrect Token'));
        }
        else {
            res.json(JSONResponse_1.oResponse(true, 'Success', session.owner.toJSON()));
        }
    });
    return router;
});
//# sourceMappingURL=UserController.js.map