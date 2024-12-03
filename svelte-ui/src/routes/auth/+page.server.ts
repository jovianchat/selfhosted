import { redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import { deleteJwtCookies, setJwtCookies } from '$lib/jwtCookies';

export const load: PageServerLoad = async (event) => {
	const refresh_token = event.cookies.get('refresh_token');
	const expiration = event.cookies.get('refresh_token_expiration');
	const currentTime = Math.ceil(Date.now() / 1000);
	if (refresh_token && expiration && Number(expiration) > currentTime) {
		return redirect(302, '/');
	}
};
export const actions = {
	login: async ({ fetch, cookies, request }) => {
		const data = await request.formData();
		const password = data.get('password') as string;
		const res = await fetch('/axum-api/auth/sign-in', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(password)
		});
		if (!res.ok) {
			return { error: res.statusText };
		} else {
			const { refresh, access }: AuthTokens = await res.json();
			setJwtCookies(cookies, 'refresh_token', refresh!.token);
			setJwtCookies(cookies, 'refresh_token_expiration', refresh!.expiration.toString());
			setJwtCookies(cookies, 'access_token', access!.token);
			setJwtCookies(cookies, 'access_token_expiration', access!.expiration.toString());
			return redirect(303, '/');
		}
	},
	logout: async ({ cookies }) => {
		deleteJwtCookies(cookies);
		return redirect(303, '/auth');
	}
};
