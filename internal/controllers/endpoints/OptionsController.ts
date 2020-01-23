import {RouterSet} from "../../config/RouterSet";
import {OptionRepository} from "../../Repository/OptionRepository";
import {isNullOrUndefined} from "../../config/convenienceHelpers";
import {OptionType} from "../../models/OptionModel";
import {oResponse} from "../../config/JSONResponse";
import {ForexService} from "../../Services/ForexService";

export const OptionsEndpointController = new RouterSet( (router) => {

    router.get("/option/query", async function(req, res){
        let keysString = req.query['keys'];

        let keys = keysString.indexOf(",") > -1 ? keysString.split(",") : [keysString];

        let result = {};

        let values = await OptionRepository.getOptions( keys , true );

        if (values){
            values.forEach(value => {
                result[value.label] = {
                    key : value.label,
                    value : value.value,
                    type : OptionType[value.optionType]
                };
            });

            res.json( oResponse( true , 'Success' , result ) );
        }
        else{
            res.json( oResponse(false,'Not found','No options with this key was found') )
        }

    });

    router.get("/forex/rate", async function(req, res){
        let to = req.query['to'];
        let from = req.query['from'] ?? 'USD';
        let value = req.query['amount'] ?? 1;

        res.json( oResponse( true , 'Success', {
            from : from,
            to : to,
            rate : await ForexService.get1USDRate(to),
            converted : await ForexService.convert(from, to, value),
            signs:{
                from : '$',
                to : await ForexService.getSign(to)
            }
        }) );

    });

    return router;

});
