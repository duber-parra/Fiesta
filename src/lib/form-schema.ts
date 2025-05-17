
import { z } from "zod";

// Helper function for WhatsApp validation
export function isValidWhatsapp(val: string | undefined): boolean {
  if (!val) { // If undefined or empty string (since it's optional)
    return true;
  }
  return /^[0-9+\-\s()]*$/.test(val);
}

// Define and export the schema to be the single source of truth
export const rsvpFormSchema = z.object({
  fullName: z.string().min(1, "El nombre completo es requerido."),
  whatsapp: z.string().optional().refine(isValidWhatsapp, {
    message: "Número de WhatsApp inválido.",
  }),
  attending: z.enum(["yes", "no"], {
    required_error: "Por favor selecciona si asistirás o no.",
  }),
  guestNames: z.array( // Made non-optional
    z.string().min(1, "El nombre del acompañante no puede estar vacío si se añade el campo.")
  ),
});

export type RsvpFormState = {
  message: string;
  success: boolean;
  // This type needs to accommodate Zod's fieldErrors structure for arrays,
  // which can be { _errors?: string[], "0"?: string[], "1"?: string[] }
  errors?: Partial<Record<keyof z.infer<typeof rsvpFormSchema>, any | string[]>> & { _form?: string[] };
  submittedData?: z.infer<typeof rsvpFormSchema>;
};
