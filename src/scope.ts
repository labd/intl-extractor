/**
 * Individual scope used in a scope chain
 */
export interface Scope {
	variables: Map<string, string>;
	parentScope?: Scope;
}

/**
 * Create a new scope
 * @param parentScope the parent scope used in a scope chain
 */
export function createScope(parentScope?: Scope): Scope {
	return {
		variables: new Map<string, string>(),
		parentScope,
	};
}
