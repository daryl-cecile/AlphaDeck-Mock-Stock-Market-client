
namespace AlphaDeck{

    export function findStock(terms:string, callback){
        $.ajax({
            url: `/api/stock/query?term=${encodeURIComponent(terms)}`,
            headers:{
                "X-CSRF-TOKEN" : Tools.csrfToken()
            }
        }).then(r => {
            callback(r);
        });
    }

    export function getSingleStock(symbol:string, callback){
        $.ajax({
            url: `/api/stock/single?symbol=${encodeURIComponent(symbol)}`,
            headers:{
                "sessionKey" : Tools.sessionKey()
            }
        }).then(r => {
            callback(r);
        });
    }

    export function getFirstShareInfoBySymbol(symbol:string, callback){
        $.ajax({
            url: `/api/shares/first?symbol=${encodeURIComponent(symbol)}`,
            headers:{
                "sessionKey" : Tools.sessionKey()
            }
        }).then(r => {
            callback(r);
        });
    }

    export function getShareByRef(identifier:string, callback){
        $.ajax({
            url: `/api/shares/single?ref=${encodeURIComponent(identifier)}`,
            headers:{
                "sessionKey" : Tools.sessionKey()
            }
        }).then(r => {
            callback(r);
        });
    }

    export function getAllOwnedShareInfoBySymbol(symbol:string, callback){
        $.ajax({
            url: `/api/shares/list?symbol=${encodeURIComponent(symbol)}`,
            headers:{
                "sessionKey" : Tools.sessionKey()
            }
        }).then(r => {
            callback(r);
        });
    }

    export function getOptionsValue(keys:string[], callback){
        $.ajax({
            url: `/api/option/query?keys=${encodeURIComponent(keys.join(","))}`,
            headers:{
                "sessionKey" : Tools.sessionKey()
            }
        }).then(r => {
            callback(r);
        });
    }

    export function getExchangeRate(fromCurrency:string, toCurrency:string,callback){
        $.ajax({
            url: `/api/forex/rate?to=${toCurrency}&from=${fromCurrency}`,
            headers:{
                "sessionKey" : Tools.sessionKey()
            }
        }).then(r => {
            callback(r);
        });
    }

    export function getAccountInfo(callback){
        $.ajax({
            url: `/api/account/info`,
            headers:{
                "sessionKey" : Tools.sessionKey()
            }
        }).then(r => {
            callback(r);
        });
    }

    export function makePurchase(symbol,quantity,callback){
        $.ajax({
            url: `/api/transaction/make`,
            type:'POST',
            data: JSON.stringify({
                symbol:symbol,
                quantity:quantity
            }),
            contentType: 'application/json; charset=utf-8',
            headers:{
                "sessionKey" : Tools.sessionKey()
            }
        }).then(r => {
            console.log(r);
            callback(r);
        });
    }

    export function makeSale(ref,callback){
        $.ajax({
            url: `/api/transaction/sell`,
            type:'POST',
            data: JSON.stringify({
                hash: ref
            }),
            contentType: 'application/json; charset=utf-8',
            headers:{
                "sessionKey" : Tools.sessionKey()
            }
        }).then(r => {
            console.log(r);
            callback(r);
        });
    }

}