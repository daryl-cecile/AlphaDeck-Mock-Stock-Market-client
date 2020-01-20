import {MigrationInterface, QueryRunner} from "typeorm";

export class refreshedDbStrructure1579486075788 implements MigrationInterface {
    name = 'refreshedDbStrructure1579486075788'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `sessions` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `sessionKey` varchar(255) NOT NULL, `expiry` datetime NOT NULL, `invalid` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX `IDX_1ae515ea2b66b030cf3f5e5ba8` (`sessionKey`), PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("CREATE TABLE `stock_info` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `symbol` varchar(20) NOT NULL, `company` varchar(255) NOT NULL, `price` decimal(16,4) NOT NULL, `volume` int NOT NULL, `volumeAtSync` int NOT NULL, `lastTradingDate` datetime NOT NULL, `currency` varchar(5) NOT NULL DEFAULT 'USD', UNIQUE INDEX `IDX_e070ed33681787dcb207b8a0b2` (`symbol`), PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("CREATE TABLE `owned_shares` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `quantity` int NOT NULL, `currency` varchar(5) NOT NULL DEFAULT 'USD', `boughtAtPrice` decimal(16,4) NOT NULL, `stockInfoId` int NULL, `ownerId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("CREATE TABLE `transaction_log` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `transactionType` int NOT NULL, `symbol` varchar(20) NOT NULL, `currency` varchar(5) NOT NULL DEFAULT 'USD', `atPrice` decimal(16,4) NOT NULL, `reference` varchar(255) NOT NULL, `customerId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("CREATE TABLE `users` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `firstName` varchar(255) NULL, `lastName` varchar(255) NULL, `email` varchar(255) NULL, `username` varchar(255) NOT NULL, `credit` decimal(16,4) NOT NULL DEFAULT '50000.4900', `creditCurrency` varchar(5) NOT NULL DEFAULT 'USD', `password_hash` varchar(255) NULL, `isSuperUser` tinyint NOT NULL DEFAULT 0, `saltine` varchar(255) NULL, `currentSessionId` int NULL, UNIQUE INDEX `IDX_fe0bb3f6520ee0469504521e71` (`username`), UNIQUE INDEX `REL_aad9d010f8b7d5f1367e002487` (`currentSessionId`), PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("CREATE TABLE `work_log` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `title` varchar(255) NULL, `message` varchar(255) NOT NULL, `err-code` varchar(12) NULL, `reference` varchar(255) NOT NULL, `expiry` datetime NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("CREATE TABLE `api_cache` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `apiPath` varchar(255) NOT NULL, `result` longtext NOT NULL, `expiry` datetime NOT NULL, UNIQUE INDEX `IDX_efc0e14b1b9e315fed2d5c813f` (`apiPath`), PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("CREATE TABLE `core_options` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `label` varchar(100) NOT NULL, `optionType` int NOT NULL DEFAULT 0, `value` varchar(255) NOT NULL, `expiry` datetime NOT NULL, `canExpire` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("ALTER TABLE `owned_shares` ADD CONSTRAINT `FK_9184b4231136fb15aef57a05adb` FOREIGN KEY (`stockInfoId`) REFERENCES `stock_info`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `owned_shares` ADD CONSTRAINT `FK_5850fb5477caa31282c0c1a7475` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `transaction_log` ADD CONSTRAINT `FK_168eda4a02e782ed9d8b0413ccc` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `users` ADD CONSTRAINT `FK_aad9d010f8b7d5f1367e002487c` FOREIGN KEY (`currentSessionId`) REFERENCES `sessions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `users` DROP FOREIGN KEY `FK_aad9d010f8b7d5f1367e002487c`", undefined);
        await queryRunner.query("ALTER TABLE `transaction_log` DROP FOREIGN KEY `FK_168eda4a02e782ed9d8b0413ccc`", undefined);
        await queryRunner.query("ALTER TABLE `owned_shares` DROP FOREIGN KEY `FK_5850fb5477caa31282c0c1a7475`", undefined);
        await queryRunner.query("ALTER TABLE `owned_shares` DROP FOREIGN KEY `FK_9184b4231136fb15aef57a05adb`", undefined);
        await queryRunner.query("DROP TABLE `core_options`", undefined);
        await queryRunner.query("DROP INDEX `IDX_efc0e14b1b9e315fed2d5c813f` ON `api_cache`", undefined);
        await queryRunner.query("DROP TABLE `api_cache`", undefined);
        await queryRunner.query("DROP TABLE `work_log`", undefined);
        await queryRunner.query("DROP INDEX `REL_aad9d010f8b7d5f1367e002487` ON `users`", undefined);
        await queryRunner.query("DROP INDEX `IDX_fe0bb3f6520ee0469504521e71` ON `users`", undefined);
        await queryRunner.query("DROP TABLE `users`", undefined);
        await queryRunner.query("DROP TABLE `transaction_log`", undefined);
        await queryRunner.query("DROP TABLE `owned_shares`", undefined);
        await queryRunner.query("DROP INDEX `IDX_e070ed33681787dcb207b8a0b2` ON `stock_info`", undefined);
        await queryRunner.query("DROP TABLE `stock_info`", undefined);
        await queryRunner.query("DROP INDEX `IDX_1ae515ea2b66b030cf3f5e5ba8` ON `sessions`", undefined);
        await queryRunner.query("DROP TABLE `sessions`", undefined);
    }

}
