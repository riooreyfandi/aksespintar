// Menyiapkan Netlify Function yang mandiri:
// - dist/app.js dibundel esbuild menjadi satu file
// - hanya file Prisma/argon2 yang benar-benar dibutuhkan yang disalin
// Hasilnya dipakai bersama "node_bundler = none" di netlify.toml, sehingga
// Netlify tidak perlu menelusuri node_modules (bundle tetap kecil).
import { build } from "esbuild";
import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "netlify", "functions");
const modulesDir = path.join(outDir, "node_modules");

const copy = async (from, to) => {
  await mkdir(path.dirname(to), { recursive: true });
  await cp(from, to, { recursive: true });
};

const exists = async (target) => {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
};

await rm(modulesDir, { recursive: true, force: true });

await build({
  entryPoints: [path.join(root, "dist", "app.js")],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "cjs",
  outfile: path.join(outDir, "lib", "app.bundle.js"),
  external: ["@prisma/client", ".prisma/client", "argon2", "node-gyp-build", "@phc/format"],
  logLevel: "info",
});

// Prisma Client hasil generate
const prismaClientDir = path.join(root, "node_modules", ".prisma", "client");
const prismaFiles = (await readdir(prismaClientDir)).filter(
  (name) =>
    ["index.js", "default.js", "package.json", "schema.prisma", "query_engine_bg.js"].includes(name) ||
    (name.startsWith("libquery_engine-") && name.endsWith(".node")),
);
for (const name of prismaFiles) {
  await copy(path.join(prismaClientDir, name), path.join(modulesDir, ".prisma", "client", name));
}

// Paket @prisma/client: hanya runtime yang dipakai engine library
const atPrisma = path.join(root, "node_modules", "@prisma", "client");
for (const name of ["package.json", "default.js", "index.js"]) {
  if (await exists(path.join(atPrisma, name))) {
    await copy(path.join(atPrisma, name), path.join(modulesDir, "@prisma", "client", name));
  }
}
const runtimeDir = path.join(atPrisma, "runtime");
for (const name of await readdir(runtimeDir)) {
  if (name === "library.js" || name === "library.d.ts") {
    await copy(path.join(runtimeDir, name), path.join(modulesDir, "@prisma", "client", "runtime", name));
  }
}

// argon2 beserta prebuild Linux (Netlify memakai x64 glibc)
const argon2Dir = path.join(root, "node_modules", "argon2");
for (const name of ["package.json", "argon2.cjs"]) {
  await copy(path.join(argon2Dir, name), path.join(modulesDir, "argon2", name));
}
await copy(path.join(argon2Dir, "prebuilds", "linux-x64"), path.join(modulesDir, "argon2", "prebuilds", "linux-x64"));

// Dependensi kecil argon2
await copy(path.join(root, "node_modules", "node-gyp-build"), path.join(modulesDir, "node-gyp-build"));
await copy(path.join(root, "node_modules", "@phc", "format"), path.join(modulesDir, "@phc", "format"));

// serverless-http dipakai langsung oleh netlify/functions/api.js (di luar bundel esbuild)
await copy(path.join(root, "node_modules", "serverless-http"), path.join(modulesDir, "serverless-http"));

console.log("Netlify Function siap di", outDir);

