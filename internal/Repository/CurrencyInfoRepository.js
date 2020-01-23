"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRepository_1 = require("./BaseRepository");
const CurrencyInfoModel_1 = require("../models/CurrencyInfoModel");
const typeorm_1 = require("typeorm");
class repo extends BaseRepository_1.BaseRepository {
    constructor() {
        super(CurrencyInfoModel_1.CurrencyInfoModel);
    }
    async getByCode(threeLetterCode) {
        return await this.repo.findOne({
            where: {
                code: threeLetterCode
            }
        });
    }
    async getByName(name) {
        return await this.repo.findOne({
            where: {
                name: typeorm_1.Like(`%${name}%`)
            }
        });
    }
}
exports.CurrencyInfoRepository = new repo();
//# sourceMappingURL=CurrencyInfoRepository.js.map