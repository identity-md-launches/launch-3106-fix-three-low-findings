import { cp, mkdir, readFile } from "node:fs/promises";
import { Script } from "node:vm";

// The existing site is plain HTML, CSS and JavaScript: export it without rewriting it.
const root = new URL("./", import.meta.url);
const dist = new URL("dist/", root);
await mkdir(dist, { recursive: true });
for (const page of ["index.html", "overlay.html"]) {
  const html = await readFile(new URL(page, root), "utf8");
  for (const [i, match] of [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].entries()) {
    new Script(match[1], { filename: `${page}:script-${i + 1}` });
  }
  await cp(new URL(page, root), new URL(page, dist));
}
await cp(new URL("assets/", root), new URL("assets/", dist), { recursive: true });
console.log("Built dist/: both pages and their original assets; inline JavaScript syntax passed.");
