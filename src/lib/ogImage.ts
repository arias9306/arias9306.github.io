import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const color = {
  bg: '#282828',
  card: '#343a40',
  title: '#f9f4e3',
  muted: '#a8a29e',
  accent: '#fabd2f',
  border: 'rgba(249, 244, 227, 0.12)',
  accentBorder: 'rgba(250, 189, 47, 0.4)',
};

const fontDir = resolve(process.cwd(), 'node_modules', '@fontsource', 'jetbrains-mono', 'files');
const fontRegular = readFileSync(resolve(fontDir, 'jetbrains-mono-latin-400-normal.woff'));
const fontBold = readFileSync(resolve(fontDir, 'jetbrains-mono-latin-700-normal.woff'));

let avatarDataUri = '';
try {
  const avatar = readFileSync(resolve(process.cwd(), 'public', 'avatar.png'));
  avatarDataUri = `data:image/png;base64,${avatar.toString('base64')}`;
} catch {
  avatarDataUri = '';
}

type Node = {
  type: string;
  props: {
    style?: Record<string, unknown>;
    children?: unknown;
    [key: string]: unknown;
  };
};

const h = (
  type: string,
  style: Record<string, unknown>,
  children?: unknown,
  extraProps: Record<string, unknown> = {},
): Node => ({
  type,
  props: { style, ...extraProps, ...(children !== undefined ? { children } : {}) },
});

function truncate(text: string, max: number): string {
  const clean = text.trim().replace(/\s+/g, ' ');
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

function titleFontSize(title: string): string {
  const len = title.length;
  if (len <= 30) return '68px';
  if (len <= 50) return '60px';
  if (len <= 75) return '54px';
  if (len <= 100) return '48px';
  return '42px';
}

export interface OgCardProps {
  title: string;
  description?: string | null;
  category?: string | null;
  tags?: string[];
  siteName: string;
  author: string;
  eyebrow?: string;
  dateLabel?: string;
  readingTimeLabel?: string;
}

export function buildOgTree({
  title,
  description,
  category,
  tags = [],
  siteName,
  author,
  eyebrow,
  dateLabel,
  readingTimeLabel,
}: OgCardProps): Node {
  const tagList = tags.filter(Boolean).slice(0, 4) as string[];
  const metaLine = [dateLabel, readingTimeLabel].filter(Boolean).join('  ·  ');

  const pill = (text: string, filled = false): Node =>
    h(
      'div',
      {
        display: 'flex',
        alignItems: 'center',
        borderRadius: '9999px',
        padding: '8px 20px',
        fontSize: '22px',
        fontWeight: filled ? 700 : 400,
        letterSpacing: '0.5px',
        ...(filled
          ? { backgroundColor: color.accent, color: color.bg }
          : {
              backgroundColor: color.card,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: color.accentBorder,
              color: color.title,
            }),
      },
      text,
    );

  return h(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
      backgroundColor: color.bg,
      backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(250, 189, 47, 0.12), rgba(40, 40, 40, 0) 55%)',
      fontFamily: 'JetBrains Mono',
      padding: '56px 72px',
      position: 'relative',
    },
    [
      h('div', {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '8px',
        height: `${OG_HEIGHT}px`,
        backgroundColor: color.accent,
      }),
      h(
        'div',
        {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          flexShrink: 0,
        },
        [
          h('div', { display: 'flex', alignItems: 'center', gap: '18px' }, [
            avatarDataUri
              ? h('img', { borderRadius: '50%', objectFit: 'cover' }, undefined, {
                  src: avatarDataUri,
                  width: 64,
                  height: 64,
                })
              : h('div', { display: 'flex' }),
            h('div', { display: 'flex', flexDirection: 'column', gap: '2px' }, [
              h('div', { display: 'flex', fontSize: '26px', fontWeight: 700, color: color.title }, siteName),
              h('div', { display: 'flex', fontSize: '20px', color: color.muted }, eyebrow ?? author),
            ]),
          ]),
          category ? pill(category, true) : h('div', { display: 'flex' }),
        ],
      ),
      h(
        'div',
        {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          gap: '24px',
          minHeight: '0',
        },
        [
          h(
            'div',
            { display: 'flex', width: '100%' },
            h(
              'div',
              {
                display: 'flex',
                fontSize: titleFontSize(title),
                fontWeight: 700,
                lineHeight: 1.15,
                color: color.title,
                lineClamp: 4,
                overflow: 'hidden',
              },
              title,
            ),
          ),
          description
            ? h(
                'div',
                {
                  display: 'flex',
                  fontSize: '24px',
                  lineHeight: 1.4,
                  color: color.muted,
                  lineClamp: 3,
                  overflow: 'hidden',
                },
                truncate(description, 140),
              )
            : h('div', { display: 'flex' }),
          tagList.length
            ? h(
                'div',
                { display: 'flex', flexWrap: 'wrap', gap: '12px' },
                tagList.map((tag) => pill(tag)),
              )
            : h('div', { display: 'flex' }),
        ],
      ),
      h('div', { display: 'flex', flexDirection: 'column', width: '100%', flexShrink: 0 }, [
        h('div', {
          display: 'flex',
          width: '100%',
          height: '2px',
          backgroundColor: color.border,
          marginBottom: '22px',
        }),
        h(
          'div',
          {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            width: '100%',
            gap: '40px',
          },
          [
            h(
              'div',
              {
                display: 'flex',
                fontSize: '20px',
                color: color.muted,
                whiteSpace: 'nowrap',
              },
              metaLine,
            ),
            h(
              'div',
              {
                display: 'flex',
                fontSize: '20px',
                color: color.accent,
                whiteSpace: 'nowrap',
              },
              'arias9306.github.io',
            ),
          ],
        ),
      ]),
    ],
  );
}

export async function renderOgPng(props: OgCardProps): Promise<Buffer> {
  const svg = await satori(buildOgTree(props) as never, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: [
      { name: 'JetBrains Mono', data: fontRegular, weight: 400, style: 'normal' },
      { name: 'JetBrains Mono', data: fontBold, weight: 700, style: 'normal' },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: OG_WIDTH },
  });
  return resvg.render().asPng() as unknown as Buffer;
}
