import {MigrationInterface, QueryRunner} from "typeorm";

export class addedTransaction1579303257581 implements MigrationInterface {
    name = 'addedTransaction1579303257581'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `transaction-log` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `transactionType` int NOT NULL, `symbol` varchar(20) NOT NULL, `currency` varchar(5) NOT NULL DEFAULT 'USD', `atPrice` decimal(16,4) NOT NULL, `reference` varchar(255) NOT NULL, `customerId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("ALTER TABLE `transaction-log` ADD CONSTRAINT `FK_6a4bea020dd030563efbe9dcd5e` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `transaction-log` DROP FOREIGN KEY `FK_6a4bea020dd030563efbe9dcd5e`", undefined);
        await queryRunner.query("DROP TABLE `transaction-log`", undefined);
    }

}
