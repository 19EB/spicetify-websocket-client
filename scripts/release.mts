// Builds release archives to attach to a GitHub release.
//
//   npm run release
//
// Produces release/ containing one archive per platform plus SHA256SUMS.txt. Unlike
// `npm run package`, this always ships websocket-client.example.ini as the config, so
// your own settings never leak into a release.

import { execFileSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  createReadStream,
  readFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { delimiter, dirname, join } from "node:path";
import { readmeText, startCmd, startSh } from "./dist-files.mts";

const BUILD_DIR = "dist-standalone";
const OUT_DIR = "release";
const STAGE_DIR = join(OUT_DIR, ".stage");

const version = process.argv[2] ?? `v${JSON.parse(readFileSync("package.json", "utf8")).version}`;

interface Target {
  name: string;
  builtBinary: string;
  binaryName: string;
  archive: "zip" | "tar.gz";
  launcher: { name: string; body: string; executable: boolean } | null;
}

const TARGETS: Target[] = [
  {
    name: "windows-amd64",
    builtBinary: "spotify-ws-host.exe",
    binaryName: "spotify-ws-host.exe",
    archive: "zip",
    launcher: { name: "start.cmd", body: startCmd, executable: false },
  },
  {
    name: "linux-amd64",
    builtBinary: "spotify-ws-host-linux",
    binaryName: "spotify-ws-host",
    archive: "tar.gz",
    launcher: { name: "start.sh", body: startSh, executable: true },
  },
  {
    name: "macos-arm64",
    builtBinary: "spotify-ws-host-macos",
    binaryName: "spotify-ws-host",
    archive: "tar.gz",
    launcher: { name: "start.sh", body: startSh, executable: true },
  },
];

const sha256 = (path: string) =>
  new Promise<string>((resolve, reject) => {
    const hash = createHash("sha256");
    createReadStream(path)
      .on("data", (chunk) => hash.update(chunk))
      .on("end", () => resolve(hash.digest("hex")))
      .on("error", reject);
  });

const makeZip = (stage: string, out: string) => {
  if (process.platform === "win32") {
    execFileSync(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        `Compress-Archive -Path '${stage}\\*' -DestinationPath '${out}' -Force`,
      ],
      { stdio: "inherit" },
    );
    return;
  }
  execFileSync("zip", ["-r", "-q", out, "."], { cwd: stage, stdio: "inherit" });
};

// We need GNU tar: --mode is the only way to get an execute bit into the archive from
// Windows, and Windows' own tar.exe is bsdtar, which rejects that option. Git for
// Windows bundles GNU tar, so it is available whenever this repo is cloned.
const findGnuTar = (): string => {
  const candidates = [
    process.env.TAR,
    "C:\\Program Files\\Git\\usr\\bin\\tar.exe",
    "/usr/bin/tar",
    "tar",
  ].filter(Boolean) as string[];

  const seen: string[] = [];
  for (const candidate of candidates) {
    let version: string;
    try {
      version = execFileSync(candidate, ["--version"], { encoding: "utf8", stdio: "pipe" });
    } catch {
      continue;
    }
    if (version.includes("GNU tar")) return candidate;
    seen.push(`${candidate}: ${version.split("\n")[0].trim()}`);
  }

  throw new Error(
    "GNU tar is required to build the unix archives, so the binary inside them ends up " +
      "executable. Only these were found:\n  " +
      (seen.join("\n  ") || "none") +
      "\nRun this from Git Bash, or set TAR to a GNU tar binary.",
  );
};

const makeTarGz = (tar: string, stage: string, out: string) => {
  execFileSync(
    tar,
    [
      "-czf",
      out,
      "-C",
      stage,
      // Windows cannot set a POSIX execute bit, so chmodSync above does not survive
      // into the archive. Force it here or the extracted binary will not run.
      "--mode=0755",
      // Otherwise the local account name is recorded as the owner of every entry.
      "--owner=0",
      "--group=0",
      "--numeric-owner",
      ".",
    ],
    {
      stdio: "inherit",
      // GNU tar shells out to gzip for -z. Git for Windows keeps both in the same
      // directory, which is only on PATH inside Git Bash, so add it explicitly or tar
      // fails with "Child returned status 127".
      env: { ...process.env, PATH: `${dirname(tar)}${delimiter}${process.env.PATH ?? ""}` },
    },
  );
};

/* --------------------------------------------------------------------------- */

console.log(`building release ${version}\n`);

const tar = findGnuTar();
console.log(`using tar: ${tar}`);

execFileSync(process.execPath, [join("scripts", "build-go.mts"), "--all"], { stdio: "inherit" });

// Clear the contents rather than the directory: on Windows an indexer or antivirus can
// hold a handle on release/ itself just after the archives are written.
const wipe = (path: string) =>
  rmSync(path, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });

if (existsSync(OUT_DIR)) {
  for (const entry of readdirSync(OUT_DIR)) wipe(join(OUT_DIR, entry));
}
mkdirSync(STAGE_DIR, { recursive: true });

for (const target of TARGETS) {
  const built = join(BUILD_DIR, target.builtBinary);
  if (!existsSync(built)) {
    console.warn(`  skipping ${target.name}: ${built} was not built`);
    continue;
  }

  const stage = join(STAGE_DIR, target.name);
  mkdirSync(stage, { recursive: true });

  const binary = join(stage, target.binaryName);
  copyFileSync(built, binary);
  if (target.archive === "tar.gz") chmodSync(binary, 0o755);

  // Always the example, never a local websocket-client.ini.
  copyFileSync("websocket-client.example.ini", join(stage, "websocket-client.ini"));
  writeFileSync(join(stage, "README.txt"), readmeText);

  if (target.launcher) {
    const launcher = join(stage, target.launcher.name);
    writeFileSync(launcher, target.launcher.body);
    if (target.launcher.executable) chmodSync(launcher, 0o755);
  }

  const base = `spotify-ws-host-${version}-${target.name}`;
  const archive = join(OUT_DIR, `${base}.${target.archive}`);
  if (target.archive === "zip") makeZip(stage, archive);
  else makeTarGz(tar, stage, archive);
}

wipe(STAGE_DIR);

const artifacts = readdirSync(OUT_DIR).sort();
const lines: string[] = [];
console.log("\nartifacts:");
for (const name of artifacts) {
  const path = join(OUT_DIR, name);
  const digest = await sha256(path);
  lines.push(`${digest}  ${name}`);
  console.log(`  ${name.padEnd(46)} ${(statSync(path).size / 1024 / 1024).toFixed(1)} MB`);
}
writeFileSync(join(OUT_DIR, "SHA256SUMS.txt"), lines.join("\n") + "\n");

console.log(`\n${OUT_DIR}/ ready to attach to a GitHub release`);
console.log("SHA256SUMS.txt written");
