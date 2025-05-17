"use server";

import { z } from "zod";

const rsvpFormSchema = z.object({
  fullName: z.string().min(1, "El nombre completo es requerido."),
  whatsapp: z.string().optional().refine(val => !val || /^[0-9+\-\s()]*$/.test(val), {
    message: "Número de WhatsApp inválido.",
  }),
  attending: z.enum(["yes", "no"]),
  guestName: z.string().optional(),
});

export type RsvpFormState = {
  message: string;
  success: boolean;
  errors?: Partial<Record<keyof z.infer<typeof rsvpFormSchema> | "_form", string[]>>;
  submittedData?: z.infer<typeof rsvpFormSchema>;
};

export async function submitRsvp(prevState: RsvpFormState, formData: FormData): Promise<RsvpFormState> {
  const rawFormData = {
    fullName: formData.get("fullName"),
    whatsapp: formData.get("whatsapp"),
    attending: formData.get("attending"),
    guestName: formData.get("guestName"),
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
