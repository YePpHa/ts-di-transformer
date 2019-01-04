import * as ts from 'typescript';
import * as path from 'path';
import * as crypto from 'crypto';

function hash(str: string): string {
  const h = crypto.createHash('sha256');
  h.update(str);

  return h.digest('hex');
}

function getId(type: ts.Type): string {
  return (type.symbol as any).id;
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

    const type = typeChecker.getTypeFromTypeNode(node.typeArguments[0]);
    if (type.isClass() || !type.isClassOrInterface()) {
      throw new Error("The type provided is not an interface.");
    }
    
    const uid = hash(prefix + getId(type));
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

    if (!ts.isMethodDeclaration(declaration) || !declaration.name) {
      return node;
    }

    const numArgs = declaration.name.getText() === 'bind' ? 2 : 1;
    
    if (node.arguments.length !== numArgs) {
      return node;
    }
    const type = typeChecker.getTypeFromTypeNode(node.arguments[numArgs - 1] as ts.Node as ts.TypeNode);
    if (!type.symbol.members) return node;

    const params: any[] = [];
    type.symbol.members.forEach((val, key) => {
      if (val.declarations.length === 0) return;

      const firstDeclaration = val.declarations[0];
      if (ts.isConstructorDeclaration(firstDeclaration)) {
        for (const param of firstDeclaration.parameters) {
          if (param.type) {
            const type = typeChecker.getTypeFromTypeNode(param.type);
            if (type.isClassOrInterface() && !type.isClass()) {
              const uid = hash(prefix + getId(type));
              params.push(ts.createCall(ts.createIdentifier('Symbol.for'), [], [ts.createStringLiteral(uid)]));
            } else {
              params.push(ts.createIdentifier(type.symbol.name));
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

    /*if (declaration.name.getText() === 'bind') {
      const firstArgument = node.arguments[0];
      if (ts.isIdentifier(firstArgument)) {
        const uid = hash(prefix + (firstArgument as any).id);
        args[0] = ts.createCall(ts.createIdentifier('Symbol.for'), [], [ts.createStringLiteral(uid)]);
      }
    }*/

    node.arguments = ts.createNodeArray(args);

    return node;
  }

  const apiTs = [
    path.join(__dirname, 'api.ts'),
    path.join(__dirname, 'api.d.ts'),
    path.join(__dirname, '../src/api.ts')
  ];
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
    const filename = path.join(declaration.getSourceFile().fileName);
    if (apiTs.indexOf(filename) === -1) {
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
