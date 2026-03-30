import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { buildAbsoluteUrl, siteConfig } from '@lib/site';

type StructuredData = Record<string, unknown> | Array<Record<string, unknown>>;

interface SeoProps {
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
  type?: 'website' | 'article';
  structuredData?: StructuredData;
}

function upsertMeta(selector: string, attributes: Record<string, string>, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement('meta');

    Object.entries(attributes).forEach(([key, value]) => {
      element?.setAttribute(key, value);
    });

    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
}

export function Seo({
  title,
  description,
  path,
  noindex = false,
  type = 'website',
  structuredData,
}: SeoProps) {
  const location = useLocation();

  useEffect(() => {
    const resolvedPath = path ?? location.pathname;
    const pageTitle = `${title} | ${siteConfig.name}`;
    const canonicalUrl = buildAbsoluteUrl(resolvedPath);
    const robotsValue = noindex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

    document.title = pageTitle;

    upsertMeta('meta[name="description"]', { name: 'description' }, description);
    upsertMeta('meta[name="robots"]', { name: 'robots' }, robotsValue);
    upsertMeta('meta[property="og:title"]', { property: 'og:title' }, pageTitle);
    upsertMeta('meta[property="og:description"]', { property: 'og:description' }, description);
    upsertMeta('meta[property="og:type"]', { property: 'og:type' }, type);
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name' }, siteConfig.name);
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image');
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, pageTitle);
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, description);

    if (canonicalUrl) {
      upsertMeta('meta[property="og:url"]', { property: 'og:url' }, canonicalUrl);
      upsertLink('canonical', canonicalUrl);
    }

    document.head.querySelectorAll('script[data-vf-jsonld="true"]').forEach((node) => {
      node.remove();
    });

    if (!noindex) {
      const payloads = [
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: siteConfig.name,
          description: siteConfig.defaultDescription,
          ...(buildAbsoluteUrl(siteConfig.defaultPath)
            ? { url: buildAbsoluteUrl(siteConfig.defaultPath) }
            : {}),
        },
        ...(Array.isArray(structuredData) ? structuredData : structuredData ? [structuredData] : []),
      ];

      payloads.forEach((payload) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.dataset.vfJsonld = 'true';
        script.textContent = JSON.stringify(payload);
        document.head.appendChild(script);
      });
    }
  }, [description, location.pathname, noindex, path, structuredData, title, type]);

  return null;
}
