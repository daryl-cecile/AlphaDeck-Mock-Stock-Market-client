import {MigrationInterface, QueryRunner} from "typeorm";

export class addedChargesToTransactionLog1579742856887 implements MigrationInterface {
    name = 'addedChargesToTransactionLog1579742856887'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `transaction_log` ADD `charges` decimal(16,4) NOT NULL DEFAULT 0", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `transaction_log` DROP COLUMN `charges`", undefined);
    }

}
