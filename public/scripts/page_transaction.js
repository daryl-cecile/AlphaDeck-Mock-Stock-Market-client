/**
 * Created by WebStorm.
 * User: darylcecile
 * Date: 22/01/2020
 * Time: 23:22
 * License: MIT
 */

function checkCanSell(callback){
    AlphaDeck.getShareByRef(HASH, (r)=>{
        if (r.isSuccessful){
            if (Object.keys(r.payload).length > 0){
                if (callback) callback(r.payload);
            }
            else{
                Tools.showAlert("No shares", "You do not currently own any shares in this stock to sell.",()=>{
                    history.back();
                });
            }
        }
        else{
            Tools.showAlert("Unknown error", "We were unable to prepare this transaction. Please try again",()=>{
                location.reload();
            });
        }
    });
}

function checkCanBuy(callback){
    AlphaDeck.getSingleStock(SYMBOL,(r)=>{
        if (r.isSuccessful){
            if (Object.keys(r.payload).length > 0){
                if (callback) callback(r.payload);
            }
            else{
                Tools.showAlert("Stock not found", "This stock is either no longer available for trading.",()=>{
                    history.back();
                });
            }
        }
        else{
            Tools.showAlert("Unknown error", "We were unable to get any information about this stock. Please try again shortly",()=>{
                location.reload();
            });
        }
    });
}