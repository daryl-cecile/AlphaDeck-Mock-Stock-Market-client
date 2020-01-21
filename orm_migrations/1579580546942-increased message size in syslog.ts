import {MigrationInterface, QueryRunner} from "typeorm";

export class increasedMessageSizeInSyslog1579580546942 implements MigrationInterface {
    name = 'increasedMessageSizeInSyslog1579580546942'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `work_log` DROP COLUMN `message`", undefined);
        await queryRunner.query("ALTER TABLE `work_log` ADD `message` text NOT NULL", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `work_log` DROP COLUMN `message`", undefined);
        await queryRunner.query("ALTER TABLE `work_log` ADD `message` varchar(255) NOT NULL", undefined);
    }

}
