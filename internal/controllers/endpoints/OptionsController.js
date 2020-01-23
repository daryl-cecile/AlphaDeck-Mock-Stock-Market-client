"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RouterSet_1 = require("../../config/RouterSet");
const OptionRepository_1 = require("../../Repository/OptionRepository");
const OptionModel_1 = require("../../models/OptionModel");
const JSONResponse_1 = require("../../config/JSONResponse");
const ForexService_1 = require("../../Services/ForexService");
exports.OptionsEndpointController = new RouterSet_1.RouterSet((router) => {
    router.get("/option/query", async function (req, res) {
        let keysString = req.query['keys'];
        let keys = keysString.indexOf(",") > -1 ? keysString.split(",") : [keysString];
        let result = {};
        let values = await OptionRepository_1.OptionRepository.getOptions(keys, true);
        if (values) {
            values.forEach(value => {
                result[value.label] = {
                    key: value.label,
                    value: value.value,
                    type: OptionModel_1.OptionType[value.optionType]
                };
            });
            res.json(JSONResponse_1.oResponse(true, 'Success', result));
        }
        else {
            res.json(JSONResponse_1.oResponse(false, 'Not found', 'No options with this key was found'));
        }
    });
    router.get("/forex/rate", async function (req, res) {
        var _a, _b;
        let to = req.query['to'];
        let from = (_a = req.query['from'], (_a !== null && _a !== void 0 ? _a : 'USD'));
        let value = (_b = req.query['amount'], (_b !== null && _b !== void 0 ? _b : 1));
        res.json(JSONResponse_1.oResponse(true, 'Success', {
            from: from,
            to: to,
            rate: await ForexService_1.ForexService.get1USDRate(to),
            converted: await ForexService_1.ForexService.convert(from, to, value),
            signs: {
                from: '$',
                to: await ForexService_1.ForexService.getSign(to)
            }
        }));
    });
    return router;
});
//# sourceMappingURL=OptionsController.js.map