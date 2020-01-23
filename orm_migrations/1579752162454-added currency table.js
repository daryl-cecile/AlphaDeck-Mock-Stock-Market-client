"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class addedCurrencyTable1579752162454 {
    constructor() {
        this.name = 'addedCurrencyTable1579752162454';
    }
    async up(queryRunner) {
        await queryRunner.query("CREATE TABLE `currency_info` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `symbol` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `symbol_native` varchar(255) NOT NULL, `decimal_digits` int NOT NULL, `rounding` int NOT NULL, `code` varchar(255) NOT NULL, `name_plural` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
    }
    async down(queryRunner) {
        await queryRunner.query("DROP TABLE `currency_info`", undefined);
    }
}
exports.addedCurrencyTable1579752162454 = addedCurrencyTable1579752162454;
//# sourceMappingURL=1579752162454-added currency table.js.map