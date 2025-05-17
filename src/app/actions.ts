
"use server";

import type { RsvpFormState } from "@/lib/form-schema";
import { rsvpFormSchema } from "@/lib/form-schema";
import type { z } from "zod";

console.log("!!!!!!!! MODULE actions.ts LOADED ON SERVER ( dovrebbe apparire all'avvio del server o al primo accesso ) !!!!!!!!");

const GOOGLE_SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzRmBhm6Yp-uh89kSyw6nAjI-ZpTzml0RpEJHLtvXBu03jFSURjDX4IDOnzSc25V6VFwQ/exec";

export async function submitRsvp(prevState: RsvpFormState, data: z.infer<typeof rsvpFormSchema>): Promise<RsvpFormState> {
  console.log("!!!!!!!! SERVER ACTION submitRsvp ENTERED ( dovrebbe apparire ad ogni invio ) !!!!!!!!");
  console.log("[submitRsvp Action] Received data object:", data);

  const validatedFields = rsvpFormSchema.safeParse(data);

  if (!validatedFields.success) {
    console.error("[submitRsvp Action] Zod validation failed:", validatedFields.error.flatten().fieldErrors);
    return {
      message: "Por favor corrige los errores en el formulario.",
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  console.log("[submitRsvp Action] Zod validation successful. Data:", validatedFields.data);

  const dataToSubmit = {
    ...validatedFields.data,
    guestNames: validatedFields.data.guestNames ? validatedFields.data.guestNames.filter(name => typeof name === 'string' && name.trim() !== "") : [],
  };


  if (GOOGLE_SHEET_WEB_APP_URL === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE" || !GOOGLE_SHEET_WEB_APP_URL.startsWith("https://script.google.com/")) {
    const warningMessage = GOOGLE_SHEET_WEB_APP_URL === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE"
      ? "La integración con Google Sheets no está configurada. Reemplaza la URL placeholder en actions.ts."
      : "La URL de Google Sheets en actions.ts no parece ser válida. Por favor, verifica.";
    console.warn(`[submitRsvp Action] RSVP Data (not sent, ${warningMessage}):`, dataToSubmit);
    
    const simulatedThankYouMessage = dataToSubmit.attending === "yes"
      ? "¡Gracias por confirmar tu asistencia! Te esperamos con alegría en la celebración."
      : "Lamentamos que no puedas asistir. ¡Gracias por responder!";

    return {
      message: `${simulatedThankYouMessage} (Nota: ${warningMessage})`,
      success: true,
      submittedData: dataToSubmit,
    };
  }

  try {
    console.log("[submitRsvp Action] Attempting to submit to Google Sheet URL:", GOOGLE_SHEET_WEB_APP_URL);
    console.log("[submitRsvp Action] Data being sent to Google Sheet:", JSON.stringify(dataToSubmit));
    const response = await fetch(GOOGLE_SHEET_WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSubmit), 
    });
    console.log("[submitRsvp Action] Google Sheet API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[submitRsvp Action] Google Sheet API Error. Status:", response.status, "Body:", errorText);
      let errorDataMessage = `Error del servidor: ${response.statusText || 'Error desconocido'}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorDataMessage = errorJson.message || errorJson.error || response.statusText || 'Error procesando respuesta del servidor.';
      } catch (e) {
        errorDataMessage = errorText || response.statusText || 'Error en la respuesta del servidor.';
      }
      return {
        message: `Hubo un problema al guardar tu confirmación en Google Sheets: ${errorDataMessage}. Por favor, intenta de nuevo o contacta al organizador.`,
        success: false,
        errors: { _form: [`Error del servidor: ${errorDataMessage}`] },
      };
    }

    const result = await response.json();
    console.log("[submitRsvp Action] Google Sheet API Success:", result);

    const thankYouMessage = dataToSubmit.attending === "yes"
      ? "¡Gracias por confirmar tu asistencia! Te esperamos con alegría en la celebración."
      : "Lamentamos que no puedas asistir. ¡Gracias por responder!";

    return {
      message: `${thankYouMessage} Tu respuesta ha sido registrada.`,
      success: true,
      submittedData: dataToSubmit,
    };

  } catch (error) {
    console.error("[submitRsvp Action] Network or other error submitting to Google Sheet:", error);
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
