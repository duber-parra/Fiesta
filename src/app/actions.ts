
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

// !!! IMPORTANT: REPLACE THIS WITH YOUR ACTUAL GOOGLE APPS SCRIPT WEB APP URL !!!
const GOOGLE_SHEET_WEB_APP_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE"; 
// Example: "https://script.google.com/macros/s/ABCDEFG1234567/exec"

export async function submitRsvp(prevState: RsvpFormState, formData: FormData): Promise<RsvpFormState> {
  
  const tempGuestNames: { index: number, value: string }[] = [];
  for (const [key, value] of formData.entries()) {
    const match = key.match(/^guestNames\.(\d+)$/);
    if (match && typeof value === 'string') {
      tempGuestNames.push({ index: parseInt(match[1], 10), value: value });
    }
  }
  tempGuestNames.sort((a, b) => a.index - b.index);
  const guestNamesArray = tempGuestNames.map(item => item.value).filter(name => name.trim() !== ""); // Filter out empty strings

  const rawFormData = {
    fullName: formData.get("fullName"),
    whatsapp: formData.get("whatsapp"),
    attending: formData.get("attending"),
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

  const dataToSubmit = validatedFields.data;

  // Check if the placeholder URL is still there
  if (GOOGLE_SHEET_WEB_APP_URL === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE") {
    console.warn("RSVP Data (not sent, using placeholder URL):", dataToSubmit);
    const thankYouMessage = dataToSubmit.attending === "yes" 
      ? "¡Gracias por confirmar tu asistencia! Nos vemos en la celebración."
      : "Lamentamos que no puedas asistir. ¡Gracias por responder!";
    
    return {
      message: `${thankYouMessage} (Nota: La integración con Google Sheets no está configurada completamente. Reemplaza la URL en actions.ts).`,
      success: true, // Simulate success for UI purposes
      submittedData: dataToSubmit,
    };
  }

  try {
    const response = await fetch(GOOGLE_SHEET_WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSubmit), // Send all validated data
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Error al contactar el servicio de Google Sheets." }));
      console.error("Google Sheet API Error:", errorData);
      return {
        message: `Hubo un problema al guardar tu confirmación en Google Sheets: ${errorData.message || response.statusText}. Por favor, intenta de nuevo o contacta al organizador.`,
        success: false,
        errors: { _form: [`Error del servidor: ${errorData.message || response.statusText}`] },
      };
    }

    const result = await response.json();
    console.log("Google Sheet API Success:", result);

    const thankYouMessage = dataToSubmit.attending === "yes" 
      ? "¡Gracias por confirmar tu asistencia! Nos vemos en la celebración."
      : "Lamentamos que no puedas asistir. ¡Gracias por responder!";

    return {
      message: `${thankYouMessage} Tu respuesta ha sido registrada.`,
      success: true,
      submittedData: dataToSubmit,
    };

  } catch (error) {
    console.error("Network or other error submitting to Google Sheet:", error);
    let errorMessage = "Ocurrió un error de red o desconocido al enviar tu confirmación.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      message: `Error: ${errorMessage}. Por favor, intenta de nuevo o contacta al organizador.`,
      success: false,
      errors: { _form: [errorMessage] },
    };
  }
}
