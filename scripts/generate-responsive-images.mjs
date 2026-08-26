import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const uploadsRoot = path.join(projectRoot, "public", "uploads");
const outputRoot = path.join(projectRoot, "public", "generated", "uploads");
const manifestPath = path.join(
  projectRoot,
  "src",
  "_data",
  "responsive-images.json",
);
const widths = [320, 640, 960, 1280];
const supportedExtensions = new Set([".avif", ".jpeg", ".jpg", ".png", ".webp"]);

async function findImages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) return findImages(absolutePath);
      return supportedExtensions.has(path.extname(entry.name).toLowerCase())
        ? [absolutePath]
        : [];
    }),
  );

  return files.flat();
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

const manifest = {};
const sourceFiles = await findImages(uploadsRoot);

for (const sourcePath of sourceFiles) {
  const relativePath = path.relative(uploadsRoot, sourcePath);
  const extension = path.extname(relativePath);
  const relativeStem = relativePath.slice(0, -extension.length);
  const metadata = await sharp(sourcePath).metadata();

  if (!metadata.width || !metadata.height) continue;

  const maximumGeneratedWidth = Math.min(metadata.width, widths.at(-1));
  const sourceWidths = [...new Set([
    ...widths.filter((width) => width < maximumGeneratedWidth),
    maximumGeneratedWidth,
  ])].sort((first, second) => first - second);
  const variants = { avif: [], webp: [] };

  for (const width of sourceWidths) {
    for (const format of ["avif", "webp"]) {
      const outputRelativePath = `${relativeStem}-${width}.${format}`;
      const outputPath = path.join(outputRoot, outputRelativePath);
      await mkdir(path.dirname(outputPath), { recursive: true });

      const pipeline = sharp(sourcePath)
        .rotate()
        .resize({ width, withoutEnlargement: true });

      if (format === "avif") {
        await pipeline.avif({ quality: 55, effort: 4 }).toFile(outputPath);
      } else {
        await pipeline.webp({ quality: 75, effort: 4 }).toFile(outputPath);
      }

      variants[format].push({
        src: `/generated/uploads/${outputRelativePath.split(path.sep).join("/")}`,
        width,
      });
    }
  }

  const sourceUrl = `/uploads/${relativePath.split(path.sep).join("/")}`;
  manifest[sourceUrl] = {
    width: metadata.width,
    height: metadata.height,
    sources: variants,
  };
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Generated responsive variants for ${sourceFiles.length} images.`);
