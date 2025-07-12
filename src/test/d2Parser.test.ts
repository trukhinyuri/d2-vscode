/**
 * D2 Parser Tests
 * Tests for D2 syntax parsing
 */

import * as assert from 'assert';
import { D2Parser, D2NodeType } from '../d2Parser';

suite('D2 Parser Test Suite', () => {
  
  test('Should parse simple shape declaration', () => {
    const parser = new D2Parser('server: "Web Server"');
    const ast = parser.parse();
    
    assert.strictEqual(ast.type, D2NodeType.Document);
    assert.ok(ast.children);
    assert.strictEqual(ast.children.length, 1);
    
    const shapes = parser.getAllShapes();
    assert.strictEqual(shapes.length, 1);
    assert.strictEqual(shapes[0].identifier, 'server');
  });

  test('Should parse shape with style', () => {
    const parser = new D2Parser(`
      server: {
        shape: cylinder
        style: {
          fill: blue
          stroke: black
        }
      }
    `);
    const ast = parser.parse();
    
    const shapes = parser.getAllShapes();
    assert.strictEqual(shapes.length, 1);
    assert.strictEqual(shapes[0].identifier, 'server');
  });

  test('Should parse connections', () => {
    const parser = new D2Parser('client -> server: HTTP Request');
    const ast = parser.parse();
    
    const connections = parser.getAllConnections();
    assert.strictEqual(connections.length, 1);
    assert.strictEqual(connections[0].source, 'client');
    assert.strictEqual(connections[0].target, 'server');
    assert.strictEqual(connections[0].connectionType, '->');
    assert.strictEqual(connections[0].label, 'HTTP Request');
  });

  test('Should parse multiple connection types', () => {
    const testCases = [
      { text: 'a -> b', type: '->' },
      { text: 'a <- b', type: '<-' },
      { text: 'a <-> b', type: '<->' },
      { text: 'a -- b', type: '--' }
    ];

    testCases.forEach(({ text, type }) => {
      const parser = new D2Parser(text);
      parser.parse();
      const connections = parser.getAllConnections();
      assert.strictEqual(connections[0].connectionType, type);
    });
  });

  test('Should parse quoted identifiers', () => {
    const parser = new D2Parser('"database server" -> "web server"');
    const ast = parser.parse();
    
    const shapes = parser.getAllShapes();
    assert.strictEqual(shapes.length, 2);
    assert.ok(shapes.some(s => s.identifier === 'database server'));
    assert.ok(shapes.some(s => s.identifier === 'web server'));
  });

  test('Should handle comments', () => {
    const parser = new D2Parser(`
      # This is a comment
      server: "Web Server"
      # Another comment
    `);
    const ast = parser.parse();
    
    const shapes = parser.getAllShapes();
    assert.strictEqual(shapes.length, 1);
    assert.strictEqual(shapes[0].identifier, 'server');
  });

  test('Should handle block comments', () => {
    const parser = new D2Parser(`
      """
      This is a block comment
      It can span multiple lines
      """
      server: "Web Server"
    `);
    const ast = parser.parse();
    
    const shapes = parser.getAllShapes();
    assert.strictEqual(shapes.length, 1);
  });

  test('Should detect context at position', () => {
    const document = 'server.shape: square\nserver.style.fill: ';
    const parser = new D2Parser(document);
    
    // After colon in style property
    const context1 = parser.getContextAtPosition(document.indexOf('fill: ') + 6);
    assert.ok(context1.isAfterColon);
    assert.ok(!context1.isInConnection);
    
    // After dot
    const context2 = parser.getContextAtPosition(document.indexOf('.shape'));
    assert.ok(context2.isAfterDot);
    
    // In connection
    const parser2 = new D2Parser('client -> ');
    const context3 = parser2.getContextAtPosition(10);
    assert.ok(context3.isInConnection);
  });

  test('Should parse nested shapes', () => {
    const parser = new D2Parser(`
      container: {
        server: "Web Server"
        database: "PostgreSQL"
      }
    `);
    const ast = parser.parse();
    
    const shapes = parser.getAllShapes();
    assert.strictEqual(shapes.length, 3); // container, server, database
    assert.ok(shapes.some(s => s.identifier === 'container'));
    assert.ok(shapes.some(s => s.identifier === 'server'));
    assert.ok(shapes.some(s => s.identifier === 'database'));
  });

  test('Should handle style blocks', () => {
    const parser = new D2Parser(`
      server.style: {
        fill: blue
        stroke: red
        stroke-width: 2
      }
    `);
    const ast = parser.parse();
    
    const context = parser.getContextAtPosition(
      parser['document'].indexOf('fill:') - 2
    );
    assert.ok(context.isInStyle);
  });

  test('Should parse dot notation properties', () => {
    const parser = new D2Parser('server.style.fill: blue');
    const ast = parser.parse();
    
    const shapes = parser.getAllShapes();
    assert.strictEqual(shapes.length, 1);
    assert.strictEqual(shapes[0].identifier, 'server');
  });

  test('Should handle escape sequences in strings', () => {
    const parser = new D2Parser('server: "Web \\"Server\\""');
    const ast = parser.parse();
    
    const shapes = parser.getAllShapes();
    assert.strictEqual(shapes.length, 1);
  });

  test('Should parse multiple statements', () => {
    const parser = new D2Parser(`
      server: "Web Server"
      database: "PostgreSQL"
      server -> database: queries
      database -> server: results
    `);
    const ast = parser.parse();
    
    const shapes = parser.getAllShapes();
    assert.strictEqual(shapes.length, 2);
    
    const connections = parser.getAllConnections();
    assert.strictEqual(connections.length, 2);
  });

  test('Performance: Should parse large document quickly', () => {
    const lines: string[] = [];
    for (let i = 0; i < 1000; i++) {
      lines.push(`shape${i}: "Shape ${i}"`);
      if (i > 0) {
        lines.push(`shape${i-1} -> shape${i}: connection`);
      }
    }
    
    const start = Date.now();
    const parser = new D2Parser(lines.join('\n'));
    parser.parse();
    const duration = Date.now() - start;
    
    assert.ok(duration < 100, `Parsing took ${duration}ms, should be < 100ms`);
    
    const shapes = parser.getAllShapes();
    assert.strictEqual(shapes.length, 1000);
    
    const connections = parser.getAllConnections();
    assert.strictEqual(connections.length, 999);
  });

  test('Should parse multi-word identifiers without quotes', () => {
    const parser = new D2Parser(`
      AI Auto: {
        shape: square
      }
      Database Server: cylinder
      Web Application Server -> Database Server
    `);
    const ast = parser.parse();
    
    const shapes = parser.getAllShapes();
    assert.strictEqual(shapes.length, 3);
    
    const shapeNames = shapes.map(s => s.identifier);
    assert.ok(shapeNames.includes('AI Auto'));
    assert.ok(shapeNames.includes('Database Server'));
    assert.ok(shapeNames.includes('Web Application Server'));
    
    const connections = parser.getAllConnections();
    assert.strictEqual(connections.length, 1);
    assert.strictEqual(connections[0].source, 'Web Application Server');
    assert.strictEqual(connections[0].target, 'Database Server');
  });

  test('Should parse connections between multi-word identifiers', () => {
    const parser = new D2Parser('AI Auto -> Machine Learning Model: data flow');
    parser.parse();
    
    const connections = parser.getAllConnections();
    assert.strictEqual(connections.length, 1);
    assert.strictEqual(connections[0].source, 'AI Auto');
    assert.strictEqual(connections[0].target, 'Machine Learning Model');
    assert.strictEqual(connections[0].label, 'data flow');
  });

  test('Should handle mixed quoted and unquoted multi-word identifiers', () => {
    const parser = new D2Parser(`
      AI Auto: service
      "Database Server": cylinder
      AI Auto -> "Database Server"
    `);
    parser.parse();
    
    const shapes = parser.getAllShapes();
    assert.strictEqual(shapes.length, 2);
    assert.ok(shapes.some(s => s.identifier === 'AI Auto'));
    assert.ok(shapes.some(s => s.identifier === 'Database Server'));
  });

  test('Should parse multi-word identifiers with style properties', () => {
    const parser = new D2Parser(`
      Load Balancer: {
        shape: hexagon
        style: {
          fill: orange
        }
      }
      Load Balancer.style.stroke: black
    `);
    parser.parse();
    
    const shapes = parser.getAllShapes();
    assert.strictEqual(shapes.length, 1);
    assert.strictEqual(shapes[0].identifier, 'Load Balancer');
  });

  test('Should stop parsing identifier at special characters', () => {
    const parser = new D2Parser('AI Auto: value');
    parser.parse();
    
    const shapes = parser.getAllShapes();
    assert.strictEqual(shapes.length, 1);
    assert.strictEqual(shapes[0].identifier, 'AI Auto');
  });
}); 