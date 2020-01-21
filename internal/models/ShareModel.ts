import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
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

    @ManyToOne(type => UserModel, user => user.ownedShares)
    @JoinColumn()
    public owner:UserModel;

    @ManyToOne(type => StockModel, stock => stock.soldShares)
    public stockInfo:StockModel;

}