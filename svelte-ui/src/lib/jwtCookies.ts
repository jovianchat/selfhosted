import type { Cookies } from '@sveltejs/kit';

export function deleteJwtCookies(cookies: Cookies) {
	deleteCookies(cookies, 'refresh_token');
	deleteCookies(cookies, 'refresh_token_expiration');
	deleteCookies(cookies, 'access_token');
	deleteCookies(cookies, 'access_token_expiration');
}
export function setJwtCookies(cookies: Cookies, cookieName: string, cookieValue: string) {
	cookies.set(cookieName, cookieValue, {
		path: '/',
		httpOnly: true,
		// secure: !dev,
		secure: false,
		sameSite: 'strict'
	});
}
function deleteCookies(cookies: Cookies, cookieName: string) {
	cookies.delete(cookieName, { path: '/', httpOnly: true, secure: false, sameSite: 'strict' });
}
