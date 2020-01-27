import {MigrationInterface, QueryRunner} from "typeorm";

export class addedReserve1580087329668 implements MigrationInterface {
    name = 'addedReserve1580087329668'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `reserved_shares` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `quantity` int NOT NULL, `expiry` datetime NOT NULL, `ownerId` int NULL, `stockInfoId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("ALTER TABLE `reserved_shares` ADD CONSTRAINT `FK_818810a4c499ec74f0cba9b5f0c` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `reserved_shares` ADD CONSTRAINT `FK_67ccae481afb8d8cc2367962c81` FOREIGN KEY (`stockInfoId`) REFERENCES `stock_info`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `reserved_shares` DROP FOREIGN KEY `FK_67ccae481afb8d8cc2367962c81`", undefined);
        await queryRunner.query("ALTER TABLE `reserved_shares` DROP FOREIGN KEY `FK_818810a4c499ec74f0cba9b5f0c`", undefined);
        await queryRunner.query("DROP TABLE `reserved_shares`", undefined);
    }

}
