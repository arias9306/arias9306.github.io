import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, render } from 'astro:content';
import { renderOgPng } from '../../lib/ogImage';
import { formatDate } from '../../utils/formatDate';
import { site } from '../../consts';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = (await getCollection('blog')).filter(({ data }) =>
    import.meta.env.PROD ? !data.draft : true
  );
  return posts.map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { entry } = props as {
    entry: {
      data: {
        title: string;
        description?: string | null;
        date: Date;
        tags?: string[] | string | null;
        category?: string[] | string | null;
      };
    };
  };

  const { remarkPluginFrontmatter } = await render(entry as never);
  const readingMinutes = Math.ceil(remarkPluginFrontmatter?.readingTime?.minutes ?? 0);

  const toArray = (value?: string[] | string | null): string[] => {
    if (!value) return [];
    return Array.isArray(value) ? value : value.split(',');
  };

  const png = await renderOgPng({
    title: entry.data.title,
    description: entry.data.description,
    category: toArray(entry.data.category)[0],
    tags: toArray(entry.data.tags),
    siteName: site.title,
    author: site.author,
    dateLabel: formatDate(entry.data.date),
    readingTimeLabel: readingMinutes ? `${readingMinutes} min read` : undefined,
  });

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
