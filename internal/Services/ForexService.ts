import {BaseService} from "./BaseService";
import {System} from "../config/System";
import {isNullOrUndefined} from "../config/convenienceHelpers";

let superAgent = require("superagent");

class service extends BaseService{

    private currencyList:{[currency:string]:{ fromOneUSD?:number, name?:string }} = {};
    private currencyInfo:{
        [currencyCode:string]:{
            symbol : string,
            name: string,
            symbol_native : string,
            decimal_digits : number,
            rounding : number,
            code : string,
            name_plural : string
        }
    } = {};

    constructor() {
        super();

        System.log("Currency Update","Updating list of currency names", System.ERRORS.NORMAL);

        superAgent.get("https://openexchangerates.org/api/currencies.json").query({
            prettyprint : true,
            show_alternative : true,
            app_id : process.env.OPEN_EXCHANGE_RATE_API
        }).end((err, res) => {
            for (let k in res.body){
                if (res.body.hasOwnProperty(k)){
                    if (isNullOrUndefined(this.currencyList[k])) this.currencyList[k] = {};
                    this.currencyList[k].name = res.body[k];
                }
            }
        });

        superAgent.get("https://openexchangerates.org/api/latest.json").query({
            show_alternative : true,
            app_id : process.env.OPEN_EXCHANGE_RATE_API
        }).end((err, res) => {
            if (!err){
                for (let k in res.body.rates){
                    if (res.body.rates.hasOwnProperty(k)){
                        if (isNullOrUndefined(this.currencyList[k])) this.currencyList[k] = {};
                        this.currencyList[k].fromOneUSD = res.body.rates[k];
                    }
                }
            }
        });

        superAgent.get("https://gist.githubusercontent.com/soubhikchatterjee/7972a069d478acd891c9ab27b87a87e2/raw/44c7f50435402d0b0ba3d14e7fd9ca5eb5a0de70/Country%2520Currency%2520Codes%2520JSON").end( (err, res)=>{
            this.currencyInfo = JSON.parse( res.text )[0];
        });

    }

    async convert(from:string,to:string, fromValue:number=1){
        return new Promise<number>( resolve => {

            if (from === "USD"){
                resolve( this.currencyList[to].fromOneUSD * fromValue );
            }
            else{
                let rate = 1 / this.currencyList[from].fromOneUSD; // get to USD from 'from'
                let base = fromValue * rate;
                let value = this.currencyList[to].fromOneUSD * base;

                resolve( value );
            }

        });

    }

    formatCurrency(value:number, currency:string){
        let cur = this.currencyInfo[currency.toUpperCase()];

        if (isNullOrUndefined(cur)){
            return {
                sentence : value + " " + currency,
                withSymbol : currency + " " + value,
                safeValue : currency + " " + value
            }
        }
        else{
            return {
                sentence : value + " " + (value > 1 ? cur.name_plural : cur.name ),
                withSymbol : cur.symbol + " " + value,
                safeValue : cur.code + " " + value
            }
        }
    }
}

export const ForexService = new service();