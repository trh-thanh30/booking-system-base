import { parsePhoneNumberWithError } from "libphonenumber-js/max";
import { z } from "zod";

/** Optional international phone number, validated and stored as canonical E.164. */
export const optionalInternationalPhoneSchema = z
  .string()
  .trim()
  .max(40)
  .transform((value, context) => {
    if (!value) return undefined;
    try {
      const phone = parsePhoneNumberWithError(value, { extract: false });
      if (phone.isValid()) return phone.number;
    } catch {
      // Invalid calling codes and incomplete numbers are reported as field errors.
    }
    context.addIssue({
      code: "custom",
      message: "Invalid international phone number",
    });
    return z.NEVER;
  })
  .optional();
