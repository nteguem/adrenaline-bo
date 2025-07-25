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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_DOMAIN}/api/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(postdata),
          }
        );
        const data = await response.json(); // Parse the response data
        return data;
    }catch (err) {
        console.error("Error during login:", err);
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
    console.log("gotresponse:", gotresponse)
    if (gotresponse?.success === false) return { error: gotresponse?.message };
    if (gotresponse?.success === true) {
      const gotUser = {email: gotresponse?.user?.email, name: gotresponse?.user?.username, access: gotresponse?.accessToken};
      await createSession(gotUser);
      redirect("/dashboard");
    }
}