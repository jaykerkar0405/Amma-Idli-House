import { createAuthClient } from 'better-auth/svelte';
import { PUBLIC_BETTER_AUTH_URL } from '$env/static/public';
import { phoneNumberClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
	plugins: [phoneNumberClient()],
	baseURL: PUBLIC_BETTER_AUTH_URL
});

export const { signIn, signUp, signOut, useSession } = authClient;
