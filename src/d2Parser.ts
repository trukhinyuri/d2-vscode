/**
 * D2 Parser for VSCode Extension
 * Provides syntax analysis and AST building for D2 documents
 */

export enum D2NodeType {
  Document = 'document',
  Shape = 'shape',
  Connection = 'connection',
  Container = 'container',
  Style = 'style',
  Attribute = 'attribute',
  Comment = 'comment',
  String = 'string',
  Import = 'import',
  Variable = 'variable',
  Class = 'class',
  Block = 'block'
}

export interface D2Node {
  type: D2NodeType;
  name?: string;
  value?: string;
  start: number;
  end: number;
  children?: D2Node[];
  parent?: D2Node;
  metadata?: Record<string, any>;
}

export interface D2Shape extends D2Node {
  type: D2NodeType.Shape;
  identifier: string;
  attributes: Map<string, string>;
  styles: Map<string, string>;
  children: D2Node[];
}

export interface D2Connection extends D2Node {
  type: D2NodeType.Connection;
  source: string;
  target: string;
  label?: string;
  connectionType: '--' | '->' | '<-' | '<->';
  styles: Map<string, string>;
}

export interface ParseContext {
  shapes: Map<string, D2Shape>;
  connections: D2Connection[];
  variables: Map<string, string>;
  classes: Map<string, Map<string, string>>;
  imports: string[];
  currentContainer?: D2Shape;
}

export class D2Parser {
  private document: string;
  private position: number = 0;
  private line: number = 0;
  private column: number = 0;
  private context: ParseContext;

  constructor(document: string) {
    this.document = document;
    this.context = {
      shapes: new Map(),
      connections: [],
      variables: new Map(),
      classes: new Map(),
      imports: []
    };
  }

  /**
   * Parse the entire document and return AST
   */
  parse(): D2Node {
    const root: D2Node = {
      type: D2NodeType.Document,
      start: 0,
      end: this.document.length,
      children: []
    };

    while (this.position < this.document.length) {
      this.skipWhitespace();
      
      if (this.position >= this.document.length) break;

      const node = this.parseStatement();
      if (node) {
        root.children!.push(node);
      }
    }

    return root;
  }

  /**
   * Get parsing context at a specific position
   */
  getContextAtPosition(position: number): {
    isInShape: boolean;
    isInConnection: boolean;
    isInStyle: boolean;
    isAfterDot: boolean;
    isAfterColon: boolean;
    isInString: boolean;
    isInComment: boolean;
    parentShape?: string;
    precedingText: string;
    currentLine: string;
  } {
    const lines = this.document.substring(0, position).split('\n');
    const currentLine = lines[lines.length - 1];
    const precedingText = currentLine.trim();

    // Check if we're in a string
    const isInString = this.isPositionInString(position);
    
    // Check if we're in a comment
    const isInComment = this.isPositionInComment(position);

    // Check for dot completion (including multi-word identifiers)
    const isAfterDot = /\.$/.test(currentLine) || /\.\w*$/.test(currentLine);

    // Check for colon
    const isAfterColon = /:[\s]*$/.test(precedingText);

    // Check if we're in a style block
    const isInStyle = this.isInStyleBlock(position);

    // Check if we're defining a connection
    const isInConnection = /[\-<>]+\s*$/.test(precedingText) || 
                          /\s+[\-<>]+\s+\w*$/.test(precedingText);

    // Check if we're in a shape context
    const isInShape = !isInConnection && !isInStyle && /^\w+/.test(precedingText);

    // Find parent shape if nested
    const parentShape = this.findParentShape(position);

    return {
      isInShape,
      isInConnection,
      isInStyle,
      isAfterDot,
      isAfterColon,
      isInString,
      isInComment,
      parentShape,
      precedingText,
      currentLine
    };
  }

  private parseStatement(): D2Node | null {
    this.skipWhitespace();

    // Skip comments
    if (this.peek() === '#') {
      return this.parseComment();
    }

    // Skip block comments
    if (this.peek(3) === '"""') {
      return this.parseBlockComment();
    }

    // Parse imports
    if (this.peek(3) === '...') {
      return this.parseSpread();
    }

    // Try to parse a shape or connection
    const start = this.position;
    const identifier = this.parseIdentifier();

    if (!identifier) {
      this.position++;
      return null;
    }

    this.skipWhitespace();

    // Check for connection
    const connectionOp = this.parseConnectionOperator();
    if (connectionOp) {
      return this.parseConnection(identifier, connectionOp, start);
    }

    // Check for attribute/style assignment
    if (this.peek() === ':') {
      return this.parseShapeOrAttribute(identifier, start);
    }

    // Check for dot notation (nested shapes or attributes)
    if (this.peek() === '.') {
      return this.parseDotNotation(identifier, start);
    }

    // Plain shape declaration
    const shape = this.createShape(identifier, start, this.position);
    shape.type = D2NodeType.Shape; // Ensure it's marked as shape
    return shape;
  }

  private parseIdentifier(): string | null {
    this.skipWhitespace();

    if (this.peek() === '"' || this.peek() === "'") {
      return this.parseQuotedString();
    }

    const start = this.position;
    let lastNonWhitespace = start;
    
    // Parse unquoted identifier which can contain spaces
    while (this.position < this.document.length) {
      const char = this.document[this.position];
      
      // Stop at special characters that end an identifier
      if (char === ':' || char === '{' || char === '}' || 
          char === ';' || char === '#' || char === '\n' ||
          char === '.' || char === '[' || char === ']') {
        break;
      }
      
      // Check for connection operators
      if (this.position < this.document.length - 1) {
        const twoChars = this.peek(2);
        if (twoChars === '->' || twoChars === '<-' || twoChars === '--') {
          break;
        }
      }
      
      if (this.position < this.document.length - 2) {
        const threeChars = this.peek(3);
        if (threeChars === '<->') {
          break;
        }
      }
      
      // Track non-whitespace position
      if (!/\s/.test(char)) {
        lastNonWhitespace = this.position + 1;
      }
      
      this.position++;
    }

    if (this.position === start) return null;
    
    // Trim trailing whitespace
    const identifier = this.document.substring(start, lastNonWhitespace);
    return identifier || null;
  }

  private parseQuotedString(): string | null {
    const quote = this.peek();
    if (quote !== '"' && quote !== "'") return null;

    this.position++; // Skip opening quote
    const start = this.position;

    while (this.position < this.document.length) {
      if (this.peek() === '\\') {
        this.position += 2; // Skip escape sequence
        continue;
      }
      if (this.peek() === quote) {
        const content = this.document.substring(start, this.position);
        this.position++; // Skip closing quote
        return content;
      }
      this.position++;
    }

    return null;
  }

  private parseConnectionOperator(): string | null {
    const ops = ['<->', '<-', '->', '--'];
    for (const op of ops) {
      if (this.peek(op.length) === op) {
        this.position += op.length;
        return op;
      }
    }
    return null;
  }

  private parseConnection(source: string, operator: string, start: number): D2Connection {
    this.skipWhitespace();
    const target = this.parseIdentifier();
    
    let label: string | undefined;
    this.skipWhitespace();
    if (this.peek() === ':') {
      this.position++;
      this.skipWhitespace();
      label = this.parseValue();
    }

    const connection: D2Connection = {
      type: D2NodeType.Connection,
      source,
      target: target || '',
      connectionType: operator as any,
      label,
      styles: new Map(),
      start,
      end: this.position
    };

    this.context.connections.push(connection);
    return connection;
  }

  private parseShapeOrAttribute(identifier: string, start: number): D2Node {
    this.position++; // Skip ':'
    this.skipWhitespace();

    // Check if it's a container
    if (this.peek() === '{') {
      return this.parseContainer(identifier, start);
    }

    // Parse value
    const value = this.parseValue();

    // Register as shape if not already exists
    if (!this.context.shapes.has(identifier)) {
      const shape = this.createShape(identifier, start, this.position);
      this.context.shapes.set(identifier, shape as D2Shape);
    }

    return {
      type: D2NodeType.Attribute,
      name: identifier,
      value,
      start,
      end: this.position
    };
  }

  private parseContainer(identifier: string, start: number): D2Shape {
    const shape: D2Shape = {
      type: D2NodeType.Shape,
      identifier,
      attributes: new Map(),
      styles: new Map(),
      children: [],
      start,
      end: 0
    };

    this.position++; // Skip '{'
    const previousContainer = this.context.currentContainer;
    this.context.currentContainer = shape;

    while (this.position < this.document.length && this.peek() !== '}') {
      const child = this.parseStatement();
      if (child) {
        shape.children.push(child);
      }
    }

    if (this.peek() === '}') {
      this.position++;
    }

    shape.end = this.position;
    this.context.currentContainer = previousContainer;
    this.context.shapes.set(identifier, shape);

    return shape;
  }

  private parseValue(): string {
    this.skipWhitespace();

    // Handle different value types
    if (this.peek() === '"' || this.peek() === "'") {
      return this.parseQuotedString() || '';
    }

    if (this.peek() === '|') {
      return this.parseBlockString();
    }

    // Parse unquoted value
    const start = this.position;
    while (this.position < this.document.length && 
           !/[\n;#{}]/.test(this.document[this.position])) {
      this.position++;
    }

    return this.document.substring(start, this.position).trim();
  }

  private parseBlockString(): string {
    // TODO: Implement block string parsing
    return '';
  }

  private parseDotNotation(base: string, start: number): D2Node {
    // TODO: Implement dot notation parsing for nested properties
    return {
      type: D2NodeType.Attribute,
      name: base,
      start,
      end: this.position
    };
  }

  private parseComment(): D2Node {
    const start = this.position;
    this.position++; // Skip '#'
    
    while (this.position < this.document.length && 
           this.document[this.position] !== '\n') {
      this.position++;
    }

    return {
      type: D2NodeType.Comment,
      value: this.document.substring(start + 1, this.position),
      start,
      end: this.position
    };
  }

  private parseBlockComment(): D2Node {
    const start = this.position;
    this.position += 3; // Skip '"""'
    
    const end = this.document.indexOf('"""', this.position);
    if (end !== -1) {
      const value = this.document.substring(this.position, end);
      this.position = end + 3;
      return {
        type: D2NodeType.Comment,
        value,
        start,
        end: this.position
      };
    }

    // Unclosed block comment
    this.position = this.document.length;
    return {
      type: D2NodeType.Comment,
      value: this.document.substring(start + 3),
      start,
      end: this.position
    };
  }

  private parseSpread(): D2Node | null {
    // TODO: Implement spread operator parsing
    return null;
  }

  private createShape(identifier: string, start: number, end: number): D2Shape {
    const shape: D2Shape = {
      type: D2NodeType.Shape,
      identifier,
      attributes: new Map(),
      styles: new Map(),
      children: [],
      start,
      end
    };

    this.context.shapes.set(identifier, shape);
    return shape;
  }

  private skipWhitespace(): void {
    while (this.position < this.document.length && 
           /\s/.test(this.document[this.position])) {
      if (this.document[this.position] === '\n') {
        this.line++;
        this.column = 0;
      } else {
        this.column++;
      }
      this.position++;
    }
  }

  private peek(length: number = 1): string {
    return this.document.substring(this.position, this.position + length);
  }

  private isPositionInString(position: number): boolean {
    const text = this.document.substring(0, position);
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < text.length; i++) {
      if (i > 0 && text[i - 1] === '\\') continue;
      
      if (!inString && (text[i] === '"' || text[i] === "'")) {
        inString = true;
        stringChar = text[i];
      } else if (inString && text[i] === stringChar) {
        inString = false;
      }
    }

    return inString;
  }

  private isPositionInComment(position: number): boolean {
    const lines = this.document.substring(0, position).split('\n');
    const currentLine = lines[lines.length - 1];
    return currentLine.includes('#');
  }

  private isInStyleBlock(position: number): boolean {
    // Simple heuristic - check if we're after 'style:' or 'style.'
    const text = this.document.substring(0, position);
    const lastStyleIndex = Math.max(
      text.lastIndexOf('style:'),
      text.lastIndexOf('style.')
    );
    
    if (lastStyleIndex === -1) return false;

    // Check if there's a closing brace between style and position
    const afterStyle = text.substring(lastStyleIndex);
    const openBraces = (afterStyle.match(/{/g) || []).length;
    const closeBraces = (afterStyle.match(/}/g) || []).length;

    return openBraces > closeBraces;
  }

  private findParentShape(position: number): string | undefined {
    // TODO: Implement finding parent shape based on position
    return undefined;
  }

  /**
   * Get all defined shapes in the document
   */
  getAllShapes(): D2Shape[] {
    return Array.from(this.context.shapes.values());
  }

  /**
   * Get all connections in the document
   */
  getAllConnections(): D2Connection[] {
    return this.context.connections;
  }

  /**
   * Get variables defined in the document
   */
  getVariables(): Map<string, string> {
    return this.context.variables;
  }

  /**
   * Get classes defined in the document
   */
  getClasses(): Map<string, Map<string, string>> {
    return this.context.classes;
  }
} 