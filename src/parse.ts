import { readFile } from "node:fs/promises";
import { parseSync } from "oxc-parser";

import { FileSpecifiers } from "./types.js";

const quotes = new Set(['"', "'", "`"]);

export function extractSpecifiers(filePath: string, source: string): string[] {
	const result = parseSync(filePath, source);
	const specifiers = new Set<string>();

	for (const staticImport of result.module.staticImports) {
		specifiers.add(staticImport.moduleRequest.value);
	}

	for (const staticExport of result.module.staticExports) {
		for (const entry of staticExport.entries) {
			if (entry.moduleRequest) {
				specifiers.add(entry.moduleRequest.value);
			}
		}
	}

	for (const dynamicImport of result.module.dynamicImports) {
		const raw = source.slice(
			dynamicImport.moduleRequest.start,
			dynamicImport.moduleRequest.end,
		);
		if (quotes.has(raw[0]) && raw.at(-1) === raw[0]) {
			specifiers.add(raw.slice(1, -1));
		}
	}

	return [...specifiers];
}

export async function parseFileSpecifiers(
	filePath: string,
): Promise<FileSpecifiers> {
	let source: string;
	try {
		source = await readFile(filePath, "utf8");
	} catch {
		return { filePath, specifiers: [] };
	}

	return { filePath, specifiers: extractSpecifiers(filePath, source) };
}
