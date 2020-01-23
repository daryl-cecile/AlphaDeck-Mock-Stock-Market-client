import {Column, Entity} from "typeorm";
import {BaseModel} from "./IModel";

@Entity("currency_info")
export class CurrencyInfoModel extends BaseModel{

    @Column("varchar",{length:255})
    public symbol:string;

    @Column("varchar",{length:255})
    public name:string;

    @Column("varchar",{length:255})
    public symbol_native:string;

    @Column("integer")
    public decimal_digits:number;

    @Column("integer")
    public rounding:number;

    @Column("varchar",{length:255})
    public code:string;

    @Column("varchar",{length:255})
    public name_plural:string;

}