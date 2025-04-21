"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Initial1745229500580 = void 0;
class Initial1745229500580 {
    name = 'Initial1745229500580';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."reaction_type_enum" AS ENUM('benefited', 'not_benefited')`);
        await queryRunner.query(`CREATE TABLE "reaction" ("id" SERIAL NOT NULL, "type" "public"."reaction_type_enum" DEFAULT 'benefited', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "postId" integer, CONSTRAINT "PK_41fbb346da22da4df129f14b11e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "content" text NOT NULL, "resources" text, "type" character varying NOT NULL DEFAULT 'post', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('user', 'sup_user', 'admin')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "age" integer NOT NULL, "email" character varying(250) NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'user', "bio" character varying, "profileImage" character varying, "imagePublicId" character varying, "isAccountVerify" boolean NOT NULL DEFAULT false, "verificationCode" character varying, "point" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "job" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "short_intro" character varying NOT NULL, "responsibilities" character varying NOT NULL, "requirements" character varying NOT NULL, "extra_info" character varying NOT NULL, "email_applay" character varying NOT NULL, "type" character varying NOT NULL DEFAULT 'job', "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "userId" integer, CONSTRAINT "PK_98ab1c14ff8d1cf80d18703b92f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notification" ("id" SERIAL NOT NULL, "message" character varying NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "jobId" integer, "postId" integer, "recipientId" integer, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_followers" ("follower_id" integer NOT NULL, "following_id" integer NOT NULL, CONSTRAINT "PK_81bc622bd88e6ea821f9fa0ed97" PRIMARY KEY ("follower_id", "following_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_da722d93356ae3119d6be40d98" ON "user_followers" ("follower_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_0092daece8ed943fec27d37c41" ON "user_followers" ("following_id") `);
        await queryRunner.query(`CREATE TABLE "user_favorites_job" ("userId" integer NOT NULL, "jobId" integer NOT NULL, CONSTRAINT "PK_bfc344564a3b83a2f6afeccce26" PRIMARY KEY ("userId", "jobId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_23c4f6653e5b7ff0d61d63cd71" ON "user_favorites_job" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_31dd68fe7898586c43c354f662" ON "user_favorites_job" ("jobId") `);
        await queryRunner.query(`ALTER TABLE "reaction" ADD CONSTRAINT "FK_e58a09ab17e3ce4c47a1a330ae1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reaction" ADD CONSTRAINT "FK_dc3aeb83dc815f9f22ebfa7785f" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_5c1cf55c308037b5aca1038a131" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job" ADD CONSTRAINT "FK_308fb0752c2ea332cb79f52ceaa" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_d0ed2319fbe6a8e27b3b06c6d85" FOREIGN KEY ("jobId") REFERENCES "job"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_c7dc378ca2844fdfe647e00e993" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_ab7cbe7a013ecac5da0a8f88884" FOREIGN KEY ("recipientId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_followers" ADD CONSTRAINT "FK_da722d93356ae3119d6be40d988" FOREIGN KEY ("follower_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_followers" ADD CONSTRAINT "FK_0092daece8ed943fec27d37c413" FOREIGN KEY ("following_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_favorites_job" ADD CONSTRAINT "FK_23c4f6653e5b7ff0d61d63cd71c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_favorites_job" ADD CONSTRAINT "FK_31dd68fe7898586c43c354f662b" FOREIGN KEY ("jobId") REFERENCES "job"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_favorites_job" DROP CONSTRAINT "FK_31dd68fe7898586c43c354f662b"`);
        await queryRunner.query(`ALTER TABLE "user_favorites_job" DROP CONSTRAINT "FK_23c4f6653e5b7ff0d61d63cd71c"`);
        await queryRunner.query(`ALTER TABLE "user_followers" DROP CONSTRAINT "FK_0092daece8ed943fec27d37c413"`);
        await queryRunner.query(`ALTER TABLE "user_followers" DROP CONSTRAINT "FK_da722d93356ae3119d6be40d988"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_ab7cbe7a013ecac5da0a8f88884"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_c7dc378ca2844fdfe647e00e993"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_d0ed2319fbe6a8e27b3b06c6d85"`);
        await queryRunner.query(`ALTER TABLE "job" DROP CONSTRAINT "FK_308fb0752c2ea332cb79f52ceaa"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_5c1cf55c308037b5aca1038a131"`);
        await queryRunner.query(`ALTER TABLE "reaction" DROP CONSTRAINT "FK_dc3aeb83dc815f9f22ebfa7785f"`);
        await queryRunner.query(`ALTER TABLE "reaction" DROP CONSTRAINT "FK_e58a09ab17e3ce4c47a1a330ae1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_31dd68fe7898586c43c354f662"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_23c4f6653e5b7ff0d61d63cd71"`);
        await queryRunner.query(`DROP TABLE "user_favorites_job"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0092daece8ed943fec27d37c41"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_da722d93356ae3119d6be40d98"`);
        await queryRunner.query(`DROP TABLE "user_followers"`);
        await queryRunner.query(`DROP TABLE "notification"`);
        await queryRunner.query(`DROP TABLE "job"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`DROP TABLE "reaction"`);
        await queryRunner.query(`DROP TYPE "public"."reaction_type_enum"`);
    }
}
exports.Initial1745229500580 = Initial1745229500580;
//# sourceMappingURL=1745229500580-initial.js.map