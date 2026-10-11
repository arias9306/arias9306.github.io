import type { APIRoute } from 'astro';
import { renderOgPng } from '../../lib/ogImage';
import { site } from '../../consts';

export const GET: APIRoute = async () => {
  const png = await renderOgPng({
    title: site.motto,
    description: site.description,
    siteName: site.title,
    author: site.author,
  });

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
