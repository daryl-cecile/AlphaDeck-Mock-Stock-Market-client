"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class addedCurrencyTable1579752074956 {
    constructor() {
        this.name = 'addedCurrencyTable1579752074956';
    }
    async up(queryRunner) {
        await queryRunner.query("ALTER TABLE `transaction_log` CHANGE `charges` `charges` decimal(16,4) NOT NULL DEFAULT 0", undefined);
    }
    async down(queryRunner) {
        await queryRunner.query("ALTER TABLE `transaction_log` CHANGE `charges` `charges` decimal(16,4) NOT NULL DEFAULT '0.0000'", undefined);
    }
}
exports.addedCurrencyTable1579752074956 = addedCurrencyTable1579752074956;
//# sourceMappingURL=1579752074956-added currency table.js.map