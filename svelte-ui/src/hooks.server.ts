import { dev } from '$app/environment';
import { type HandleFetch } from '@sveltejs/kit';
import { setJwtCookies } from '$lib/jwtCookies';

export const handleFetch: HandleFetch = async ({ request, fetch, event }) => {
	/**
	 * Need to proxy the /axum-api requests to the local axum server because sveltekit server fetch is different than normal fetch and doesnt go through client to protect secrets so reverse proxy cant handle it
	 */
	let axumApiUrl = '/axum-api';
	if (!dev) {
		axumApiUrl = 'http://127.0.0.1:5000'; // Backend server instead of reverse proxy so it  goes from server to server instead of via client
		// Replace /axum-api with the proxy url
		const requestUrl = new URL(request.url);
		if (requestUrl.pathname.startsWith('/axum-api')) {
			request = new Request(request.url.replace(requestUrl.origin, axumApiUrl).replace('/axum-api', ''), request); // Also replace /axum-api because direct calling will have this otherwise reverse proxy would have stripped it
		}
	}
	// Send fetch request forward
	// Auth page going forward is login authentication so no need to check for auth
	if (event.url.pathname === '/auth') return fetch(request);

	const authTokens: AuthTokens = {
		refresh: {
			token: event.cookies.get('refresh_token')!,
			expiration: Number(event.cookies.get('refresh_token_expiration'))
		},
		access: {
			token: event.cookies.get('access_token')!,
			expiration: Number(event.cookies.get('access_token_expiration'))
		}
	};
	const currentTime = Math.ceil(Date.now() / 1000);
	const expiryInTwoDays = 2 * 24 * 60 * 60;
	const expiryInTenMins = 10 * 60;

	if (!authTokens.refresh?.token || authTokens.refresh?.expiration < currentTime) {
		throw new Error('Refresh token expired and failed to logout user'); // If invalid refresh token looged out at (signedInUser)/+layout.server.ts
	}
	//Get new access token if not exist or less than 10 mins and refresh token is valid, need to be above refresh token renew so can get access token with old refresh token and then refresh using new access token
	if (!authTokens.access?.token || authTokens.access.expiration - currentTime < expiryInTenMins) {
		const res = await fetch(`${axumApiUrl}/auth/new-access-token`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(authTokens.refresh.token)
		});
		if (!res.ok) {
			throw new Error(await res.text());
		}
		const { access }: AuthTokens = await res.json();
		setJwtCookies(event.cookies, 'access_token', access!.token);
		setJwtCookies(event.cookies, 'access_token_expiration', access!.expiration.toString());
		authTokens.access = access!;
	}
	// Renew refresh token if less than 2 days
	if (authTokens.refresh.expiration - currentTime < expiryInTwoDays) {
		const res = await fetch(`${axumApiUrl}/auth/new-refresh-token`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authTokens.access.token}`
			},
			body: JSON.stringify(authTokens.refresh.token)
		});
		if (!res.ok) {
			throw new Error(await res.text());
		} else {
			const { refresh }: AuthTokens = await res.json();
			setJwtCookies(event.cookies, 'refresh_token', refresh!.token);
			setJwtCookies(event.cookies, 'refresh_token_expiration', refresh!.expiration.toString());
			authTokens.refresh = refresh!;
		}
	}

	// Just to refresh tokens without calling api
	// hooks_fetchHandler api route does exist and can connect to api if returned fetch instead of response
	if (event.url.pathname === '/hooks_fetchHandler') return new Response('OK', { status: 200 });

	// Add the access token to the request and send it
	request.headers.set('Authorization', `Bearer ${authTokens.access.token}`);
	return fetch(request);
};
