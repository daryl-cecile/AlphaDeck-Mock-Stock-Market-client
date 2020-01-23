import {Column, Entity, JoinColumn, JoinTable, ManyToOne} from "typeorm";
import {BaseModel} from "./IModel";
import {StockModel} from "./StockModel";
import {UserModel} from "./UserModel";

@Entity("owned_shares")
export class ShareModel extends BaseModel{

    @Column("integer")
    public quantity:number;

    @Column("varchar", { length: 5, default:"USD" })
    public currency:string;

    @Column("decimal", { precision: 16, scale: 4 })
    public boughtAtPrice:number;

    @Column("varchar", {length: 255, unique: true})
    public identifier:string;

    @ManyToOne(type => UserModel, user => user.ownedShares)
    @JoinColumn()
    public owner:UserModel;

    @ManyToOne(type => StockModel, stock => stock.soldShares)
    @JoinTable()
    public stockInfo:StockModel;

}