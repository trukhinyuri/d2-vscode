/**
 * D2 Hover Provider
 * Provides hover documentation for D2 language elements
 */

import * as vscode from 'vscode';
import { D2Parser } from './d2Parser';
import { D2CompletionEnhancer } from './d2CompletionEnhancer';

export class D2HoverProvider implements vscode.HoverProvider {
  private enhancer: D2CompletionEnhancer;

  constructor() {
    this.enhancer = new D2CompletionEnhancer();
  }

  public provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    // Check if hover is enabled
    const config = vscode.workspace.getConfiguration('d2');
    if (!config.get('hover.enabled', true)) {
      return null;
    }

    const wordRange = document.getWordRangeAtPosition(position);
    if (!wordRange) {
      return null;
    }

    const word = document.getText(wordRange);
    
    // Get quick documentation from enhancer
    const quickDoc = this.enhancer.getQuickDocumentation(word);
    if (quickDoc) {
      return new vscode.Hover(quickDoc, wordRange);
    }

    // Check for D2-specific documentation
    const hoverContent = this.getD2Documentation(word);
    if (hoverContent) {
      return new vscode.Hover(hoverContent, wordRange);
    }

    return null;
  }

  private getD2Documentation(word: string): vscode.MarkdownString | null {
    const docs: Record<string, string> = {
      // Shapes
      'square': '**square** - Basic square shape\n\n```d2\nbox.shape: square\n```',
      'rectangle': '**rectangle** - Rectangular shape (default)\n\n```d2\nbox.shape: rectangle\n```',
      'circle': '**circle** - Circular shape\n\n```d2\nnode.shape: circle\n```',
      'oval': '**oval** - Elliptical shape\n\n```d2\nnode.shape: oval\n```',
      'diamond': '**diamond** - Diamond/rhombus shape\n\n```d2\ndecision.shape: diamond\n```',
      'hexagon': '**hexagon** - Six-sided shape\n\n```d2\nservice.shape: hexagon\n```',
      'cloud': '**cloud** - Cloud shape for external services\n\n```d2\nexternal.shape: cloud\n```',
      'cylinder': '**cylinder** - Database/storage shape\n\n```d2\ndb.shape: cylinder\n```',
      'person': '**person** - Actor/user shape\n\n```d2\nuser.shape: person\n```',
      
      // Style properties
      'fill': '**fill** - Background color\n\nSets the fill color of a shape.\n\n```d2\nbox.style.fill: blue\n```\n\nSupports:\n- Named colors: `red`, `blue`, `green`\n- Hex colors: `#FF0000`\n- `transparent` for no fill',
      
      'stroke': '**stroke** - Border color\n\nSets the border color.\n\n```d2\nbox.style.stroke: black\n```',
      
      'stroke-width': '**stroke-width** - Border thickness\n\nSets border width in pixels.\n\n```d2\nbox.style.stroke-width: 2\n```',
      
      'opacity': '**opacity** - Transparency\n\nSets element transparency (0-1).\n\n```d2\nbox.style.opacity: 0.8\n```',
      
      'shadow': '**shadow** - Drop shadow\n\nAdds shadow effect.\n\n```d2\nbox.style.shadow: true\n```',
      
      // Keywords
      'direction': '**direction** - Layout direction\n\nControls diagram flow direction.\n\n```d2\ndirection: right\n```\n\nOptions: `up`, `down`, `left`, `right`',
      
      'near': '**near** - Relative positioning\n\nPositions shape near another.\n\n```d2\nlabel.near: box\n```',
      
      'icon': '**icon** - Shape icon\n\nAdds icon to shape.\n\n```d2\nserver.icon: https://icons.terrastruct.com/aws/compute/EC2.svg\n```',
      
      'vars': '**vars** - Variables\n\nDefines reusable variables.\n\n```d2\nvars: {\n  primary-color: "#2563eb"\n}\nbox.style.fill: ${primary-color}\n```',
      
      'classes': '**classes** - Style classes\n\nDefines reusable style classes.\n\n```d2\nclasses: {\n  important: {\n    style.fill: red\n    style.bold: true\n  }\n}\nbox.class: important\n```'
    };

    const content = docs[word.toLowerCase()];
    return content ? new vscode.MarkdownString(content) : null;
  }
}

/**
 * Register the hover provider
 */
export function registerD2HoverProvider(context: vscode.ExtensionContext): void {
  const provider = new D2HoverProvider();
  
  const disposable = vscode.languages.registerHoverProvider('d2', provider);
  context.subscriptions.push(disposable);
} 