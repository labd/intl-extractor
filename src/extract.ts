import { promises as fsPromises } from "node:fs";
import ts from "typescript";
import { createScope, type Scope } from "./scope";

export async function extractLabelsFromFile(filePath: string) {
	const fileContent = await fsPromises.readFile(filePath, "utf8");
	return extractLabels(filePath, fileContent);
}

export function extractLabels(filename: string, source: string) {
	const sourceFile = ts.createSourceFile(
		filename,
		source,
		ts.ScriptTarget.Latest,
		true,
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
						callExpr.arguments[0]
							.getText()
							.slice(1, -1),
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

					// If the argument is an object, parse the object
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
					} else {
						currentScope.variables.set(
							node.name.text,
							// Remove the surrounding quotes
							callExpr.arguments[0]
								.getText()
								.slice(1, -1),
						);
					}
				}
			}
		}

		let baseIdentifier: string | undefined;

		if (ts.isCallExpression(node)) {
			// The `t()` function also has properties like `t.html()` and `t.rich()`
			// we need to check for both cases and get variables for the current scope
			if (ts.isIdentifier(node.expression)) {
				baseIdentifier = node.expression.text;
			} else if (ts.isPropertyAccessExpression(node.expression)) {
				if (ts.isIdentifier(node.expression.expression)) {
					baseIdentifier = node.expression.expression.text;
				}
			}

			// Found an identifier, check if it's a variable in the current scope
			if (baseIdentifier) {
				if (findVariableInScopes(baseIdentifier, currentScope)) {
					// Get the label from the first argument
					const label = getLabelFromArguments(node);

					if (label) {
						const namespace = findNamespaceForExpression(
							baseIdentifier,
							currentScope,
						);

						if (namespace) {
							if (!result[namespace]) {
								result[namespace] = new Set();
							}
							result[namespace].add(label);
						}
					}
				}
			}
		}

		ts.forEachChild(node, (child) => visit(child, currentScope));
	}

	const globalScope = createScope();
	visit(sourceFile, globalScope);
	return result;
}

function findNamespaceForExpression(variableName: string, scope?: Scope) {
	while (scope !== undefined) {
		if (scope.variables.has(variableName)) {
			return scope.variables.get(variableName);
		}
		scope = scope.parentScope;
	}
	return;
}

function findVariableInScopes(variableName: string, scope?: Scope): boolean {
	while (scope !== undefined) {
		if (scope.variables.has(variableName)) {
			return true;
		}
		scope = scope.parentScope; // Move to the next higher scope
	}
	return false;
}

function getLabelFromArguments(node: ts.CallExpression) {
	const text = node.arguments[0];
	if (ts.isStringLiteral(text)) {
		return text.text;
	}
	return null;
}
