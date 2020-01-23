"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class addedIdenfierToOwnedShares1579747088024 {
    constructor() {
        this.name = 'addedIdenfierToOwnedShares1579747088024';
    }
    async up(queryRunner) {
        await queryRunner.query("ALTER TABLE `owned_shares` ADD `identifier` varchar(255) NOT NULL DEFAULT 'a'", undefined);
        await queryRunner.query("ALTER TABLE `transaction_log` CHANGE `charges` `charges` decimal(16,4) NOT NULL DEFAULT 0", undefined);
    }
    async down(queryRunner) {
        await queryRunner.query("ALTER TABLE `transaction_log` CHANGE `charges` `charges` decimal(16,4) NOT NULL DEFAULT '0.0000'", undefined);
        await queryRunner.query("ALTER TABLE `owned_shares` DROP COLUMN `identifier`", undefined);
    }
}
exports.addedIdenfierToOwnedShares1579747088024 = addedIdenfierToOwnedShares1579747088024;
//# sourceMappingURL=1579747088024-added idenfier to owned shares.js.map