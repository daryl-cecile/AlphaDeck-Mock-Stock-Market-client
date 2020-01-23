"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class addedChargesToTransactionLog1579742856887 {
    constructor() {
        this.name = 'addedChargesToTransactionLog1579742856887';
    }
    async up(queryRunner) {
        await queryRunner.query("ALTER TABLE `transaction_log` ADD `charges` decimal(16,4) NOT NULL DEFAULT 0", undefined);
    }
    async down(queryRunner) {
        await queryRunner.query("ALTER TABLE `transaction_log` DROP COLUMN `charges`", undefined);
    }
}
exports.addedChargesToTransactionLog1579742856887 = addedChargesToTransactionLog1579742856887;
//# sourceMappingURL=1579742856887-added charges to transaction log.js.map