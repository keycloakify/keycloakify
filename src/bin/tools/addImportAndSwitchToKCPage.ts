import ts from "typescript";
import * as fs from "fs";
// import * as prettier from "prettier";

export const addImportAndSwitchToKCPage = async (
    kcPagePath: string,
    caseName: string,
    reactComponentName: string,
    isFormField: boolean
): Promise<void> => {
    let content = fs.readFileSync(kcPagePath).toString("utf-8");
    const sourceFile = ts.createSourceFile(
        "temp.tsx",
        content,
        ts.ScriptTarget.ESNext,
        true,
        ts.ScriptKind.TSX
    );
    const result = ts.transform(sourceFile, [
        typescriptTransformer(caseName, reactComponentName, isFormField)
    ]);
    const printer = ts.createPrinter();
    const transformedSourceFile = result.transformed[0] as ts.SourceFile;
    content = printer.printFile(transformedSourceFile);

    //TODO Unfortunately this will cause build error after compilation so we can't prettify kcPage before printing for now
    //Prettify ts file before returning
    // let formatedContent = await prettier.format(content, {
    //     parser: "typescript",
    //     printWidth: 90,
    //     tabWidth: 4,
    //     useTabs: false,
    //     semi: true,
    //     singleQuote: false,
    //     trailingComma: "none",
    //     bracketSpacing: true,
    //     arrowParens: "avoid"
    // });
    fs.writeFileSync(kcPagePath, content);
};

const typescriptTransformer =
    (caseName: string, reactComponentName: string, isFormField: boolean) =>
    <T extends ts.Node>(context: ts.TransformationContext) =>
    (rootNode: T) => {
        const visit = (sourceFile: ts.Node): ts.Node => {
            if (ts.isSourceFile(sourceFile)) {
                // Find index of last import statements in the source file to put new import there
                const lastImportIndex = sourceFile.statements.findIndex(
                    stmt => !ts.isImportDeclaration(stmt)
                );

                sourceFile = ts.factory.updateSourceFile(sourceFile, [
                    ...sourceFile.statements.slice(0, lastImportIndex),
                    // Create const reactComponentName = lazy(() => import("importName"));
                    ts.factory.createVariableStatement(
                        undefined, // No modifiers (e.g., export, declare)
                        ts.factory.createVariableDeclarationList(
                            [
                                ts.factory.createVariableDeclaration(
                                    ts.factory.createIdentifier(reactComponentName),
                                    undefined, // No type annotation
                                    undefined, // No initializer type
                                    ts.factory.createCallExpression(
                                        ts.factory.createIdentifier("lazy"),
                                        undefined, // No type arguments
                                        [
                                            ts.factory.createArrowFunction(
                                                undefined, // No modifiers
                                                undefined, // No type parameters
                                                [], // No parameters
                                                undefined, // No return type annotation
                                                ts.factory.createToken(
                                                    ts.SyntaxKind.EqualsGreaterThanToken
                                                ),
                                                ts.factory.createCallExpression(
                                                    ts.factory.createIdentifier("import"),
                                                    undefined, // No type arguments
                                                    [
                                                        ts.factory.createStringLiteral(
                                                            `./pages/${reactComponentName}`
                                                        )
                                                    ]
                                                )
                                            )
                                        ]
                                    )
                                )
                            ],
                            ts.NodeFlags.Const // Declare as const
                        )
                    ),
                    ...sourceFile.statements.slice(lastImportIndex)
                ]);
            }
            return ts.visitEachChild(sourceFile, node => convertNode(node), context);
        };

        // Helper function to handle node conversion
        const convertNode = (node: ts.Node): ts.Node => {
            return ts.visitEachChild(node, visitChild, context);
        };

        const visitChild = (child: ts.Node): ts.Node | undefined => {
            // Check for a specific switch statement with kcContext.pageId  pass from args
            if (
                ts.isSwitchStatement(child) &&
                child.expression.getText() === "kcContext.pageId"
            ) {
                //Create a react component e.g  <SomeComponent> </SomeComponent> with it's attributes
                //{...{ kcContext, i18n, classes }}
                //Template={Template}
                //oUseDefaultCss={true}
                const registerStatement = ts.factory.createExpressionStatement(
                    ts.factory.createJsxSelfClosingElement(
                        ts.factory.createIdentifier(reactComponentName),
                        undefined,
                        ts.factory.createJsxAttributes([
                            ts.factory.createJsxSpreadAttribute(
                                ts.factory.createObjectLiteralExpression([
                                    ts.factory.createShorthandPropertyAssignment(
                                        "kcContext"
                                    ),
                                    ts.factory.createShorthandPropertyAssignment("i18n"),
                                    ts.factory.createShorthandPropertyAssignment(
                                        "classes"
                                    )
                                ])
                            ),
                            ts.factory.createJsxAttribute(
                                ts.factory.createIdentifier("Template"),
                                ts.factory.createJsxExpression(
                                    undefined,
                                    ts.factory.createIdentifier("Template")
                                )
                            ),
                            ts.factory.createJsxAttribute(
                                ts.factory.createIdentifier("doUseDefaultCss"),
                                ts.factory.createJsxExpression(
                                    undefined,
                                    ts.factory.createTrue()
                                )
                            ),
                            //Conditionally add UserProfileFormFields and doMakeUserConfirmPassword
                            ...(isFormField
                                ? [
                                      ts.factory.createJsxAttribute(
                                          ts.factory.createIdentifier(
                                              "UserProfileFormFields"
                                          ),
                                          ts.factory.createJsxExpression(
                                              undefined,
                                              ts.factory.createIdentifier(
                                                  "UserProfileFormFields"
                                              )
                                          )
                                      ),
                                      ts.factory.createJsxAttribute(
                                          ts.factory.createIdentifier(
                                              "doMakeUserConfirmPassword"
                                          ),
                                          ts.factory.createJsxExpression(
                                              undefined,
                                              ts.factory.createIdentifier(
                                                  "doMakeUserConfirmPassword"
                                              )
                                          )
                                      )
                                  ]
                                : [])
                        ])
                    )
                );
                // create new case statement dynamically
                const newCaseClause = ts.factory.createCaseClause(
                    ts.factory.createStringLiteral(caseName),
                    //Add return(...) to component
                    [ts.factory.createReturnStatement(registerStatement.expression)]
                );

                //Add new case to the beginning of switch statement
                const updatedClauses = ts.factory.createNodeArray([
                    newCaseClause,
                    ...child.caseBlock.clauses
                ]);

                //Update the node itself
                child = ts.factory.updateSwitchStatement(
                    child,
                    child.expression,
                    ts.factory.updateCaseBlock(child.caseBlock, updatedClauses)
                );
            }

            return ts.visitEachChild(child, visitChild, context);
        };

        return ts.visitNode(rootNode, visit);
    };
