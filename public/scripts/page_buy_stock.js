/**
 * Created by WebStorm.
 * User: darylcecile
 * Date: 22/01/2020
 * Time: 23:22
 * License: MIT
 */
let loadingIndicator = Tools.showLoading();

let info = {};

let $balanceAfterPurchase = $('#post-balance');
let $charges = $('[itemid="charge-per-share"]');
let $quantity = $('#share-quantity');
let $total = $('[itemid="total-price"]');
let $buyBtn = $('#purchase-btn');

let values = {
    balancePostPurchase: 0,
    total: 0,
    localCurrency: 'USD',
    stockCurrency: 'USD'
};

function roundCurrency(num){
    let val = (Math.round( ( num + Number.EPSILON ) * 100 ) / 100).toString();
    let whole = val.indexOf(".") > -1 ? val.split(".")[0] : val;
    let part = val.indexOf(".") > -1 ? val.split(".")[1] : "00";
    return whole + "." + part.padEnd(2,"0");
}

function onDataReady() {
    let x;

    values.localCurrency = info.rate.signs.from;
    values.stockCurrency = info.rate.signs.to;

    let stockPrice = info.stock.price * info.rate.rate;

    $('#transaction-ref').val("AD" + INTENT + "-?");
    $('#local-currency-sign').val( values.localCurrency );
    $('#local-currency-name').val( info.account.creditCurrency );
    $('#stock-currency').val( info.stock.currency );
    $('#local-currency').val( info.account.creditCurrency );
    $('[itemid="local-currency"]').html( values.localCurrency );
    $('[itemid="price-per-share"]').html( roundCurrency(stockPrice) );

    $('#price-info').on('mouseover',function(){
        $(this).addClass('hint-showing').html(`<ins itemid="local-currency">${ values.stockCurrency }</ins> <ins itemid="price-per-share">${ roundCurrency(info.stock.price) }</ins>`)
    }).on('mouseleave',function(){
        console.log("yall");
        $(this).removeClass('hint-showing').html(`<ins itemid="local-currency">${ values.localCurrency }</ins> <ins itemid="price-per-share">${ roundCurrency(stockPrice) }</ins>`)
    });

    loadingIndicator.stop();

    updateTotal();

    $quantity.on('input',function(){
        updateTotal();
    });

}

function updateTotal(){

    const MAX_TAX_CAP = parseFloat(info.settings['MAX_TAX_CAP'].value);
    const TAX_PERCENT = parseFloat(info.settings['TAX_PERCENT'].value);

    let sharePrice = info.stock.price * info.rate.rate;
    let shareSetPrice = sharePrice * parseInt( $quantity.val() || "1" );

    let taxRate = TAX_PERCENT/100;

    let tax = shareSetPrice * taxRate;

    let cappedTax = (tax > MAX_TAX_CAP ? MAX_TAX_CAP : tax);

    let charges = cappedTax * (1/100); //one percent of capped tax
    let total = shareSetPrice + charges;
    let grandTotal = total + tax;

    $charges.html(charges);

    $total.html( roundCurrency(grandTotal) );

    let accBalanceAfter = parseFloat(info.account.credit) - grandTotal;

    $balanceAfterPurchase.val( values.localCurrency + ' ' + roundCurrency(accBalanceAfter) );

    if (accBalanceAfter < 0){
        $balanceAfterPurchase.css({ color: 'red' });
        $buyBtn.attr('disabled','disabled');
    }
    else{
        $balanceAfterPurchase.css({ color: 'initial' });
        $buyBtn.removeAttr('disabled');
    }

    values.balancePostPurchase = parseFloat(info.account.credit) - grandTotal;
    values.total = grandTotal;

    $('[itemid="total-tax"]').html( roundCurrency(tax) );
    $('[itemid="cost"]').html( roundCurrency(total) );

}

function setExchangeRate(){
    AlphaDeck.getExchangeRate(info.account.creditCurrency, info.stock.currency,(r)=>{
        if (r.isSuccessful){
            info['rate'] = r.payload;
            if (Object.keys(info).length === 4) onDataReady();
        }
        else{
            Tools.showAlert("Unknown error", "We were unable to get the exchange rate. Please try again shortly", () => {
                location.reload();
            });
        }
    });
}

function purchase(elem){
    let swapper = Tools.ButtonStateSwapper(elem);
    swapper.setLoading();

    let quantity = parseInt( $quantity.val() || "0" );
    AlphaDeck.makePurchase(info.stock.symbol, quantity, (r)=>{
        swapper.reset();
        if (r.isSuccessful){
            Tools.showAlert('Congratulations!', `Your purchase of ${quantity} ${info.stock.symbol} share is complete`,()=>{
                location.href = "/home";
            });
        }
        else{
            Tools.showAlert('Oops!', r.message);
        }
    });
}

checkCanBuy(r => {
    info['stock'] = r;
    $quantity.attr('max', info.stock.volume);
    if (info['stock'] && info['account']) setExchangeRate();
    if (Object.keys(info).length === 4) onDataReady();
});

AlphaDeck.getAccountInfo(r => {
    if (r.isSuccessful) {
        info['account'] = r.payload;
        if (info['stock'] && info['account']) setExchangeRate();
        if (Object.keys(info).length === 4) onDataReady();
    }
    else {
        Tools.showAlert("Unknown error", "We were unable to get any information about your account. Please try again shortly", () => {
            location.reload();
        });
    }
});

AlphaDeck.getOptionsValue(['VA_RATE_LIMIT','TAX_PERCENT','MAX_TAX_CAP'],r => {
    if (r.isSuccessful) {
        info['settings'] = r.payload;
        if (Object.keys(info).length === 4) onDataReady();
    }
    else {
        Tools.showAlert("Unknown error", "We were unable to get any information about your account. Please try again shortly", () => {
            location.reload();
        });
    }
});
