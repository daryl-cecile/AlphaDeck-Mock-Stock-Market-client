"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class madeIdentifierUnique1579747545520 {
    constructor() {
        this.name = 'madeIdentifierUnique1579747545520';
    }
    async up(queryRunner) {
        await queryRunner.query("ALTER TABLE `owned_shares` CHANGE `identifier` `identifier` varchar(255) NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `owned_shares` ADD UNIQUE INDEX `IDX_3add896df11508e2c38f4ba8dc` (`identifier`)", undefined);
        await queryRunner.query("ALTER TABLE `transaction_log` CHANGE `charges` `charges` decimal(16,4) NOT NULL DEFAULT 0", undefined);
    }
    async down(queryRunner) {
        await queryRunner.query("ALTER TABLE `transaction_log` CHANGE `charges` `charges` decimal(16,4) NOT NULL DEFAULT '0.0000'", undefined);
        await queryRunner.query("ALTER TABLE `owned_shares` DROP INDEX `IDX_3add896df11508e2c38f4ba8dc`", undefined);
        await queryRunner.query("ALTER TABLE `owned_shares` CHANGE `identifier` `identifier` varchar(255) NOT NULL DEFAULT 'a'", undefined);
    }
}
exports.madeIdentifierUnique1579747545520 = madeIdentifierUnique1579747545520;
//# sourceMappingURL=1579747545520-made identifier unique.js.map