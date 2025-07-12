/**
 * D2 Completion Enhancer
 * Advanced features for JetBrains-style intelligent completion
 */

import * as vscode from 'vscode';
import { D2Parser } from './d2Parser';

interface CompletionCache {
  document: string;
  shapes: Map<string, any>;
  connections: any[];
  lastUpdate: number;
}

interface CompletionMetrics {
  frequency: Map<string, number>;
  recentlyUsed: string[];
  contextualScore: Map<string, number>;
}

export class D2CompletionEnhancer {
  private cache: CompletionCache | null = null;
  private metrics: CompletionMetrics;
  private readonly CACHE_TTL = 1000; // 1 second cache
  private readonly MAX_RECENT_ITEMS = 10;

  constructor() {
    this.metrics = {
      frequency: new Map(),
      recentlyUsed: [],
      contextualScore: new Map()
    };
  }

  /**
   * Get enhanced completion items with smart filtering and prioritization
   */
  public enhanceCompletionItems(
    items: vscode.CompletionItem[],
    document: vscode.TextDocument,
    position: vscode.Position,
    context: any,
    currentWord?: string
  ): vscode.CompletionItem[] {
    // Apply smart filtering based on partial input
    const lineText = document.lineAt(position.line).text;
    const wordRange = document.getWordRangeAtPosition(position);
    const word = currentWord || (wordRange ? document.getText(wordRange) : '');

    // Filter and score items
    let enhancedItems = items.map(item => {
      const score = this.calculateItemScore(item, word, context);
      return { item, score };
    });

    // Sort by score (higher is better)
    enhancedItems.sort((a, b) => b.score - a.score);

    // Apply JetBrains-style enhancements
    return enhancedItems.map(({ item }, index) => {
      // Boost recently used items
      if (this.metrics.recentlyUsed.includes(item.label.toString())) {
        item.preselect = true;
      }

      // Add frequency indicators
      const frequency = this.metrics.frequency.get(item.label.toString()) || 0;
      if (frequency > 5) {
        item.detail = `${item.detail} ★`; // Star for frequently used
      }

      // Smart sorting with padded numbers
      item.sortText = String(index).padStart(4, '0');

      return item;
    });
  }

  /**
   * Calculate relevance score for a completion item
   */
  private calculateItemScore(
    item: vscode.CompletionItem,
    currentWord: string,
    context: any
  ): number {
    let score = 100;
    const label = item.label.toString();

    // Exact match bonus
    if (label === currentWord) {
      score += 1000;
    }

    // Prefix match bonus
    if (label.startsWith(currentWord)) {
      score += 500;
    }

    // Case-insensitive match
    if (label.toLowerCase().startsWith(currentWord.toLowerCase())) {
      score += 300;
    }

    // Fuzzy match scoring
    score += this.fuzzyMatchScore(currentWord, label);

    // Context-based scoring
    if (context.isInStyle && item.detail?.includes('[Style')) {
      score += 200;
    }

    if (context.isAfterColon && item.kind === vscode.CompletionItemKind.Value) {
      score += 150;
    }

    // Frequency bonus
    const frequency = this.metrics.frequency.get(label) || 0;
    score += frequency * 10;

    // Recently used bonus
    const recentIndex = this.metrics.recentlyUsed.indexOf(label);
    if (recentIndex >= 0) {
      score += (this.MAX_RECENT_ITEMS - recentIndex) * 20;
    }

    // Type-based priority
    switch (item.kind) {
      case vscode.CompletionItemKind.Keyword:
        score += 50;
        break;
      case vscode.CompletionItemKind.Property:
        score += 40;
        break;
      case vscode.CompletionItemKind.Value:
        score += 30;
        break;
      case vscode.CompletionItemKind.Variable:
        // Boost existing shapes/variables
        if (item.detail?.includes('[Existing')) {
          score += 200; // High priority for existing elements
        } else {
          score += 35;
        }
        break;
    }

    return score;
  }

  /**
   * Fuzzy matching algorithm (similar to JetBrains)
   */
  private fuzzyMatchScore(pattern: string, text: string): number {
    if (!pattern) return 0;

    let score = 0;
    let patternIndex = 0;
    let prevMatchIndex = -1;
    const patternLower = pattern.toLowerCase();
    const textLower = text.toLowerCase();

    for (let i = 0; i < textLower.length && patternIndex < patternLower.length; i++) {
      if (textLower[i] === patternLower[patternIndex]) {
        // Consecutive match bonus
        if (prevMatchIndex === i - 1) {
          score += 15;
        }
        
        // CamelCase match bonus
        if (i === 0 || (i > 0 && text[i - 1] === ' ') || 
            (text[i] === text[i].toUpperCase() && text[i - 1] !== text[i - 1].toUpperCase())) {
          score += 20;
        }

        score += 10;
        prevMatchIndex = i;
        patternIndex++;
      }
    }

    // Complete pattern match bonus
    if (patternIndex === patternLower.length) {
      score += 50;
      
      // Shorter matches are better
      score += Math.max(0, 30 - (text.length - pattern.length));
    }

    return score;
  }

  /**
   * Track item selection for learning
   */
  public trackSelection(item: vscode.CompletionItem): void {
    const label = item.label.toString();

    // Update frequency
    this.metrics.frequency.set(label, (this.metrics.frequency.get(label) || 0) + 1);

    // Update recently used
    this.metrics.recentlyUsed = this.metrics.recentlyUsed.filter(l => l !== label);
    this.metrics.recentlyUsed.unshift(label);
    if (this.metrics.recentlyUsed.length > this.MAX_RECENT_ITEMS) {
      this.metrics.recentlyUsed.pop();
    }
  }

  /**
   * Get cached parser results for performance
   */
  public getCachedParseResults(document: vscode.TextDocument): {
    shapes: Map<string, any>;
    connections: any[];
  } | null {
    const docText = document.getText();
    
    // Check cache validity
    if (this.cache && 
        this.cache.document === docText && 
        Date.now() - this.cache.lastUpdate < this.CACHE_TTL) {
      return {
        shapes: this.cache.shapes,
        connections: this.cache.connections
      };
    }

    // Parse document
    const parser = new D2Parser(docText);
    parser.parse();
    
    // Update cache
    this.cache = {
      document: docText,
      shapes: new Map(parser.getAllShapes().map(s => [s.identifier, s])),
      connections: parser.getAllConnections(),
      lastUpdate: Date.now()
    };

    return {
      shapes: this.cache.shapes,
      connections: this.cache.connections
    };
  }

  /**
   * Get AI-powered suggestions for common patterns
   */
  public getPatternSuggestions(
    context: any,
    existingShapes: Map<string, any>
  ): vscode.CompletionItem[] {
    const suggestions: vscode.CompletionItem[] = [];

    // Suggest common architectural patterns
    if (existingShapes.has('client') && !existingShapes.has('server')) {
      const item = new vscode.CompletionItem('server', vscode.CompletionItemKind.Snippet);
      item.detail = '[Pattern Suggestion]';
      item.documentation = 'Complete client-server architecture';
      item.insertText = new vscode.SnippetString('server: {\n\tshape: cylinder\n}\nclient -> server: request');
      item.preselect = true;
      suggestions.push(item);
    }

    if (existingShapes.has('database') && !existingShapes.has('cache')) {
      const item = new vscode.CompletionItem('cache', vscode.CompletionItemKind.Snippet);
      item.detail = '[Pattern Suggestion]';
      item.documentation = 'Add caching layer';
      item.insertText = new vscode.SnippetString('cache: {\n\tshape: hexagon\n\tstyle.fill: orange\n}');
      suggestions.push(item);
    }

    // Suggest common style patterns
    if (context.isInStyle) {
      const item = new vscode.CompletionItem('modern-style', vscode.CompletionItemKind.Snippet);
      item.detail = '[Style Pattern]';
      item.documentation = 'Apply modern styling';
      item.insertText = new vscode.SnippetString('fill: #2563eb\nstroke: #1e40af\nstroke-width: 2\nshadow: true\nborder-radius: 8');
      suggestions.push(item);
    }

    return suggestions;
  }

  /**
   * Get quick documentation for hover
   */
  public getQuickDocumentation(label: string): vscode.MarkdownString | undefined {
    const docs: Record<string, string> = {
      'shape': '**shape** - Defines the visual representation of a node\n\nCommon shapes: `square`, `circle`, `cylinder`, `cloud`',
      'style': '**style** - Groups visual properties\n\nExample:\n```d2\nstyle: {\n  fill: blue\n  stroke: red\n}\n```',
      'fill': '**fill** - Background color\n\nExamples: `red`, `#FF0000`, `transparent`',
      'stroke': '**stroke** - Border color\n\nExamples: `black`, `#000000`',
      '->': '**->** - Directed connection\n\nCreates an arrow from source to target',
      '<->': '**<->** - Bidirectional connection\n\nCreates arrows in both directions'
    };

    const doc = docs[label];
    return doc ? new vscode.MarkdownString(doc) : undefined;
  }
} 