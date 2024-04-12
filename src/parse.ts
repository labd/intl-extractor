import { promises as fsPromises } from "fs";
import ts from "typescript";

interface Scope {
	variables: Set<string>;
	parentScope: Scope | null;
}


export async function findTranslationsUsage(filePath: string) {
	const fileContent = await fsPromises.readFile(filePath, "utf8");
	return parseSource(filePath, fileContent);
}

export async function parseSource(filename: string, source: string) {
	const sourceFile = ts.createSourceFile(
		filename,
		source,
		ts.ScriptTarget.Latest,
		true
	);

	const result: Record<string, any> = {};

	// Create a scope dictionary to track variables assigned from useTranslations
	const scopes: Record<string, Set<string>> = {};

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
					currentScope.variables.add(node.name.text);
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
					currentScope.variables.add(node.name.text);
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
				const [key, value] = item;
				if (!result[key]) {
					result[key] = value;
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
			variables: new Set<string>(),
			parentScope
	};
}

function findVariableInScopes(variableName: string, scope: Scope | null): boolean {
	while (scope !== null) {
			if (scope.variables.has(variableName)) {
					return true;
			}
			scope = scope.parentScope;  // Move to the next higher scope
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
