import { redirect } from '@sveltejs/kit';
import { HOST, DOMAIN } from '../../consts';

export const load = async ({ params }) => {
	const path = params.file;
	throw redirect(307, new URL(path, HOST).href);
};