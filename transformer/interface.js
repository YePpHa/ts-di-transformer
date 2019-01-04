const ts = require('typescript');
const path = require('path');
const crypto = require('crypto');

function hash(str) {
  const h = crypto.createHash('sha256');
  h.update(str);

  return h.digest('hex');
}

function getId(type) {
  return type.symbol.declarations[0].id;
}

module.exports = function(program) {
  function visitNodeAndChildren(node, program, context) {
    return ts.visitEachChild(visitNode(node, program), childNode => visitNodeAndChildren(childNode, program, context), context);
  }

  function visitNode(node, program) {
    const typeChecker = program.getTypeChecker();
    if (isSymbolCallExpression(node, typeChecker)) {
      return visitSymbolNode(node, typeChecker);
    } else if (isParametersCallExpression(node, typeChecker)) {
      return visitParametersNode(node, typeChecker);
    }
    return node;
  }

  function visitSymbolNode(node, typeChecker) {
    if (!node.typeArguments) {
      return ts.createIdentifier("Symbol()");
    }

    const type = typeChecker.getTypeFromTypeNode(node.typeArguments[0]);
    
    const uid = hash(prefix + getId(type));
    return ts.createCall(ts.createIdentifier('Symbol.for'), [], [ts.createStringLiteral(uid)]);
  }

  function visitParametersNode(node, typeChecker) {
    const { declaration } = typeChecker.getResolvedSignature(node);

    const numArgs = declaration['name'].getText() === 'bind' ? 2 : 1;
    
    if (node.arguments.length !== numArgs) {
      return node;
    }
    const type = typeChecker.getTypeFromTypeNode(node.arguments[numArgs - 1]);

    const params = [];
    type.symbol.members.forEach((val, key) => {
      if (key.toString() === '__constructor') {
        for (const param of val.declarations[0].parameters) {
          const type = typeChecker.getTypeFromTypeNode(param.type);
          const uid = hash(prefix + getId(type));
          params.push(ts.createCall(ts.createIdentifier('Symbol.for'), [], [ts.createStringLiteral(uid)]));
        }
      }
    });

    node.arguments.push(ts.createArrayLiteral(params));

    return node;
  }

  const apiTs = path.join(__dirname, 'api.ts');
  function getCallExpressionName(node, typeChecker) {
    if (node.kind !== ts.SyntaxKind.CallExpression) {
      return undefined;
    }
    const signature = typeChecker.getResolvedSignature(node);
    if (typeof signature === 'undefined') {
      return undefined;
    }
    const { declaration } = signature;
    if (
      !!declaration
      && (path.join(declaration.getSourceFile().fileName) === apiTs)
      && !!declaration['name']
    ) {
      return declaration['name'].getText();
    }
    return undefined;
  }

  function isSymbolCallExpression(node, typeChecker) {
    return getCallExpressionName(node, typeChecker) === 'InterfaceSymbol';
  }
  function isParametersCallExpression(node, typeChecker) {
    const name = getCallExpressionName(node, typeChecker);
    return name === 'startBootstrap' || name === 'bind';
  }

  const prefix = crypto.randomBytes(256).toString('hex');
  const cache = {};

  return (context) => (file) => visitNodeAndChildren(file, program, context, cache);
}
