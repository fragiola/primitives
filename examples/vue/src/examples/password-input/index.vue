<script setup lang="ts">
import { PasswordInput } from "@fragiola/primitives-vue/password-input";
import { ref } from "vue";
import { styles } from "./styles.ts";

// A sign-in form (spec/password-input.md): the eye button shows and hides the password, keeping
// the focus and the caret in the field; signing in hides it again before the form is read.
const status = ref("");
const signIn = (event: Event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    status.value = `Signed in as ${String(data.get("email"))}.`;
};
</script>

<template>
    <form :class="styles.form" @submit="signIn">
        <label for="email" :class="styles.label">Email</label>
        <input
            id="email"
            name="email"
            type="email"
            autocomplete="username"
            value="ada@example.com"
            :class="styles.email"
        />
        <label for="password" :class="styles.label">Password</label>
        <PasswordInput.Root id="password" name="password" required :class="styles.root">
            <PasswordInput.Input autocomplete="current-password" :class="styles.input" />
            <PasswordInput.VisibilityTrigger aria-label="Show password" :class="styles.visibilityTrigger">
                <svg
                    :class="styles.show"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
                <svg
                    :class="styles.hide"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                    <path d="M3 3l18 18" />
                </svg>
            </PasswordInput.VisibilityTrigger>
        </PasswordInput.Root>
        <button type="submit" :class="styles.submit">Sign in</button>
        <p role="status" :class="styles.status">{{ status }}</p>
    </form>
</template>
