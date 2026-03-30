import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

function seoFilesPlugin() {
  const siteUrl = process.env.VITE_SITE_URL?.trim().replace(/\/+$/, '')
  const publicRoutes = ['/markets']
  const generatedAt = new Date().toISOString()

  return {
    name: 'vf-seo-files',
    generateBundle() {
      const robotsLines = [
        'User-agent: *',
        'Allow: /',
      ]

      if (siteUrl) {
        robotsLines.push(`Sitemap: ${siteUrl}/sitemap.xml`)
      }

      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `${robotsLines.join('\n')}\n`,
      })

      if (!siteUrl) {
        return
      }

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicRoutes
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route}</loc>
    <lastmod>${generatedAt}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: sitemap,
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), seoFilesPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@contexts": path.resolve(__dirname, "./src/contexts"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@app-types": path.resolve(__dirname, "./src/types/index.ts"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@lib": path.resolve(__dirname, "./src/lib"),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
