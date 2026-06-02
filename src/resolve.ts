import { ResolverFactory } from "oxc-resolver";

import { ResolveSpecifier } from "./types.js";

export function createResolveSpecifier(): ResolveSpecifier {
	const resolver = new ResolverFactory({
		conditionNames: ["node", "import", "default"],
		extensionAlias: {
			".cjs": [".cts", ".cjs"],
			".js": [".ts", ".tsx", ".js"],
			".mjs": [".mts", ".mjs"],
		},
		extensions: [".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"],
	});

	return (fromDirectory, specifier) => {
		const { path } = resolver.sync(fromDirectory, specifier);
		if (!path || path.includes("node_modules")) {
			return undefined;
		}

		return path;
	};
}
