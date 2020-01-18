import {MigrationInterface, QueryRunner} from "typeorm";

export class addedCreditToAccount1579356017465 implements MigrationInterface {
    name = 'addedCreditToAccount1579356017465'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `users` ADD `credit` decimal(16,4) NOT NULL DEFAULT '50000.4900'", undefined);
        await queryRunner.query("ALTER TABLE `users` ADD `creditCurrency` varchar(5) NOT NULL DEFAULT 'USD'", undefined);
        await queryRunner.query("ALTER TABLE `users` CHANGE `username` `username` varchar(255) NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `users` ADD UNIQUE INDEX `IDX_fe0bb3f6520ee0469504521e71` (`username`)", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `users` DROP INDEX `IDX_fe0bb3f6520ee0469504521e71`", undefined);
        await queryRunner.query("ALTER TABLE `users` CHANGE `username` `username` varchar(255) NOT NULL DEFAULT ''", undefined);
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `creditCurrency`", undefined);
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `credit`", undefined);
    }

}
