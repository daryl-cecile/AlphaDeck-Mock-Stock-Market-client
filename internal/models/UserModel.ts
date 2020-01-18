import {BaseModel, jsonIgnore} from "./IModel";
import {Column, Entity, JoinColumn, OneToMany, OneToOne} from "typeorm";
import {SessionModel} from "./SessionModel";
import {ShareModel} from "./ShareModel";
import {TransactionLogModel} from "./TransactionLogModel";

@Entity("users")
export class UserModel extends BaseModel{

    @Column("varchar",{length:255, nullable: true})
    public firstName:string;

    @Column("varchar",{length:255, nullable: true})
    public lastName:string;

    @Column("varchar", {length:255, nullable:true})
    public email:string;

    @Column("varchar",{length:255, unique: true})
    public username:string;

    @Column("decimal", { precision: 16, scale: 4, default:"50000.4900" })
    public credit:number;

    @Column("varchar", { length: 5 , default:"USD" })
    public creditCurrency:string;

    @Column("varchar",{length:255, nullable:true, name:"password_hash"})
    @jsonIgnore()
    public passHash:string;

    @Column("boolean", {default: false})
    public isSuperUser:boolean;

    @Column("varchar", {length:255,nullable:true, name:"saltine"})
    @jsonIgnore()
    public saltine:string;

    @OneToOne( type => SessionModel, session => session.owner ,   {
        nullable: true,
        cascade:['insert','update','remove'],
        eager: true
    } )
    @JoinColumn()
    @jsonIgnore()
    public currentSession:SessionModel;

    @OneToMany(type => ShareModel, share => share.owner, {
        cascade:true,
        eager:true
    })
    public ownedShares:ShareModel[];

    @OneToMany(type => TransactionLogModel, transaction => transaction.customer, {
        cascade:true,
        eager:true
    })
    public transactions:TransactionLogModel[];

}