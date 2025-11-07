import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1762513792252 implements MigrationInterface {
    name = 'InitialSchema1762513792252'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."roles_name_enum" AS ENUM('Admin', 'Teacher', 'Student', 'Employee')`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" "public"."roles_name_enum" NOT NULL, "description" character varying, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "qr_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "sessionId" uuid NOT NULL, "token" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "rotatedAt" TIMESTAMP, CONSTRAINT "REL_7c0f8804f86665a40a74158e38" UNIQUE ("sessionId"), CONSTRAINT "PK_a15da7300056c43ee429dec3211" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."sessions_qrmode_enum" AS ENUM('session', 'student', 'off')`);
        await queryRunner.query(`CREATE TABLE "sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "classId" uuid NOT NULL, "date" date NOT NULL, "startTime" TIME, "endTime" TIME, "qrMode" "public"."sessions_qrmode_enum" NOT NULL DEFAULT 'off', "geoRequired" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."attendance_records_status_enum" AS ENUM('Present', 'Absent', 'Late', 'Excused', 'Leave')`);
        await queryRunner.query(`CREATE TYPE "public"."attendance_records_source_enum" AS ENUM('manual', 'qr', 'api', 'biometric')`);
        await queryRunner.query(`CREATE TABLE "attendance_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "sessionId" uuid NOT NULL, "studentId" uuid NOT NULL, "status" "public"."attendance_records_status_enum" NOT NULL, "note" character varying(200), "lat" numeric(10,7), "long" numeric(10,7), "accuracy" numeric(6,2), "markedBy" character varying NOT NULL, "markedAt" TIMESTAMP NOT NULL, "source" "public"."attendance_records_source_enum" NOT NULL DEFAULT 'manual', CONSTRAINT "PK_946920332f5bc9efad3f3023b96" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "students" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "studentId" character varying NOT NULL, "email" character varying, CONSTRAINT "UQ_9d9f010d4d6a6eea8b4779638c4" UNIQUE ("studentId"), CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."enrollments_status_enum" AS ENUM('active', 'archived')`);
        await queryRunner.query(`CREATE TABLE "enrollments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "classId" uuid NOT NULL, "studentId" uuid NOT NULL, "status" "public"."enrollments_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "UQ_43599c2329cb145ee8ba57079b4" UNIQUE ("classId", "studentId"), CONSTRAINT "PK_7c0f752f9fb68bf6ed7367ab00f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "classes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "subject" character varying, "teacherId" uuid NOT NULL, "timezone" character varying, CONSTRAINT "PK_e207aa15404e9b2ce35910f9f7f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'suspended', 'pending_verification')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying NOT NULL, "name" character varying NOT NULL, "passwordHash" character varying NOT NULL, "status" "public"."users_status_enum" NOT NULL DEFAULT 'pending_verification', "emailVerifiedAt" TIMESTAMP, "locale" character varying, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."leave_requests_status_enum" AS ENUM('draft', 'submitted', 'approved', 'rejected', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "leave_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "type" character varying NOT NULL, "start" date NOT NULL, "end" date NOT NULL, "reason" character varying(500), "status" "public"."leave_requests_status_enum" NOT NULL DEFAULT 'draft', "approverId" character varying, "decidedAt" TIMESTAMP, "approverComment" character varying(500), CONSTRAINT "PK_d3abcf9a16cef1450129e06fa9f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "leave_balances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" character varying NOT NULL, "type" character varying NOT NULL, "remaining" numeric(5,1) NOT NULL DEFAULT '0', CONSTRAINT "PK_a1d90dff48fb2bfd23a7163d077" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."verification_tokens_type_enum" AS ENUM('email', 'reset')`);
        await queryRunner.query(`CREATE TABLE "verification_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" character varying NOT NULL, "type" "public"."verification_tokens_type_enum" NOT NULL, "token" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "usedAt" TIMESTAMP, CONSTRAINT "PK_f2d4d7a2aa57ef199e61567db22" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "entity" character varying NOT NULL, "entityId" character varying NOT NULL, "action" character varying NOT NULL, "changedBy" character varying NOT NULL, "changes" jsonb NOT NULL, CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_channel_enum" AS ENUM('email', 'sms', 'push')`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_status_enum" AS ENUM('queued', 'sent', 'failed')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" character varying NOT NULL, "type" character varying NOT NULL, "channel" "public"."notifications_channel_enum" NOT NULL, "payload" jsonb NOT NULL, "status" "public"."notifications_status_enum" NOT NULL DEFAULT 'queued', CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_roles" ("usersId" uuid NOT NULL, "rolesId" uuid NOT NULL, CONSTRAINT "PK_38ffcfb865fc628fa337d9a0d4f" PRIMARY KEY ("usersId", "rolesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_99b019339f52c63ae615358738" ON "user_roles" ("usersId") `);
        await queryRunner.query(`CREATE INDEX "IDX_13380e7efec83468d73fc37938" ON "user_roles" ("rolesId") `);
        await queryRunner.query(`ALTER TABLE "qr_tokens" ADD CONSTRAINT "FK_7c0f8804f86665a40a74158e386" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_df8bda143f8079aed2bbe55342a" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance_records" ADD CONSTRAINT "FK_73dc742eac42ee289715b6d2593" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance_records" ADD CONSTRAINT "FK_21f6cf258d12a2432bd2a8f798d" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_470304681bce2933d3cbb680db8" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_bf3ba3dfa95e2df7388eb4589fd" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "classes" ADD CONSTRAINT "FK_4b7ac7a7eb91f3e04229c7c0b6f" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leave_requests" ADD CONSTRAINT "FK_0cd010879e155a6611f00dc456e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_99b019339f52c63ae6153587380" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_13380e7efec83468d73fc37938e" FOREIGN KEY ("rolesId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_13380e7efec83468d73fc37938e"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_99b019339f52c63ae6153587380"`);
        await queryRunner.query(`ALTER TABLE "leave_requests" DROP CONSTRAINT "FK_0cd010879e155a6611f00dc456e"`);
        await queryRunner.query(`ALTER TABLE "classes" DROP CONSTRAINT "FK_4b7ac7a7eb91f3e04229c7c0b6f"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_bf3ba3dfa95e2df7388eb4589fd"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_470304681bce2933d3cbb680db8"`);
        await queryRunner.query(`ALTER TABLE "attendance_records" DROP CONSTRAINT "FK_21f6cf258d12a2432bd2a8f798d"`);
        await queryRunner.query(`ALTER TABLE "attendance_records" DROP CONSTRAINT "FK_73dc742eac42ee289715b6d2593"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_df8bda143f8079aed2bbe55342a"`);
        await queryRunner.query(`ALTER TABLE "qr_tokens" DROP CONSTRAINT "FK_7c0f8804f86665a40a74158e386"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_13380e7efec83468d73fc37938"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_99b019339f52c63ae615358738"`);
        await queryRunner.query(`DROP TABLE "user_roles"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_channel_enum"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TABLE "verification_tokens"`);
        await queryRunner.query(`DROP TYPE "public"."verification_tokens_type_enum"`);
        await queryRunner.query(`DROP TABLE "leave_balances"`);
        await queryRunner.query(`DROP TABLE "leave_requests"`);
        await queryRunner.query(`DROP TYPE "public"."leave_requests_status_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`DROP TABLE "classes"`);
        await queryRunner.query(`DROP TABLE "enrollments"`);
        await queryRunner.query(`DROP TYPE "public"."enrollments_status_enum"`);
        await queryRunner.query(`DROP TABLE "students"`);
        await queryRunner.query(`DROP TABLE "attendance_records"`);
        await queryRunner.query(`DROP TYPE "public"."attendance_records_source_enum"`);
        await queryRunner.query(`DROP TYPE "public"."attendance_records_status_enum"`);
        await queryRunner.query(`DROP TABLE "sessions"`);
        await queryRunner.query(`DROP TYPE "public"."sessions_qrmode_enum"`);
        await queryRunner.query(`DROP TABLE "qr_tokens"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TYPE "public"."roles_name_enum"`);
    }

}
