import { promises as fsPromises } from "fs";
import ts from "typescript";

interface Scope {
	variables: Map<string, string>;
	parentScope: Scope | null;
}

export async function extractLabelsFromFile(filePath: string) {
	const fileContent = await fsPromises.readFile(filePath, "utf8");
	return extractLabels(filePath, fileContent);
}

export async function extractLabels(filename: string, source: string) {
	const sourceFile = ts.createSourceFile(
		filename,
		source,
		ts.ScriptTarget.Latest,
		true
	);

	// Since we use the namespace string we also allow nested namespaces out of the box
	const result: Record<string, Set<string>> = {};

	// Visitor function that traverses the AST and logs calls to t()
	function visit(node: ts.Node, currentScope: Scope) {
		if (
			ts.isFunctionDeclaration(node) ||
			ts.isBlock(node) ||
			ts.isSourceFile(node)
		) {
			currentScope = createScope(currentScope);
		}

		// Check for variable declarations that initialize with useTranslations
		if (
			ts.isVariableDeclaration(node) &&
			node.initializer &&
			ts.isCallExpression(node.initializer)
		) {
			const callExpr = node.initializer;
			if (
				ts.isIdentifier(callExpr.expression) &&
				callExpr.expression.text === "useTranslations"
			) {
				if (node.name && ts.isIdentifier(node.name)) {
					currentScope.variables.set(
						node.name.text,
						// Remove the surrounding quotes
						callExpr.arguments[0].getText().slice(1, -1)
					);
				}
			}
		}

		// Check for variable declarations that initialize with getTranslations
		if (ts.isVariableDeclaration(node) && node.initializer) {
			let callExpr = node.initializer;

			// Check if the initializer is an AwaitExpression
			if (ts.isAwaitExpression(callExpr) && callExpr.expression) {
				callExpr = callExpr.expression;
			}

			if (
				ts.isCallExpression(callExpr) &&
				ts.isIdentifier(callExpr.expression) &&
				callExpr.expression.text === "getTranslations"
			) {
				if (node.name && ts.isIdentifier(node.name)) {
					const arg = callExpr.arguments[0];
					if (ts.isObjectLiteralExpression(arg)) {
						// Iterate over the object properties
						for (const prop of arg.properties) {
							if (
								ts.isPropertyAssignment(prop) &&
								ts.isIdentifier(prop.name) &&
								prop.name.text === "namespace"
							) {
								// Get the namespace value
								const namespaceValue = prop.initializer;
								if (ts.isStringLiteral(namespaceValue)) {
									const namespace = namespaceValue.text;
									// Do something with the namespace
									currentScope.variables.set(node.name.text, namespace);
								}
							}
						}
					}
				}
			}
		}

		// Check for calls using the translation function variable
		if (
			ts.isCallExpression(node) &&
			ts.isIdentifier(node.expression) &&
			findVariableInScopes(node.expression.text, currentScope)
		) {
			const item = parseText(node);

			if (item) {
				// Get caller name for node
				const namespace = findNamespaceForExpression(
					node.expression.text,
					currentScope
				);
				if (namespace) {
					if (!result[namespace]) {
						result[namespace] = new Set();
					}
					result[namespace].add(item[1]);
				}
			}
		}

		ts.forEachChild(node, (child) => visit(child, currentScope));
	}

	const globalScope = createScope();
	visit(sourceFile, globalScope);
	return result;
}

function createScope(parentScope: Scope | null = null): Scope {
	return {
		variables: new Map<string, string>(),
		parentScope,
	};
}

function findNamespaceForExpression(variableName: string, scope: Scope | null) {
	while (scope !== null) {
		if (scope.variables.has(variableName)) {
			return scope.variables.get(variableName);
		}
		scope = scope.parentScope;
	}
	return null;
}

function findVariableInScopes(
	variableName: string,
	scope: Scope | null
): boolean {
	while (scope !== null) {
		if (scope.variables.has(variableName)) {
			return true;
		}
		scope = scope.parentScope; // Move to the next higher scope
	}
	return false;
}

function parseText(node: ts.CallExpression) {
	const text = node.arguments[0];
	if (ts.isStringLiteral(text)) {
		return [text.text, text.text];
	}
	return null;
}
