import {BeforeInsert, Column, Entity, JoinColumn, JoinTable, ManyToOne} from "typeorm";
import {BaseModel} from "./IModel";
import {StockModel} from "./StockModel";
import {UserModel} from "./UserModel";

@Entity("reserved_shares")
export class ReservedShareModel extends BaseModel{

    @Column("integer")
    public quantity:number;

    @ManyToOne(type => UserModel)
    @JoinColumn()
    public owner:UserModel;

    @ManyToOne(type => StockModel)
    @JoinTable()
    public stockInfo:StockModel;

    @Column("datetime")
    public expiry:Date;

    @BeforeInsert()
    private setExpiry(){
        // set expiry to 2min in future from current time
        this.expiry = new Date( Date.now() + 2 * 60_000 );
    }

    public get IsValid(){
        return (Date.now() < this.expiry.getTime() + (2 * 60 * 1000) );
    }

}