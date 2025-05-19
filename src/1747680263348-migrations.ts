import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1747680263348 implements MigrationInterface {
    name = 'Migrations1747680263348'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."subscriptions_frequency_enum" AS ENUM('hourly', 'daily')
        `);
        await queryRunner.query(`
            CREATE TABLE "subscriptions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "city" character varying NOT NULL,
                "frequency" "public"."subscriptions_frequency_enum" NOT NULL DEFAULT 'daily',
                "confirmed" boolean NOT NULL DEFAULT false,
                "confirmationToken" character varying NOT NULL,
                "unsubscribeToken" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "lastSentAt" TIMESTAMP,
                CONSTRAINT "UQ_f0558bf43d14f66844255e8b7c2" UNIQUE ("email"),
                CONSTRAINT "UQ_d46cfde8a78c651b1b0a8b2083c" UNIQUE ("confirmationToken"),
                CONSTRAINT "UQ_fbeeac007acbb955e64c1d1bfff" UNIQUE ("unsubscribeToken"),
                CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "subscriptions"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."subscriptions_frequency_enum"
        `);
    }

}
