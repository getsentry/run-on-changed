import path from "node:path";

import {
	DependencyGraph,
	DependentsGraph,
	FileSpecifiers,
	ResolveSpecifier,
} from "./types.js";

export function buildDependencyGraph(
	fileSpecifiers: FileSpecifiers[],
	resolveSpecifier: ResolveSpecifier,
): DependencyGraph {
	const graph: DependencyGraph = new Map();

	for (const { filePath, specifiers } of fileSpecifiers) {
		const fromDirectory = path.dirname(filePath);
		const dependencies = new Set<string>();

		for (const specifier of specifiers) {
			const resolved = resolveSpecifier(fromDirectory, specifier);
			if (resolved) {
				dependencies.add(resolved);
			}
		}

		graph.set(filePath, dependencies);
	}

	return graph;
}

export function reverseGraph(graph: DependencyGraph): DependentsGraph {
	const dependents: DependentsGraph = new Map();

	for (const file of graph.keys()) {
		dependents.set(file, new Set());
	}

	for (const [file, dependencies] of graph) {
		for (const dependency of dependencies) {
			const importers = dependents.get(dependency) ?? new Set();
			importers.add(file);
			dependents.set(dependency, importers);
		}
	}

	return dependents;
}
