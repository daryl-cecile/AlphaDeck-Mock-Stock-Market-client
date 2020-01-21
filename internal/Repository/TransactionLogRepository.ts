import {BaseRepository} from "./BaseRepository";
import {TransactionLogModel} from "../models/TransactionLogModel";

class repo extends BaseRepository<TransactionLogModel>{

    constructor() {
        super(TransactionLogModel);
    }

}

export const TransactionLogRepository = new repo();