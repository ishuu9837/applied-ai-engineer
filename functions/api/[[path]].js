// Cloudflare Pages Functions: same-origin /api/* route (runs on Workers).
import api from '../../worker/index.mjs';
export async function onRequest(context){return api.fetch(context.request,context.env);}
