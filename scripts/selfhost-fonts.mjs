/**
 * Self-host Google Fonts used in index.html.
 * Usage: node scripts/selfhost-fonts.mjs
 * - Finds <link href="https://fonts.googleapis.com/..."> in index.html
 * - Downloads CSS + font files into public/fonts/
 * - Rewrites index.html to reference local CSS instead of Google
 */
import fs from 'node:fs/promises'
import path from 'node:path'

const projectRoot = new URL('..', import.meta.url).pathname
const indexPath = path.join(projectRoot, 'index.html')
const publicDir = path.join(projectRoot, 'public', 'fonts')
await fs.mkdir(publicDir, { recursive: true })

const html = await fs.readFile(indexPath, 'utf8')

// collect google font links
const linkRe = /<link[^>]+href=["'](https:\/\/fonts\.googleapis\.com\/[^"']+)["'][^>]*>/g
const links = [...html.matchAll(linkRe)].map(m => m[1])

if (links.length === 0) {
  console.log('No Google Fonts links found in index.html. Nothing to do.')
  process.exit(0)
}

const fetchCss = async (url) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return await res.text()
}

const fetchBin = async (url) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  return buf
}

let newHtml = html
let cssIndex = 0

for (const url of links) {
  const css = await fetchCss(url)
  // find fonts and rewrite urls
  const fontUrls = [...css.matchAll(/url\((https:[^\)]+)\)/g)].map(m => m[1])
  let localCss = css
  for (const f of fontUrls) {
    const filename = path.basename(new URL(f).pathname)
    const dest = path.join(publicDir, filename)
    const bin = await fetchBin(f)
    await fs.writeFile(dest, bin)
    localCss = localCss.replaceAll(f, `/fonts/${filename}`)
  }
  const localCssName = `google-fonts-${cssIndex++}.css`
  const localCssPath = path.join(publicDir, localCssName)
  await fs.writeFile(localCssPath, localCss, 'utf8')

  // replace original link tag with local stylesheet
  newHtml = newHtml.replace(url, `/fonts/${localCssName}`)
}

await fs.writeFile(indexPath, newHtml, 'utf8')
console.log('Google Fonts self-hosted. Updated index.html and saved assets in public/fonts/.')
