/**
 * D2 Completion Provider Tests
 * Tests for code completion functionality
 */

import * as vscode from 'vscode';
import * as assert from 'assert';
import { D2CompletionProvider } from '../d2CompletionProvider';
import { D2Parser } from '../d2Parser';

suite('D2 Completion Provider Test Suite', () => {
  let provider: D2CompletionProvider;

  setup(() => {
    provider = new D2CompletionProvider();
  });

  test('Should provide shape completions after shape keyword', async () => {
    const doc = createMockDocument('server.shape: ');
    const position = new vscode.Position(0, 14);
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: undefined }
    );

    assert.ok(completions);
    const items = (completions as vscode.CompletionList).items;
    
    // Should include shape types
    assert.ok(items.some(item => item.label === 'square'));
    assert.ok(items.some(item => item.label === 'circle'));
    assert.ok(items.some(item => item.label === 'cylinder'));
    assert.ok(items.some(item => item.label === 'cloud'));
  });

  test('Should provide style properties in style block', async () => {
    const doc = createMockDocument('server.style: {\n  \n}');
    const position = new vscode.Position(1, 2);
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: undefined }
    );

    assert.ok(completions);
    const items = (completions as vscode.CompletionList).items;
    
    // Should include style properties
    assert.ok(items.some(item => item.label === 'fill'));
    assert.ok(items.some(item => item.label === 'stroke'));
    assert.ok(items.some(item => item.label === 'opacity'));
    assert.ok(items.some(item => item.label === 'shadow'));
  });

  test('Should provide connection completions after shape name', async () => {
    const doc = createMockDocument('client ');
    const position = new vscode.Position(0, 7);
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: ' ' }
    );

    assert.ok(completions);
    const items = (completions as vscode.CompletionList).items;
    
    // Should include connection operators
    assert.ok(items.some(item => item.label === '->'));
    assert.ok(items.some(item => item.label === '<->'));
    assert.ok(items.some(item => item.label === '--'));
  });

  test('Should provide existing shapes after connection', async () => {
    const doc = createMockDocument('server: "Web Server"\nclient -> ');
    const position = new vscode.Position(1, 10);
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: ' ' }
    );

    assert.ok(completions);
    const items = (completions as vscode.CompletionList).items;
    
    // Should include existing shape
    assert.ok(items.some(item => item.label === 'server'));
  });

  test('Should provide color completions for fill property', async () => {
    const doc = createMockDocument('box.style.fill: ');
    const position = new vscode.Position(0, 16);
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: ' ' }
    );

    assert.ok(completions);
    const items = (completions as vscode.CompletionList).items;
    
    // Should include colors
    assert.ok(items.some(item => item.label === 'red'));
    assert.ok(items.some(item => item.label === 'blue'));
    assert.ok(items.some(item => item.label === 'transparent'));
  });

  test('Should provide direction values after direction keyword', async () => {
    const doc = createMockDocument('direction: ');
    const position = new vscode.Position(0, 11);
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: ' ' }
    );

    assert.ok(completions);
    const items = (completions as vscode.CompletionList).items;
    
    // Should include directions
    assert.ok(items.some(item => item.label === 'up'));
    assert.ok(items.some(item => item.label === 'down'));
    assert.ok(items.some(item => item.label === 'left'));
    assert.ok(items.some(item => item.label === 'right'));
  });

  test('Should provide multi-word suggestions without quotes', async () => {
    const doc = createMockDocument('');
    const position = new vscode.Position(0, 0);
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: undefined }
    );

    assert.ok(completions);
    const items = (completions as vscode.CompletionList).items;
    
    // Should include multi-word suggestions without quotes
    assert.ok(items.some(item => item.label === 'database server'));
    assert.ok(items.some(item => item.label === 'web server'));
    
    // Check that insertText also doesn't have quotes
    const dbServerItem = items.find(item => item.label === 'database server');
    assert.ok(dbServerItem);
    assert.strictEqual(dbServerItem.insertText, 'database server');
  });

  test('Should provide dot completions for shapes', async () => {
    const doc = createMockDocument('server: "Web Server"\nserver.');
    const position = new vscode.Position(1, 7);
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.TriggerCharacter, triggerCharacter: '.' }
    );

    assert.ok(completions);
    const items = (completions as vscode.CompletionList).items;
    
    // Should include shape properties
    assert.ok(items.some(item => item.label === 'style'));
    assert.ok(items.some(item => item.label === 'shape'));
    assert.ok(items.some(item => item.label === 'icon'));
  });

  test('Should not provide completions in comments', async () => {
    const doc = createMockDocument('# This is a comment ');
    const position = new vscode.Position(0, 20);
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: ' ' }
    );

    // Should return empty array for comments
    assert.ok(Array.isArray(completions) && completions.length === 0);
  });

  test('Performance: Should complete within 200ms', async () => {
    const doc = createMockDocument(generateLargeDocument());
    const position = new vscode.Position(50, 10);
    
    const start = Date.now();
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: undefined }
    );
    const duration = Date.now() - start;

    assert.ok(completions);
    assert.ok(duration < 200, `Completion took ${duration}ms, should be < 200ms`);
  });

  test('Should provide multi-word identifier completions', async () => {
    const doc = createMockDocument('AI Auto: "AI Service"\nDatabase Server: cylinder\nAI');
    const position = new vscode.Position(2, 2); // After "AI"
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: undefined }
    );

    assert.ok(completions);
    const items = (completions as vscode.CompletionList).items;
    
    // Should NOT include just "AI" (it's a separate shape)
    // Should include "AI Auto" as a full path
    const labels = items.map(item => item.label);
    assert.ok(labels.includes('AI'), 'Should include "AI"');
    assert.ok(labels.includes('AI Auto'), 'Should include "AI Auto"');
  });

  test('Should filter multi-word identifiers based on partial input', async () => {
    const doc = createMockDocument('Database Server: cylinder\nWeb Application Server: rectangle\nData');
    const position = new vscode.Position(2, 4); // After "Data"
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: undefined }
    );

    assert.ok(completions);
    const items = (completions as vscode.CompletionList).items;
    
    // Should include "Database Server" when typing "Data"
    assert.ok(items.some(item => item.label === 'Database Server'));
    // Should not include "Web Application Server"
    assert.ok(!items.some(item => item.label === 'Web Application Server'));
  });

  test('Should suggest multi-word identifiers after connection', async () => {
    const doc = createMockDocument('AI Auto: "Service"\nAI: "Single"\nAI -> ');
    const position = new vscode.Position(2, 6); // After "AI -> "
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: ' ' }
    );

    assert.ok(completions);
    const items = (completions as vscode.CompletionList).items;
    
    // Should include "AI Auto" but not "AI" (source shape)
    assert.ok(items.some(item => item.label === 'AI Auto'));
    assert.ok(!items.some(item => item.label === 'AI'));
  });

  test('Should NOT add quotes to multi-word identifiers in insertText', async () => {
    const doc = createMockDocument('AI Auto: "Service"\n');
    const position = new vscode.Position(1, 0);
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: undefined }
    );

    assert.ok(completions);
    const items = (completions as vscode.CompletionList).items;
    
    const aiAutoItem = items.find(item => item.label === 'AI Auto');
    assert.ok(aiAutoItem);
    // Should NOT have quotes - D2 supports multi-word identifiers without quotes
    assert.ok(!aiAutoItem.insertText || aiAutoItem.insertText === 'AI Auto');
  });

  test('Should prioritize existing nested shapes in dot completions', async () => {
    const doc = createMockDocument(`
      Middle: {
        Backbone
        AIS
      }
      Middle.`);
    const position = new vscode.Position(5, 13); // After "Middle."
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.TriggerCharacter, triggerCharacter: '.' }
    );

    assert.ok(completions);
    const items = (completions as vscode.CompletionList).items;
    
    // Check that existing shapes come first
    const labels = items.map(item => item.label);
    const aisIndex = labels.indexOf('AIS');
    const backboneIndex = labels.indexOf('Backbone');
    const styleIndex = labels.indexOf('style');
    const shapeIndex = labels.indexOf('shape');
    
    assert.ok(aisIndex !== -1, 'Should include AIS');
    assert.ok(backboneIndex !== -1, 'Should include Backbone');
    assert.ok(styleIndex !== -1, 'Should include style');
    assert.ok(shapeIndex !== -1, 'Should include shape');
    
    // Existing shapes should come before new properties
    assert.ok(aisIndex < styleIndex, 'AIS should come before style');
    assert.ok(backboneIndex < styleIndex, 'Backbone should come before style');
    assert.ok(aisIndex < shapeIndex, 'AIS should come before shape');
    assert.ok(backboneIndex < shapeIndex, 'Backbone should come before shape');
    
    // Check that existing shapes are marked as such
    const aisItem = items.find(item => item.label === 'AIS');
    assert.ok(aisItem);
    assert.strictEqual(aisItem.detail, '[Existing Nested Shape]');
    assert.ok(aisItem.preselect, 'Existing shapes should be preselected');
  });

  test('Should handle multi-word shapes in dot completions', async () => {
    const doc = createMockDocument(`
      AI System: {
        Neural Network
        Data Processing Unit
      }
      AI System.`);
    const position = new vscode.Position(5, 18); // After "AI System."
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.TriggerCharacter, triggerCharacter: '.' }
    );

    assert.ok(completions);
    const items = (completions as vscode.CompletionList).items;
    
    // Should include multi-word nested shapes
    const labels = items.map(item => item.label);
    assert.ok(labels.includes('Neural Network'), 'Should include "Neural Network"');
    assert.ok(labels.includes('Data Processing Unit'), 'Should include "Data Processing Unit"');
    
    // Multi-word shapes should NOT have quotes in insertText
    const neuralItem = items.find(item => item.label === 'Neural Network');
    assert.ok(neuralItem);
    assert.ok(!neuralItem.insertText || neuralItem.insertText === 'Neural Network');
  });

  test('Should suggest full path for nested shapes', async () => {
    const doc = createMockDocument(`
      Middle: {
        Backbone
        AIS
      }
      Back`); // Typing "Back" should suggest "Middle.Backbone"
    const position = new vscode.Position(5, 8); // After "Back"
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: undefined }
    );

    assert.ok(completions);
    const items = (completions as vscode.CompletionList).items;
    
    // Should suggest "Middle.Backbone" when typing "Back"
    const backboneItem = items.find(item => item.label === 'Middle.Backbone');
    assert.ok(backboneItem, 'Should suggest Middle.Backbone for nested shape');
    assert.ok(backboneItem.detail?.includes('[Existing Shape in Middle]'));
    
    // Should be filterable by both "Backbone" and "Middle.Backbone"
    assert.ok(backboneItem.filterText?.includes('Backbone'));
    assert.ok(backboneItem.filterText?.includes('Middle.Backbone'));
  });

  test('Should not suggest parent shape in connections from itself', async () => {
    const doc = createMockDocument(`
      Container: {
        Child1
        Child2
      }
      Container -> `); // Should not suggest "Container"
    const position = new vscode.Position(5, 17); // After "Container -> "
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: ' ' }
    );

    assert.ok(completions);
    const items = (completions as vscode.CompletionList).items;
    
    // Should not include "Container" (source of connection)
    assert.ok(!items.some(item => item.label === 'Container'));
    
    // But should include nested shapes with full path
    assert.ok(items.some(item => item.label === 'Container.Child1'));
    assert.ok(items.some(item => item.label === 'Container.Child2'));
  });

  test('Should prioritize existing shapes over new suggestions', async () => {
    const doc = createMockDocument(`
      Middle: {
        Backbone
        AIS
      }
      AI`); // Typing "AI" should prioritize Middle.AIS over new "AI" keyword
    const position = new vscode.Position(5, 6); // After "AI"
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: undefined }
    );

    assert.ok(completions);
    const items = (completions as vscode.CompletionList).items;
    
    // Find both Middle.AIS and any new suggestions starting with AI
    const middleAisItem = items.find(item => item.label === 'Middle.AIS');
    const aiSystemItem = items.find(item => item.label === 'AI System');
    
    assert.ok(middleAisItem, 'Should include Middle.AIS');
    
    // Middle.AIS should have higher priority (lower sortText)
    if (aiSystemItem) {
      assert.ok(middleAisItem.sortText! < aiSystemItem.sortText!, 
        `Middle.AIS (${middleAisItem.sortText}) should have higher priority than AI System (${aiSystemItem.sortText})`);
    }
    
    // Middle.AIS should NOT be preselected since it's a nested shape
    assert.ok(!middleAisItem.preselect, 'Middle.AIS should not be preselected');
  });

  test('Should give highest priority to exact identifier matches', async () => {
    const doc = createMockDocument(`
      Server: {
        API
        Database
      }
      Client
      
      API`); // Typing "API" exactly should prioritize Server.API
    const position = new vscode.Position(7, 7); // After "API"
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: undefined }
    );

    assert.ok(completions);
    const items = (completions as vscode.CompletionList).items;
    
    const serverApiItem = items.find(item => item.label === 'Server.API');
    assert.ok(serverApiItem, 'Should include Server.API');
    assert.ok(serverApiItem.preselect, 'Server.API should be preselected for exact match');
    
    // Check it has the highest priority sort text
    assert.ok(serverApiItem.sortText?.startsWith('000'), 
      `Server.API should have highest priority sortText starting with '000', got: ${serverApiItem.sortText}`);
  });

  test('Should handle both root and nested shapes with same identifier', async () => {
    const doc = createMockDocument(`
      Middle: {
        AIS
      }
      AIS: "Standalone"
      
      AI`); // Typing "AI" should show both AIS shapes
    const position = new vscode.Position(6, 6); // After "AI"
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: undefined }
    );

    assert.ok(completions);
    const items = (completions as vscode.CompletionList).items;
    
    // Should include both shapes
    const rootAis = items.find(item => item.label === 'AIS');
    const nestedAis = items.find(item => item.label === 'Middle.AIS');
    
    assert.ok(rootAis, 'Should include root AIS');
    assert.ok(nestedAis, 'Should include Middle.AIS');
    
    // Check priorities: root AIS should have higher priority than nested
    assert.ok(rootAis.sortText?.startsWith('001'), 'Root AIS should have top-level prefix match priority');
    assert.ok(nestedAis.sortText?.startsWith('003'), 'Middle.AIS should have nested identifier match priority');
    assert.ok(rootAis.sortText! < nestedAis.sortText!, 'Root AIS should have higher priority than nested');
    
    // Root should be preselected as it starts with AI
    assert.ok(rootAis.preselect, 'Root AIS should be preselected');
  });

  test('Should prioritize existing shapes when typing partial names', async () => {
    const doc = createMockDocument(`
      Middle: {
        Backbone
      }
      
      Back`); // Typing "Back" should suggest Middle.Backbone with high priority
    const position = new vscode.Position(5, 8); // After "Back"
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: undefined }
    );

    assert.ok(completions);
    const items = (completions as vscode.CompletionList).items;
    
    // Should include Middle.Backbone
    const backboneItem = items.find(item => item.label === 'Middle.Backbone');
    assert.ok(backboneItem, 'Should include Middle.Backbone');
    
    // Should have nested identifier priority since "Backbone" starts with "Back"
    assert.ok(backboneItem.sortText?.startsWith('003'), 
      `Middle.Backbone should have nested identifier priority, got: ${backboneItem.sortText}`);
    // Should not be preselected as it's a nested shape
    assert.ok(!backboneItem.preselect, 'Middle.Backbone should not be preselected');
    
    // Should also suggest creating new "Back" shape
    const newBackItem = items.find(item => item.label === 'Back' && item.detail === '[New Shape]');
    assert.ok(newBackItem, 'Should suggest creating new Back shape');
    assert.ok(newBackItem.sortText?.startsWith('1'), 'New shape should have lower priority');
  });

  test('Should prioritize all Server shapes when typing Server', async () => {
    const doc = createMockDocument(`
      Server: {
        API
        Database
      }
      
      Server`); // Typing "Server" should show Server and nested shapes with priority
    const position = new vscode.Position(6, 10); // After "Server"
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: undefined }
    );

    assert.ok(completions);
    const items = (completions as vscode.CompletionList).items;
    
    // Should include all Server-related shapes
    const serverItem = items.find(item => item.label === 'Server');
    const apiItem = items.find(item => item.label === 'Server.API');
    const dbItem = items.find(item => item.label === 'Server.Database');
    const webServerItem = items.find(item => item.label === 'web server');
    
    assert.ok(serverItem, 'Should include Server');
    assert.ok(apiItem, 'Should include Server.API');
    assert.ok(dbItem, 'Should include Server.Database');
    
    // Server should have highest priority (exact match)
    assert.ok(serverItem.sortText?.startsWith('000'), 
      `Server should have exact match priority, got: ${serverItem.sortText}`);
    assert.ok(serverItem.preselect, 'Server should be preselected');
    
    // Nested shapes should have child-of-match priority
    assert.ok(apiItem.sortText?.startsWith('002'), 
      `Server.API should have child-of-match priority, got: ${apiItem.sortText}`);
    assert.ok(dbItem.sortText?.startsWith('002'), 
      `Server.Database should have child-of-match priority, got: ${dbItem.sortText}`);
    
    // Multi-word suggestions should have lower priority
    if (webServerItem) {
      assert.ok(webServerItem.sortText?.startsWith('4'), 
        `web server should have lower priority, got: ${webServerItem.sortText}`);
    }
  });

  test('Should only suggest real paths when typing in connection context', async () => {
    const doc = createMockDocument(`
      Middle: {
        Backbone
        AIS
      }
      
      Authentication Service: {
        JWT Handler
        Session Manager
      }
      
      Authentication Service.JWT Handler -> Midd`); // Typing "Midd" after arrow
    const position = new vscode.Position(11, 45); // After "Midd"
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: undefined }
    );

    assert.ok(completions);
    const items = (completions as vscode.CompletionList).items;
    
    // Should include only real Middle shapes
    const middleItem = items.find(item => item.label === 'Middle');
    const backboneItem = items.find(item => item.label === 'Middle.Backbone');
    const aisItem = items.find(item => item.label === 'Middle.AIS');
    
    assert.ok(middleItem, 'Should include Middle');
    assert.ok(backboneItem, 'Should include Middle.Backbone');
    assert.ok(aisItem, 'Should include Middle.AIS');
    
    // Should NOT include non-existent paths
    const wrongAuthItem = items.find(item => item.label === 'Middle.Authentication Service');
    const wrongJwtItem = items.find(item => item.label === 'Middle.Authentication Service.JWT Handler');
    const wrongSessionItem = items.find(item => item.label === 'Middle.Authentication Service.Session Manager');
    
    assert.ok(!wrongAuthItem, 'Should NOT include non-existent Middle.Authentication Service');
    assert.ok(!wrongJwtItem, 'Should NOT include non-existent Middle.Authentication Service.JWT Handler');
    assert.ok(!wrongSessionItem, 'Should NOT include non-existent Middle.Authentication Service.Session Manager');
    
    // Check labels for debugging
    const labels = items.map(item => item.label);
    console.log('Actual suggestions:', labels);
  });

  test('Should provide correct dot completions for existing shapes', async () => {
    const doc = createMockDocument(`
      Middle: {
        Backbone: "Core System"
        AIS: "AI Service"
      }
      
      Middle.`); // After dot
    const position = new vscode.Position(6, 13); // After "Middle."
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: '.' }
    );

    assert.ok(completions);
    const items = (completions as vscode.CompletionList).items;
    
    // Should show child shapes first
    const backboneItem = items.find(item => item.label === 'Backbone');
    const aisItem = items.find(item => item.label === 'AIS');
    
    assert.ok(backboneItem, 'Should include Backbone');
    assert.ok(aisItem, 'Should include AIS');
    
    // Should NOT show other global shapes
    const authServiceItem = items.find(item => item.label === 'Authentication Service');
    assert.ok(!authServiceItem, 'Should NOT include unrelated global shapes');
    
    // Check priorities
    assert.ok(backboneItem.sortText?.startsWith('0000'), 'Backbone should have highest priority');
    assert.ok(aisItem.sortText?.startsWith('0000'), 'AIS should have highest priority');
  });

  test('Should provide dot completions in connection context', async () => {
    const doc = createMockDocument(`
      Middle: {
        Backbone
        AIS
      }
      
      Authentication Service: {
        JWT Handler
        Session Manager
      }
      
      Middle.Backbone -> Authentication Service.`); // After dot in connection
    const position = new vscode.Position(11, 47); // After "Authentication Service."
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: '.' }
    );

    assert.ok(completions);
    const items = (completions as vscode.CompletionList).items;
    
    // Should show Authentication Service children
    const jwtItem = items.find(item => item.label === 'JWT Handler');
    const sessionItem = items.find(item => item.label === 'Session Manager');
    
    assert.ok(jwtItem, 'Should include JWT Handler');
    assert.ok(sessionItem, 'Should include Session Manager');
    
    // Should NOT show Middle children
    const backboneItem = items.find(item => item.label === 'Backbone');
    assert.ok(!backboneItem, 'Should NOT include children from other shapes');
  });

  test('Should NOT suggest non-existent paths after dot', async () => {
    const doc = createMockDocument(`
      Middle: {
        Backbone
        AIS
      }
      
      Authentication Service: {
        JWT Handler
      }
      
      Middle.`); // Type after dot
    const position = new vscode.Position(10, 13); // After "Middle."
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: '.' }
    );

    assert.ok(completions);
    const items = (completions as vscode.CompletionList).items;
    
    // Should NOT suggest Authentication Service as child of Middle
    const authServiceItem = items.find(item => item.label === 'Authentication Service');
    assert.ok(!authServiceItem, 'Should NOT suggest Authentication Service after Middle.');
    
    // Should only show actual children
    const labels = items.map(item => item.label.toString());
    assert.ok(labels.includes('Backbone'), 'Should include Backbone');
    assert.ok(labels.includes('AIS'), 'Should include AIS');
    assert.ok(labels.includes('style'), 'Should include style property');
    
    // Verify no global shapes leak in
    assert.ok(!labels.includes('Authentication Service'), 'Should NOT include global shapes');
    assert.ok(!labels.includes('JWT Handler'), 'Should NOT include nested shapes from other containers');
  });

  test('Should prioritize based on hierarchy when typing AI', async () => {
    const doc = createMockDocument(`
      AI Auto : {
        Backbone
        Air
      }
      
      Middle : {
        Backbone
        AIS
      }
      
      AI`); // Typing "AI"
    const position = new vscode.Position(11, 6); // After "AI"
    
    const completions = await provider.provideCompletionItems(
      doc,
      position,
      new vscode.CancellationTokenSource().token,
      { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: undefined }
    );

    assert.ok(completions);
    const items = (completions as vscode.CompletionList).items;
    
    // Find all relevant items
    const aiAutoItem = items.find(item => item.label === 'AI Auto');
    const aiAutoBackboneItem = items.find(item => item.label === 'AI Auto.Backbone');
    const aiAutoAirItem = items.find(item => item.label === 'AI Auto.Air');
    const middleAisItem = items.find(item => item.label === 'Middle.AIS');
    const newAiItem = items.find(item => item.label === 'AI' && item.detail === '[New Shape]');
    
    assert.ok(aiAutoItem, 'Should include AI Auto');
    assert.ok(aiAutoBackboneItem, 'Should include AI Auto.Backbone');
    assert.ok(aiAutoAirItem, 'Should include AI Auto.Air');
    assert.ok(middleAisItem, 'Should include Middle.AIS');
    assert.ok(newAiItem, 'Should include new AI suggestion');
    
    // Check priority order
    assert.ok(aiAutoItem.sortText?.startsWith('001'), 'AI Auto should have top-level prefix priority');
    assert.ok(aiAutoBackboneItem.sortText?.startsWith('002'), 'AI Auto.Backbone should have child-of-match priority');
    assert.ok(aiAutoAirItem.sortText?.startsWith('002'), 'AI Auto.Air should have child-of-match priority');
    assert.ok(middleAisItem.sortText?.startsWith('003'), 'Middle.AIS should have nested identifier priority');
    assert.ok(newAiItem.sortText?.startsWith('1'), 'New AI should have lowest priority');
    
    // Verify ordering
    assert.ok(aiAutoItem.sortText! < aiAutoBackboneItem.sortText!, 'AI Auto should come before its children');
    assert.ok(aiAutoBackboneItem.sortText! < middleAisItem.sortText!, 'AI Auto children should come before other nested shapes');
    assert.ok(middleAisItem.sortText! < newAiItem.sortText!, 'Existing shapes should come before new shape suggestion');
    
    // AI Auto should be preselected
    assert.ok(aiAutoItem.preselect, 'AI Auto should be preselected');
  });
});

/**
 * Helper function to create mock document
 */
function createMockDocument(content: string): vscode.TextDocument {
  return {
    getText: () => content,
    lineAt: (line: number) => ({
      text: content.split('\n')[line] || '',
      lineNumber: line,
      range: new vscode.Range(line, 0, line, content.split('\n')[line]?.length || 0),
      rangeIncludingLineBreak: new vscode.Range(line, 0, line + 1, 0),
      firstNonWhitespaceCharacterIndex: 0,
      isEmptyOrWhitespace: false
    }),
    offsetAt: (position: vscode.Position) => {
      const lines = content.split('\n');
      let offset = 0;
      for (let i = 0; i < position.line; i++) {
        offset += lines[i].length + 1;
      }
      offset += position.character;
      return offset;
    },
    positionAt: (offset: number) => new vscode.Position(0, offset),
    getWordRangeAtPosition: (position: vscode.Position) => {
      const line = content.split('\n')[position.line] || '';
      const wordMatch = /\w+/.exec(line.substring(0, position.character));
      if (wordMatch) {
        return new vscode.Range(
          position.line,
          position.character - wordMatch[0].length,
          position.line,
          position.character
        );
      }
      return undefined;
    },
    languageId: 'd2',
    version: 1,
    uri: vscode.Uri.parse('file:///test.d2'),
    fileName: 'test.d2',
    isUntitled: false,
    isDirty: false,
    isClosed: false,
    save: async () => true,
    eol: vscode.EndOfLine.LF,
    lineCount: content.split('\n').length,
    validateRange: (range: vscode.Range) => range,
    validatePosition: (position: vscode.Position) => position
  } as unknown as vscode.TextDocument;
}

/**
 * Generate a large document for performance testing
 */
function generateLargeDocument(): string {
  const shapes = ['server', 'client', 'database', 'cache', 'queue', 'api'];
  const lines: string[] = [];
  
  for (let i = 0; i < 100; i++) {
    const shape1 = shapes[i % shapes.length];
    const shape2 = shapes[(i + 1) % shapes.length];
    lines.push(`${shape1}${i}: "Service ${i}"`);
    lines.push(`${shape1}${i} -> ${shape2}${i}: connection`);
    lines.push(`${shape1}${i}.style: {`);
    lines.push(`  fill: blue`);
    lines.push(`  stroke: black`);
    lines.push(`}`);
  }
  
  return lines.join('\n');
} 