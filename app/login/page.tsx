"use client";
// import { login } from "@/app/lib/lib";
import { login } from "./actions";
import { Checkbox, FormControlLabel, Typography } from "@mui/material";
import Image from "next/image";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

export default function Page() {
  const [state, action] = useActionState(login, undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const session = await getSession();
  return (
    <section className="login">
      <form action={action} autoComplete="off">
        <div
          className="login-container"
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Image
              //   className={styles.leftSideLogo}
              src="/images/mackk.png"
              width={100}
              height={100}
              alt="Picture of the author"
            />
            <Typography component="h1" variant="h5">
              BackOffice Adrénaline Tour
            </Typography>
            <Typography component="p" variant="body1" sx={{ color: "gray" }}>
              Matt Pokora
            </Typography>
          </div>
          <div
            style={{
              display: "flex",
              // alignItems: "center",
              flexDirection: "column",
              alignSelf: "anchor-center",
              width: "100%",
            }}
          >
            <input
              type="text"
              placeholder={"example@gmail.com"}
              id="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.currentTarget.value)}
              onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
                const input = e.currentTarget;
                setTimeout(() => {
                  setEmail(input.value);
                }, 0);
              }}
              name={"email"}
              autoComplete="off"
              className={` text-white w-full border-1 rounded p-3 mb-3 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300 ${"mb-0"}`}
            />
            {state?.errors?.email && (
              <p className="text-red-500">{state.errors.email}</p>
            )}
            <input
              type="password"
              id="password"
              placeholder={"******"}
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.currentTarget.value)}
              onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
                const input = e.currentTarget;
                setTimeout(() => {
                  setPassword(input.value);
                }, 0);
              }}
              name={"password"}
              autoComplete="new-password"
              className={` text-white w-full border-1 rounded p-3 mb-3 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300 ${"mb-0"}`}
            />
            {state?.errors?.password && (
              <p className="text-red-500">{state.errors.password}</p>
            )}
            <FormControlLabel
              control={<Checkbox value="remember" sx={{ color: "#4a5565" }} />}
              label="Remember me"
            />
            {state?.error && <p className="text-red-500">{state.error}</p>}
            <SubmitButton />
          </div>
        </div>
      </form>
      {/* <pre>{JSON.stringify(session, null, 2)}</pre> */}
    </section>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <div>
      {!pending ? (
        <button
          disabled={pending}
          type="submit"
          style={{ cursor: "pointer" }}
          className={` text-white w-full border-1 rounded p-3 mb-3 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300 ${"mb-0"}`}
        >
          Se connecter
        </button>
      ) : (
        <p className="text-center">Connexion...</p>
      )}
    </div>
  );
}