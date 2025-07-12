/**
 * D2 Completion Data
 * Contains all completion items for D2 language features
 */

import { CompletionItemKind } from 'vscode';

export interface D2CompletionItem {
  label: string;
  kind: CompletionItemKind;
  detail?: string;
  documentation?: string;
  insertText?: string;
  sortText?: string;
  filterText?: string;
  preselect?: boolean;
  commitCharacters?: string[];
}

// Shape types available in D2
export const D2_SHAPES: D2CompletionItem[] = [
  {
    label: 'square',
    kind: CompletionItemKind.Value,
    detail: '[Shape]',
    documentation: 'A square shape',
    sortText: '0001'
  },
  {
    label: 'rectangle',
    kind: CompletionItemKind.Value,
    detail: '[Shape]',
    documentation: 'A rectangle shape',
    sortText: '0002'
  },
  {
    label: 'circle',
    kind: CompletionItemKind.Value,
    detail: '[Shape]',
    documentation: 'A circular shape',
    sortText: '0003'
  },
  {
    label: 'oval',
    kind: CompletionItemKind.Value,
    detail: '[Shape]',
    documentation: 'An oval shape',
    sortText: '0004'
  },
  {
    label: 'diamond',
    kind: CompletionItemKind.Value,
    detail: '[Shape]',
    documentation: 'A diamond/rhombus shape',
    sortText: '0005'
  },
  {
    label: 'parallelogram',
    kind: CompletionItemKind.Value,
    detail: '[Shape]',
    documentation: 'A parallelogram shape',
    sortText: '0006'
  },
  {
    label: 'hexagon',
    kind: CompletionItemKind.Value,
    detail: '[Shape]',
    documentation: 'A hexagonal shape',
    sortText: '0007'
  },
  {
    label: 'cloud',
    kind: CompletionItemKind.Value,
    detail: '[Shape]',
    documentation: 'A cloud shape',
    sortText: '0008'
  },
  {
    label: 'cylinder',
    kind: CompletionItemKind.Value,
    detail: '[Shape]',
    documentation: 'A cylindrical shape',
    sortText: '0009'
  },
  {
    label: 'queue',
    kind: CompletionItemKind.Value,
    detail: '[Shape]',
    documentation: 'A queue shape',
    sortText: '0010'
  },
  {
    label: 'package',
    kind: CompletionItemKind.Value,
    detail: '[Shape]',
    documentation: 'A package shape',
    sortText: '0011'
  },
  {
    label: 'step',
    kind: CompletionItemKind.Value,
    detail: '[Shape]',
    documentation: 'A step shape',
    sortText: '0012'
  },
  {
    label: 'callout',
    kind: CompletionItemKind.Value,
    detail: '[Shape]',
    documentation: 'A callout bubble shape',
    sortText: '0013'
  },
  {
    label: 'stored_data',
    kind: CompletionItemKind.Value,
    detail: '[Shape]',
    documentation: 'A stored data shape',
    sortText: '0014'
  },
  {
    label: 'person',
    kind: CompletionItemKind.Value,
    detail: '[Shape]',
    documentation: 'A person/actor shape',
    sortText: '0015'
  },
  {
    label: 'text',
    kind: CompletionItemKind.Value,
    detail: '[Shape]',
    documentation: 'A text-only shape with no border',
    sortText: '0016'
  },
  {
    label: 'code',
    kind: CompletionItemKind.Value,
    detail: '[Shape]',
    documentation: 'A code block shape',
    sortText: '0017'
  },
  {
    label: 'sql_table',
    kind: CompletionItemKind.Value,
    detail: '[Shape]',
    documentation: 'A SQL table shape',
    sortText: '0018'
  },
  {
    label: 'class',
    kind: CompletionItemKind.Value,
    detail: '[Shape]',
    documentation: 'A UML class shape',
    sortText: '0019'
  },
  {
    label: 'sequence_diagram',
    kind: CompletionItemKind.Value,
    detail: '[Shape]',
    documentation: 'A sequence diagram container',
    sortText: '0020'
  }
];

// Style properties
export const D2_STYLE_PROPERTIES: D2CompletionItem[] = [
  {
    label: 'fill',
    kind: CompletionItemKind.Property,
    detail: '[Style Property]',
    documentation: 'Sets the background color of a shape',
    insertText: 'fill: ',
    sortText: '0101'
  },
  {
    label: 'stroke',
    kind: CompletionItemKind.Property,
    detail: '[Style Property]',
    documentation: 'Sets the border color',
    insertText: 'stroke: ',
    sortText: '0102'
  },
  {
    label: 'stroke-width',
    kind: CompletionItemKind.Property,
    detail: '[Style Property]',
    documentation: 'Sets the border width',
    insertText: 'stroke-width: ',
    sortText: '0103'
  },
  {
    label: 'stroke-dash',
    kind: CompletionItemKind.Property,
    detail: '[Style Property]',
    documentation: 'Sets the border dash pattern',
    insertText: 'stroke-dash: ',
    sortText: '0104'
  },
  {
    label: 'opacity',
    kind: CompletionItemKind.Property,
    detail: '[Style Property]',
    documentation: 'Sets the transparency (0-1)',
    insertText: 'opacity: ',
    sortText: '0105'
  },
  {
    label: 'shadow',
    kind: CompletionItemKind.Property,
    detail: '[Style Property]',
    documentation: 'Adds shadow to the shape',
    insertText: 'shadow: true',
    sortText: '0106'
  },
  {
    label: 'border-radius',
    kind: CompletionItemKind.Property,
    detail: '[Style Property]',
    documentation: 'Sets rounded corners',
    insertText: 'border-radius: ',
    sortText: '0107'
  },
  {
    label: 'font-size',
    kind: CompletionItemKind.Property,
    detail: '[Style Property]',
    documentation: 'Sets the text font size',
    insertText: 'font-size: ',
    sortText: '0108'
  },
  {
    label: 'font-color',
    kind: CompletionItemKind.Property,
    detail: '[Style Property]',
    documentation: 'Sets the text color',
    insertText: 'font-color: ',
    sortText: '0109'
  },
  {
    label: 'bold',
    kind: CompletionItemKind.Property,
    detail: '[Style Property]',
    documentation: 'Makes text bold',
    insertText: 'bold: true',
    sortText: '0110'
  },
  {
    label: 'italic',
    kind: CompletionItemKind.Property,
    detail: '[Style Property]',
    documentation: 'Makes text italic',
    insertText: 'italic: true',
    sortText: '0111'
  },
  {
    label: 'underline',
    kind: CompletionItemKind.Property,
    detail: '[Style Property]',
    documentation: 'Underlines text',
    insertText: 'underline: true',
    sortText: '0112'
  },
  {
    label: '3d',
    kind: CompletionItemKind.Property,
    detail: '[Style Property]',
    documentation: 'Adds 3D effect to rectangles/squares',
    insertText: '3d: true',
    sortText: '0113'
  },
  {
    label: 'multiple',
    kind: CompletionItemKind.Property,
    detail: '[Style Property]',
    documentation: 'Shows multiple stacked shapes',
    insertText: 'multiple: true',
    sortText: '0114'
  },
  {
    label: 'double-border',
    kind: CompletionItemKind.Property,
    detail: '[Style Property]',
    documentation: 'Adds double border to shape',
    insertText: 'double-border: true',
    sortText: '0115'
  },
  {
    label: 'animated',
    kind: CompletionItemKind.Property,
    detail: '[Style Property]',
    documentation: 'Animates connections',
    insertText: 'animated: true',
    sortText: '0116'
  },
  {
    label: 'filled',
    kind: CompletionItemKind.Property,
    detail: '[Style Property]',
    documentation: 'Whether the shape is filled',
    insertText: 'filled: true',
    sortText: '0117'
  },
  {
    label: 'width',
    kind: CompletionItemKind.Property,
    detail: '[Style Property]',
    documentation: 'Sets the shape width',
    insertText: 'width: ',
    sortText: '0118'
  },
  {
    label: 'height',
    kind: CompletionItemKind.Property,
    detail: '[Style Property]',
    documentation: 'Sets the shape height',
    insertText: 'height: ',
    sortText: '0119'
  }
];

// Keywords
export const D2_KEYWORDS: D2CompletionItem[] = [
  {
    label: 'shape',
    kind: CompletionItemKind.Keyword,
    detail: '[Keyword]',
    documentation: 'Defines the shape type',
    insertText: 'shape: ',
    sortText: '0201'
  },
  {
    label: 'style',
    kind: CompletionItemKind.Keyword,
    detail: '[Keyword]',
    documentation: 'Groups style properties',
    insertText: 'style: {\n\t$0\n}',
    sortText: '0202'
  },
  {
    label: 'icon',
    kind: CompletionItemKind.Keyword,
    detail: '[Keyword]',
    documentation: 'Sets an icon for the shape',
    insertText: 'icon: ',
    sortText: '0203'
  },
  {
    label: 'near',
    kind: CompletionItemKind.Keyword,
    detail: '[Keyword]',
    documentation: 'Positions shape near another',
    insertText: 'near: ',
    sortText: '0204'
  },
  {
    label: 'tooltip',
    kind: CompletionItemKind.Keyword,
    detail: '[Keyword]',
    documentation: 'Adds tooltip text',
    insertText: 'tooltip: ',
    sortText: '0205'
  },
  {
    label: 'link',
    kind: CompletionItemKind.Keyword,
    detail: '[Keyword]',
    documentation: 'Makes shape clickable with URL',
    insertText: 'link: ',
    sortText: '0206'
  },
  {
    label: 'label',
    kind: CompletionItemKind.Keyword,
    detail: '[Keyword]',
    documentation: 'Sets the label text',
    insertText: 'label: ',
    sortText: '0207'
  },
  {
    label: 'direction',
    kind: CompletionItemKind.Keyword,
    detail: '[Keyword]',
    documentation: 'Sets layout direction',
    insertText: 'direction: ',
    sortText: '0208'
  },
  {
    label: 'constraint',
    kind: CompletionItemKind.Keyword,
    detail: '[Keyword]',
    documentation: 'Adds layout constraints',
    insertText: 'constraint: ',
    sortText: '0209'
  },
  {
    label: 'classes',
    kind: CompletionItemKind.Keyword,
    detail: '[Keyword]',
    documentation: 'Defines reusable style classes',
    insertText: 'classes: {\n\t$0\n}',
    sortText: '0210'
  },
  {
    label: 'vars',
    kind: CompletionItemKind.Keyword,
    detail: '[Keyword]',
    documentation: 'Defines variables',
    insertText: 'vars: {\n\t$0\n}',
    sortText: '0211'
  },
  {
    label: 'scenarios',
    kind: CompletionItemKind.Keyword,
    detail: '[Keyword]',
    documentation: 'Defines diagram scenarios',
    insertText: 'scenarios: {\n\t$0\n}',
    sortText: '0212'
  },
  {
    label: 'layers',
    kind: CompletionItemKind.Keyword,
    detail: '[Keyword]',
    documentation: 'Defines diagram layers',
    insertText: 'layers: {\n\t$0\n}',
    sortText: '0213'
  },
  {
    label: 'grid-rows',
    kind: CompletionItemKind.Keyword,
    detail: '[Keyword]',
    documentation: 'Sets grid rows',
    insertText: 'grid-rows: ',
    sortText: '0214'
  },
  {
    label: 'grid-columns',
    kind: CompletionItemKind.Keyword,
    detail: '[Keyword]',
    documentation: 'Sets grid columns',
    insertText: 'grid-columns: ',
    sortText: '0215'
  },
  {
    label: 'grid-gap',
    kind: CompletionItemKind.Keyword,
    detail: '[Keyword]',
    documentation: 'Sets grid gap',
    insertText: 'grid-gap: ',
    sortText: '0216'
  },
  {
    label: 'source-arrowhead',
    kind: CompletionItemKind.Keyword,
    detail: '[Keyword]',
    documentation: 'Sets arrowhead at connection source',
    insertText: 'source-arrowhead: ',
    sortText: '0217'
  },
  {
    label: 'target-arrowhead',
    kind: CompletionItemKind.Keyword,
    detail: '[Keyword]',
    documentation: 'Sets arrowhead at connection target',
    insertText: 'target-arrowhead: ',
    sortText: '0218'
  }
];

// Direction values
export const D2_DIRECTIONS: D2CompletionItem[] = [
  {
    label: 'up',
    kind: CompletionItemKind.Value,
    detail: '[Direction]',
    documentation: 'Layout flows upward',
    sortText: '0301'
  },
  {
    label: 'down',
    kind: CompletionItemKind.Value,
    detail: '[Direction]',
    documentation: 'Layout flows downward',
    sortText: '0302'
  },
  {
    label: 'left',
    kind: CompletionItemKind.Value,
    detail: '[Direction]',
    documentation: 'Layout flows leftward',
    sortText: '0303'
  },
  {
    label: 'right',
    kind: CompletionItemKind.Value,
    detail: '[Direction]',
    documentation: 'Layout flows rightward',
    sortText: '0304'
  }
];

// Arrowhead types
export const D2_ARROWHEADS: D2CompletionItem[] = [
  {
    label: 'triangle',
    kind: CompletionItemKind.Value,
    detail: '[Arrowhead]',
    documentation: 'Triangle arrowhead',
    sortText: '0401'
  },
  {
    label: 'diamond',
    kind: CompletionItemKind.Value,
    detail: '[Arrowhead]',
    documentation: 'Diamond arrowhead',
    sortText: '0402'
  },
  {
    label: 'circle',
    kind: CompletionItemKind.Value,
    detail: '[Arrowhead]',
    documentation: 'Circle arrowhead',
    sortText: '0403'
  },
  {
    label: 'cf-one',
    kind: CompletionItemKind.Value,
    detail: '[Arrowhead]',
    documentation: 'Crow\'s foot: one',
    sortText: '0404'
  },
  {
    label: 'cf-one-required',
    kind: CompletionItemKind.Value,
    detail: '[Arrowhead]',
    documentation: 'Crow\'s foot: one required',
    sortText: '0405'
  },
  {
    label: 'cf-many',
    kind: CompletionItemKind.Value,
    detail: '[Arrowhead]',
    documentation: 'Crow\'s foot: many',
    sortText: '0406'
  },
  {
    label: 'cf-many-required',
    kind: CompletionItemKind.Value,
    detail: '[Arrowhead]',
    documentation: 'Crow\'s foot: many required',
    sortText: '0407'
  },
  {
    label: 'diamond-filled',
    kind: CompletionItemKind.Value,
    detail: '[Arrowhead]',
    documentation: 'Filled diamond arrowhead',
    sortText: '0408'
  },
  {
    label: 'circle-filled',
    kind: CompletionItemKind.Value,
    detail: '[Arrowhead]',
    documentation: 'Filled circle arrowhead',
    sortText: '0409'
  }
];

// Connection operators
export const D2_CONNECTIONS: D2CompletionItem[] = [
  {
    label: '->',
    kind: CompletionItemKind.Operator,
    detail: '[Connection]',
    documentation: 'Directed connection (arrow)',
    insertText: '-> ',
    sortText: '0501'
  },
  {
    label: '<-',
    kind: CompletionItemKind.Operator,
    detail: '[Connection]',
    documentation: 'Reverse directed connection',
    insertText: '<- ',
    sortText: '0502'
  },
  {
    label: '<->',
    kind: CompletionItemKind.Operator,
    detail: '[Connection]',
    documentation: 'Bidirectional connection',
    insertText: '<-> ',
    sortText: '0503'
  },
  {
    label: '--',
    kind: CompletionItemKind.Operator,
    detail: '[Connection]',
    documentation: 'Undirected connection (line)',
    insertText: '-- ',
    sortText: '0504'
  }
];

// Common colors
export const D2_COLORS: D2CompletionItem[] = [
  {
    label: 'red',
    kind: CompletionItemKind.Color,
    detail: '[Color]',
    documentation: 'Red color',
    sortText: '0601'
  },
  {
    label: 'blue',
    kind: CompletionItemKind.Color,
    detail: '[Color]',
    documentation: 'Blue color',
    sortText: '0602'
  },
  {
    label: 'green',
    kind: CompletionItemKind.Color,
    detail: '[Color]',
    documentation: 'Green color',
    sortText: '0603'
  },
  {
    label: 'yellow',
    kind: CompletionItemKind.Color,
    detail: '[Color]',
    documentation: 'Yellow color',
    sortText: '0604'
  },
  {
    label: 'orange',
    kind: CompletionItemKind.Color,
    detail: '[Color]',
    documentation: 'Orange color',
    sortText: '0605'
  },
  {
    label: 'purple',
    kind: CompletionItemKind.Color,
    detail: '[Color]',
    documentation: 'Purple color',
    sortText: '0606'
  },
  {
    label: 'black',
    kind: CompletionItemKind.Color,
    detail: '[Color]',
    documentation: 'Black color',
    sortText: '0607'
  },
  {
    label: 'white',
    kind: CompletionItemKind.Color,
    detail: '[Color]',
    documentation: 'White color',
    sortText: '0608'
  },
  {
    label: 'gray',
    kind: CompletionItemKind.Color,
    detail: '[Color]',
    documentation: 'Gray color',
    sortText: '0609'
  },
  {
    label: 'transparent',
    kind: CompletionItemKind.Color,
    detail: '[Color]',
    documentation: 'Transparent (no fill)',
    sortText: '0610'
  }
];

// Boolean values
export const D2_BOOLEANS: D2CompletionItem[] = [
  {
    label: 'true',
    kind: CompletionItemKind.Value,
    detail: '[Boolean]',
    documentation: 'Boolean true value',
    sortText: '0701'
  },
  {
    label: 'false',
    kind: CompletionItemKind.Value,
    detail: '[Boolean]',
    documentation: 'Boolean false value',
    sortText: '0702'
  }
];

// Special blocks
export const D2_SPECIAL_BLOCKS: D2CompletionItem[] = [
  {
    label: 'md',
    kind: CompletionItemKind.Snippet,
    detail: '[Markdown Block]',
    documentation: 'Markdown content block',
    insertText: '|md\n$0\n|',
    sortText: '0801'
  },
  {
    label: 'latex',
    kind: CompletionItemKind.Snippet,
    detail: '[LaTeX Block]',
    documentation: 'LaTeX content block',
    insertText: '|latex\n$0\n|',
    sortText: '0802'
  },
  {
    label: 'code',
    kind: CompletionItemKind.Snippet,
    detail: '[Code Block]',
    documentation: 'Code content block',
    insertText: '|`\n$0\n`|',
    sortText: '0803'
  }
];

// Common multi-word suggestions
export const D2_MULTI_WORD_SUGGESTIONS: D2CompletionItem[] = [
  {
    label: 'database server',
    kind: CompletionItemKind.Text,
    detail: '[Multi-word Shape]',
    documentation: 'Database server shape',
    insertText: 'database server',
    filterText: 'database server',
    sortText: '0901'
  },
  {
    label: 'web server',
    kind: CompletionItemKind.Text,
    detail: '[Multi-word Shape]',
    documentation: 'Web server shape',
    insertText: 'web server',
    filterText: 'web server',
    sortText: '0902'
  },
  {
    label: 'load balancer',
    kind: CompletionItemKind.Text,
    detail: '[Multi-word Shape]',
    documentation: 'Load balancer shape',
    insertText: 'load balancer',
    filterText: 'load balancer',
    sortText: '0903'
  },
  {
    label: 'user interface',
    kind: CompletionItemKind.Text,
    detail: '[Multi-word Shape]',
    documentation: 'User interface shape',
    insertText: 'user interface',
    filterText: 'user interface',
    sortText: '0904'
  },
  {
    label: 'mobile app',
    kind: CompletionItemKind.Text,
    detail: '[Multi-word Shape]',
    documentation: 'Mobile app shape',
    insertText: 'mobile app',
    filterText: 'mobile app',
    sortText: '0905'
  },
  {
    label: 'api gateway',
    kind: CompletionItemKind.Text,
    detail: '[Multi-word Shape]',
    documentation: 'API gateway shape',
    insertText: 'api gateway',
    filterText: 'api gateway',
    sortText: '0906'
  },
  {
    label: 'message queue',
    kind: CompletionItemKind.Text,
    detail: '[Multi-word Shape]',
    documentation: 'Message queue shape',
    insertText: 'message queue',
    filterText: 'message queue',
    sortText: '0907'
  },
  {
    label: 'external service',
    kind: CompletionItemKind.Text,
    detail: '[Multi-word Shape]',
    documentation: 'External service shape',
    insertText: 'external service',
    filterText: 'external service',
    sortText: '0908'
  }
];

// Get relevant completion items based on context
export function getCompletionItemsForContext(context: {
  isAfterColon: boolean;
  isInStyle: boolean;
  isAfterDot: boolean;
  propertyName?: string;
  parentShape?: string;
}): D2CompletionItem[] {
  let items: D2CompletionItem[] = [];

  if (context.isInStyle || context.propertyName === 'style') {
    items.push(...D2_STYLE_PROPERTIES);
  }

  if (context.propertyName === 'shape') {
    items.push(...D2_SHAPES);
  }

  if (context.propertyName === 'direction') {
    items.push(...D2_DIRECTIONS);
  }

  if (context.propertyName?.includes('arrowhead')) {
    items.push(...D2_ARROWHEADS);
  }

  if (context.propertyName === 'fill' || 
      context.propertyName === 'stroke' || 
      context.propertyName === 'font-color') {
    items.push(...D2_COLORS);
  }

  if (context.propertyName === 'shadow' || 
      context.propertyName === 'bold' ||
      context.propertyName === 'italic' ||
      context.propertyName === 'underline' ||
      context.propertyName === '3d' ||
      context.propertyName === 'multiple' ||
      context.propertyName === 'animated' ||
      context.propertyName === 'filled' ||
      context.propertyName === 'double-border') {
    items.push(...D2_BOOLEANS);
  }

  // Default: show keywords and common items
  if (items.length === 0) {
    items.push(...D2_KEYWORDS);
    items.push(...D2_CONNECTIONS);
    items.push(...D2_MULTI_WORD_SUGGESTIONS);
  }

  return items;
} 