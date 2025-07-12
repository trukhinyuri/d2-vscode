/**
 * D2 Completion Provider
 * Provides intelligent code completion for D2 diagrams
 */

import * as vscode from 'vscode';
import { D2Parser } from './d2Parser';
import { 
  D2CompletionItem,
  D2_SHAPES,
  D2_STYLE_PROPERTIES,
  D2_KEYWORDS,
  D2_DIRECTIONS,
  D2_ARROWHEADS,
  D2_CONNECTIONS,
  D2_COLORS,
  D2_BOOLEANS,
  D2_SPECIAL_BLOCKS,
  D2_MULTI_WORD_SUGGESTIONS,
  getCompletionItemsForContext
} from './d2CompletionData';
import { D2CompletionEnhancer } from './d2CompletionEnhancer';

export class D2CompletionProvider implements vscode.CompletionItemProvider {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private enhancer: D2CompletionEnhancer;
  private performanceTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('d2');
    this.enhancer = new D2CompletionEnhancer();
  }

  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    // Check if completion is enabled
    const config = vscode.workspace.getConfiguration('d2');
    if (!config.get('completion.enabled', true)) {
      return [];
    }

    const startTime = Date.now();
    
    // Don't provide completions in comments or strings (unless explicitly invoked)
    const lineText = document.lineAt(position.line).text;
    const linePrefix = lineText.substring(0, position.character);
    
    // Get the current word being typed (including spaces for multi-word identifiers)
    const currentWordMatch = linePrefix.match(/([a-zA-Z0-9_\-\s]+)$/);
    const currentWord = currentWordMatch ? currentWordMatch[1].trim() : '';
    
    // Create parser and analyze document
    const parser = new D2Parser(document.getText());
    const ast = parser.parse();
    const parserContext = parser.getContextAtPosition(document.offsetAt(position));

    // Don't provide completions in comments
    if (parserContext.isInComment) {
      return [];
    }

    // Get all defined shapes for reference
    const definedShapes = parser.getAllShapes();
    const shapesMap = new Map(definedShapes.map(shape => [shape.identifier, shape]));

    // Build completion items based on context
    let completionItems: vscode.CompletionItem[] = [];

    // Check what property we're completing
    const propertyMatch = linePrefix.match(/(\w+)\s*:\s*(\w*)$/);
    const propertyName = propertyMatch ? propertyMatch[1] : undefined;

    // After connection operator - suggest existing shapes
    if (parserContext.isInConnection || /[\-<>]+\s*$/.test(linePrefix)) {
      completionItems = this.getShapeCompletions(shapesMap, parserContext.precedingText, currentWord);
      
      // Add multi-word suggestions if enabled (lower priority)
      if (config.get('completion.verboseMultiWord', true)) {
        const multiWordItems = D2_MULTI_WORD_SUGGESTIONS.map(item => {
          const completionItem = this.createCompletionItem(item);
          // Set lower priority than existing shapes
          if (completionItem.sortText) {
            completionItem.sortText = '3' + completionItem.sortText;
          } else {
            completionItem.sortText = '30';
          }
          return completionItem;
        });
        completionItems.push(...multiWordItems);
      }
    }
    // After dot - suggest nested shapes or properties
    else if (parserContext.isAfterDot || lineText.substring(0, position.character).includes('.')) {
      completionItems = this.getDotCompletions(linePrefix, shapesMap, parserContext);
      // Return only dot-specific completions
      return new vscode.CompletionList(completionItems, false);
    }
    // After colon - context-aware value suggestions
    else if (parserContext.isAfterColon && propertyName) {
      const contextItems = getCompletionItemsForContext({
        isAfterColon: true,
        isInStyle: parserContext.isInStyle,
        isAfterDot: parserContext.isAfterDot,
        propertyName: propertyName
      });

      completionItems = contextItems.map(item => this.createCompletionItem(item));

      // Add existing shapes if completing 'near' property
      if (propertyName === 'near') {
        completionItems.push(...this.getShapeCompletions(shapesMap, '', currentWord));
      }
    }
    // In style block - suggest style properties
    else if (parserContext.isInStyle || /style\s*:\s*\{/.test(linePrefix)) {
      completionItems = D2_STYLE_PROPERTIES.map(item => this.createCompletionItem(item));
    }
    // Default context - suggest keywords, shapes, connections
    else {
      // Existing shapes (highest priority)
      completionItems.push(...this.getShapeCompletions(shapesMap, '', currentWord));
      
      // If user is typing something that could be a new shape name, suggest creating it
      if (currentWord && currentWord.length > 0) {
        // Check if exact match already exists
        const exactExists = Array.from(shapesMap.keys()).some(
          key => key.toLowerCase() === currentWord.toLowerCase()
        );
        
        if (!exactExists) {
          // Add suggestion to create new shape with the current word
          const newShapeItem = new vscode.CompletionItem(
            currentWord,
            vscode.CompletionItemKind.Text
          );
          newShapeItem.detail = '[New Shape]';
          newShapeItem.documentation = `Create new shape: ${currentWord}`;
          newShapeItem.sortText = '1' + currentWord; // After all existing shapes
          completionItems.push(newShapeItem);
        }
      }
      
      // Keywords (medium priority)
      const keywordItems = D2_KEYWORDS.map(item => {
        const completionItem = this.createCompletionItem(item);
        // Adjust sort text to be after existing shapes
        if (completionItem.sortText) {
          completionItem.sortText = '2' + completionItem.sortText;
        } else {
          completionItem.sortText = '20';
        }
        return completionItem;
      });
      completionItems.push(...keywordItems);
      
      // Connection operators
      if (/\w+\s*$/.test(linePrefix)) {
        const connectionItems = D2_CONNECTIONS.map(item => {
          const completionItem = this.createCompletionItem(item);
          if (completionItem.sortText) {
            completionItem.sortText = '3' + completionItem.sortText;
          } else {
            completionItem.sortText = '30';
          }
          return completionItem;
        });
        completionItems.push(...connectionItems);
      }
      
      // Multi-word suggestions (lower priority)
      const multiWordItems = D2_MULTI_WORD_SUGGESTIONS.map(item => {
        const completionItem = this.createCompletionItem(item);
        if (completionItem.sortText) {
          completionItem.sortText = '4' + completionItem.sortText;
        } else {
          completionItem.sortText = '40';
        }
        // Only include if it matches the current word
        if (!currentWord || item.label.toLowerCase().includes(currentWord.toLowerCase())) {
          return completionItem;
        }
        return null;
      }).filter(item => item !== null) as vscode.CompletionItem[];
      completionItems.push(...multiWordItems);
      
      // Special blocks
      if (linePrefix.trim() === '' || /^\s*$/.test(linePrefix)) {
        const specialItems = D2_SPECIAL_BLOCKS.map(item => {
          const completionItem = this.createCompletionItem(item);
          if (completionItem.sortText) {
            completionItem.sortText = '5' + completionItem.sortText;
          } else {
            completionItem.sortText = '50';
          }
          return completionItem;
        });
        completionItems.push(...specialItems);
      }
    }

    // Add pattern suggestions
    const patternSuggestions = this.enhancer.getPatternSuggestions(parserContext, shapesMap);
    completionItems.push(...patternSuggestions);

    // Enhance items with smart filtering and scoring
    const enhancedItems = this.enhancer.enhanceCompletionItems(
      completionItems,
      document,
      position,
      parserContext,
      currentWord
    );

    // Track performance
    const completionTime = Date.now() - startTime;
    if (completionTime > 200) {
      console.warn(`D2 completion took ${completionTime}ms - consider optimization`);
    }

    // Return enhanced completion list
    const completionList = new vscode.CompletionList(enhancedItems, false);
    completionList.isIncomplete = false; // We provide all completions at once

    return completionList;
  }

  /**
   * Create VSCode CompletionItem from D2CompletionItem
   */
  private createCompletionItem(item: D2CompletionItem): vscode.CompletionItem {
    const completionItem = new vscode.CompletionItem(
      item.label,
      item.kind
    );

    // Set detail to show inline (JetBrains-style)
    completionItem.detail = item.detail;
    
    // Set documentation
    if (item.documentation) {
      completionItem.documentation = new vscode.MarkdownString(item.documentation);
    }

    // Set insert text
    if (item.insertText) {
      completionItem.insertText = new vscode.SnippetString(item.insertText);
    }

    // Set sort text for ordering
    if (item.sortText) {
      completionItem.sortText = item.sortText;
    }

    // Set filter text for fuzzy matching
    if (item.filterText) {
      completionItem.filterText = item.filterText;
    }

    // Set commit characters
    if (item.commitCharacters) {
      completionItem.commitCharacters = item.commitCharacters;
    }

    // Preselect if specified
    if (item.preselect) {
      completionItem.preselect = item.preselect;
    }

    return completionItem;
  }

  /**
   * Get shape completions from defined shapes
   */
  private getShapeCompletions(
    shapesMap: Map<string, any>, 
    precedingText: string,
    currentWord: string = ''
  ): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];
    
    // Helper function to collect all shapes with their full paths
    const collectShapesWithPaths = (
      shapes: Map<string, any>, 
      parentPath: string = ''
    ): Array<{ identifier: string; fullPath: string; shape: any }> => {
      const result: Array<{ identifier: string; fullPath: string; shape: any }> = [];
      
      shapes.forEach((shape, identifier) => {
        const fullPath = parentPath ? `${parentPath}.${identifier}` : identifier;
        result.push({ identifier, fullPath, shape });
        
        // Recursively collect from children
        if (shape.children && shape.children.length > 0) {
          const childShapes = new Map<string, any>();
          shape.children.forEach((child: any) => {
            if (child.type === 'shape' || child.identifier) {
              childShapes.set(child.identifier, child);
            }
          });
          
          if (childShapes.size > 0) {
            result.push(...collectShapesWithPaths(childShapes, fullPath));
          }
        }
      });
      
      return result;
    };
    
    const allShapes = collectShapesWithPaths(shapesMap);
    
    allShapes.forEach(({ identifier, fullPath, shape }) => {
      // Skip if it's the shape we're connecting from (exact match)
      const connectionMatch = precedingText.match(/^(.*?)\s*[\-<>]+\s*$/);
      if (connectionMatch && connectionMatch[1].trim() === fullPath) {
        return;
      }

      // Filter based on current word input
      if (currentWord) {
        const wordLower = currentWord.toLowerCase();
        const identLower = identifier.toLowerCase();
        const pathLower = fullPath.toLowerCase();
        
        // For connection context, be more strict about matching
        // Only match if:
        // 1. The identifier starts with or contains the word
        // 2. OR the first segment of the path starts with the word
        const pathSegments = fullPath.split('.');
        const firstSegmentMatches = pathSegments[0].toLowerCase().includes(wordLower);
        
        if (!identLower.includes(wordLower) && !firstSegmentMatches) {
          return;
        }
      }

      const item = new vscode.CompletionItem(
        fullPath, // Show full path
        vscode.CompletionItemKind.Variable
      );
      
      item.detail = '[Existing Shape]';
      item.documentation = `Reference to existing shape: ${fullPath}`;
      
      // Calculate priority based on match quality and hierarchy
      let priority = '0'; // Default: highest priority for existing shapes
      
      if (currentWord) {
        const wordLower = currentWord.toLowerCase();
        const identLower = identifier.toLowerCase();
        const pathLower = fullPath.toLowerCase();
        const pathSegments = fullPath.split('.');
        const firstSegmentLower = pathSegments[0].toLowerCase();
        const isTopLevel = !fullPath.includes('.');
        
        // Priority 1: Top-level exact match
        if (isTopLevel && identLower === wordLower) {
          priority = '000'; // Highest priority
          item.preselect = true;
        }
        // Priority 2: Top-level starts with word
        else if (isTopLevel && identLower.startsWith(wordLower)) {
          priority = '001'; // Very high priority
          item.preselect = true;
        }
        // Priority 3: Child of a shape that starts with word (e.g., AI Auto.Backbone when typing "AI")
        else if (!isTopLevel && firstSegmentLower.startsWith(wordLower)) {
          priority = '002'; // High priority
          // Preselect if parent is exact match
          if (firstSegmentLower === wordLower) {
            item.preselect = true;
          }
        }
        // Priority 4: Nested shape where identifier starts with word (e.g., Middle.AIS when typing "AI")
        else if (!isTopLevel && identLower.startsWith(wordLower)) {
          priority = '003'; // Medium-high priority
        }
        // Priority 5: Top-level contains word
        else if (isTopLevel && identLower.includes(wordLower)) {
          priority = '004'; // Medium priority
        }
        // Priority 6: Any identifier contains word
        else if (identLower.includes(wordLower)) {
          priority = '005'; // Lower priority
        }
        // Priority 7: First segment contains word
        else if (firstSegmentLower.includes(wordLower)) {
          priority = '006'; // Lowest priority for existing shapes
        }
      } else {
        // No current word - all existing shapes get medium priority
        priority = '02';
      }
      
      item.sortText = priority + fullPath;
      
      // Set filterText to allow filtering by identifier
      // Don't include full path in filterText to avoid VSCode confusion
      item.filterText = identifier;
      
      // If it's a nested shape, show the path structure
      if (fullPath.includes('.')) {
        const parentPath = fullPath.substring(0, fullPath.lastIndexOf('.'));
        item.detail = `[Existing Shape in ${parentPath.split('.').pop()}]`;
      }
      
      items.push(item);
    });

    return items;
  }

  /**
   * Get completions after dot notation
   */
  private getDotCompletions(
    linePrefix: string,
    shapesMap: Map<string, any>,
    context: any
  ): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];
    
    // Extract base identifier before dot
    // We need to handle multi-word identifiers and connection contexts
    let baseIdentifier = '';
    let partial = '';
    
    // Match pattern: something.partial where something can contain spaces
    // Look for the last dot and work backwards
    const lastDotIndex = linePrefix.lastIndexOf('.');
    if (lastDotIndex === -1) return items;
    
    // Get everything after the last dot
    partial = linePrefix.substring(lastDotIndex + 1);
    
    // Get the identifier before the dot
    // We need to find where the identifier starts
    let beforeDot = linePrefix.substring(0, lastDotIndex);
    
    // Remove any connection operators and get the target identifier
    const connectionMatch = beforeDot.match(/.*?[\-<>]+\s*(.*)$/);
    if (connectionMatch) {
      baseIdentifier = connectionMatch[1].trim();
    } else {
      // No connection operator, find the identifier
      // It starts after: newline, colon, semicolon, or beginning of line
      const identifierMatch = beforeDot.match(/(?:^|[\n:;]\s*)([^:\n;]*)$/);
      if (identifierMatch) {
        baseIdentifier = identifierMatch[1].trim();
      } else {
        baseIdentifier = beforeDot.trim();
      }
    }

    // Check if it's a style property access
    if (baseIdentifier === 'style' || baseIdentifier.endsWith('.style')) {
      return D2_STYLE_PROPERTIES.map(item => this.createCompletionItem(item));
    }

    // Helper to find shape by path
    const findShapeByPath = (path: string): any => {
      const segments = path.split('.');
      let currentShapes = shapesMap;
      let currentShape = null;
      
      for (const segment of segments) {
        const trimmedSegment = segment.trim();
        if (currentShapes.has(trimmedSegment)) {
          currentShape = currentShapes.get(trimmedSegment);
          // Build map of children for next iteration
          if (currentShape.children && currentShape.children.length > 0) {
            currentShapes = new Map();
            currentShape.children.forEach((child: any) => {
              if (child.type === 'shape' || child.identifier) {
                currentShapes.set(child.identifier, child);
              }
            });
          } else {
            // No more children, stop here
            currentShapes = new Map();
          }
        } else {
          return null;
        }
      }
      
      return currentShape;
    };

    // Try to find the shape by path
    const shape = findShapeByPath(baseIdentifier);
    
    if (shape) {
      // FIRST: Add existing child shapes if container (highest priority)
      if (shape.children && shape.children.length > 0) {
        shape.children.forEach((child: any) => {
          if (child.type === 'shape' || child.identifier) {
            const item = new vscode.CompletionItem(
              child.identifier,
              vscode.CompletionItemKind.Variable
            );
            item.detail = '[Existing Nested Shape]';
            item.sortText = '0000' + child.identifier; // Highest priority
            item.preselect = true; // Pre-select existing items
            
            items.push(item);
          }
        });
      }
      
      // SECOND: Add style suggestion
      const styleItem = new vscode.CompletionItem('style', vscode.CompletionItemKind.Property);
      styleItem.detail = '[Property]';
      styleItem.documentation = 'Access style properties';
      styleItem.insertText = 'style';
      styleItem.sortText = '0001';
      items.push(styleItem);

      // THIRD: Add common shape properties
      const properties = ['shape', 'label', 'icon', 'tooltip', 'link', 'near'];
      properties.forEach((prop, index) => {
        const item = new vscode.CompletionItem(prop, vscode.CompletionItemKind.Property);
        item.detail = '[Property]';
        item.insertText = prop + ': ';
        item.sortText = '0002' + index;
        items.push(item);
      });
    }

    return items;
  }

  /**
   * Resolve additional information for a completion item
   */
  public resolveCompletionItem(
    item: vscode.CompletionItem,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CompletionItem> {
    // Add more detailed documentation on demand
    if (!item.documentation && item.label) {
      switch (item.label) {
        case 'shape':
          item.documentation = new vscode.MarkdownString(
            'Defines the visual shape of a node.\n\n' +
            '**Example:**\n```d2\nserver.shape: cylinder\n```\n\n' +
            '**Available shapes:** square, rectangle, circle, oval, diamond, ' +
            'parallelogram, hexagon, cloud, cylinder, queue, package, step, ' +
            'callout, stored_data, person, text, code, sql_table, class'
          );
          break;
        
        case 'style':
          item.documentation = new vscode.MarkdownString(
            'Groups style properties for a shape or connection.\n\n' +
            '**Example:**\n```d2\nserver.style: {\n  fill: blue\n  stroke: red\n  stroke-width: 2\n}\n```'
          );
          break;
        
        case '->':
          item.documentation = new vscode.MarkdownString(
            'Creates a directed connection (arrow) from source to target.\n\n' +
            '**Example:**\n```d2\nclient -> server: HTTP Request\n```'
          );
          break;
      }
    }

    return item;
  }
}

/**
 * Register the completion provider
 */
export function registerD2CompletionProvider(context: vscode.ExtensionContext): void {
  const provider = new D2CompletionProvider();
  
  // Register for D2 files
  const disposable = vscode.languages.registerCompletionItemProvider(
    'd2',
    provider,
    '.', ':', ' ', '-', '<', '>', '"', "'"
  );

  context.subscriptions.push(disposable);
} 