import {UserModel} from "./internal/models/UserModel";
import {StockModel} from "./internal/models/StockModel";
import {ShareModel} from "./internal/models/ShareModel";
import {SessionModel} from "./internal/models/SessionModel";
import {SystemLogEntryModel} from "./internal/models/SystemLogEntryModel";
import {TransactionLogModel} from "./internal/models/TransactionLogModel";
import {ApiCacheModel} from "./internal/models/ApiCacheModel";
import {OptionModel} from "./internal/models/OptionModel";
import {CurrencyInfoModel} from "./internal/models/CurrencyInfoModel";
import {ReservedShareModel} from "./internal/models/ReservedShareModel";

interface IConnectionInfo{
    type: string,
    host: string,
    port: number,
    username: string,
    password: string,
    database?: string,
    ssl?: {
        ca: string,
        key: string,
        cert: string
    },
    synchronize: boolean,
    logging: boolean,
    entities: any[],
    migrationsTableName: string,
    migrations: string[],
    cli: {[name:string]:string}
}

let x:IConnectionInfo = {
    type: "mysql",
    host: process.env.SQL_IP,
    port: 3306,
    username: process.env.SQL_USER,
    password: process.env.SQL_PASS,
    database: process.env.SQL_BASE,
    synchronize: false,
    logging: false,
    entities: [
        UserModel,
        StockModel,
        ShareModel,
        SessionModel,
        SystemLogEntryModel,
        TransactionLogModel,
        ApiCacheModel,
        OptionModel,
        CurrencyInfoModel,
        ReservedShareModel
    ],
    migrationsTableName:'db_migrations',
    migrations: ["orm_migrations/*.js"],
    cli: {
        migrationsDir: "orm_migrations"
    }
};

module.exports = x;