import { DependentsGraph } from "./types.js";

export function collectImpactedFiles(
	changedFiles: string[],
	dependents: DependentsGraph,
): Set<string> {
	const impacted = new Set<string>();
	const queue = [...changedFiles];

	while (queue.length) {
		const file = queue.shift();
		if (file === undefined || impacted.has(file)) {
			continue;
		}

		impacted.add(file);

		for (const importer of dependents.get(file) ?? []) {
			if (!impacted.has(importer)) {
				queue.push(importer);
			}
		}
	}

	return impacted;
}
