import {BaseService} from "./BaseService";
import {UserModel} from "../models/UserModel";
import {ShareModel} from "../models/ShareModel";
import {StockModel} from "../models/StockModel";
import {UserRepository} from "../Repository/UserRepository";
import {StockRepository} from "../Repository/StockRepository";
import {TransactionLogModel, TransactionType} from "../models/TransactionLogModel";
import {TransactionLogRepository} from "../Repository/TransactionLogRepository";
import {ForexService} from "./ForexService";
import {SharesRepository} from "../Repository/SharesRepository";
import {AppError} from "../config/AppError";
import {OptionRepository} from "../Repository/OptionRepository";
import {Passport} from "./Passport";

class service extends BaseService{

    async processPurchase(buyer:UserModel, stock:StockModel, quantity:number=1){
        if (quantity > 0){
            let nativeStockPrice = (await ForexService.convert(stock.currency,buyer.creditCurrency, stock.price));

            let expenses = await this.getExpenses(nativeStockPrice, quantity);

            if (quantity > stock.volume) throw new AppError("Transaction failed due to insufficient shares available");
            if (expenses.grandTotal > buyer.credit) throw new AppError("Transaction failed due to insufficient funds");

            let share = new ShareModel();
            share.boughtAtPrice = stock.price;
            share.quantity = quantity;
            share.currency = stock.currency;
            share.stockInfo = stock;
            share.identifier = await Passport.createHash64();
            stock.volume -= quantity;

            let log = new TransactionLogModel();
            log.atPrice = stock.price;
            log.currency = stock.currency;
            log.reference = "";
            log.symbol = stock.symbol;
            log.charges = expenses.charges;
            log.transactionType = TransactionType.BUY;

            buyer.credit -= expenses.grandTotal;
            buyer.ownedShares.push(share);
            buyer.transactions.push(log);

            await StockRepository.update(stock);
            await TransactionLogRepository.save(log);
            await UserRepository.update(buyer);
        }
    }

    async getExpenses(sharePrice:number, quantity:number=1){

        const TAX_PERCENT = parseFloat( (await OptionRepository.getOption('TAX_PERCENT', true)).value );
        const MAX_TAX_CAP = parseFloat( (await OptionRepository.getOption('MAX_TAX_CAP', true)).value );

        let shareSetPrice = sharePrice * quantity;

        let taxRate = TAX_PERCENT/100;

        let tax = shareSetPrice * taxRate;

        let cappedTax = (tax > MAX_TAX_CAP ? MAX_TAX_CAP : tax);

        let charges = cappedTax * (1/100); //one percent of capped tax
        let total = shareSetPrice + charges + tax;

        return {
            grandTotal : total,
            tax : tax,
            charges : charges,
            taxRate : taxRate
        }

    }

    async processSale(seller:UserModel, share:ShareModel){
        let singleWorth = (await ForexService.convert(share.currency, seller.creditCurrency, share.stockInfo.price));
        let worth = singleWorth * share.quantity;

        let log = new TransactionLogModel();
        log.atPrice = share.boughtAtPrice;
        log.currency = share.currency;
        log.reference = "";
        log.symbol = share.stockInfo.symbol;
        log.transactionType = TransactionType.SELL;

        seller.credit += worth;
        seller.ownedShares = seller.ownedShares.filter(os => os.id !== share.id);
        seller.transactions.push(log);

        share.stockInfo.volume += share.quantity;

        await StockRepository.update(share.stockInfo);
        await TransactionLogRepository.update(log);
        await UserRepository.update(seller);
        await SharesRepository.delete(share);
    }

}

export const TransactionService = new service();