import { fail, redirect } from '@sveltejs/kit';
import { HOST, DOMAIN } from '../../consts';

export const load = async (config) => {
	const slug = config.params.slug;
	const request = config.request;

	const referer = request.headers.get('referer');
	const userAgent = request.headers.get('user-agent');
	console.log('referer:', referer, ' userAgent', userAgent);
	if (!userAgent?.includes?.('face') && userAgent.match(/FBAN|FBAV/i) && referer?.includes?.('facebook.com')) {
		throw redirect(307, new URL(slug, HOST).href);
	}

	const res = await fetch(`${HOST}wp-json/wp/v2/posts/?slug=${slug}`);
	const [data] = await res.json();

	const headJson = data.yoast_head_json;
	
	const title = data.title.rendered;

	const featuredImageUrl = new URL(headJson?.og_image?.[0]?.url);
	const ogImageUrl = new URL(featuredImageUrl.pathname, DOMAIN).href;

	const imageUrls =
		Array.from(
			new Set(
				data.content.rendered.match(/wp\-content\/uploads[\d\-\/\.]+\.\w+/g
			))
		)
		.map(url => HOST + url);
	imageUrls.splice(0, 1, ogImageUrl);
	
	
	const meta = [
		// ['og:locale', headJson.og_locale],
		['og:type', 'article'],
		['og:title', title],
		['og:description', '...'],
		['og:url', request.url],
		// ['og:site_name', ''],
		// ['article:section', 'Animal'],
		['og:image', ogImageUrl],
		['og:image:alt', title],
		
	];
	return {
		title,
		meta,
		imageUrls,
	};
};

export const actions = {
	update: async ({ request, cookies }) => {
	},
	enter: async ({ request, cookies }) => {
	},
	restart: async ({ cookies }) => {
	}
};
