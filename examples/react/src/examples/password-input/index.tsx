import { PasswordInput } from "@fragiola/primitives-react/password-input";
import { useState } from "react";
import { styles } from "./styles.ts";

// A sign-in form (spec/password-input.md): the eye button shows and hides the password, keeping
// the focus and the caret in the field; signing in hides it again before the form is read.
export default function SignInForm() {
    const [status, setStatus] = useState("");
    return (
        <form
            className={styles.form}
            onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                setStatus(`Signed in as ${String(data.get("email"))}.`);
            }}
        >
            <label htmlFor="email" className={styles.label}>
                Email
            </label>
            <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                defaultValue="ada@example.com"
                className={styles.email}
            />
            <label htmlFor="password" className={styles.label}>
                Password
            </label>
            <PasswordInput.Root
                id="password"
                name="password"
                required
                className={styles.root}
            >
                <PasswordInput.Input
                    autoComplete="current-password"
                    className={styles.input}
                />
                <PasswordInput.VisibilityTrigger
                    aria-label="Show password"
                    className={styles.visibilityTrigger}
                >
                    <svg
                        className={styles.show}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                    >
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                    <svg
                        className={styles.hide}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                    >
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                        <path d="M3 3l18 18" />
                    </svg>
                </PasswordInput.VisibilityTrigger>
            </PasswordInput.Root>
            <button type="submit" className={styles.submit}>
                Sign in
            </button>
            <p role="status" className={styles.status}>
                {status}
            </p>
        </form>
    );
}
