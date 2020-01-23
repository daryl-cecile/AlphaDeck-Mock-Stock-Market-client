import {MigrationInterface, QueryRunner} from "typeorm";

export class addedCurrencyTable1579752074956 implements MigrationInterface {
    name = 'addedCurrencyTable1579752074956'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `transaction_log` CHANGE `charges` `charges` decimal(16,4) NOT NULL DEFAULT 0", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `transaction_log` CHANGE `charges` `charges` decimal(16,4) NOT NULL DEFAULT '0.0000'", undefined);
    }

}
