/**
 * Integration tests: verify every plan pattern runs through the PHP executor.
 * These require PHP 8.2+ installed on the system.
 */
import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import { PhpExecutor } from '../php-executor.js';
import { parsePhpFile } from '../php-parser.js';
import { storybookPhpPlugin } from '../vite-plugin.js';
import type { PhpRenderRequest } from '../types.js';

let hasPhp = false;
try {
  const out = execSync('php -v', { stdio: 'pipe' }).toString();
  // Require PHP 8.2+
  const ver = out.match(/PHP (\d+)\.(\d+)/);
  if (ver && (parseInt(ver[1]!) > 8 || (parseInt(ver[1]!) === 8 && parseInt(ver[2]!) >= 2))) {
    hasPhp = true;
  }
} catch {
  // PHP not available
}

const fixturesDir = resolve(import.meta.dirname!, 'fixtures');
const examplesDir = resolve(import.meta.dirname!, '../../examples/basic/src');
const laravelDir = resolve(import.meta.dirname!, '../../examples/laravel/src');
const laravelBootstrap = resolve(import.meta.dirname!, '../../examples/laravel/bootstrap.php');
const laravelAdapter = resolve(import.meta.dirname!, '../../examples/laravel/adapter.php');
const fixture = (name: string) => resolve(fixturesDir, name);
const example = (name: string) => resolve(examplesDir, name);
const laravel = (name: string) => resolve(laravelDir, name);

describe.skipIf(!hasPhp)('Integration: All Plan Patterns', () => {
  const executor = new PhpExecutor({ timeout: 10000 });

  // -------------------------------------------------------------------------
  // UC1: Class with constructor + instance method
  // -------------------------------------------------------------------------
  describe('UC1: Class instance method', () => {
    it('renders Greeting with constructor args', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Greeting.php'),
        class: 'App\\Components\\Greeting',
        callable: 'render',
        args: { name: 'World' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Hello, World!');
    });

    it('uses default constructor values', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Greeting.php'),
        class: 'App\\Components\\Greeting',
        callable: 'render',
        args: { name: 'Storybook', greeting: 'Welcome' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Welcome, Storybook!');
    });
  });

  // -------------------------------------------------------------------------
  // UC2: Method with own params (separate from constructor)
  // -------------------------------------------------------------------------
  describe('UC2: Method with own params', () => {
    it('maps args to constructor vs method params', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Formatter.php'),
        class: 'App\\Components\\Formatter',
        callable: 'formatCurrency',
        args: { locale: 'en_US', amount: 42.5, symbol: '$' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('$42.50');
      expect(result.html).toContain('currency');
    });

    it('uses defaults for both constructor and method', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Formatter.php'),
        class: 'App\\Components\\Formatter',
        callable: 'formatCurrency',
        args: { amount: 100 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('$100.00');
    });
  });

  // -------------------------------------------------------------------------
  // UC3: Static method
  // -------------------------------------------------------------------------
  describe('UC3: Static method', () => {
    it('renders Alert::danger', async () => {
      const result = await executor.execute({
        type: 'staticMethod',
        file: example('Alert.php'),
        class: 'App\\Components\\Alert',
        callable: 'danger',
        args: { message: 'Error!', dismissible: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('alert-danger');
      expect(result.html).toContain('Error!');
      expect(result.html).toContain('&times;');
    });

    it('renders without optional args', async () => {
      const result = await executor.execute({
        type: 'staticMethod',
        file: example('Alert.php'),
        class: 'App\\Components\\Alert',
        callable: 'info',
        args: { message: 'Info text' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('alert-info');
    });
  });

  // -------------------------------------------------------------------------
  // UC4: Standalone function (global)
  // -------------------------------------------------------------------------
  describe('UC4: Global function', () => {
    it('renders badge()', async () => {
      const result = await executor.execute({
        type: 'function',
        file: example('badge.php'),
        class: null,
        callable: 'badge',
        args: { label: 'New', color: 'green' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('New');
      expect(result.html).toContain('green');
    });

    it('uses default color', async () => {
      const result = await executor.execute({
        type: 'function',
        file: example('badge.php'),
        class: null,
        callable: 'badge',
        args: { label: 'Default' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('gray');
    });
  });

  // -------------------------------------------------------------------------
  // UC5: Namespaced function
  // -------------------------------------------------------------------------
  describe('UC5: Namespaced function', () => {
    it('renders namespaced pill()', async () => {
      const result = await executor.execute({
        type: 'function',
        file: example('helpers.php'),
        class: null,
        callable: 'App\\Helpers\\pill',
        args: { text: 'Tag' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('pill');
      expect(result.html).toContain('Tag');
    });

    it('passes outline arg', async () => {
      const result = await executor.execute({
        type: 'function',
        file: example('helpers.php'),
        class: null,
        callable: 'App\\Helpers\\pill',
        args: { text: 'Outlined', outline: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('pill-outline');
    });
  });

  // -------------------------------------------------------------------------
  // UC6: Template file
  // -------------------------------------------------------------------------
  describe('UC6: Template file', () => {
    it('renders template with extracted variables', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/card.php'),
        class: null,
        callable: null,
        args: { title: 'Template', body: 'Content', variant: 'primary' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Template');
      expect(result.html).toContain('Content');
      expect(result.html).toContain('card-primary');
    });
  });

  // -------------------------------------------------------------------------
  // UC7: Invocable class (__invoke)
  // -------------------------------------------------------------------------
  describe('UC7: Invocable class (__invoke)', () => {
    it('renders English greeting', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('InvocableGreeting.php'),
        class: 'App\\Components\\InvocableGreeting',
        callable: '__invoke',
        args: { locale: 'en', name: 'World' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Hello World');
    });

    it('renders Japanese greeting', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('InvocableGreeting.php'),
        class: 'App\\Components\\InvocableGreeting',
        callable: '__invoke',
        args: { locale: 'ja', name: '太郎' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('こんにちは');
      expect(result.html).toContain('太郎');
    });

    it('renders French greeting', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('InvocableGreeting.php'),
        class: 'App\\Components\\InvocableGreeting',
        callable: '__invoke',
        args: { locale: 'fr', name: 'Marie' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Bonjour Marie');
    });
  });

  // -------------------------------------------------------------------------
  // UC8: Laravel Component + Blade (real illuminate/view)
  // -------------------------------------------------------------------------
  describe('UC8: Laravel Component + Blade', () => {
    const bladeExecutor = new PhpExecutor({ timeout: 10000, bootstrap: laravelBootstrap, adapter: laravelAdapter });

    it('renders BladeAlert via Blade template', async () => {
      const result = await bladeExecutor.execute({
        type: 'classMethod',
        file: laravel('BladeAlert.php'),
        class: 'App\\Components\\BladeAlert',
        callable: 'render',
        args: { title: 'Error', type: 'danger', message: 'Something went wrong.', dismissible: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('alert-danger');
      expect(result.html).toContain('Error');
      expect(result.html).toContain('Something went wrong.');
      expect(result.html).toContain('btn-close');
    });

    it('renders BladeCard via Blade template', async () => {
      const result = await bladeExecutor.execute({
        type: 'classMethod',
        file: laravel('BladeCard.php'),
        class: 'App\\Components\\BladeCard',
        callable: 'render',
        args: { title: 'Featured', body: 'Content', featured: true, footer: 'Today' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('card-featured');
      expect(result.html).toContain('Featured');
      expect(result.html).toContain('Content');
      expect(result.html).toContain('Today');
    });

    it('renders BladeStats via Blade @foreach', async () => {
      const result = await bladeExecutor.execute({
        type: 'classMethod',
        file: laravel('BladeStats.php'),
        class: 'App\\Components\\BladeStats',
        callable: 'render',
        args: {
          items: [{ label: 'Users', value: '1,234' }, { label: 'Revenue', value: '$56K' }],
          color: '#10b981',
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('stats-grid');
      expect(result.html).toContain('1,234');
      expect(result.html).toContain('$56K');
      expect(result.html).toContain('#10b981');
    });
  });

  // -------------------------------------------------------------------------
  // UC9: Readonly class + enum params + object params (recursive instantiation)
  // -------------------------------------------------------------------------
  describe('UC9: Readonly + enum + object params', () => {
    it('renders ProductCard with defaults', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('ProductCard.php'),
        class: 'App\\Components\\ProductCard',
        callable: 'render',
        args: { name: 'Widget', price: 29.99 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Widget');
      expect(result.html).toContain('USD');
      expect(result.html).toContain('29.99');
      expect(result.html).toContain('Draft');
    });

    it('renders with enum status and nested object config', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('ProductCard.php'),
        class: 'App\\Components\\ProductCard',
        callable: 'render',
        args: {
          name: 'Premium',
          price: 99.99,
          config: { currency: 'JPY', decimals: 0 },
          status: 'published',
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Premium');
      expect(result.html).toContain('JPY');
      expect(result.html).toContain('100'); // 99.99 with 0 decimals = 100
      expect(result.html).toContain('Published');
    });
  });

  // -------------------------------------------------------------------------
  // UC10: Echo-based output (void return)
  // -------------------------------------------------------------------------
  describe('UC10: Echo-based void return', () => {
    it('captures output buffer from void method', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Layout.php'),
        class: 'App\\Components\\Layout',
        callable: 'render',
        args: { title: 'My Page' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('My Page');
      expect(result.html).toContain('layout');
    });

    it('works with dark theme', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Layout.php'),
        class: 'App\\Components\\Layout',
        callable: 'render',
        args: { title: 'Dark', theme: 'dark' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('layout-dark');
    });
  });

  // -------------------------------------------------------------------------
  // UC11: Enum with methods
  // -------------------------------------------------------------------------
  describe('UC11: Enum method', () => {
    it('renders Color::badge for red', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('Color.php'),
        class: 'App\\Components\\Color',
        callable: 'badge',
        args: { _case: 'red' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Red');
      expect(result.html).toContain('red');
      expect(result.html).toContain('badge');
    });

    it('renders Color::badge for blue', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('Color.php'),
        class: 'App\\Components\\Color',
        callable: 'badge',
        args: { _case: 'blue' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Blue');
    });
  });

  // -------------------------------------------------------------------------
  // UC12: Inherited method
  // -------------------------------------------------------------------------
  describe('UC12: Inherited method', () => {
    it('renders inherited render() on child class', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('CardWithBase.php'),
        class: 'App\\Components\\CardWithBase',
        callable: 'render',
        args: { title: 'My Card', content: 'Inherited body' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('base-component');
      expect(result.html).toContain('Inherited body');
    });
  });

  // -------------------------------------------------------------------------
  // UC13: Nullable parameters
  // -------------------------------------------------------------------------
  describe('UC13: Nullable parameters', () => {
    it('renders Nav with all nullables omitted', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Nav.php'),
        class: 'App\\Components\\Nav',
        callable: 'render',
        args: { brand: 'My App' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('My App');
      expect(result.html).toContain('nav');
    });

    it('renders Nav with nullable subtitle provided', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Nav.php'),
        class: 'App\\Components\\Nav',
        callable: 'render',
        args: { brand: 'My App', subtitle: 'Dashboard', activeItem: 'Settings' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Dashboard');
      expect(result.html).toContain('Settings');
    });

    it('renders Nav with sticky flag', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Nav.php'),
        class: 'App\\Components\\Nav',
        callable: 'render',
        args: { brand: 'App', sticky: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('nav-sticky');
    });
  });

  // -------------------------------------------------------------------------
  // UC14: Array parameters
  // -------------------------------------------------------------------------
  describe('UC14: Array parameters', () => {
    it('renders Table with headers and rows', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Table.php'),
        class: 'App\\Components\\Table',
        callable: 'render',
        args: {
          headers: ['Name', 'Role'],
          rows: [['Alice', 'Engineer'], ['Bob', 'Designer']],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Alice');
      expect(result.html).toContain('Engineer');
      expect(result.html).toContain('Bob');
      expect(result.html).toContain('<table');
    });

    it('renders striped Table', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Table.php'),
        class: 'App\\Components\\Table',
        callable: 'render',
        args: {
          headers: ['Item'],
          rows: [['One'], ['Two']],
          striped: true,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('table-striped');
    });
  });

  // -------------------------------------------------------------------------
  // UC15: Enum method with additional params
  // -------------------------------------------------------------------------
  describe('UC15: Enum method with params', () => {
    it('renders Status::label with default params', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('Status.php'),
        class: 'App\\Components\\Status',
        callable: 'label',
        args: { _case: 'active' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Active');
      expect(result.html).toContain('#22c55e');
    });

    it('renders Status::label with prefix and uppercase', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('Status.php'),
        class: 'App\\Components\\Status',
        callable: 'label',
        args: { _case: 'pending', prefix: 'Status', uppercase: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('STATUS: PENDING');
      expect(result.html).toContain('#f59e0b');
    });
  });

  // -------------------------------------------------------------------------
  // UC16: Multiple static methods from same class
  // -------------------------------------------------------------------------
  describe('UC16: Multiple static methods', () => {
    it('renders Alert::success', async () => {
      const result = await executor.execute({
        type: 'staticMethod',
        file: example('Alert.php'),
        class: 'App\\Components\\Alert',
        callable: 'success',
        args: { message: 'Saved!', dismissible: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('alert-success');
      expect(result.html).toContain('Saved!');
      expect(result.html).toContain('&times;');
    });
  });

  // -------------------------------------------------------------------------
  // UC17: Multiple namespaced functions from same file
  // -------------------------------------------------------------------------
  describe('UC17: Multiple functions from same file', () => {
    it('renders tag() from helpers.php', async () => {
      const result = await executor.execute({
        type: 'function',
        file: example('helpers.php'),
        class: null,
        callable: 'App\\Helpers\\tag',
        args: { label: 'Feature', color: 'green' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('tag');
      expect(result.html).toContain('Feature');
      expect(result.html).toContain('green');
    });
  });

  // -------------------------------------------------------------------------
  // UC18: Additional template file
  // -------------------------------------------------------------------------
  describe('UC18: Profile template', () => {
    it('renders profile template with variables', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/profile.php'),
        class: null,
        callable: null,
        args: { name: 'Alice Johnson', role: 'Engineer' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Alice Johnson');
      expect(result.html).toContain('Engineer');
      expect(result.html).toContain('profile-card');
    });

    it('renders profile with defaults for missing variables', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/profile.php'),
        class: null,
        callable: null,
        args: { name: 'Bob' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Bob');
      expect(result.html).toContain('Member');
    });
  });

  // -------------------------------------------------------------------------
  // Vite plugin: verify virtual modules generate correctly for all patterns
  // -------------------------------------------------------------------------
  describe('Vite plugin: virtual module generation', () => {
    const plugin = storybookPhpPlugin();
    // We only need load + resolveId
    const resolveId = (plugin as any).resolveId.bind(plugin);
    const load = (plugin as any).load.bind(plugin);

    it('UC2: Formatter@formatCurrency generates classMethod with ctor+method args', () => {
      const id = resolveId('./Formatter.php@formatCurrency', example('Formatter.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("__callable: \"formatCurrency\"");
      expect(code).toContain('locale:');  // ctor arg
      expect(code).toContain('amount:');  // method arg
      expect(code).toContain('symbol:');  // method arg
    });

    it('UC5: helpers.php@pill generates function with FQN callable', () => {
      const id = resolveId('./helpers.php@pill', example('helpers.php'));
      const code = load(id);
      expect(code).toContain("__type: 'function'");
      expect(code).toContain('App\\\\Helpers\\\\pill'); // FQN in JSON string
    });

    it('UC7: InvocableGreeting@__invoke generates classMethod', () => {
      const id = resolveId('./InvocableGreeting.php@__invoke', example('InvocableGreeting.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("__callable: \"__invoke\"");
      expect(code).toContain('locale:');  // ctor arg
      expect(code).toContain('name:');    // invoke arg
    });

    it('UC11: Color@badge generates enumMethod', () => {
      const id = resolveId('./Color.php@badge', example('Color.php'));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain('_case:');
    });

    it('UC12: CardWithBase@render finds inherited method', () => {
      const id = resolveId('./CardWithBase.php@render', example('CardWithBase.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('CardWithBase');
      expect(code).toContain('title:');   // ctor arg from CardWithBase
      expect(code).toContain('content:'); // method arg from BaseComponent.render
    });

    it('UC9: ProductCard@render generates classMethod', () => {
      const id = resolveId('./ProductCard.php@render', example('ProductCard.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('name:');
      expect(code).toContain('price:');
      expect(code).toContain('config:');
      expect(code).toContain('status:');
    });

    it('UC13: Nav@render generates classMethod with nullable params', () => {
      const id = resolveId('./Nav.php@render', example('Nav.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('brand:');
      expect(code).toContain('subtitle:');
      expect(code).toContain('activeItem:');
    });

    it('UC14: Table@render generates classMethod with array params', () => {
      const id = resolveId('./Table.php@render', example('Table.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('headers:');
      expect(code).toContain('rows:');
      expect(code).toContain('striped:');
    });

    it('UC15: Status@label generates enumMethod with extra params', () => {
      const id = resolveId('./Status.php@label', example('Status.php'));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain('_case:');
      expect(code).toContain('prefix:');
      expect(code).toContain('uppercase:');
    });

    it('UC16: Alert@success generates staticMethod', () => {
      const id = resolveId('./Alert.php@success', example('Alert.php'));
      const code = load(id);
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain("__callable: \"success\"");
      expect(code).toContain('message:');
      expect(code).toContain('dismissible:');
    });

    it('UC17: helpers.php@tag generates function for second function', () => {
      const id = resolveId('./helpers.php@tag', example('helpers.php'));
      const code = load(id);
      expect(code).toContain("__type: 'function'");
      expect(code).toContain('App\\\\Helpers\\\\tag');
      expect(code).toContain('label:');
      expect(code).toContain('color:');
    });
  });

  // -------------------------------------------------------------------------
  // Parser: verify PHP parser extracts metadata correctly for all patterns
  // -------------------------------------------------------------------------
  describe('Parser: metadata extraction for all patterns', () => {
    it('parses namespaced functions correctly', () => {
      const meta = parsePhpFile(example('helpers.php'));
      expect(meta.namespace).toBe('App\\Helpers');
      expect(meta.functions).toHaveLength(2);
      expect(meta.functions[0]!.name).toBe('pill');
      expect(meta.functions[0]!.fqn).toBe('App\\Helpers\\pill');
      expect(meta.functions[1]!.name).toBe('tag');
      expect(meta.functions[1]!.fqn).toBe('App\\Helpers\\tag');
    });

    it('parses enum with methods and cases', () => {
      const meta = parsePhpFile(example('Color.php'));
      const color = meta.classes.find(c => c.name === 'Color');
      expect(color).toBeDefined();
      expect(color!.isEnum).toBe(true);
      expect(color!.enumBackingType).toBe('string');
      expect(color!.enumCases).toContain('Red');
      expect(color!.enumCases).toContain('Blue');
      const badge = color!.methods.find(m => m.name === 'badge');
      expect(badge).toBeDefined();
    });

    it('parses readonly class with enum and object params', () => {
      const meta = parsePhpFile(example('ProductCard.php'));
      const pc = meta.classes.find(c => c.name === 'ProductCard');
      expect(pc).toBeDefined();
      expect(pc!.isReadonly).toBe(true);
      expect(pc!.constructorParams).toHaveLength(4);
      const configParam = pc!.constructorParams.find(p => p.name === 'config');
      expect(configParam).toBeDefined();
      expect(configParam!.type).toBe('ProductConfig');
    });

    it('parses inherited class structure', () => {
      const meta = parsePhpFile(example('CardWithBase.php'));
      const card = meta.classes.find(c => c.name === 'CardWithBase');
      expect(card).toBeDefined();
      expect(card!.extends).toBe('BaseComponent');
      // Card itself has no methods (render is inherited)
      expect(card!.methods).toHaveLength(0);
      // BaseComponent has render
      const base = meta.classes.find(c => c.name === 'BaseComponent');
      expect(base).toBeDefined();
      expect(base!.methods.some(m => m.name === 'render')).toBe(true);
    });

    it('parses __invoke as a method', () => {
      const meta = parsePhpFile(example('InvocableGreeting.php'));
      const cls = meta.classes[0]!;
      expect(cls.methods.some(m => m.name === '__invoke')).toBe(true);
    });

    it('parses Nav with nullable constructor and method params', () => {
      const meta = parsePhpFile(example('Nav.php'));
      const nav = meta.classes.find(c => c.name === 'Nav');
      expect(nav).toBeDefined();
      const subtitle = nav!.constructorParams.find(p => p.name === 'subtitle');
      expect(subtitle).toBeDefined();
      expect(subtitle!.nullable).toBe(true);
      const render = nav!.methods.find(m => m.name === 'render');
      expect(render).toBeDefined();
      const activeItem = render!.params.find(p => p.name === 'activeItem');
      expect(activeItem).toBeDefined();
      expect(activeItem!.nullable).toBe(true);
    });

    it('parses Table with array params', () => {
      const meta = parsePhpFile(example('Table.php'));
      const table = meta.classes.find(c => c.name === 'Table');
      expect(table).toBeDefined();
      const headers = table!.constructorParams.find(p => p.name === 'headers');
      expect(headers).toBeDefined();
      expect(headers!.type).toBe('array');
      const rows = table!.constructorParams.find(p => p.name === 'rows');
      expect(rows).toBeDefined();
      expect(rows!.type).toBe('array');
    });

    it('parses Status enum with method params', () => {
      const meta = parsePhpFile(example('Status.php'));
      const status = meta.classes.find(c => c.name === 'Status');
      expect(status).toBeDefined();
      expect(status!.isEnum).toBe(true);
      expect(status!.enumBackingType).toBe('string');
      expect(status!.enumCases).toContain('Active');
      expect(status!.enumCases).toContain('Inactive');
      expect(status!.enumCases).toContain('Pending');
      const label = status!.methods.find(m => m.name === 'label');
      expect(label).toBeDefined();
      expect(label!.params).toHaveLength(2);
      expect(label!.params[0]!.name).toBe('prefix');
      expect(label!.params[1]!.name).toBe('uppercase');
    });

    it('parses multiple functions from helpers.php', () => {
      const meta = parsePhpFile(example('helpers.php'));
      expect(meta.functions).toHaveLength(2);
      const tag = meta.functions.find(f => f.name === 'tag');
      expect(tag).toBeDefined();
      expect(tag!.fqn).toBe('App\\Helpers\\tag');
      expect(tag!.params).toHaveLength(2);
      expect(tag!.params[0]!.name).toBe('label');
      expect(tag!.params[1]!.name).toBe('color');
    });
  });
});
