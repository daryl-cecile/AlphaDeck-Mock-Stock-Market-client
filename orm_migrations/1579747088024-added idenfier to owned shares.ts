import {MigrationInterface, QueryRunner} from "typeorm";

export class addedIdenfierToOwnedShares1579747088024 implements MigrationInterface {
    name = 'addedIdenfierToOwnedShares1579747088024'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `owned_shares` ADD `identifier` varchar(255) NOT NULL DEFAULT 'a'", undefined);
        await queryRunner.query("ALTER TABLE `transaction_log` CHANGE `charges` `charges` decimal(16,4) NOT NULL DEFAULT 0", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `transaction_log` CHANGE `charges` `charges` decimal(16,4) NOT NULL DEFAULT '0.0000'", undefined);
        await queryRunner.query("ALTER TABLE `owned_shares` DROP COLUMN `identifier`", undefined);
    }

}
