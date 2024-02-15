import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1707248156718 implements MigrationInterface {
    name = 'Init1707248156718'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "admins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "UQ_051db7d37d478a69a7432df1479" UNIQUE ("email"), CONSTRAINT "PK_e3b38270c97a854c48d2e80874e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "scopes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "description" character varying NOT NULL, "clientId" uuid, CONSTRAINT "PK_fb1f703d1ac574fe4551a354977" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."clients_type_enum" AS ENUM('confidential', 'public')`);
        await queryRunner.query(`CREATE TABLE "clients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "type" "public"."clients_type_enum" NOT NULL DEFAULT 'confidential', "redirectUris" character varying array NOT NULL, "name" character varying NOT NULL, "logoLink" character varying, "clientSecret" character varying, CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "authorization_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "code" character varying NOT NULL, "userId" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "redirectUri" character varying NOT NULL, "isUsed" boolean NOT NULL DEFAULT false, "scopes" character varying array NOT NULL DEFAULT '{}', "clientId" uuid, CONSTRAINT "PK_f05b2eb99ad2db12d87544656c4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tokens_type_enum" AS ENUM('access_token', 'refresh_token')`);
        await queryRunner.query(`CREATE TABLE "tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "type" "public"."tokens_type_enum" NOT NULL, "token" character varying NOT NULL, "payload" jsonb NOT NULL, "expiredAt" TIMESTAMP WITH TIME ZONE NOT NULL, "sub" character varying NOT NULL, "pairId" uuid, CONSTRAINT "REL_8711f4a3f7c365cc957b2c5f53" UNIQUE ("pairId"), CONSTRAINT "PK_3001e89ada36263dabf1fb6210a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "scopes" ADD CONSTRAINT "FK_0f9cc9809e80e43eaef916a4d02" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "authorization_codes" ADD CONSTRAINT "FK_1705bf5f03833d4ccbab19ef50d" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "tokens" ADD CONSTRAINT "FK_8711f4a3f7c365cc957b2c5f53c" FOREIGN KEY ("pairId") REFERENCES "tokens"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tokens" DROP CONSTRAINT "FK_8711f4a3f7c365cc957b2c5f53c"`);
        await queryRunner.query(`ALTER TABLE "authorization_codes" DROP CONSTRAINT "FK_1705bf5f03833d4ccbab19ef50d"`);
        await queryRunner.query(`ALTER TABLE "scopes" DROP CONSTRAINT "FK_0f9cc9809e80e43eaef916a4d02"`);
        await queryRunner.query(`DROP TABLE "tokens"`);
        await queryRunner.query(`DROP TYPE "public"."tokens_type_enum"`);
        await queryRunner.query(`DROP TABLE "authorization_codes"`);
        await queryRunner.query(`DROP TABLE "clients"`);
        await queryRunner.query(`DROP TYPE "public"."clients_type_enum"`);
        await queryRunner.query(`DROP TABLE "scopes"`);
        await queryRunner.query(`DROP TABLE "admins"`);
    }

}
