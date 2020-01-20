import {BeforeInsert, Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {BaseModel} from "./IModel";
import {UserModel} from "./UserModel";

export enum TransactionType{
    SELL,
    BUY
}

@Entity("transaction_log")
export class TransactionLogModel extends BaseModel{

    @Column("integer",{nullable: false})
    public transactionType:TransactionType;

    @Column("varchar", {length: 20, nullable: false})
    public symbol:string;

    @Column("varchar",{length:5, default: "USD"})
    public currency:string;

    @Column("decimal", { precision: 16, scale: 4 })
    public atPrice:number;

    @Column("varchar")
    public reference:string;

    @ManyToOne(type => UserModel, user => user.transactions)
    @JoinColumn()
    public customer:UserModel;

}