// tslint:disable:max-classes-per-file

import * as Lint from 'tslint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
  public static failureMessage = 'padding space in classes not allowed';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new NoClassPaddingWalker(sourceFile, this.getOptions()));
  }
}

class NoClassPaddingWalker extends Lint.RuleWalker {
  static ignoreStringsPattern = /([`"'])[\S\s]*?(\1)/g;
  static matchPaddingStartPattern = /class[^{]+{(\s*\n){2,}/;
  static matchPaddingEndPattern = /\n\s*\n\s*}/;

  public visitClassDeclaration(node: ts.ClassDeclaration): void {
    const text = node.getText().replace(NoClassPaddingWalker.ignoreStringsPattern, '');

    if (NoClassPaddingWalker.matchPaddingStartPattern.test(text)) {
      const children = node.getChildren();

      const startNode = children.find((child) => child.getText() === 'class');
      const endNode = children.find((child) => child.getText() === '{');

      this.addFailureAt(startNode.getStart(), endNode.getStart() - startNode.getStart() + 1, Rule.failureMessage);
    }

    if (NoClassPaddingWalker.matchPaddingEndPattern.test(text)) {
      const lastToken = node.getLastToken();
      this.addFailureAt(lastToken.getStart() - 1, lastToken.getEnd(), Rule.failureMessage);
    }

    super.visitClassDeclaration(node);
  }
}
