import {BaseService} from "./BaseService";
import {Callback, IAPIResponse, isNullOrUndefined, isVoid, JsonObject} from "../config/convenienceHelpers";
import {SymbolResultData} from "../data/SymbolResultData";
import {ApiCacheService} from "./ApiCacheService";
import {StockInfoData} from "../data/StockInfoData";
import {System} from "../config/System";
import {OptionRepository} from "../Repository/OptionRepository";
import {TimeHelper} from "../config/TimeHelper";
import {ApiCacheModel} from "../models/ApiCacheModel";
import {StockRepository} from "../Repository/StockRepository";
import {StockModel} from "../models/StockModel";
import {AppError} from "../config/AppError";

let superAgent = require("superagent");

enum Endpoint{
    AV_QUERY_SYMBOL,
    AV_FOREIGN_EXCHANGE,
    AV_GLOBAL_STOCK_INFO
}

enum Providers {
    ALPHA_VANTANGE
}

export class StockResponseError extends Error implements IAPIResponse{
    public coreError: Error = undefined;
    public title: string;
    public message: string;

    public endpointPath: string;
    public rateLimitReached: boolean = false;
    public response: any;

    constructor(...props) {
        super(...props);

        // setTimeout(()=>{
        //     if ( !isVoid(this.title) && !isVoid(this.message) ){
        //         let e = isNullOrUndefined(this.coreError) ? new Error("StockResponseError Happened") : this.coreError;
        //         System.error( e , System.ERRORS.NETWORK_RESULT_ERR , `${this.title}: ${this.message} \n @->${this.endpointPath}` );
        //     }
        // },1500).unref();
    }

    public get isUnhandled(){
        return isNullOrUndefined(this.coreError) === false;
    }

    public static wrap(err:Error, endpointPath:string, message?:string, title?:string){
        let n = new StockResponseError();
        n.coreError = err;
        n.endpointPath = endpointPath;

        if (message) n.message = message;
        else n.message = (err.message || "unknown error");

        if (title) n.title = title;
        else n.title = (err.name || "Anonymous Error");

        return n;
    }
}

class service extends BaseService{

    public serviceClass = service;

    public static lastEndpointUsed:string = null;

    private static getPathToAPI(endpoint:Endpoint, ...param:string[]){
        switch (endpoint) {
            case Endpoint.AV_QUERY_SYMBOL:
                return service.buildPathToAPI({
                    function : "SYMBOL_SEARCH",
                    keywords : param[0]
                });
            case Endpoint.AV_FOREIGN_EXCHANGE:
                return service.buildPathToAPI({
                    function : "CURRENCY_EXCHANGE_RATE",
                    from_currency : param[0],
                    to_currency : param[1]
                });
            case Endpoint.AV_GLOBAL_STOCK_INFO:
                return service.buildPathToAPI({
                    function : "GLOBAL_QUOTE",
                    symbol : param[0]
                });
        }
    }

    private static buildPathToAPI(obj:JsonObject){
        let q = "";
        for (let k in obj){
            if (obj.hasOwnProperty(k)) q += ( isVoid(q) ? "?" : "&" ) + `${k}=${obj[k]}`;
        }
        let endpoint = `https://www.alphavantage.co/query${q}&apikey=${process.env.ALPHA_VANTAGE_API}`;
        this.lastEndpointUsed = endpoint;
        return endpoint;
    }

    private static async handleRateLimit(provider:Providers){
        await System.log("Rate-limited","Rate limit reached for " + provider[provider], System.ERRORS.STATUS_CHANGE);
        await OptionRepository.setOption({
            label : "VA_RATE_LIMIT",
            value : process.env.ALPHA_VANTAGE_API,
            canExpire : true,
            expiry : TimeHelper.minutesFromNow(2)
        });
    }

    private static async updateCache(endpointPath, response){
        if ( !isNullOrUndefined(response) && response !== -1 ){
            await ApiCacheService.setEntry({
                apiPath : endpointPath,
                result : JSON.stringify(response)
            });
        }
    }

    private static async performCacheCheck<X>(cachedResult:ApiCacheModel, forceUseCache:boolean, resolve, reject){
        let isRateLimited = await OptionRepository.hasOption("VA_RATE_LIMIT");

        if ( !isNullOrUndefined(cachedResult) ){
            if ( cachedResult.isOutdated === false || isRateLimited === true ||  forceUseCache ){
                resolve(<X>JSON.parse(cachedResult.result));
                return true;
            }
        }
        else{
            if (isRateLimited === true){
                reject(AppError.fromMessage("Requested resource not in cache and API Key has been rate-limited. Retrying in 1min..."));
                return true;
            }
        }
        return false;
    }


    // QUERY SYMBOL

    private async doQuery<R = JsonObject|SymbolResultData[]>(term:string, callback:Callback<StockResponseError, R>):Promise<R>{
        return new Promise<R>(resolve => {

            let endpointPath = service.getPathToAPI(Endpoint.AV_QUERY_SYMBOL, term);

            superAgent.get(endpointPath).end((err, res)=>{
                if (err) return callback(StockResponseError.wrap(err, endpointPath), undefined);

                let oldCallback = callback;

                callback = async (err, param) => {
                    let r = await oldCallback(err, param);
                    resolve( isNullOrUndefined(r) ? param : r );
                };

                let result = res.body;
                let sre = new StockResponseError();
                sre.endpointPath = endpointPath;
                sre.response = result;

                if (result['bestMatches']){
                    let collection = result['bestMatches'].map(item => {
                        return new SymbolResultData(item);
                    });
                    return callback(undefined, collection);
                }
                else if (result['Note']){
                    sre.title = "Note";
                    sre.message = result['Note'];
                    if (result['Note'].indexOf("API call frequency") > -1) {
                        sre.rateLimitReached = true;
                        service.handleRateLimit(Providers.ALPHA_VANTANGE);
                    }
                    return callback(sre, <any>result);
                }
                else if (result['Information']){
                    sre.title = "Information";
                    sre.message = result['Information'];
                    return callback(sre, <any>result);
                }
                else if (result['Error Message']){
                    sre.title = "Error Message";
                    sre.message = result['Error Message'];
                    return callback(sre, <any>result);
                }
                else {
                    sre.title = "Format error";
                    sre.message = "Response was in unknown format";
                    return callback(sre, undefined);
                }

            });

        });

    }

    public async queryStockInfo<R = SymbolResultData[]>(term:string, forceUseCache:boolean=false){
        let endpointPath = service.getPathToAPI(Endpoint.AV_QUERY_SYMBOL, term);
        let cachedResult = await ApiCacheService.getEntry(endpointPath);

        return new Promise<SymbolResultData[]>(async (resolve, reject) => {

            if ( await service.performCacheCheck<SymbolResultData[]>(cachedResult,forceUseCache,resolve,reject) ){
                // handled using cache so return;
                return;
            }

            let response = await this.doQuery<SymbolResultData[]>(term, async (err, param) => {
                if (err){
                    if (err.rateLimitReached === true){
                        if ( isNullOrUndefined(cachedResult) ){
                            reject(AppError.createFrom(err));
                            return -1;
                        }
                        else{
                            param = <SymbolResultData[]>JSON.parse(cachedResult.result);
                            return param;
                        }
                    }
                    else{
                        reject(AppError.fromMessage(err.message, err));
                        return -1;
                    }
                }
                else{
                    return param;
                }
            });

            await service.updateCache(endpointPath, response);

            resolve(response);
        });
    }


    // GLOBAL STOCK INFO

    private async doFetchStockInfo<R = JsonObject|StockInfoData>(symbol:string, callback:Callback<StockResponseError, R>){
        return new Promise<R>(resolve => {

            let endpointPath = service.getPathToAPI(Endpoint.AV_GLOBAL_STOCK_INFO, symbol);

            superAgent.get(endpointPath).end((err, res)=>{
                if (err) return callback(StockResponseError.wrap(err,endpointPath), undefined);
                let oldCallback = callback;

                callback = async (err, param) => {
                    let r = await oldCallback(err, param);
                    resolve( isNullOrUndefined(r) ? param : r );
                };

                let result = res.body;
                let sre = new StockResponseError();
                sre.endpointPath = endpointPath;
                sre.response = result;

                if (result["Global Quote"]){
                    let item = new StockInfoData(result["Global Quote"]);
                    callback(undefined, <any>item);
                }
                else if (result['Note']){
                    sre.title = "Note";
                    sre.message = result['Note'];
                    if (result['Note'].indexOf("API call frequency") > -1) {
                        service.handleRateLimit(Providers.ALPHA_VANTANGE);
                        sre.rateLimitReached = true;
                    }
                    callback(sre, <any>result);
                }
                else if (result['Information']){
                    sre.title = "Information";
                    sre.message = result['Information'];
                    callback(sre, <any>result);
                }
                else if (result['Error Message']){
                    sre.title = "Error Message";
                    sre.message = result['Error Message'];
                    callback(sre, <any>result);
                }
                else {
                    sre.title = "Format error";
                    sre.message = "Response was in unknown format";
                    callback(sre, undefined);
                }

            });

        });
    }

    public async getStockInfo<R = StockInfoData>(symbol:string, forceUseCache:boolean=false){
        let endpointPath = service.getPathToAPI(Endpoint.AV_GLOBAL_STOCK_INFO, symbol);
        let cachedResult = await ApiCacheService.getEntry(endpointPath);

        return new Promise<StockInfoData>(async (resolve, reject) => {

            if ( await service.performCacheCheck<StockInfoData>(cachedResult,forceUseCache,resolve,reject) ){
                // handled using cache so return;
                return;
            }

            let response = await this.doFetchStockInfo<StockInfoData>(symbol, async (err, param) => {
                if (err){
                    if (err.rateLimitReached === true){
                        if ( isNullOrUndefined(cachedResult) ){
                            reject(AppError.createFrom(err));
                            return -1;
                        }
                        else{
                            param = <StockInfoData>JSON.parse(cachedResult.result);
                            return param;
                        }
                    }
                    else{
                        reject(AppError.fromMessage(err.message,err));
                        return -1;
                    }
                }
                else{
                    return param;
                }
            });

            await service.updateCache(endpointPath, response);

            resolve(response);
        });
    }


    // ALPHADECK

    public async getStock(symbol:string):Promise<StockModel>;
    public async getStock(symbol:string, companyName:string, currency:string):Promise<StockModel>;
    public async getStock(symbol:string, companyName?:string, currency?:string):Promise<StockModel>{
        await System.log("Task",`getStock - symb: ${symbol}, cpN: ${companyName}, cny: ${currency}`);
        let extraInfo = await StockService.getStockInfo(symbol, true);

        let rec = (await StockRepository.findBySymbol(symbol));

        if (isNullOrUndefined(rec)){
            let info = isVoid(companyName) ? (await StockService.queryStockInfo(symbol, true))[0] : {
                name: companyName,
                currency: currency
            };

            rec = new StockModel();
            rec.symbol = symbol;
            rec.company = info.name;
            rec.currency = info.currency;
            rec.price = parseFloat(extraInfo.price);
            rec.lastTradingDate = new Date(extraInfo.latest_trading_day);
            rec.volume = parseInt(extraInfo.volume);
            rec.volumeAtSync = rec.volume;

            return await StockRepository.save(rec);
        }
        else{
            if (rec.isOutdated){
                rec.volume = rec.volumeAtSync;
                rec.price = parseFloat(extraInfo.price);
                rec.volumeAtSync = parseInt(extraInfo.volume);
                rec.lastTradingDate = new Date(extraInfo.latest_trading_day);
                return await StockRepository.save(rec);
            }
            return rec;
        }

    }

    public async queryStock(term:string, localFirst:boolean=true):Promise<StockModel[]>{
        await System.log("Task",`queryStock - term: ${term}, localF: ${localFirst}`);

        let queryByTermsResult:StockModel[] = [];
        let finalResults = [];

        if (localFirst === true){
            queryByTermsResult = await StockRepository.queryByTerms(term);

            if (queryByTermsResult.length >= 5){
                return queryByTermsResult;
            }
        }

        try{
            let results = await this.queryStockInfo(term);

            for (const r of results) {
                try{
                    if ( queryByTermsResult.filter(rx => rx.symbol === r.symbol).length > 0 ){
                        finalResults.push( ...queryByTermsResult.filter(rx => rx.symbol === r.symbol) );
                    }
                    else{
                        let v = await this.getStock(r.symbol, r.name, r.currency);
                        finalResults.push(v);
                    }
                } catch(x){
                    /*noop*/
                    await System.error(x, System.ERRORS.PROMISE_ERR)
                }
            }
        }
        catch(x){
            /* noop */
            await System.error(x, System.ERRORS.PROMISE_ERR)
        }

        return finalResults;

    }
}

export const StockService = new service();