import {MigrationInterface, QueryRunner} from "typeorm";

export class madeIdentifierUnique1579747545520 implements MigrationInterface {
    name = 'madeIdentifierUnique1579747545520'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `owned_shares` CHANGE `identifier` `identifier` varchar(255) NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `owned_shares` ADD UNIQUE INDEX `IDX_3add896df11508e2c38f4ba8dc` (`identifier`)", undefined);
        await queryRunner.query("ALTER TABLE `transaction_log` CHANGE `charges` `charges` decimal(16,4) NOT NULL DEFAULT 0", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `transaction_log` CHANGE `charges` `charges` decimal(16,4) NOT NULL DEFAULT '0.0000'", undefined);
        await queryRunner.query("ALTER TABLE `owned_shares` DROP INDEX `IDX_3add896df11508e2c38f4ba8dc`", undefined);
        await queryRunner.query("ALTER TABLE `owned_shares` CHANGE `identifier` `identifier` varchar(255) NOT NULL DEFAULT 'a'", undefined);
    }

}
