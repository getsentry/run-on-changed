import { mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createResolveSpecifier } from "./resolve.js";

let directory: string;

beforeAll(async () => {
	directory = await realpath(
		await mkdtemp(path.join(tmpdir(), "run-on-changed-")),
	);
	await writeFile(path.join(directory, "target.ts"), "export const value = 1;");
});

afterAll(async () => {
	await rm(directory, { force: true, recursive: true });
});

describe(createResolveSpecifier, () => {
	it("resolves a .js specifier to its .ts source when the source exists", () => {
		const resolveSpecifier = createResolveSpecifier();

		const resolved = resolveSpecifier(directory, "./target.js");

		expect(resolved).toBe(path.join(directory, "target.ts"));
	});

	it("returns undefined when a relative specifier cannot be resolved", () => {
		const resolveSpecifier = createResolveSpecifier();

		const resolved = resolveSpecifier(directory, "./missing.js");

		expect(resolved).toBeUndefined();
	});

	it("returns undefined when a bare specifier resolves into node_modules", () => {
		const resolveSpecifier = createResolveSpecifier();

		const resolved = resolveSpecifier(process.cwd(), "oxc-parser");

		expect(resolved).toBeUndefined();
	});
});
