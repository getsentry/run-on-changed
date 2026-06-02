import { describe, expect, it } from "vitest";

import { extractSpecifiers } from "./parse.js";

describe(extractSpecifiers, () => {
	it("collects the specifier when a file has a static import", () => {
		const specifiers = extractSpecifiers("a.ts", `import a from "./a.js";`);

		expect(specifiers).toEqual(["./a.js"]);
	});

	it("collects the specifier when a file has a type-only import", () => {
		const specifiers = extractSpecifiers(
			"a.ts",
			`import type { T } from "./t.js";`,
		);

		expect(specifiers).toEqual(["./t.js"]);
	});

	it("collects the specifier when a file re-exports from another file", () => {
		const specifiers = extractSpecifiers("a.ts", `export * from "./b.js";`);

		expect(specifiers).toEqual(["./b.js"]);
	});

	it("collects the specifier when a file has a literal dynamic import", () => {
		const specifiers = extractSpecifiers(
			"a.ts",
			`const c = await import("./c.js");`,
		);

		expect(specifiers).toEqual(["./c.js"]);
	});

	it("ignores the import when a dynamic import is not a string literal", () => {
		const specifiers = extractSpecifiers(
			"a.ts",
			`const c = await import(specifier);`,
		);

		expect(specifiers).toEqual([]);
	});

	it("ignores plain exports that have no module specifier", () => {
		const specifiers = extractSpecifiers("a.ts", `export const y = 1;`);

		expect(specifiers).toEqual([]);
	});

	it("deduplicates a specifier when it is imported more than once", () => {
		const specifiers = extractSpecifiers(
			"a.ts",
			`import { a } from "./a.js";\nimport { b } from "./a.js";`,
		);

		expect(specifiers).toEqual(["./a.js"]);
	});
});
