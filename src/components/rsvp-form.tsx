
"use client";

import type { ChangeEvent} from 'react';
import { useState, useEffect, useActionState } from "react";
import { useForm, useFieldArray, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { UserPlus, Send, Loader2, CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { submitRsvp } from "@/app/actions";
import type { RsvpFormState } from "@/lib/form-schema";
import { rsvpFormSchema } from "@/lib/form-schema";
import { useToast } from "@/hooks/use-toast";


type RsvpFormData = z.infer<typeof rsvpFormSchema>;

const initialState: RsvpFormState = {
  message: "",
  success: false,
  errors: {},
};

function SubmitButton() {
  const { formState: { isSubmitting } } = useFormContext<RsvpFormData>();

  return (
    <Button type="submit" disabled={isSubmitting} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Enviando...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          Enviar Confirmación
        </>
      )}
    </Button>
  );
}

export function RsvpForm() {
  const [state, formAction] = useActionState(submitRsvp, initialState);
  const { toast } = useToast();

  const form = useForm<RsvpFormData>({
    resolver: zodResolver(rsvpFormSchema),
    defaultValues: {
      fullName: "",
      whatsapp: "",
      attending: undefined,
      guestNames: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "guestNames",
  });

  const watchAttending = form.watch("attending");

  useEffect(() => {
    if (watchAttending === "no") {
      remove(); // Clears all guest name fields
    }
  }, [watchAttending, remove]);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "¡Confirmación Enviada!",
          description: state.message, // This message will come from the server action
          variant: "default",
          action: <CheckCircle2 className="text-green-500" />,
        });
        form.reset({
          fullName: "",
          whatsapp: "",
          attending: undefined,
          guestNames: []
        });
      } else {
        toast({
          title: "Error en la Confirmación",
          description: state.message || "Hubo un problema al enviar tu confirmación. Intenta de nuevo.",
          variant: "destructive",
          action: <XCircle className="text-red-500" />,
        });
        if (state.errors) {
          type FormFieldKey = keyof RsvpFormData | "_form";
          (Object.keys(state.errors) as FormFieldKey[]).forEach((key) => {
            const fieldKey = key === "_form" ? undefined : key;
            if (fieldKey && state.errors && state.errors[fieldKey]) {
                 const errorMessages = state.errors[fieldKey];
                 let messageToShow: string | undefined;
                 if (typeof errorMessages === 'object' && errorMessages !== null && !Array.isArray(errorMessages)) {
                    messageToShow = (errorMessages as any)._errors?.[0] || Object.values(errorMessages as any).flat()?.[0] as string | undefined;
                 } else if (Array.isArray(errorMessages)) {
                    messageToShow = errorMessages[0];
                 }

                 if (messageToShow) {
                    form.setError(fieldKey as keyof RsvpFormData, { type: "server", message: messageToShow });
                 } else if (typeof errorMessages === 'string') {
                    form.setError(fieldKey as keyof RsvpFormData, { type: "server", message: errorMessages });
                 }
            }
          });
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, toast, form]);

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center text-primary">Formulario de Confirmación</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form
          action={formAction}
          onSubmit={form.handleSubmit(
            () => {
              // Client-side validation passed. Native form submission will proceed, triggering `formAction`.
              console.log("[RsvpForm] Client-side validation passed. Native form submission should proceed.");
            },
            (errors) => {
              // Client-side validation failed. react-hook-form will display errors.
              console.error("[RsvpForm] Client-side validation failed:", JSON.stringify(errors, null, 2));
            }
          )}
          className="space-y-6"
        >
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu nombre completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de WhatsApp (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="Ej: +57 300 123 4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="attending"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>¿Asistirás?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value: "yes" | "no") => {
                        field.onChange(value);
                        if (value === "no") {
                          remove(); // Clear guest names if "no"
                        }
                      }}
                      value={field.value}
                      className="flex flex-col space-y-3"
                    >
                      <FormItem className="border rounded-lg hover:bg-muted/80 transition-colors">
                        <FormLabel
                          htmlFor="attending-yes"
                          className="flex w-full cursor-pointer flex-row items-center space-x-4 p-4 text-base font-medium"
                        >
                          <RadioGroupItem value="yes" id="attending-yes" className="h-6 w-6" />
                          <span>Sí, ¡allí estaré!</span>
                        </FormLabel>
                      </FormItem>
                      <FormItem className="border rounded-lg hover:bg-muted/80 transition-colors">
                        <FormLabel
                          htmlFor="attending-no"
                          className="flex w-full cursor-pointer flex-row items-center space-x-4 p-4 text-base font-medium"
                        >
                          <RadioGroupItem value="no" id="attending-no" className="h-6 w-6" />
                          <span>No podré asistir.</span>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchAttending === "yes" && (
              <div className="space-y-4 pt-2 border-t border-border">
                <FormLabel className="pt-2 block">Acompañantes (Opcional)</FormLabel>
                {fields.map((item, index) => (
                  <FormField
                    control={form.control}
                    key={item.id}
                    name={`guestNames.${index}`} // Use dot notation for array field names
                    render={({ field: guestField }) => ( // Renamed field to guestField to avoid conflict
                      <FormItem>
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <Input placeholder={`Nombre del acompañante ${index + 1}`} {...guestField} />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="text-destructive hover:text-destructive/80 flex-shrink-0"
                            aria-label={`Eliminar acompañante ${index + 1}`}
                          >
                            <XCircle className="h-5 w-5" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append("")} // Add an empty string for a new guest
                  className="mt-2 flex items-center"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Agregar Acompañante
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <SubmitButton />
            {state?.message && !state.success && state.errors?._form && (
              <p className="text-sm font-medium text-destructive">{state.errors._form.join(', ')}</p>
            )}
          </CardFooter>
        </form>
      </Form>
      {state.success && state.message && (
         <div className="p-4 mt-4 text-center bg-green-100 border border-green-300 text-green-700 rounded-md mx-6 mb-2">
            <p>{state.message}</p>
         </div>
      )}
      <div className="p-6 pt-0 text-center text-sm text-muted-foreground">
        <p className="font-semibold">Aviso Importante:</p>
        <p>Una vez envíes tu confirmación, recibirás un mensaje agradeciendo tu respuesta. ¡Esperamos contar contigo para celebrar a Jorge Enrique!</p>
      </div>
    </Card>
  );
}
