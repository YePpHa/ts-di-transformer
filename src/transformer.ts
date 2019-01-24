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

  function visitParametersNode(node: ts.CallExpression, typeChecker: ts.TypeChecker): ts.CallExpression {
    const signature = typeChecker.getResolvedSignature(node);
    if (!signature) {
      return node;
    }

    const { declaration } = signature;
    if (!declaration) {
      return node;
    }

    if (
      (
        !ts.isMethodDeclaration(declaration)
        && !ts.isMethodSignature(declaration)
      )
      || !declaration.name
    ) {
      return node;
    }

    const isBind = declaration.name.getText() === 'bind';
    if (isBind) {
      const parent = node.parent.parent;
      if (isCallExpression(parent, typeChecker)) {
        const methodName = getCallExpressionName(parent, typeChecker);
        if (methodName === 'to') {
          node.parent.parent = visitParametersNode(parent, typeChecker);
          return node;
        }
      }
    }
    
    if (node.arguments.length !== 1) {
      return node;
    }

    const type = typeChecker.getTypeFromTypeNode(node.arguments[0] as ts.Node as ts.TypeNode);
    if (!type.symbol || !type.symbol.members) return node;

    const params: any[] = [];
    type.symbol.members.forEach(val => {
      if (val.declarations.length === 0) return;

      const firstDeclaration = val.declarations[0];
      if (ts.isConstructorDeclaration(firstDeclaration)) {
        for (const param of firstDeclaration.parameters) {
          if (param.type) {
            if (ts.isArrayTypeNode(param.type)) {
              
            } else {
              const type = typeChecker.getTypeFromTypeNode(param.type);
              const symbol = type.symbol;
              if ((type.isClassOrInterface() && !type.isClass()) as boolean) {
                const uid = symbol.escapedName + "#" + hash(prefix + getId(symbol));
                params.push(ts.createCall(ts.createIdentifier('Symbol.for'), [], [ts.createStringLiteral(uid)]));
              } else {
                params.push(ts.createIdentifier(symbol.name));
              }
            }
          }
        }
      }
    });

    const args: any[] = [];
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
    if (
      (
        ts.isMethodDeclaration(declaration)
        || ts.isMethodSignature(declaration)
        || ts.isFunctionDeclaration(declaration)
      )
      && !!declaration.name
    ) {
      return declaration.name.getText();
    }
    return undefined;
  }

  function isCallExpression(node: ts.Node, typeChecker: ts.TypeChecker): node is ts.CallExpression {
    if (!ts.isCallExpression(node)) {
      return false;
    }
    const signature = typeChecker.getResolvedSignature(node);
    if (typeof signature === 'undefined') {
      return false;
    }
    const { declaration } = signature;
    if (!declaration) {
      return false;
    }
    return (
      ts.isMethodDeclaration(declaration)
      || ts.isMethodSignature(declaration)
      || ts.isFunctionDeclaration(declaration)
    ) && !!declaration.name;
  }

  const prefix = crypto.randomBytes(256).toString('hex');

  return (context: ts.TransformationContext) => (file: ts.Node) => visitNodeAndChildren(file, program, context);
}
