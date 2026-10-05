ALTER TABLE "user" RENAME COLUMN "refresh_token" TO "refresh_token_hash";

-- Existing values are raw refresh tokens. Revoke them instead of preserving
-- sensitive data under the new hash-only column contract.
UPDATE "user" SET "refresh_token_hash" = NULL;
