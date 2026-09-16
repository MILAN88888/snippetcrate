"use strict";

require("dotenv").config();
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("./package.json"));
const { dest, series, src, watch, parallel, task } = require("gulp");
const { exec } = require("child_process");
const browserSync = require("browser-sync").create();
const bump = require("gulp-bump");

if (!process.env.WORDPRESS_URL && process.env.DEVELOPMENT) {
  console.error("Please set WORDPRESS_URL on your environment variable");
  process.exit(1);
}

const fileList = {
  includes: {
    src: "includes/**/*",
    dest: `build/${pkg.name}/includes`
  },
  languages: {
    src: "languages/**/*",
    dest: `build/${pkg.name}/languages`
  },
  composer: {
    src: ["composer.json"],
    dest: `build/${pkg.name}/`
  },
  npm: {
    src: ["package.json"],
    dest: `build/${pkg.name}/`
  },
  other: {
    src: [
      "readme.txt",
      "changelog.txt",
      "custom-code-snippets-manager.php",
      "uninstall.php",
      "LICENSE"
    ],
    dest: `build/${pkg.name}/`
  },
  dist: {
    src: "dist/**/*",
    dest: `build/${pkg.name}/dist`
  }
};

// Load ES modules dynamically
async function loadModules() {
  const autoprefixer = (await import("gulp-autoprefixer")).default;
  const zip = (await import("gulp-zip")).default;
  return { autoprefixer, zip };
}

const paths = {
  frontEndJs: { src: "js/**/*.js" },
  php: { src: "**/*.php" },
  images: { src: "images/**/*" }
};

function startBrowserSync(cb) {
  browserSync.init({
    proxy: process.env.WORDPRESS_URL
  });
  cb();
}

function reloadBrowserSync(cb) {
  browserSync.reload();
  cb();
}

function watchChanges() {
  watch(paths.frontEndJs.src, series(reloadBrowserSync));
  watch(paths.php.src, reloadBrowserSync);
  watch(paths.images.src, series(reloadBrowserSync));
}

function removeBuild() {
  return exec("rm -rf build");
}

function removeRelease() {
  return exec("rm -rf release");
}

function removeLanguageFiles() {
  return exec("rm -rf languages/custom-code-snippets-manager*");
}

function generateLanguageFiles() {
  // Prefer the dev dependency, fall back to a global wp-cli so a --no-dev
  // vendor tree still builds a complete package.
  const wp = fs.existsSync("vendor/bin/wp") ? "vendor/bin/wp" : "wp";

  return exec(
    `${wp} i18n make-pot . languages/${pkg.name}.pot --exclude=".github,.wordpress-org,bin,node_modules,vendor,tests,build,release" --slug=${pkg.name} --skip-audit`
  );
}

const copyToBuild = [
  () => src(fileList.includes.src).pipe(dest(fileList.includes.dest)),
  () => src(fileList.languages.src).pipe(dest(fileList.languages.dest)),
  () => src(fileList.composer.src).pipe(dest(fileList.composer.dest)),
  () => src(fileList.npm.src).pipe(dest(fileList.npm.dest)),
  () =>
    src(fileList.other.src, { allowEmpty: true }).pipe(
      dest(fileList.other.dest)
    ),
  () => src(fileList.dist.src).pipe(dest(fileList.dist.dest))
];

function runComposerInBuild() {
  return exec(
    `cd build/${pkg.name} && composer install --no-dev --optimize-autoloader`
  );
}

async function compressBuildWithoutVersion() {
  const { zip } = await loadModules();
  return src("build/**/*")
    .pipe(zip(`${pkg.name}.zip`))
    .pipe(dest("release"));
}

async function compressBuildWithVersion() {
  const { zip } = await loadModules();
  return src("build/**/*")
    .pipe(zip(`${pkg.name}-${pkg.version}.zip`))
    .pipe(dest("release"));
}

async function bumpMinorVersion() {
  src(["./package.json", "./composer.json"])
    .pipe(
      bump({
        keys: ["version"],
        type: "minor"
      })
    )
    .pipe(dest("./"));

  src(["./README.md"], { allowEmpty: true })
    .pipe(
      bump({
        keys: ["Stable tag", "\\*\\*Stable tag\\*\\*"],
        type: "minor"
      })
    )
    .pipe(dest("./"));

  src("./custom-code-snippets-manager.php")
    .pipe(
      bump({
        key: "SNIPPET_MASTER_VERSION",
        regex: new RegExp(
          "([<|'|\"]?(" +
            "SNIPPET_MASTER_VERSION" +
            ")[>|'|\"]?[ ]*[:=,]?[ ]*['|\"]?[a-z]?)(\\d+.\\d+.\\d+)(-[0-9A-Za-z.-]+)?(\\+[0-9A-Za-z\\.-]+)?(['|\"|<]?)",
          "i"
        ),
        type: "minor"
      })
    )
    .pipe(
      bump({
        key: "\\* Version",
        type: "minor"
      })
    )
    .pipe(dest("./"));
}

async function bumpPatchVersion() {
  src(["./package.json", "./composer.json"])
    .pipe(
      bump({
        keys: ["version"],
        type: "patch"
      })
    )
    .pipe(dest("./"));

  src(["./readme.md"], { allowEmpty: true })
    .pipe(
      bump({
        keys: ["Stable tag", "\\*\\*Stable tag\\*\\*"],
        type: "patch"
      })
    )
    .pipe(dest("./"));

  src("./custom-code-snippets-manager.php")
    .pipe(
      bump({
        key: "SNIPPET_MASTER_VERSION",
        regex: new RegExp(
          "([<|'|\"]?(" +
            "SNIPPET_MASTER_VERSION" +
            ")[>|'|\"]?[ ]*[:=,]?[ ]*['|\"]?[a-z]?)(\\d+.\\d+.\\d+)(-[0-9A-Za-z.-]+)?(\\+[0-9A-Za-z\\.-]+)?(['|\"|<]?)",
          "i"
        ),
        type: "patch"
      })
    )
    .pipe(
      bump({
        key: "\\* Version",
        type: "patch"
      })
    )
    .pipe(dest("./"));
}

const build = series(removeBuild, removeLanguageFiles, generateLanguageFiles);

const dev = series(startBrowserSync, watchChanges);
const release = series(
  removeRelease,
  build,
  copyToBuild,
  runComposerInBuild,
  parallel(compressBuildWithVersion, compressBuildWithoutVersion)
);

const bumpPatch = task("bumpPatch", bumpPatchVersion);
const bumpMinor = task("bumpMinor", bumpMinorVersion);

exports.clean = series(removeBuild, removeRelease, removeLanguageFiles);

exports.dev = dev;
exports.build = build;
exports.release = release;
exports.bumpPatch = bumpPatch;
exports.bumpMinor = bumpMinor;
