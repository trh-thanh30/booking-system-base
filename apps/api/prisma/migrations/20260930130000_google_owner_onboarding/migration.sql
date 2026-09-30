-- OAuth-only users authenticate through UserIdentity and do not require a local password.
ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL;
