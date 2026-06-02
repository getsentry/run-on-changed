import { describe, expect, it } from "vitest";

import { buildDependencyGraph, reverseGraph } from "./graph.js";
import { FileSpecifiers, ResolveSpecifier } from "./types.js";

const resolveSpecifier: ResolveSpecifier = (_fromDirectory, specifier) =>
	specifier.startsWith("./") ? specifier.replace("./", "/") : undefined;

describe(buildDependencyGraph, () => {
	it("maps a file to its resolved dependencies when specifiers resolve", () => {
		const fileSpecifiers: FileSpecifiers[] = [
			{ filePath: "/a.ts", specifiers: ["./b.ts"] },
		];

		const graph = buildDependencyGraph(fileSpecifiers, resolveSpecifier);

		expect(graph).toEqual(new Map([["/a.ts", new Set(["/b.ts"])]]));
	});

	it("excludes specifiers when they do not resolve to a project file", () => {
		const fileSpecifiers: FileSpecifiers[] = [
			{ filePath: "/a.ts", specifiers: ["node_modules:eslint", "./b.ts"] },
		];

		const graph = buildDependencyGraph(fileSpecifiers, resolveSpecifier);

		expect(graph).toEqual(new Map([["/a.ts", new Set(["/b.ts"])]]));
	});

	it("includes a file with an empty set when it has no specifiers", () => {
		const fileSpecifiers: FileSpecifiers[] = [
			{ filePath: "/a.ts", specifiers: [] },
		];

		const graph = buildDependencyGraph(fileSpecifiers, resolveSpecifier);

		expect(graph).toEqual(new Map([["/a.ts", new Set()]]));
	});
});

describe(reverseGraph, () => {
	it("inverts edges so dependencies map to their importers", () => {
		const graph = new Map([
			["/a.ts", new Set(["/b.ts"])],
			["/b.ts", new Set<string>()],
		]);

		const dependents = reverseGraph(graph);

		expect(dependents).toEqual(
			new Map([
				["/a.ts", new Set()],
				["/b.ts", new Set(["/a.ts"])],
			]),
		);
	});
});
