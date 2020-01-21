import {Column, Entity, JoinTable, OneToMany} from "typeorm";
import {BaseModel, jsonIgnore} from "./IModel";
import {ShareModel} from "./ShareModel";

@Entity("stock_info")
export class StockModel extends BaseModel{

    @Column("varchar",{ length: 20, unique:true })
    public symbol:string;

    @Column("varchar",{ length: 255 })
    public company:string;

    @Column("decimal",{ precision: 16, scale: 4 })
    public price:number;

    @Column("integer")
    public volume:number;

    @Column("integer")
    public volumeAtSync:number;

    @Column("datetime")
    public lastTradingDate:Date;

    @Column("varchar", { length: 5, default:"USD" })
    public currency:string;

    @OneToMany(type => ShareModel, share => share.stockInfo)
    @JoinTable()
    @jsonIgnore()
    public soldShares:ShareModel[];

    public get isOutdated():boolean{
        return ( Date.now() >= this.lastTradingDate.getTime() || Date.now() >= this.updatedAt.getTime() + (15 * 60_000) );
    }

}