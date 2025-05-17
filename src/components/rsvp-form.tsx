"use client";

import type { ChangeEvent} from 'react';
import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Send, Loader2, CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { submitRsvp, type RsvpFormState } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

const rsvpFormSchema = z.object({
  fullName: z.string().min(1, { message: "El nombre completo es requerido." }),
  whatsapp: z.string().optional().refine(val => !val || /^[0-9+\-\s()]*$/.test(val), {
    message: "Número de WhatsApp inválido.",
  }),
  attending: z.enum(["yes", "no"], {
    required_error: "Por favor selecciona si asistirás o no.",
  }),
  guestName: z.string().optional(),
});

type RsvpFormData = z.infer<typeof rsvpFormSchema>;

const initialState: RsvpFormState = {
  message: "",
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
      {pending ? (
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
  const [state, formAction] = useFormState(submitRsvp, initialState);
  const [showGuestNameInput, setShowGuestNameInput] = useState(false);
  const { toast } = useToast();

  const form = useForm<RsvpFormData>({
    resolver: zodResolver(rsvpFormSchema),
    defaultValues: {
      fullName: "",
      whatsapp: "",
      guestName: "",
    },
  });

  const watchAttending = form.watch("attending");

  useEffect(() => {
    if (watchAttending === "no") {
      setShowGuestNameInput(false);
      form.setValue("guestName", "");
    }
  }, [watchAttending, form]);
  
  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "¡Confirmación Enviada!",
          description: state.message,
          variant: "default",
          action: <CheckCircle2 className="text-green-500" />,
        });
        form.reset();
        setShowGuestNameInput(false);
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
            const fieldKey = key === "_form" ? undefined : key; // For general form errors, react-hook-form doesn't have a direct way to setRootError from server.
                                                               // We'll rely on the toast for general errors.
            if (fieldKey && state.errors && state.errors[fieldKey]) {
                 form.setError(fieldKey as keyof RsvpFormData, { type: "server", message: state.errors[fieldKey]?.[0] });
            }
          });
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, toast]); // form should not be in deps to avoid re-triggering on form object change

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center text-primary">Formulario de Confirmación</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form action={formAction} className="space-y-6">
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
                          setShowGuestNameInput(false);
                          form.setValue("guestName", "");
                        }
                      }}
                      value={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="yes" id="attending-yes" />
                        </FormControl>
                        <FormLabel htmlFor="attending-yes" className="font-normal cursor-pointer">
                          Sí, ¡allí estaré!
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="no" id="attending-no" />
                        </FormControl>
                        <FormLabel htmlFor="attending-no" className="font-normal cursor-pointer">
                          No podré asistir.
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchAttending === "yes" && (
              <>
                {!showGuestNameInput && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary/10"
                    onClick={() => setShowGuestNameInput(true)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Agregar acompañante +
                  </Button>
                )}

                {showGuestNameInput && (
                  <FormField
                    control={form.control}
                    name="guestName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Acompañante (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre de tu acompañante" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
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
         <div className="p-4 mt-4 text-center bg-green-100 border border-green-300 text-green-700 rounded-md">
            <p>{state.message}</p>
         </div>
      )}
      <div className="p-6 text-center text-sm text-muted-foreground">
        <p className="font-semibold">Aviso Importante:</p>
        <p>Una vez envíes tu confirmación, recibirás un mensaje agradeciendo tu respuesta. ¡Esperamos contar contigo para celebrar a Jorge Enrique!</p>
      </div>
    </Card>
  );
}
