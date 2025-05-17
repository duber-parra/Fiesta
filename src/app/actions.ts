
"use server";

import type { RsvpFormState } from "@/lib/form-schema";
import { rsvpFormSchema } from "@/lib/form-schema";
import type { z } from "zod";


const GOOGLE_SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzRmBhm6Yp-uh89kSyw6nAjI-ZpTzml0RpEJHLtvXBu03jFSURjDX4IDOnzSc25V6VFwQ/exec";

export async function submitRsvp(prevState: RsvpFormState, formData: FormData): Promise<RsvpFormState> {
  console.log("[submitRsvp Action] Received formData. Full Name:", formData.get("fullName"));

  // Correctly parse guestNames from FormData
  const tempGuestNames: { index: number, value: string }[] = [];
  for (const [key, value] of formData.entries()) {
    const match = key.match(/^guestNames\.(\d+)$/); // Matches guestNames.0, guestNames.1, etc.
    if (match && typeof value === 'string') {
      tempGuestNames.push({ index: parseInt(match[1], 10), value: value });
    }
  }
  // Sort by index to maintain order and filter out empty names submitted by react-hook-form if field is empty
  tempGuestNames.sort((a, b) => a.index - b.index);
  const guestNamesArray = tempGuestNames.map(item => item.value).filter(name => name.trim() !== "");


  const rawFormData = {
    fullName: formData.get("fullName"),
    whatsapp: formData.get("whatsapp"),
    attending: formData.get("attending"),
    // Only include guestNames if there are actual names, otherwise Zod might fail if it's an empty array but expecting undefined
    guestNames: guestNamesArray.length > 0 ? guestNamesArray : undefined,
  };
  console.log("[submitRsvp Action] Parsed rawFormData for Zod:", rawFormData);

  const validatedFields = rsvpFormSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    console.error("[submitRsvp Action] Zod validation failed:", validatedFields.error.flatten().fieldErrors);
    return {
      message: "Por favor corrige los errores en el formulario.",
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  console.log("[submitRsvp Action] Zod validation successful. Data:", validatedFields.data);

  const dataToSubmit = validatedFields.data;

  // Check if the URL is the placeholder. If it is, simulate success without actual submission.
  if (GOOGLE_SHEET_WEB_APP_URL === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE") {
    console.warn("[submitRsvp Action] RSVP Data (not sent, using placeholder URL):", dataToSubmit);
    const thankYouMessage = dataToSubmit.attending === "yes"
      ? "¡Gracias por confirmar tu asistencia! Nos vemos en la celebración."
      : "Lamentamos que no puedas asistir. ¡Gracias por responder!";

    return {
      message: `${thankYouMessage} (Nota: La integración con Google Sheets no está configurada completamente. Reemplaza la URL en actions.ts).`,
      success: true,
      submittedData: dataToSubmit,
    };
  }

  try {
    console.log("[submitRsvp Action] Attempting to submit to Google Sheet URL:", GOOGLE_SHEET_WEB_APP_URL);
    const response = await fetch(GOOGLE_SHEET_WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSubmit), // Send validated data
    });
    console.log("[submitRsvp Action] Google Sheet API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[submitRsvp Action] Google Sheet API Error. Status:", response.status, "Body:", errorText);
      let errorDataMessage = `Error del servidor: ${response.statusText || 'Error desconocido'}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorDataMessage = errorJson.message || response.statusText || 'Error procesando respuesta del servidor.';
      } catch (e) {
        // If parsing error body as JSON fails, use the raw text or statusText
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

    // Refined thank you messages
    const thankYouMessage = dataToSubmit.attending === "yes"
      ? "¡Gracias por confirmar tu asistencia! Nos vemos en la celebración."
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
