import {BaseService} from "./BaseService";
import {System} from "../config/System";
import {isNullOrUndefined} from "../config/convenienceHelpers";
import {CurrencyInfoModel} from "../models/CurrencyInfoModel";
import {CurrencyInfoRepository} from "../Repository/CurrencyInfoRepository";

let superAgent = require("superagent");

class service extends BaseService{

    private _currencyList:{[currency:string]:{ fromOneUSD?:number, name?:string }} = {};


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

                    if (isNullOrUndefined(this._currencyList[k])) this._currencyList[k] = {};
                    this._currencyList[k].name = res.body[k];

                    if (k === "MXN"){
                        if (isNullOrUndefined(this._currencyList["MXP"])) this._currencyList["MXP"] = {};
                        this._currencyList["MXP"].name = res.body[k];
                    }

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
                        if (isNullOrUndefined(this._currencyList[k])) this._currencyList[k] = {};
                        this._currencyList[k].fromOneUSD = res.body.rates[k];

                        if (k === "MXN"){
                            if (isNullOrUndefined(this._currencyList["MXP"])) this._currencyList["MXP"] = {};
                            this._currencyList["MXP"].fromOneUSD = res.body.rates[k] * 1000;
                        }

                    }
                }
            }
        });

    }

    async getCurrencyInfoOf(currencyCode:string){
        if (this._currencyList[currencyCode]) return this._currencyList[currencyCode];

        let currencyInfo = await CurrencyInfoRepository.getByCode(currencyCode);
        let correctCurrency = await CurrencyInfoRepository.getByName(currencyInfo.name);
        currencyCode = correctCurrency.code;

        return this._currencyList[currencyCode];
    }

    async get1USDRate(to:string){
        return 1 / (await this.getCurrencyInfoOf(to)).fromOneUSD;
    }

    async convert(from:string,to:string, fromValue:number=1){
        if (from === "USD"){
            return (await this.getCurrencyInfoOf(to)).fromOneUSD * fromValue;
        }
        else{
            let rate = 1 / (await this.getCurrencyInfoOf(from)).fromOneUSD; // get to USD from 'from'
            let base = fromValue * rate;
            return (await this.getCurrencyInfoOf(to)).fromOneUSD * base;
        }

    }

    async getSign(currency:string){
        let cur = await CurrencyInfoRepository.getByCode(currency);

        if (isNullOrUndefined(cur)){
            return "?";
        }
        else{
            return cur.symbol;
        }
    }

    async formatCurrency(value:number, currency:string){
        let cur = await CurrencyInfoRepository.getByCode(currency);

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