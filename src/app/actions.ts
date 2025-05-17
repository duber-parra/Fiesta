
"use server";

import { z } from "zod";

const rsvpFormSchema = z.object({
  fullName: z.string().min(1, "El nombre completo es requerido."),
  whatsapp: z.string().optional().refine(val => !val || /^[0-9+\-\s()]*$/.test(val), {
    message: "Número de WhatsApp inválido.",
  }),
  attending: z.enum(["yes", "no"]),
  guestNames: z.array(
    z.string().min(1, "El nombre del acompañante no puede estar vacío si se añade el campo.")
  ).optional(),
});

export type RsvpFormState = {
  message: string;
  success: boolean;
  // This type needs to accommodate Zod's fieldErrors structure for arrays, 
  // which can be { _errors?: string[], "0"?: string[], "1"?: string[] }
  errors?: Partial<Record<keyof z.infer<typeof rsvpFormSchema>, any | string[]>> & { _form?: string[] };
  submittedData?: z.infer<typeof rsvpFormSchema>;
};

export async function submitRsvp(prevState: RsvpFormState, formData: FormData): Promise<RsvpFormState> {
  
  const tempGuestNames: { index: number, value: string }[] = [];
  for (const [key, value] of formData.entries()) {
    // react-hook-form names field array inputs like "guestNames.0", "guestNames.1", etc.
    const match = key.match(/^guestNames\.(\d+)$/);
    if (match && typeof value === 'string') {
      tempGuestNames.push({ index: parseInt(match[1], 10), value: value });
    }
  }
  // Sort by index to ensure correct order, as FormData iteration order isn't strictly guaranteed for all keys
  tempGuestNames.sort((a, b) => a.index - b.index);
  const guestNamesArray = tempGuestNames.map(item => item.value);
  // Empty strings submitted from empty fields will be validated by Zod's .min(1)

  const rawFormData = {
    fullName: formData.get("fullName"),
    whatsapp: formData.get("whatsapp"),
    attending: formData.get("attending"),
    // Pass the array; if no guests were added, it will be empty, which is fine for .optional()
    // If guests were added but names are empty, Zod's .min(1) on the string will catch it.
    guestNames: guestNamesArray.length > 0 ? guestNamesArray : undefined,
  };

  const validatedFields = rsvpFormSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      message: "Por favor corrige los errores en el formulario.",
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const data = validatedFields.data;

  // In a real application, you would send this data to a Google Sheet, database, email, etc.
  // For this example, we'll just log it to the server console.
  console.log("RSVP Submitted:", data);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // You can customize the success message based on attendance
  const thankYouMessage = data.attending === "yes" 
    ? "¡Gracias por confirmar tu asistencia! Nos vemos en la celebración."
    : "Lamentamos que no puedas asistir. ¡Gracias por responder!";

  return {
    message: `${thankYouMessage} Esperamos que todo marche bien para ti.`,
    success: true,
    submittedData: data,
  };
}

    