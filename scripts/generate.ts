import ts, { factory } from "typescript";
import { readdir, readFile, writeFile } from "node:fs/promises";
import * as path from "node:path";

const operations = [
    {
        name: "ChangePassword"
    },
    {
        name: "ForgotPassword"
    },
    {
        name: "ConfirmForgotPassword"
    },
    {
        name: "ConfirmSignUp"
    },
    {
        name: "GetUser"
    },
    {
        name: "ResendConfirmationCode"
    },
    {
        name: "SignUp"
    },
    {
        name: "InitiateAuth"
    },
    {
        name: "RespondToAuthChallenge"
    }
];

const actionsDirpath = path.join(
    import.meta.dirname,
    "..",
    "src",
    "actions"
);

const modelsDirpath = path.join(
    import.meta.dirname,
    "..",
    "node_modules/@aws-sdk/client-cognito-identity-provider/dist-types/models"
);
const modelFiles = (await Promise.all(
    (await readdir(modelsDirpath))
        .filter(f => f.startsWith("models_"))
        .map(f => modelsDirpath + "/" + f)
        .map(async (f) => {
            const fileContent = await readFile(f, "utf-8");
            return ts.createSourceFile(
                f,          // File name
                fileContent,       // File content
                ts.ScriptTarget.ESNext, // Language version (adjust as needed)
                false               // SetParentNodes flag for full AST navigation
        );
        })
)).map(s => {
    const all: ts.Node[] = [];
    ts.forEachChild(s, v => {
        all.push(v);
    });
    return all;
});

type NodeInfo = {
    readonly node: ts.Node;
    readonly source: ts.Node;
}

async function findInterfacesOrTypesByName(name: string) {
    let results: NodeInfo[] = [];
    for (const nodes of modelFiles) {
        for (const source of nodes) {
            if (ts.isInterfaceDeclaration(source) && source.name.escapedText === name) {
                results.push({
                    node: factory.createInterfaceDeclaration(
                        undefined, source.name,
                        source.typeParameters, source.heritageClauses, name.endsWith("Request")
                            ? source.members.filter(m => !ts.isPropertySignature(m) || !ts.isIdentifier(m.name) || m.name.escapedText !== "ClientId")
                            : source.members
                    ),
                    source
                });
            } else if (ts.isTypeAliasDeclaration(source) && source.name.escapedText === name) {
                results.push({
                    node: factory.createTypeAliasDeclaration(
                        undefined, source.name, source.typeParameters, source.type
                    ),
                    source
                });
            } else if (ts.isVariableStatement(source) && source.declarationList.declarations.some(d => ts.isIdentifier(d.name) && d.name.escapedText === name)) {
                results.push({
                    node: factory.createVariableStatement(
                        source.modifiers?.filter(m => m.kind === ts.SyntaxKind.DeclareKeyword), source.declarationList
                    ),
                    source
                });
            }
        }
    }
    if (results.length === 0) {
        throw new Error(`Cannot find interface or type ${name} `)
    }
    return results;
}
 
const builtInTypes = ["Record"];

async function findInterfaceOrTypeAndLinkedTypesByName(name: string): Promise<readonly NodeInfo[]> {
    const coreNodes = await findInterfacesOrTypesByName(name);
    return (await Promise.all(
        coreNodes.map(async (info) => {
            const { node } = info;
            if (!ts.isInterfaceDeclaration(node)) {
                return [info];
            }

            const memberTypes = node.members.flatMap((m) => {
                if (ts.isTypeAliasDeclaration(m)) {
                    if (ts.isUnionTypeNode(m.type)) {
                        return m.type.types;
                    }
                }
                if (ts.isPropertySignature(m)) {
                    if (m.type && ts.isUnionTypeNode(m.type)) {
                        return m.type.types;
                    }
                }
                console.log("Error", m);
                throw new Error("Unrecognised");
            })
            .flatMap((t) => {
                if (ts.isTypeReferenceNode(t) && ts.isIdentifier(t.typeName)) {
                    return [t.typeName.escapedText.toString()]
                }
                if (ts.isArrayTypeNode(t) && ts.isTypeReferenceNode(t.elementType) && ts.isIdentifier(t.elementType.typeName)) {
                    return [t.elementType.typeName.escapedText.toString()]
                }
                return [];
            }).filter(t => !builtInTypes.includes(t));
            if (memberTypes.length === 0) {
                return [info];
            }

            const uniqueMemberTypes = memberTypes.filter((v, i) => !memberTypes.slice(0, i).includes(v));
            return [
                info,
                ...(await Promise.all(uniqueMemberTypes.map(t => findInterfaceOrTypeAndLinkedTypesByName(t)))).flat()
            ];
        })
    )).flat();
}

const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
await Promise.all(
    operations.map(async (o) => {
        const filename = o.name.replace(/([a-z0–9])([A-Z])/g, "$1-$2").toLowerCase();
        const sourceFile = ts.createSourceFile(
            `${filename}.ts`,
            '',
            ts.ScriptTarget.Latest,
            false,
            ts.ScriptKind.TS,
          );

          // Find model types
          const requestName = `${o.name}Request`;
          const responseName = `${o.name}Response`;
          const [requestAsts, responseAsts] = await Promise.all([
            findInterfaceOrTypeAndLinkedTypesByName(requestName),
            findInterfaceOrTypeAndLinkedTypesByName(responseName)
          ]);
          const { node: responseAst } = responseAsts[0];
          if (!ts.isInterfaceDeclaration(responseAst)) {
            throw new Error("Response is not an interface");
          }
          const emptyValidForResponse = responseAst.members.every(m => m.questionToken);
          const uniqueAsts = [...requestAsts, ...responseAsts].reduce((accu, a) => {
            if (accu.some(s => s.source === a.source)) {
                return accu;
            }
            return [...accu, a];
          }, [] as readonly NodeInfo[]).map(a => a.node);
          const oNameLower = o.name.charAt(0).toLowerCase() + o.name.substring(1);

          const requestResponseTypes = printer.printList(ts.ListFormat.MultiLine, factory.createNodeArray(uniqueAsts), sourceFile);

          const handlerOutput = `
            import type { RestHandlersFactory } from "@dhau/msw-builders";
            import { isMatch } from "../utils.ts";
            import type { HandlerOptions } from "../create-handler.ts";
            import { createCognitoPostHandler } from "../create-handler.ts";

            ${requestResponseTypes}

            function ${oNameLower}Handler(
                factory: RestHandlersFactory,
                request: ${requestName},
                response${emptyValidForResponse ? "?" : ""}: ${responseName},
                handlerOptions?: HandlerOptions,
            ) {
                return createCognitoPostHandler(
                    factory,
                    {
                        target: "AWSCognitoIdentityProviderService.${o.name}",
                        bodyMatcher: (b) =>
                            isMatch(b, request),
                        matchResponse: {
                            status: 200,
                            body: ${emptyValidForResponse ? `(response ?? {}) satisfies ${responseName}` : "response"},
                        },
                    },
                    handlerOptions,
                );
            }

            export type { ${requestName}, ${responseName} };
            export default ${oNameLower}Handler;
          `;

          await writeFile(
            path.join(actionsDirpath, sourceFile.fileName),
            handlerOutput,
            "utf-8"
          )
    })
)
