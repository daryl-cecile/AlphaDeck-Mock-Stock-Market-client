import {MigrationInterface, QueryRunner} from "typeorm";

export class addedExtraInfoInLog1579495713541 implements MigrationInterface {
    name = 'addedExtraInfoInLog1579495713541'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `work_log` ADD `extraInfo` text NULL", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `work_log` DROP COLUMN `extraInfo`", undefined);
    }

}
