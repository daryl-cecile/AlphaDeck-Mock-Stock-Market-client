
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

    export function getOwnedShareInfo(symbol:string, callback){
        $.ajax({
            url: `/api/shares/single?symbol=${encodeURIComponent(symbol)}`,
            headers:{
                "sessionKey" : Tools.sessionKey()
            }
        }).then(r => {
            callback(r);
        });
    }

}