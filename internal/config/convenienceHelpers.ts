import {System} from "./System";

export function isNullOrUndefined(obj:any){
    if (obj === void 0) return true;
    return obj === null;

}

export function isVoid(obj:any){
    if (typeof obj === "string" || obj instanceof String){
        obj = obj.trim();
        if (obj === "") return true;
    }
    return isNullOrUndefined(obj);
}

export type JsonObject = {
    [key:string] : any
}

export type ErrorCallback<E = Error> = (err:E)=>void;

export type Callback<E = Error, R = any> = (err?:E|undefined, param?:R)=>any;

export class APIResponse{
    public rateLimitReached:boolean = false;
    public response:any;
}

export type ObjectProperties<O> = { [K in keyof O]?: O[K] };

export function loadProperties<C>(option:C, properties:ObjectProperties<C>):C{
    for (let propertyName in properties){
        if (properties.hasOwnProperty(propertyName))
            if (!isNullOrUndefined(properties[propertyName])) option[propertyName] = properties[propertyName];
    }
    return option;
}

export function LogOnError():any {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor):void {
        let symb = Symbol.for( target.constructor.name );
        if (!target.constructor[ symb ]) target.constructor[ symb ] = [];
        target.constructor[ symb ].push(propertyKey);

        let oldHandler = descriptor.value;

        descriptor.value = async (...args)=>{
            let retVal;
            try{
                retVal = await oldHandler(...args);
            }
            catch(x){
                System.error(x, System.ERRORS.PROMISE_ERR, "Intercepted via LogOnError");
            }
            return retVal;
        }
    }
}