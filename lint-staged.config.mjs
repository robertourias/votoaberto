import path from "node:path";

const root = process.cwd();
const prettierConfig = path.join(root, "packages/config/prettier/index.mjs");
const quote = (file) => `"${file}"`;

// ESLint só roda em workspaces que têm eslint.config.mjs; o cwd precisa ser o do workspace.
const eslintWorkspaces = ["apps/bff", "apps/web"];

const toPosix = (file) => path.relative(root, file).split(path.sep).join("/");

export default {
  "{apps,packages}/**/*.{ts,tsx,js,mjs}": (files) => {
    const commands = [];
    for (const workspace of eslintWorkspaces) {
      const own = files.filter((file) => toPosix(file).startsWith(`${workspace}/`));
      if (own.length > 0) {
        commands.push(
          `pnpm --dir ${workspace} exec eslint --fix --max-warnings=0 ${own.map(quote).join(" ")}`,
        );
      }
    }
    commands.push(
      `prettier --config "${prettierConfig}" --write --ignore-unknown ${files.map(quote).join(" ")}`,
    );
    return commands;
  },
  "{apps,packages}/**/*.{json,css,md}": (files) =>
    `prettier --config "${prettierConfig}" --write --ignore-unknown ${files.map(quote).join(" ")}`,
};
