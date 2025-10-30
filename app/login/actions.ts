"use server"
import { redirect } from "next/navigation";
import { createSession } from "../lib/sessions";
import {z} from 'zod';

const loginSchema = z.object({
    email: z.string().email({message: "Addresse e-mail invalide"}).trim(),
    password: z.string().min(5, {message: "Le mot de passe doit être de 5 caractères"}).trim(),
})

export async function apiLogin(formData: FormData) {
    try {
        const postdata = {email: formData.get("email"), password: formData.get("password")}
        const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3001";
        const response = await fetch(
          `${baseUrl}/api/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(postdata),
          }
        );
        // Handle non-200 responses
        const data = await response.json().catch(() => null);
        if (!response.ok) {
            return {
                success: false,
                message: data?.message || `Erreur d'authentification (${response.status})`
            };
        }
        return data || { success: false, message: "Réponse invalide du service d'authentification" };
    }catch (err) {
        console.error("Error during login:", err);
        return { success: false, message: "Impossible de joindre le service d'authentification" };
    }
}

export async function login(prevState: any, formData: FormData) {
  // Verify credentials && get the user
    const result = loginSchema.safeParse(Object.fromEntries(formData));
    if(!result.success){
        return {
            errors: result.error.flatten().fieldErrors
        }
    }
    const gotresponse = await apiLogin(formData);
    if (!gotresponse) return { error: "Réponse invalide du service d'authentification" };
    if (gotresponse?.success === false) return { error: gotresponse?.message || "Échec de l'authentification" };
    if (gotresponse?.success === true) {
      const gotUser = {email: gotresponse?.user?.email, name: gotresponse?.user?.username, access: gotresponse?.accessToken};
      await createSession(gotUser);
      redirect("/dashboard");
    }
    return { error: "Échec de l'authentification" };
}