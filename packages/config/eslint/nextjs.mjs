import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig } from "eslint/config";

import base from "./base.mjs";

export default defineConfig(base, nextVitals, nextTs);
