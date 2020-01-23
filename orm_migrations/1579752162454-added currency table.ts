import {MigrationInterface, QueryRunner} from "typeorm";

export class addedCurrencyTable1579752162454 implements MigrationInterface {
    name = 'addedCurrencyTable1579752162454'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `currency_info` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `symbol` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `symbol_native` varchar(255) NOT NULL, `decimal_digits` int NOT NULL, `rounding` int NOT NULL, `code` varchar(255) NOT NULL, `name_plural` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("DROP TABLE `currency_info`", undefined);
    }

}
