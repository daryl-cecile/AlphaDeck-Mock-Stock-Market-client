/**
 * Created by WebStorm.
 * User: darylcecile
 * Date: 23/01/2020
 * Time: 02:04
 * License: MIT
 */

let loadingIndicator = Tools.showLoading();

let info = {};

function roundCurrency(num){
    num = parseFloat(num);
    let val = (Math.round( ( num + Number.EPSILON ) * 100 ) / 100).toString();
    let whole = val.indexOf(".") > -1 ? val.split(".")[0] : val;
    let part = val.indexOf(".") > -1 ? val.split(".")[1] : "00";
    return whole + "." + part.padEnd(2,"0");
}

function onDataReady() {
    let nativeCurrency = info.rate.signs.from;
    let localCurrency = info.rate.signs.to;

    let currentValue = info.share.stockInfo.price;
    let initialValue = info.share.boughtAtPrice;

    $('#stock-currency').val( nativeCurrency );
    $('#local-currency').val( info.account.creditCurrency );
    $('[itemid="local-currency"]').html( localCurrency );
    $('[itemid="current-value"]').html( roundCurrency(currentValue) );
    $('[itemid="initial-value"]').html( roundCurrency(initialValue) );
    $('[itemid="profit"]').html( roundCurrency(currentValue - initialValue) );
    $('#company-name').val(info.share.stockInfo.company);

    loadingIndicator.stop();
}

function setExchangeRate(){
    if ( info.share.currency.trim() === info.account.creditCurrency.trim() ){
        info['rate'] = {
            from : info.share.currency,
            to : info.account.creditCurrency,
            rate : 1,
            converted : 1,
            signs:{
                from : '$',
                to : '$'
            }
        };
        if (Object.keys(info).length === 3) onDataReady();
        return;
    }

    AlphaDeck.getExchangeRate(info.account.creditCurrency, info.share.currency,(r)=>{
        if (r.isSuccessful){
            info['rate'] = r.payload;
            if (Object.keys(info).length === 3) onDataReady();
        }
        else{
            Tools.showAlert("Unknown error", "We were unable to get the exchange rate. Please try again shortly", () => {
                location.reload();
            });
        }
    });
}

function sell(elem){
    let swapper = Tools.ButtonStateSwapper(elem);
    swapper.setLoading();

    AlphaDeck.makeSale(info.share.identifier, (r)=>{
        swapper.reset();
        if (r.isSuccessful){
            Tools.showAlert('Congratulations!', `The sale of your shares in ${info.share.stockInfo.symbol} is complete`,()=>{
                location.href = "/home";
            });
        }
        else{
            Tools.showAlert('Oops!', r.message);
        }
    });
}

checkCanSell(r => {
    info['share'] = r;
    if (info['share'] && info['account']) setExchangeRate();
    if (Object.keys(info).length === 3) onDataReady();
});

AlphaDeck.getAccountInfo(r => {
    if (r.isSuccessful) {
        info['account'] = r.payload;
        if (info['share'] && info['account']) setExchangeRate();
        if (Object.keys(info).length === 3) onDataReady();
    }
    else {
        Tools.showAlert("Unknown error", "We were unable to get any information about your account. Please try again shortly", () => {
            location.reload();
        });
    }
});
