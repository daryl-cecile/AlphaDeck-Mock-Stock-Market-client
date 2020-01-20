import {BaseRepository} from "./BaseRepository";
import {OptionModel, OptionType} from "../models/OptionModel";
import {isNullOrUndefined, loadProperties, ObjectProperties} from "../config/convenienceHelpers";


class repo extends BaseRepository<OptionModel>{

    constructor() {
        super(OptionModel);
    }

    async getOption(label:string, honourableOnly:boolean=true){
        let item = (await this.repo.findOne({
            where: {
                label : label
            }
        }));

        if (item && honourableOnly && item.isHonourable === false){
            item = undefined;
        }

        return item;
    }

    async hasOption(label:string, mustBeHonourable:boolean=true){
        let o = await this.getOption(label, mustBeHonourable);
        return !isNullOrUndefined(o);
    }

    async setOption(properties:ObjectProperties<OptionModel>, autoSave:boolean=true){
        let option = new OptionModel();

        if (autoSave === true && await this.hasOption( properties.label )) {
            let o = await this.getOption( properties.label , false );
            if ( !isNullOrUndefined(o) ) {
                loadProperties(o,properties);
                await this.save(o);
                return o;
            }
        }

        loadProperties(option, properties);
        if (autoSave === true) await this.save(option);
        return option;
    }

}

export const OptionRepository = new repo();
