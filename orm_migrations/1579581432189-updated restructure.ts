import {MigrationInterface, QueryRunner} from "typeorm";

export class updatedRestructure1579581432189 implements MigrationInterface {
    name = 'updatedRestructure1579581432189'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("DROP INDEX `FK_9184b4231136fb15aef57a05adb` ON `owned_shares`", undefined);
        await queryRunner.query("ALTER TABLE `owned_shares` ADD CONSTRAINT `FK_9184b4231136fb15aef57a05adb` FOREIGN KEY (`stockInfoId`) REFERENCES `stock_info`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `owned_shares` DROP FOREIGN KEY `FK_9184b4231136fb15aef57a05adb`", undefined);
        await queryRunner.query("CREATE INDEX `FK_9184b4231136fb15aef57a05adb` ON `owned_shares` (`stockInfoId`)", undefined);
    }

}
