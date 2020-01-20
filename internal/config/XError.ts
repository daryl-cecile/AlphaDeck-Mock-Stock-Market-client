import {isNullOrUndefined} from "./convenienceHelpers";

class XStackFrame{

    public functionName:string;
    public fileName:string;
    public lineNumber:number;
    public columnNumber:number;

    public isConstructor:boolean = false;
    public isEval:boolean = false;

    private _parseFileInfo(fileInfoString:string){
        let parts = this._getFileInfoParts(fileInfoString).split(",");
        this.fileName = parts[0];
        this.lineNumber = parseInt(parts[1] ?? "0");
        this.columnNumber = parseInt(parts[2] ?? "0");
    }

    private _getFileInfoParts(fileInfoString:string){
        let r = /\(*([^!]+?):([0-9]+):([0-9])\)*/gm;

        let m = r.exec(fileInfoString);

        if (fileInfoString.trim() === "(<anonymous>)" || fileInfoString.trim() === "<anonymous>"){
            return "<anonymous>,1,0";
        }

        return m[1] + "," + m[2] + "," + m[3];
    }

    public parseStackParts(stackParts:string[]){

        stackParts.shift(); // removes "at" in first position

        if (stackParts[0] === "new" && stackParts[1].startsWith("(") === false) this.isConstructor = true;
        else if (stackParts[0] === "eval" && stackParts[1].startsWith("(eval")) this.isEval = true;
        else if ( /[a-zA-Z_$][a-zA-Z0-9_$<>]*/g.test(stackParts[0]) && stackParts[0].indexOf("/") === -1 ) this.functionName = stackParts[0];

        if ( stackParts.length === 2 ){ // direct call
            this._parseFileInfo( stackParts[ 1 ] );
        }
        else if (this.isEval){ // doesn't have file info

        }
        else{ // file info is in last part
            this._parseFileInfo( stackParts[ stackParts.length - 1 ] );
        }

    }

}

export class XError{

    public readonly originalError:Error;
    public readonly type:string;
    public readonly message:string;
    public readonly details:string;
    public readonly stackFrames:XStackFrame[] = [];

    constructor(error:Error) {
        this.originalError = error;

        let details = [];
        let stacks = error.stack?.toString()?.split(/\r\n|\n/);

        if ( isNullOrUndefined(stacks) ) stacks = [""];

        if (stacks[0]?.indexOf("Error:") === -1){
            let line = stacks[0];
            while ((line||"").indexOf("Error:") === -1){
                details.push( stacks.shift() );
                line = stacks[0];
            }
        }

        this.details = details.join("\n");

        this.type = stacks[0].split(":")?.[0];
        this.message = stacks[0].split(": ")?.[1];

        stacks.shift(); // remove first

        stacks.forEach(stack => {
            let stackFrame = new XStackFrame();
            let p = this._getParts(stack);
            stackFrame.parseStackParts(p);
            this.stackFrames.push(stackFrame);
        });
    }

    private _getParts(str:string){
        const regex = /\(.+\)|[^ ]+|\w+/gm;
        let m;
        let f = [];

        while ((m = regex.exec(str)) !== null) {
            if (m.index === regex.lastIndex) regex.lastIndex++;

            // The result can be accessed through the `m`-variable.
            m.forEach(match => {
                if (match.trim().length !== 0) f.push(match);
            });
        }

        return f;
    }

    public static createFrom(error:Error){
        return (new XError(error));
    }

}