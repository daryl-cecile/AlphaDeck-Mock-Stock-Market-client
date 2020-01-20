import {BaseModel} from "./IModel";
import {BeforeInsert, Column, Entity} from "typeorm";
import {isNullOrUndefined} from "../config/convenienceHelpers";

export enum OptionType{
    STRING,
    BOOLEAN
}

@Entity("core_options")
export class OptionModel extends BaseModel{

    @Column("varchar", {length: 100})
    public label:string;

    @Column("integer" ,{default:OptionType.STRING})
    public optionType:OptionType;

    @Column("varchar", {length: 255})
    public value:string;

    @Column("datetime")
    public expiry:Date;

    @Column("boolean", {default: true})
    public canExpire:boolean;

    @BeforeInsert()
    private setExpiry(){
        // by default if no expiry is set but option can expire, set expiry to 30min in future from current time
        if (this.canExpire === true){
            if (isNullOrUndefined(this.expiry) || this.isHonourable === false){
                this.expiry = new Date( Date.now() + 30 * 60_000 );
            }
        }
    }

    public get isHonourable():boolean{
        if (this.canExpire === true){
            if ( isNullOrUndefined(this.expiry) ) return false;
            if ( Date.now() > this.expiry.getTime() ) return false;
        }
        return true;
    }

}