import * as ts from 'typescript';
import * as path from 'path';
import * as crypto from 'crypto';

function hash(str: string): string {
  const h = crypto.createHash('sha256');
  h.update(str);

  return h.digest('hex');
}

function getId(symbol: ts.Symbol): string {
  return (symbol as any).id;
}

export default function apiTransformer(program: ts.Program) {
  function visitNodeAndChildren(node: ts.Node, program: ts.Program, context: ts.TransformationContext): ts.Node {
    return ts.visitEachChild(visitNode(node, program), childNode => visitNodeAndChildren(childNode, program, context), context);
  }

  function visitNode(node: ts.Node, program: ts.Program) {
    const typeChecker = program.getTypeChecker();
    if (isCallExpression(node, typeChecker)) {
      const methodName = getCallExpressionName(node, typeChecker);
      if (methodName === 'InterfaceSymbol') {
        return visitSymbolNode(node, typeChecker);
      } else if (methodName === 'bind' || methodName === 'resolve') {
        return visitParametersNode(node, typeChecker);
      }
    }
    return node;
  }

  function visitSymbolNode(node: ts.CallExpression, typeChecker: ts.TypeChecker) {
    if (!node.typeArguments) {
      throw new Error("No type arguments provided to `InterfaceSymbol<T>()`.");
    }

    const typeArgument = node.typeArguments[0];
    const type = typeChecker.getTypeFromTypeNode(typeArgument);
    const symbol = type.symbol;
    if (type.isClass() || !type.isClassOrInterface()) {
      throw new Error("The type provided is not an interface.");
    }
    
    const uid = symbol.escapedName + "#" + hash(prefix + getId(symbol));
    return ts.createCall(ts.createIdentifier('Symbol.for'), [], [ts.createStringLiteral(uid)]);
  }

  function getImports(root: ts.SourceFile): ts.Token<ts.SyntaxKind.StringLiteral>[] {
    const fake = root as any;
    if (fake.imports && Array.isArray(fake.imports)) {
      return fake.imports;
    } else {
      return [];
    }
  }

  function getImportForType(typeChecker: ts.TypeChecker, imports: ts.Token<ts.SyntaxKind.StringLiteral>[], type: ts.TypeNode): ts.ImportSpecifier | undefined {
    for (const node of imports) {
      if (ts.isImportDeclaration(node.parent)) {
        const importClause = node.parent.importClause;
        if (importClause && importClause.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
          const elements = importClause.namedBindings.elements;
          for (const element of elements) {
            if (ts.isImportSpecifier(element)) {
              const importType = typeChecker.getTypeFromTypeNode(element.name as any as ts.TypeNode);
              const paramType = typeChecker.getTypeFromTypeNode(type);

              if ((importType as any).id === (paramType as any).id) {
                return element;
              }
            }
          }
        }
      }
    }

    return undefined;
  }

  function visitParametersNode(node: ts.CallExpression, typeChecker: ts.TypeChecker): ts.CallExpression {
    const signature = typeChecker.getResolvedSignature(node);
    if (!signature) {
      return node;
    }

    const { declaration } = signature;
    if (!declaration) {
      return node;
    }

    if (!ts.isMethodDeclaration(declaration) || !declaration.name) {
      return node;
    }

    const numArgs = declaration.name.getText() === 'bind' ? 2 : 1;
    
    if (node.arguments.length !== numArgs) {
      return node;
    }
    const type = typeChecker.getTypeFromTypeNode(node.arguments[numArgs - 1] as ts.Node as ts.TypeNode);
    if (!type.symbol.members) return node;

    const params: ts.Expression[] = [];
    type.symbol.members.forEach(val => {
      if (val.declarations.length === 0) return;

      const firstDeclaration = val.declarations[0];
      if (ts.isConstructorDeclaration(firstDeclaration)) {
        for (const param of firstDeclaration.parameters) {
          if (param.type) {
            const type = typeChecker.getTypeFromTypeNode(param.type);
            const symbol = type.symbol;
            if ((type.isClassOrInterface() && !type.isClass()) as boolean) {
              const uid = symbol.escapedName + "#" + hash(prefix + getId(symbol));
              params.push(ts.createCall(ts.createIdentifier('Symbol.for'), [], [ts.createStringLiteral(uid)]));
            } else {
              const imports = getImports(node.getSourceFile());
              const importElement = getImportForType(typeChecker, imports, param.type);
              if (importElement) {
                params.push(importElement.name);
              } else {
                params.push(ts.createLiteral(symbol.name));
              }
            }
          }
        }
      }
    });

    const args: ts.Expression[] = [];
    for (const val of node.arguments) {
      args.push(val);
    }

    args.push(ts.createArrayLiteral(params));

    node.arguments = ts.createNodeArray(args);

    return node;
  }

  const apiTs = path.dirname(__dirname).replace(/\\/g, "/");
  function getCallExpressionName(node: ts.Node, typeChecker: ts.TypeChecker): string | undefined {
    if (!ts.isCallExpression(node)) {
      return undefined;
    }
    const signature = typeChecker.getResolvedSignature(node);
    if (typeof signature === 'undefined') {
      return undefined;
    }
    const { declaration } = signature;
    if (!declaration) {
      return undefined;
    }
    const dirname = path.dirname(declaration.getSourceFile().fileName).replace(/\\/g, "/");
    if (apiTs !== dirname && dirname.indexOf(apiTs) !== 0) {
      return undefined;
    }
    if ((ts.isMethodDeclaration(declaration) || ts.isFunctionDeclaration(declaration)) && !!declaration.name) {
      return declaration.name.getText();
    }
    return undefined;
  }

  function isCallExpression(node: ts.Node, typeChecker: ts.TypeChecker): node is ts.CallExpression {
    if (node.kind !== ts.SyntaxKind.CallExpression) {
      return false;
    }
    const signature = typeChecker.getResolvedSignature(node as ts.CallExpression);
    if (typeof signature === 'undefined') {
      return false;
    }
    const { declaration } = signature;
    if (!declaration) {
      return false;
    }
    return (
      ts.isMethodDeclaration(declaration)
      || ts.isFunctionDeclaration(declaration)
    ) && !!declaration.name;
  }

  const prefix = crypto.randomBytes(256).toString('hex');

  return (context: ts.TransformationContext) => (file: ts.Node) => visitNodeAndChildren(file, program, context);
}
