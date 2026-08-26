import { access, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const archiveRoot = path.join(
  process.cwd(),
  "public",
  "archives",
  "www.kendo-lille.com",
);
const archiveUrl = "/archives/www.kendo-lille.com";
const menuTargets = new Map([
  ["760", `${archiveUrl}/index__q-16ad33.html`],
  ["761", `${archiveUrl}/index__q-93f373.html`],
  ["764", `${archiveUrl}/index__q-ac84c3.html`],
]);

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return entry.name === "_kage" ? [] : findHtmlFiles(absolutePath);
      }
      return entry.name.endsWith(".html") ? [absolutePath] : [];
    }),
  );

  return files.flat();
}

for (const target of menuTargets.values()) {
  await stat(path.join(process.cwd(), "public", target));
}

let changedFiles = 0;
let removedCookiePopups = 0;
let repairedMenuLinks = 0;
const brokenMenuLinks = [];
const htmlFiles = await findHtmlFiles(archiveRoot);

for (const filePath of htmlFiles) {
  const originalHtml = await readFile(filePath, "utf8");
  let html = originalHtml.replace(
    /\s*<style id="cky-style">[\s\S]*?<\/style>\s*/g,
    "\n",
  );

  const cookiePopupStart = html.indexOf('<div class="cky-overlay');
  const wrapperStart = html.indexOf('<div id="wrapper"', cookiePopupStart);
  if (cookiePopupStart >= 0 && wrapperStart > cookiePopupStart) {
    html = `${html.slice(0, cookiePopupStart)}${html.slice(wrapperStart)}`;
    removedCookiePopups += 1;
  }

  for (const [menuItemId, target] of menuTargets) {
    const menuLinkPattern = new RegExp(
      `(<li id="menu-item-${menuItemId}"[^>]*>\\s*<a )href="#"`,
      "g",
    );
    html = html.replace(menuLinkPattern, (link, prefix) => {
      repairedMenuLinks += 1;
      return `${prefix}href="${target}"`;
    });
  }

  if (html !== originalHtml) {
    await writeFile(filePath, html);
    changedFiles += 1;
  }
}

for (const filePath of htmlFiles) {
  const html = await readFile(filePath, "utf8");
  if (/id="cky-style"|class="cky-(?:overlay|consent-container|modal)/.test(html)) {
    throw new Error(`Bloc CookieYes résiduel dans ${filePath}`);
  }

  const menu = html.match(/<ul id="menu-kendo"[\s\S]*?<\/ul><\/div>/)?.[0];
  if (!menu) continue;

  for (const [, href] of menu.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    if (/^(?:https?:|mailto:|tel:|#)/.test(href)) continue;

    const cleanHref = href.split(/[?#]/, 1)[0];
    const targetPath = href.startsWith("/")
      ? path.join(process.cwd(), "public", cleanHref)
      : path.resolve(path.dirname(filePath), cleanHref);

    try {
      await access(targetPath);
    } catch {
      brokenMenuLinks.push(`${path.relative(archiveRoot, filePath)} -> ${href}`);
    }
  }
}

if (brokenMenuLinks.length > 0) {
  throw new Error(`Liens de menu locaux manquants :\n${brokenMenuLinks.join("\n")}`);
}

console.log(
  `Archive vérifiée : ${changedFiles} fichiers modifiés, ${removedCookiePopups} popups retirées, ${repairedMenuLinks} liens corrigés, aucun lien local de menu manquant.`,
);