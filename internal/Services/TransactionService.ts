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

class service extends BaseService{

    async processPurchase(buyer:UserModel, stock:StockModel, quantity:number=1){
        if (quantity > 0){
            let nativeCost = (await ForexService.convert(stock.currency,buyer.creditCurrency, stock.price));

            if (nativeCost > buyer.credit) throw new AppError("Transaction failed due to insufficient funds");

            let share = new ShareModel();
            share.boughtAtPrice = stock.price;
            share.quantity = quantity;
            share.currency = stock.currency;
            share.stockInfo = stock;
            stock.volume -= quantity;

            let log = new TransactionLogModel();
            log.atPrice = stock.price;
            log.currency = stock.currency;
            log.reference = "";
            log.symbol = stock.symbol;
            log.transactionType = TransactionType.BUY;

            buyer.credit -= nativeCost;
            buyer.ownedShares.push(share);
            buyer.transactions.push(log);

            await StockRepository.update(stock);
            await TransactionLogRepository.save(log);
            await UserRepository.update(buyer);
        }
    }

    async processSale(seller:UserModel, share:ShareModel){
        let worth = (await ForexService.convert(share.currency, seller.creditCurrency, share.stockInfo.price));

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