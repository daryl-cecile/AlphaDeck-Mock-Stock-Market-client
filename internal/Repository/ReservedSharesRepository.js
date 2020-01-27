"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRepository_1 = require("./BaseRepository");
const ReservedShareModel_1 = require("../models/ReservedShareModel");
class repo extends BaseRepository_1.BaseRepository {
    constructor() {
        super(ReservedShareModel_1.ReservedShareModel);
    }
    async findByUser(user) {
        return await this.repo.find({
            where: {
                owner: user
            },
            relations: ['stockInfo', 'owner']
        });
    }
}
exports.ReservedSharesRepository = new repo();
//# sourceMappingURL=ReservedSharesRepository.js.map