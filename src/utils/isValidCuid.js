import { z } from 'zod';
import { isCuid } from '@paralleldrive/cuid2';

export const isValidCuid = (id) => {
    const CuidSchema = z.string().refine(isCuid, {
        message: "Invalid id format"
    });

    const isValid = CuidSchema.safeParse(id).success;
    return isValid;
}