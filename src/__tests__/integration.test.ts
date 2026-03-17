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
  // UC19: Variadic parameters
  // -------------------------------------------------------------------------
  describe('UC19: Variadic parameters', () => {
    it('renders Breadcrumb with variadic segments', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Breadcrumb.php'),
        class: 'App\\Components\\Breadcrumb',
        callable: 'render',
        args: { separator: ' / ', segments: ['Home', 'Products', 'Widget'] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Home');
      expect(result.html).toContain('Products');
      expect(result.html).toContain('Widget');
      expect(result.html).toContain('breadcrumb');
    });

    it('renders Breadcrumb with empty segments', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Breadcrumb.php'),
        class: 'App\\Components\\Breadcrumb',
        callable: 'render',
        args: { segments: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('breadcrumb-empty');
    });

    it('renders Breadcrumb with single segment', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Breadcrumb.php'),
        class: 'App\\Components\\Breadcrumb',
        callable: 'render',
        args: { segments: ['Home'] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('breadcrumb-current');
      expect(result.html).toContain('Home');
    });
  });

  // -------------------------------------------------------------------------
  // UC20: Union type parameters
  // -------------------------------------------------------------------------
  describe('UC20: Union type parameters', () => {
    it('renders Progress with int value', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Progress.php'),
        class: 'App\\Components\\Progress',
        callable: 'render',
        args: { value: 75 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('75%');
      expect(result.html).toContain('progress-bar');
    });

    it('renders Progress with string value', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Progress.php'),
        class: 'App\\Components\\Progress',
        callable: 'render',
        args: { value: '42', max: 100 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('42%');
    });

    it('renders Progress with custom label', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Progress.php'),
        class: 'App\\Components\\Progress',
        callable: 'render',
        args: { value: 3, max: 10, label: '3 of 10' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('3 of 10');
    });
  });

  // -------------------------------------------------------------------------
  // UC21: Generator return
  // -------------------------------------------------------------------------
  describe('UC21: Generator return', () => {
    it('renders HtmlList from generator yield', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('HtmlList.php'),
        class: 'App\\Components\\HtmlList',
        callable: 'render',
        args: { items: ['Apples', 'Bananas', 'Cherries'] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('<ul');
      expect(result.html).toContain('Apples');
      expect(result.html).toContain('Bananas');
      expect(result.html).toContain('Cherries');
      expect(result.html).toContain('</ul>');
    });

    it('renders ordered HtmlList from generator', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('HtmlList.php'),
        class: 'App\\Components\\HtmlList',
        callable: 'render',
        args: { items: ['First', 'Second'], ordered: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('<ol');
      expect(result.html).toContain('First');
      expect(result.html).toContain('Second');
      expect(result.html).toContain('</ol>');
    });
  });

  // -------------------------------------------------------------------------
  // UC22: Template with loops and conditionals
  // -------------------------------------------------------------------------
  describe('UC22: Template with loops', () => {
    it('renders list template with items', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/list.php'),
        class: null,
        callable: null,
        args: { title: 'Shopping', items: ['Milk', 'Eggs'] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Shopping');
      expect(result.html).toContain('Milk');
      expect(result.html).toContain('Eggs');
      expect(result.html).toContain('<ul');
    });

    it('renders numbered list template', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/list.php'),
        class: null,
        callable: null,
        args: { title: 'Steps', items: ['Install', 'Configure'], numbered: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('<ol');
      expect(result.html).toContain('Install');
    });

    it('renders empty list template', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/list.php'),
        class: null,
        callable: null,
        args: { title: 'Empty' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('No items to display');
    });
  });

  // -------------------------------------------------------------------------
  // UC23: Unit enum (non-backed)
  // -------------------------------------------------------------------------
  describe('UC23: Unit enum', () => {
    it('renders Size::button for Small', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('Size.php'),
        class: 'App\\Components\\Size',
        callable: 'button',
        args: { _case: 'Small', text: 'Click me' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('btn-Small');
      expect(result.html).toContain('Click me');
      expect(result.html).toContain('font-size: 12px');
    });

    it('renders Size::button for ExtraLarge with custom color', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('Size.php'),
        class: 'App\\Components\\Size',
        callable: 'button',
        args: { _case: 'ExtraLarge', text: 'Big Button', color: '#ef4444' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('btn-ExtraLarge');
      expect(result.html).toContain('Big Button');
      expect(result.html).toContain('#ef4444');
      expect(result.html).toContain('font-size: 18px');
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

    it('UC19: Breadcrumb@render generates classMethod with variadic param', () => {
      const id = resolveId('./Breadcrumb.php@render', example('Breadcrumb.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('separator:');
      expect(code).toContain('segments:');
    });

    it('UC20: Progress@render generates classMethod with union type param', () => {
      const id = resolveId('./Progress.php@render', example('Progress.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('value:');
      expect(code).toContain('max:');
      expect(code).toContain('label:');
    });

    it('UC21: HtmlList@render generates classMethod', () => {
      const id = resolveId('./HtmlList.php@render', example('HtmlList.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('items:');
      expect(code).toContain('ordered:');
    });

    it('UC23: Size@button generates enumMethod for unit enum', () => {
      const id = resolveId('./Size.php@button', example('Size.php'));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain('_case:');
      expect(code).toContain('text:');
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

    it('parses Breadcrumb with variadic method param', () => {
      const meta = parsePhpFile(example('Breadcrumb.php'));
      const cls = meta.classes.find(c => c.name === 'Breadcrumb');
      expect(cls).toBeDefined();
      const render = cls!.methods.find(m => m.name === 'render');
      expect(render).toBeDefined();
      const segments = render!.params.find(p => p.name === 'segments');
      expect(segments).toBeDefined();
      expect(segments!.isVariadic).toBe(true);
      expect(segments!.type).toBe('string');
    });

    it('parses Progress with union type constructor param', () => {
      const meta = parsePhpFile(example('Progress.php'));
      const cls = meta.classes.find(c => c.name === 'Progress');
      expect(cls).toBeDefined();
      const value = cls!.constructorParams.find(p => p.name === 'value');
      expect(value).toBeDefined();
      expect(value!.type).toBe('int|string');
    });

    it('parses HtmlList with Generator return type', () => {
      const meta = parsePhpFile(example('HtmlList.php'));
      const cls = meta.classes.find(c => c.name === 'HtmlList');
      expect(cls).toBeDefined();
      const render = cls!.methods.find(m => m.name === 'render');
      expect(render).toBeDefined();
      expect(render!.returnType).toContain('Generator');
    });

    it('parses Size as unit enum without backing type', () => {
      const meta = parsePhpFile(example('Size.php'));
      const size = meta.classes.find(c => c.name === 'Size');
      expect(size).toBeDefined();
      expect(size!.isEnum).toBe(true);
      expect(size!.enumBackingType).toBeNull();
      expect(size!.enumCases).toContain('Small');
      expect(size!.enumCases).toContain('Medium');
      expect(size!.enumCases).toContain('Large');
      expect(size!.enumCases).toContain('ExtraLarge');
      const button = size!.methods.find(m => m.name === 'button');
      expect(button).toBeDefined();
      expect(button!.params).toHaveLength(2);
    });

    it('parses Accordion with trait usage', () => {
      const meta = parsePhpFile(example('Accordion.php'));
      const accordion = meta.classes.find(c => c.name === 'Accordion');
      expect(accordion).toBeDefined();
      expect(accordion!.traits).toContain('HasToggle');
      expect(accordion!.constructorParams).toHaveLength(1);
      expect(accordion!.constructorParams[0]!.name).toBe('label');
      // Trait itself is parsed
      const hasToggle = meta.classes.find(c => c.name === 'HasToggle');
      expect(hasToggle).toBeDefined();
      expect(hasToggle!.methods).toHaveLength(1);
      expect(hasToggle!.methods[0]!.name).toBe('toggle');
    });

    it('parses Direction enum with implements', () => {
      const meta = parsePhpFile(example('Direction.php'));
      const dir = meta.classes.find(c => c.name === 'Direction');
      expect(dir).toBeDefined();
      expect(dir!.isEnum).toBe(true);
      expect(dir!.implements).toContain('Renderable');
      expect(dir!.enumCases).toContain('Up');
      expect(dir!.enumCases).toContain('Down');
      expect(dir!.enumCases).toContain('Left');
      expect(dir!.enumCases).toContain('Right');
    });

    it('parses Sections file with two classes', () => {
      const meta = parsePhpFile(example('Sections.php'));
      expect(meta.classes).toHaveLength(2);
      const header = meta.classes.find(c => c.name === 'SectionHeader');
      expect(header).toBeDefined();
      expect(header!.constructorParams).toHaveLength(2);
      const footer = meta.classes.find(c => c.name === 'SectionFooter');
      expect(footer).toBeDefined();
      expect(footer!.constructorParams).toHaveLength(2);
    });

    it('parses Tooltip with Stringable return type', () => {
      const meta = parsePhpFile(example('Tooltip.php'));
      const tooltip = meta.classes.find(c => c.name === 'Tooltip');
      expect(tooltip).toBeDefined();
      expect(tooltip!.methods).toHaveLength(1);
      expect(tooltip!.methods[0]!.name).toBe('render');
      expect(tooltip!.methods[0]!.returnType).toBe('HtmlFragment');
    });
  });

  // -------------------------------------------------------------------------
  // UC24: Trait usage (class using trait method)
  // -------------------------------------------------------------------------
  describe('UC24: Trait usage', () => {
    it('renders Accordion using trait toggle method', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Accordion.php'),
        class: 'App\\Components\\Accordion',
        callable: 'toggle',
        args: { label: 'Show Details', content: '<p>Hidden content</p>' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('toggle');
      expect(result.html).toContain('Show Details');
      expect(result.html).toContain('Hidden content');
    });

    it('renders Accordion with open=true', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Accordion.php'),
        class: 'App\\Components\\Accordion',
        callable: 'toggle',
        args: { label: 'FAQ', content: '<p>Answer</p>', open: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('open');
      expect(result.html).toContain('FAQ');
      expect(result.html).toContain('Answer');
    });
  });

  // -------------------------------------------------------------------------
  // UC25: Multiple classes in one file (both exported)
  // -------------------------------------------------------------------------
  describe('UC25: Multiple classes in one file', () => {
    it('renders SectionHeader', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Sections.php'),
        class: 'App\\Components\\SectionHeader',
        callable: 'render',
        args: { title: 'Welcome' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('section-header');
      expect(result.html).toContain('Welcome');
      expect(result.html).toContain('<h1');
    });

    it('renders SectionHeader with h2 level', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Sections.php'),
        class: 'App\\Components\\SectionHeader',
        callable: 'render',
        args: { title: 'Sub Title', level: 'h2' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('<h2');
      expect(result.html).toContain('Sub Title');
    });

    it('renders SectionFooter', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Sections.php'),
        class: 'App\\Components\\SectionFooter',
        callable: 'render',
        args: { copyright: 'My Company' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('section-footer');
      expect(result.html).toContain('My Company');
      expect(result.html).toContain('2025');
    });

    it('renders SectionFooter with custom year', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Sections.php'),
        class: 'App\\Components\\SectionFooter',
        callable: 'render',
        args: { copyright: 'Acme Inc.', year: 2024 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('2024');
      expect(result.html).toContain('Acme Inc.');
    });
  });

  // -------------------------------------------------------------------------
  // UC26: __toString / Stringable return
  // -------------------------------------------------------------------------
  describe('UC26: Stringable return', () => {
    it('renders Tooltip with __toString conversion', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Tooltip.php'),
        class: 'App\\Components\\Tooltip',
        callable: 'render',
        args: { text: 'Helpful tip' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('tooltip');
      expect(result.html).toContain('Helpful tip');
      expect(result.html).toContain('tooltip-top');
    });

    it('renders Tooltip with bottom position', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Tooltip.php'),
        class: 'App\\Components\\Tooltip',
        callable: 'render',
        args: { text: 'More info', position: 'bottom' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('tooltip-bottom');
      expect(result.html).toContain('More info');
    });
  });

  // -------------------------------------------------------------------------
  // UC27: Enum implementing interface
  // -------------------------------------------------------------------------
  describe('UC27: Enum implementing interface', () => {
    it('renders Direction::render for Up', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('Direction.php'),
        class: 'App\\Components\\Direction',
        callable: 'render',
        args: { _case: 'up' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('direction-up');
      expect(result.html).toContain('Up');
    });

    it('renders Direction::render for Left', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('Direction.php'),
        class: 'App\\Components\\Direction',
        callable: 'render',
        args: { _case: 'left' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('direction-left');
      expect(result.html).toContain('Left');
    });
  });

  // -------------------------------------------------------------------------
  // UC28: Form template (complex nested data)
  // -------------------------------------------------------------------------
  describe('UC28: Form template', () => {
    it('renders contact form with fields', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/form.php'),
        class: null,
        callable: null,
        args: {
          action: '/contact',
          method: 'POST',
          submitLabel: 'Send Message',
          fields: [
            { label: 'Name', name: 'name', type: 'text', placeholder: 'Your name' },
            { label: 'Email', name: 'email', type: 'email', placeholder: 'you@example.com' },
          ],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('<form');
      expect(result.html).toContain('/contact');
      expect(result.html).toContain('Send Message');
      expect(result.html).toContain('Name');
      expect(result.html).toContain('Email');
    });

    it('renders form with textarea field', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/form.php'),
        class: null,
        callable: null,
        args: {
          action: '/feedback',
          fields: [
            { label: 'Message', name: 'message', type: 'textarea', placeholder: 'Your message...' },
          ],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('<textarea');
      expect(result.html).toContain('Message');
    });
  });

  // -------------------------------------------------------------------------
  // Vite plugin: virtual module generation for new patterns
  // -------------------------------------------------------------------------
  describe('Vite plugin: new pattern virtual modules', () => {
    const plugin = storybookPhpPlugin();
    const resolveId = (plugin as any).resolveId.bind(plugin);
    const load = (plugin as any).load.bind(plugin);

    it('UC24: Accordion@toggle generates classMethod via trait', () => {
      const id = resolveId('./Accordion.php@toggle', example('Accordion.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("__callable: \"toggle\"");
      expect(code).toContain('label:');    // ctor arg
      expect(code).toContain('content:');  // trait method arg
      expect(code).toContain('open:');     // trait method arg
    });

    it('UC25: Sections.php@render generates both SectionHeader and SectionFooter', () => {
      const id = resolveId('./Sections.php@render', example('Sections.php'));
      const code = load(id);
      expect(code).toContain('SectionHeader');
      expect(code).toContain('SectionFooter');
      expect(code).toContain("__type: 'classMethod'");
    });

    it('UC26: Tooltip@render generates classMethod', () => {
      const id = resolveId('./Tooltip.php@render', example('Tooltip.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('Tooltip');
      expect(code).toContain('text:');      // ctor arg
      expect(code).toContain('position:');  // method arg
    });

    it('UC27: Direction@render generates enumMethod', () => {
      const id = resolveId('./Direction.php@render', example('Direction.php'));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain('_case:');
    });
  });

  // -------------------------------------------------------------------------
  // UC29: Final class (Avatar)
  // -------------------------------------------------------------------------
  describe('UC29: Final class', () => {
    it('renders Avatar with initials', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Avatar.php'),
        class: 'App\\Components\\Avatar',
        callable: 'render',
        args: { name: 'John Doe' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('avatar');
      expect(result.html).toContain('JD');
    });

    it('renders Avatar with image URL', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Avatar.php'),
        class: 'App\\Components\\Avatar',
        callable: 'render',
        args: { name: 'Jane', imageUrl: 'https://example.com/avatar.png', size: 64 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('img');
      expect(result.html).toContain('https://example.com/avatar.png');
    });

    it('renders Avatar with custom size', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Avatar.php'),
        class: 'App\\Components\\Avatar',
        callable: 'render',
        args: { name: 'AB', size: 32 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('32px');
    });

    it('parser detects final class', () => {
      const meta = parsePhpFile(example('Avatar.php'));
      expect(meta.classes).toHaveLength(1);
      expect(meta.classes[0]!.isFinal).toBe(true);
      expect(meta.classes[0]!.name).toBe('Avatar');
    });
  });

  // -------------------------------------------------------------------------
  // UC30: Abstract class with concrete subclasses (Chip)
  // -------------------------------------------------------------------------
  describe('UC30: Abstract class with concrete subclasses', () => {
    it('renders InfoChip via inherited render()', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Chip.php'),
        class: 'App\\Components\\InfoChip',
        callable: 'render',
        args: { label: 'Info Tag' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('chip-info');
      expect(result.html).toContain('Info Tag');
    });

    it('renders SuccessChip with removable', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Chip.php'),
        class: 'App\\Components\\SuccessChip',
        callable: 'render',
        args: { label: 'Approved', removable: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('chip-success');
      expect(result.html).toContain('Approved');
      expect(result.html).toContain('&times;');
    });

    it('renders DangerChip', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Chip.php'),
        class: 'App\\Components\\DangerChip',
        callable: 'render',
        args: { label: 'Error' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('chip-danger');
    });

    it('parser detects abstract class and subclasses', () => {
      const meta = parsePhpFile(example('Chip.php'));
      const base = meta.classes.find((c) => c.name === 'BaseChip')!;
      expect(base.isAbstract).toBe(true);

      const info = meta.classes.find((c) => c.name === 'InfoChip')!;
      expect(info.extends).toBe('BaseChip');

      const danger = meta.classes.find((c) => c.name === 'DangerChip')!;
      expect(danger.extends).toBe('BaseChip');
    });
  });

  // -------------------------------------------------------------------------
  // UC31: Int-backed enum (Priority)
  // -------------------------------------------------------------------------
  describe('UC31: Int-backed enum', () => {
    it('renders Priority badge with int value', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('Priority.php'),
        class: 'App\\Components\\Priority',
        callable: 'badge',
        args: { _case: 3 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('priority-High');
      expect(result.html).toContain('High');
    });

    it('renders Priority Low', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('Priority.php'),
        class: 'App\\Components\\Priority',
        callable: 'badge',
        args: { _case: 1 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('priority-Low');
    });

    it('renders Priority icon method', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('Priority.php'),
        class: 'App\\Components\\Priority',
        callable: 'icon',
        args: { _case: 4 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Critical');
    });

    it('parser detects int-backed enum', () => {
      const meta = parsePhpFile(example('Priority.php'));
      const cls = meta.classes[0]!;
      expect(cls.isEnum).toBe(true);
      expect(cls.enumBackingType).toBe('int');
      expect(cls.enumCases).toEqual(['Low', 'Medium', 'High', 'Critical']);
      expect(cls.methods).toHaveLength(2);
    });
  });

  // -------------------------------------------------------------------------
  // UC32: Static factory methods (Button)
  // -------------------------------------------------------------------------
  describe('UC32: Static factory methods', () => {
    it('renders Button.primary() static factory', async () => {
      const result = await executor.execute({
        type: 'staticMethod',
        file: example('Button.php'),
        class: 'App\\Components\\Button',
        callable: 'primary',
        args: { label: 'Click Me' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('btn-primary');
      expect(result.html).toContain('Click Me');
    });

    it('renders Button.secondary() static factory', async () => {
      const result = await executor.execute({
        type: 'staticMethod',
        file: example('Button.php'),
        class: 'App\\Components\\Button',
        callable: 'secondary',
        args: { label: 'Cancel' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('btn-secondary');
      expect(result.html).toContain('Cancel');
    });

    it('renders Button.primary() with disabled', async () => {
      const result = await executor.execute({
        type: 'staticMethod',
        file: example('Button.php'),
        class: 'App\\Components\\Button',
        callable: 'primary',
        args: { label: 'Disabled', disabled: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('disabled');
    });

    it('renders Button instance render()', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Button.php'),
        class: 'App\\Components\\Button',
        callable: 'render',
        args: { label: 'Outline', variant: 'outline' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('btn-outline');
    });
  });

  // -------------------------------------------------------------------------
  // UC33: Interface + implementing class (Stepper)
  // -------------------------------------------------------------------------
  describe('UC33: Interface implementing class', () => {
    it('renders Stepper with steps', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Stepper.php'),
        class: 'App\\Components\\Stepper',
        callable: 'render',
        args: { current: 2, steps: ['Cart', 'Shipping', 'Payment'] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('stepper');
      expect(result.html).toContain('Cart');
      expect(result.html).toContain('Shipping');
      expect(result.html).toContain('Payment');
      expect(result.html).toContain('step-active');
      expect(result.html).toContain('step-inactive');
    });

    it('renders Stepper empty state', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Stepper.php'),
        class: 'App\\Components\\Stepper',
        callable: 'render',
        args: { steps: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('stepper-empty');
    });

    it('parser detects implements', () => {
      const meta = parsePhpFile(example('Stepper.php'));
      const stepper = meta.classes.find((c) => c.name === 'Stepper')!;
      expect(stepper.implements).toContain('StepRenderer');
    });
  });

  // -------------------------------------------------------------------------
  // UC34: Rating with static + instance methods
  // -------------------------------------------------------------------------
  describe('UC34: Rating component', () => {
    it('renders Rating stars', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Rating.php'),
        class: 'App\\Components\\Rating',
        callable: 'render',
        args: { value: 3, max: 5 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('rating');
      expect(result.html).toContain('(3/5)');
    });

    it('renders Rating::fromPercent()', async () => {
      const result = await executor.execute({
        type: 'staticMethod',
        file: example('Rating.php'),
        class: 'App\\Components\\Rating',
        callable: 'fromPercent',
        args: { percent: 80 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('rating');
      expect(result.html).toContain('(4/5)');
    });
  });

  // -------------------------------------------------------------------------
  // UC35: Table template with complex array data
  // -------------------------------------------------------------------------
  describe('UC35: Table template', () => {
    it('renders table with headers and rows', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/table.php'),
        class: null,
        callable: null,
        args: {
          caption: 'Users',
          headers: ['Name', 'Email'],
          rows: [['Alice', 'alice@test.com'], ['Bob', 'bob@test.com']],
          striped: false,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Users');
      expect(result.html).toContain('Alice');
      expect(result.html).toContain('bob@test.com');
      expect(result.html).toContain('<th');
      expect(result.html).toContain('<td');
    });

    it('renders striped table', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/table.php'),
        class: null,
        callable: null,
        args: {
          caption: 'Items',
          headers: ['ID', 'Name'],
          rows: [[1, 'A'], [2, 'B'], [3, 'C']],
          striped: true,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Items');
      expect(result.html).toContain('#f9fafb');
    });

    it('renders empty table', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/table.php'),
        class: null,
        callable: null,
        args: {
          headers: ['Col'],
          rows: [],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('<table');
      expect(result.html).toContain('Col');
    });
  });

  // -------------------------------------------------------------------------
  // Vite plugin: new example virtual modules
  // -------------------------------------------------------------------------
  describe('Vite plugin: expanded example virtual modules', () => {
    const plugin = storybookPhpPlugin();
    const resolveId = (plugin as any).resolveId.bind(plugin);
    const load = (plugin as any).load.bind(plugin);

    it('UC29: Avatar@render generates classMethod for final class', () => {
      const id = resolveId('./Avatar.php@render', example('Avatar.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('Avatar');
      expect(code).toContain('name:');
      expect(code).toContain('size:');
      expect(code).toContain('imageUrl:');
    });

    it('UC30: Chip@render generates classMethod for all concrete subclasses', () => {
      const id = resolveId('./Chip.php@render', example('Chip.php'));
      const code = load(id);
      // Should export InfoChip, SuccessChip, DangerChip (all inherit render from BaseChip)
      expect(code).toContain('InfoChip');
      expect(code).toContain('SuccessChip');
      expect(code).toContain('DangerChip');
      expect(code).toContain("__type: 'classMethod'");
    });

    it('UC31: Priority@badge generates enumMethod for int-backed enum', () => {
      const id = resolveId('./Priority.php@badge', example('Priority.php'));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain('Priority');
      expect(code).toContain('_case:');
    });

    it('UC32: Button@primary generates staticMethod', () => {
      const id = resolveId('./Button.php@primary', example('Button.php'));
      const code = load(id);
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain('label:');
      expect(code).toContain('disabled:');
    });

    it('UC32: Button@render generates classMethod', () => {
      const id = resolveId('./Button.php@render', example('Button.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('label:');
      expect(code).toContain('variant:');
    });

    it('UC33: Stepper@render generates classMethod for interface implementor', () => {
      const id = resolveId('./Stepper.php@render', example('Stepper.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('Stepper');
      expect(code).toContain('current:');
      expect(code).toContain('steps:');
    });

    it('UC34: Rating@fromPercent generates staticMethod', () => {
      const id = resolveId('./Rating.php@fromPercent', example('Rating.php'));
      const code = load(id);
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain('percent:');
    });
  });

  // -------------------------------------------------------------------------
  // UC36: Multi-trait usage (Modal with two traits)
  // -------------------------------------------------------------------------
  describe('UC36: Multi-trait usage', () => {
    it('renders Modal via instance render()', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Modal.php'),
        class: 'App\\Components\\Modal',
        callable: 'render',
        args: { title: 'Confirm', body: 'Are you sure?', size: 'lg' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('modal-lg');
      expect(result.html).toContain('Confirm');
      expect(result.html).toContain('Are you sure?');
    });

    it('renders Modal with default body', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Modal.php'),
        class: 'App\\Components\\Modal',
        callable: 'render',
        args: { title: 'Empty Modal' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('modal-md');
      expect(result.html).toContain('Empty Modal');
    });

    it('calls trait method animate() on Modal', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Modal.php'),
        class: 'App\\Components\\Modal',
        callable: 'animate',
        args: { title: 'Test', content: '<p>Animated</p>', effect: 'slide', duration: 500 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('animation-slide');
      expect(result.html).toContain('500ms');
      expect(result.html).toContain('Animated');
    });

    it('calls trait method overlay() on Modal', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Modal.php'),
        class: 'App\\Components\\Modal',
        callable: 'overlay',
        args: { title: 'Test', content: '<div>Overlay content</div>', opacity: '0.8' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('overlay');
      expect(result.html).toContain('0.8');
      expect(result.html).toContain('Overlay content');
    });

    it('parser detects multiple traits', () => {
      const meta = parsePhpFile(example('Modal.php'));
      const modal = meta.classes.find((c) => c.name === 'Modal')!;
      expect(modal.traits).toEqual(['HasAnimation', 'HasOverlay']);
    });
  });

  // -------------------------------------------------------------------------
  // UC37: Class with constants and mixed type (Notification)
  // -------------------------------------------------------------------------
  describe('UC37: Class with constants and mixed type', () => {
    it('renders Notification with defaults', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Notification.php'),
        class: 'App\\Components\\Notification',
        callable: 'render',
        args: { message: 'File saved successfully' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('notification-info');
      expect(result.html).toContain('File saved successfully');
      expect(result.html).toContain('data-timeout="5000"');
    });

    it('renders Notification with explicit type and metadata', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Notification.php'),
        class: 'App\\Components\\Notification',
        callable: 'render',
        args: { message: 'Disk full', type: 'error', metadata: 'disk-usage-95', timeout: 10000 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('notification-error');
      expect(result.html).toContain('Disk full');
      expect(result.html).toContain('data-meta="disk-usage-95"');
      expect(result.html).toContain('data-timeout="10000"');
    });

    it('renders Notification with warning type', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Notification.php'),
        class: 'App\\Components\\Notification',
        callable: 'render',
        args: { message: 'Low battery', type: 'warning' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('notification-warning');
    });

    it('parser handles self::CONSTANT defaults', () => {
      const meta = parsePhpFile(example('Notification.php'));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe('Notification');
      const typeParam = cls.constructorParams.find((p) => p.name === 'type')!;
      expect(typeParam.default).toBe('self::TYPE_INFO');
      const metaParam = cls.constructorParams.find((p) => p.name === 'metadata')!;
      expect(metaParam.type).toBe('mixed');
    });
  });

  // -------------------------------------------------------------------------
  // UC38: Static + instance methods (Pagination)
  // -------------------------------------------------------------------------
  describe('UC38: Pagination with static and instance methods', () => {
    it('renders paginated list via instance render()', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Pagination.php'),
        class: 'App\\Components\\Pagination',
        callable: 'render',
        args: { total: 50, perPage: 10, current: 3 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('pagination');
      expect(result.html).toContain('Page 3 of 5');
      expect(result.html).toContain('page-active');
    });

    it('renders first page with defaults', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Pagination.php'),
        class: 'App\\Components\\Pagination',
        callable: 'render',
        args: { total: 25 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Page 1 of 3');
    });

    it('renders simple static pagination', async () => {
      const result = await executor.execute({
        type: 'staticMethod',
        file: example('Pagination.php'),
        class: 'App\\Components\\Pagination',
        callable: 'simple',
        args: { total: 100, current: 5 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('pagination-simple');
      expect(result.html).toContain('page-prev');
      expect(result.html).toContain('page-next');
    });

    it('renders simple pagination first page (no prev)', async () => {
      const result = await executor.execute({
        type: 'staticMethod',
        file: example('Pagination.php'),
        class: 'App\\Components\\Pagination',
        callable: 'simple',
        args: { total: 30, current: 1 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('pagination-simple');
      expect(result.html).not.toContain('page-prev');
      expect(result.html).toContain('page-next');
    });
  });

  // -------------------------------------------------------------------------
  // UC39: TagCloud (array of objects/strings, method params)
  // -------------------------------------------------------------------------
  describe('UC39: TagCloud component', () => {
    it('renders simple string tags', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('TagCloud.php'),
        class: 'App\\Components\\TagCloud',
        callable: 'render',
        args: { tags: ['PHP', 'TypeScript', 'Storybook'] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('tag-cloud');
      expect(result.html).toContain('PHP');
      expect(result.html).toContain('TypeScript');
      expect(result.html).toContain('Storybook');
      expect(result.html).toContain('tag-weight-1');
    });

    it('renders weighted tags', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('TagCloud.php'),
        class: 'App\\Components\\TagCloud',
        callable: 'render',
        args: {
          tags: [
            { label: 'Popular', weight: 5 },
            { label: 'New', weight: 2 },
          ],
          baseSize: '12',
          maxWeight: 5,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('tag-weight-5');
      expect(result.html).toContain('tag-weight-2');
      expect(result.html).toContain('Popular');
      expect(result.html).toContain('New');
    });

    it('renders empty tag cloud', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('TagCloud.php'),
        class: 'App\\Components\\TagCloud',
        callable: 'render',
        args: { tags: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('tag-cloud-empty');
    });
  });

  // -------------------------------------------------------------------------
  // UC40: Dashboard template (nested data, conditionals)
  // -------------------------------------------------------------------------
  describe('UC40: Dashboard template', () => {
    it('renders dashboard with stats', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/dashboard.php'),
        class: null,
        callable: null,
        args: {
          title: 'Analytics',
          stats: [
            { label: 'Users', value: '1,234', change: 12 },
            { label: 'Revenue', value: '$56K', change: -3 },
          ],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('dashboard');
      expect(result.html).toContain('Analytics');
      expect(result.html).toContain('Users');
      expect(result.html).toContain('1,234');
      expect(result.html).toContain('+12%');
      expect(result.html).toContain('positive');
      expect(result.html).toContain('-3%');
      expect(result.html).toContain('negative');
    });

    it('renders empty dashboard', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/dashboard.php'),
        class: null,
        callable: null,
        args: { title: 'Empty Dashboard' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Empty Dashboard');
      expect(result.html).toContain('dashboard-empty');
    });

    it('renders dashboard with chart', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/dashboard.php'),
        class: null,
        callable: null,
        args: {
          title: 'Chart View',
          stats: [{ label: 'Visits', value: '500' }],
          showChart: true,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('dashboard-chart');
      expect(result.html).toContain('Chart placeholder');
      expect(result.html).toContain('Visits');
    });

    it('renders dashboard with default title', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/dashboard.php'),
        class: null,
        callable: null,
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Dashboard');
      expect(result.html).toContain('dashboard-empty');
    });
  });

  // -------------------------------------------------------------------------
  // Vite plugin: new pattern virtual modules (UC36-UC40)
  // -------------------------------------------------------------------------
  describe('Vite plugin: UC36-UC40 virtual modules', () => {
    const plugin = storybookPhpPlugin();
    const resolveId = (plugin as any).resolveId.bind(plugin);
    const load = (plugin as any).load.bind(plugin);

    it('UC36: Modal@render generates classMethod', () => {
      const id = resolveId('./Modal.php@render', example('Modal.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('Modal');
      expect(code).toContain('title:');
      expect(code).toContain('body:');
      expect(code).toContain('size:');
    });

    it('UC36: Modal@animate generates classMethod via trait', () => {
      const id = resolveId('./Modal.php@animate', example('Modal.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('Modal');
      expect(code).toContain('content:');
      expect(code).toContain('effect:');
      expect(code).toContain('duration:');
    });

    it('UC36: Modal@overlay generates classMethod via second trait', () => {
      const id = resolveId('./Modal.php@overlay', example('Modal.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('Modal');
      expect(code).toContain('content:');
      expect(code).toContain('opacity:');
    });

    it('UC37: Notification@render generates classMethod', () => {
      const id = resolveId('./Notification.php@render', example('Notification.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('message:');
      expect(code).toContain('type:');
      expect(code).toContain('metadata:');
      expect(code).toContain('timeout:');
    });

    it('UC38: Pagination@render generates classMethod', () => {
      const id = resolveId('./Pagination.php@render', example('Pagination.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('total:');
      expect(code).toContain('perPage:');
      expect(code).toContain('current:');
    });

    it('UC38: Pagination@simple generates staticMethod', () => {
      const id = resolveId('./Pagination.php@simple', example('Pagination.php'));
      const code = load(id);
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain('total:');
      expect(code).toContain('current:');
    });

    it('UC39: TagCloud@render generates classMethod', () => {
      const id = resolveId('./TagCloud.php@render', example('TagCloud.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('tags:');
      expect(code).toContain('baseSize:');
      expect(code).toContain('maxWeight:');
      expect(code).toContain('unit:');
    });
  });

  // -------------------------------------------------------------------------
  // Parser: metadata extraction for new patterns
  // -------------------------------------------------------------------------
  describe('Parser: new pattern metadata', () => {
    it('parses Modal with multiple traits', () => {
      const meta = parsePhpFile(example('Modal.php'));
      const modal = meta.classes.find((c) => c.name === 'Modal')!;
      expect(modal).toBeDefined();
      expect(modal.traits).toEqual(['HasAnimation', 'HasOverlay']);
      // Two traits also parsed
      const anim = meta.classes.find((c) => c.name === 'HasAnimation')!;
      expect(anim.methods[0]!.name).toBe('animate');
      const overlay = meta.classes.find((c) => c.name === 'HasOverlay')!;
      expect(overlay.methods[0]!.name).toBe('overlay');
    });

    it('parses Notification with constant defaults and mixed type', () => {
      const meta = parsePhpFile(example('Notification.php'));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe('Notification');
      expect(cls.constructorParams).toHaveLength(4);
      expect(cls.constructorParams[1]!.default).toBe('self::TYPE_INFO');
      expect(cls.constructorParams[2]!.type).toBe('mixed');
    });

    it('parses Pagination with static and instance methods', () => {
      const meta = parsePhpFile(example('Pagination.php'));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe('Pagination');
      expect(cls.constructorParams).toHaveLength(3);
      const simple = cls.methods.find((m) => m.name === 'simple')!;
      expect(simple.isStatic).toBe(true);
      expect(simple.params[0]!.name).toBe('total');
      const render = cls.methods.find((m) => m.name === 'render')!;
      expect(render.isStatic).toBe(false);
    });

    it('parses TagCloud with array constructor and method params', () => {
      const meta = parsePhpFile(example('TagCloud.php'));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe('TagCloud');
      expect(cls.constructorParams).toHaveLength(2);
      expect(cls.constructorParams[0]!.name).toBe('tags');
      expect(cls.constructorParams[0]!.type).toBe('array');
      const render = cls.methods.find((m) => m.name === 'render')!;
      expect(render.params).toHaveLength(2);
      expect(render.params[0]!.name).toBe('maxWeight');
      expect(render.params[0]!.type).toBe('int');
      expect(render.params[1]!.name).toBe('unit');
    });
  });

  // -------------------------------------------------------------------------
  // UC41: Readonly properties without visibility (ValueCard)
  // -------------------------------------------------------------------------
  describe('UC41: Readonly properties without visibility', () => {
    it('renders ValueCard with label and value', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('ValueCard.php'),
        class: 'App\\Components\\ValueCard',
        callable: 'render',
        args: { label: 'Temperature', value: '23.5', unit: '°C' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('value-card');
      expect(result.html).toContain('Temperature');
      expect(result.html).toContain('23.5');
      expect(result.html).toContain('°C');
    });

    it('renders ValueCard with up trend', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('ValueCard.php'),
        class: 'App\\Components\\ValueCard',
        callable: 'render',
        args: { label: 'Revenue', value: '$12,345', trend: '+12%' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('trend-up');
      expect(result.html).toContain('+12%');
    });

    it('renders ValueCard with down trend', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('ValueCard.php'),
        class: 'App\\Components\\ValueCard',
        callable: 'render',
        args: { label: 'Errors', value: '42', trend: '-8%' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('trend-down');
      expect(result.html).toContain('-8%');
    });

    it('parser detects readonly without visibility as promoted', () => {
      const meta = parsePhpFile(example('ValueCard.php'));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe('ValueCard');
      expect(cls.constructorParams).toHaveLength(4);
      const label = cls.constructorParams.find((p) => p.name === 'label')!;
      expect(label.isPromoted).toBe(true);
      expect(label.type).toBe('string');
      const trend = cls.constructorParams.find((p) => p.name === 'trend')!;
      expect(trend.nullable).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // UC42: Iterable/mixed type params (DataRenderer)
  // -------------------------------------------------------------------------
  describe('UC42: Iterable and mixed type params', () => {
    it('renders DataRenderer with string items', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('DataRenderer.php'),
        class: 'App\\Components\\DataRenderer',
        callable: 'render',
        args: { items: ['Alpha', 'Bravo', 'Charlie'] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('data-renderer');
      expect(result.html).toContain('Alpha');
      expect(result.html).toContain('Bravo');
      expect(result.html).toContain('Charlie');
    });

    it('renders with uppercase transform', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('DataRenderer.php'),
        class: 'App\\Components\\DataRenderer',
        callable: 'render',
        args: { items: ['hello', 'world'], transform: 'upper' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('HELLO');
      expect(result.html).toContain('WORLD');
    });

    it('renders empty state', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('DataRenderer.php'),
        class: 'App\\Components\\DataRenderer',
        callable: 'render',
        args: { items: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('data-empty');
    });

    it('renders with custom wrapper', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('DataRenderer.php'),
        class: 'App\\Components\\DataRenderer',
        callable: 'render',
        args: { items: ['Item'], wrapper: 'section' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('<section');
      expect(result.html).toContain('</section>');
    });

    it('parser detects iterable and mixed types', () => {
      const meta = parsePhpFile(example('DataRenderer.php'));
      const cls = meta.classes[0]!;
      const items = cls.constructorParams.find((p) => p.name === 'items')!;
      expect(items.type).toBe('iterable');
      const render = cls.methods.find((m) => m.name === 'render')!;
      const transform = render.params.find((p) => p.name === 'transform')!;
      expect(transform.type).toBe('mixed');
    });
  });

  // -------------------------------------------------------------------------
  // UC43: Enum with match expression and multiple methods (Visibility)
  // -------------------------------------------------------------------------
  describe('UC43: Enum with match expression', () => {
    it('renders Visibility::badge for public', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('Visibility.php'),
        class: 'App\\Components\\Visibility',
        callable: 'badge',
        args: { _case: 'public' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('visibility-badge');
      expect(result.html).toContain('visibility-public');
      expect(result.html).toContain('#22c55e');
    });

    it('renders Visibility::badge for private', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('Visibility.php'),
        class: 'App\\Components\\Visibility',
        callable: 'badge',
        args: { _case: 'private' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('visibility-private');
      expect(result.html).toContain('#ef4444');
    });

    it('renders Visibility::description', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('Visibility.php'),
        class: 'App\\Components\\Visibility',
        callable: 'description',
        args: { _case: 'unlisted' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('visibility-desc');
      expect(result.html).toContain('Accessible via direct link');
    });

    it('parser detects Visibility enum with all cases and methods', () => {
      const meta = parsePhpFile(example('Visibility.php'));
      const vis = meta.classes.find((c) => c.name === 'Visibility')!;
      expect(vis.isEnum).toBe(true);
      expect(vis.enumBackingType).toBe('string');
      expect(vis.enumCases).toEqual(['Public', 'Private', 'Unlisted', 'Draft']);
      expect(vis.methods).toHaveLength(2);
      expect(vis.methods.map((m) => m.name).sort()).toEqual(['badge', 'description']);
    });
  });

  // -------------------------------------------------------------------------
  // UC44: Array return with 'html' key (Timeline)
  // -------------------------------------------------------------------------
  describe('UC44: Array return with html key', () => {
    it('renders Timeline with events', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Timeline.php'),
        class: 'App\\Components\\Timeline',
        callable: 'render',
        args: {
          events: [
            { date: '2024-01', title: 'Start', description: 'Project started' },
            { date: '2024-06', title: 'Launch', description: 'Public launch' },
          ],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('timeline');
      expect(result.html).toContain('timeline-left');
      expect(result.html).toContain('timeline-right');
      expect(result.html).toContain('Start');
      expect(result.html).toContain('Launch');
      expect(result.html).toContain('2024-01');
    });

    it('renders empty Timeline', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Timeline.php'),
        class: 'App\\Components\\Timeline',
        callable: 'render',
        args: { events: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('timeline-empty');
    });

    it('renders reversed Timeline', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Timeline.php'),
        class: 'App\\Components\\Timeline',
        callable: 'render',
        args: {
          events: [
            { title: 'First' },
            { title: 'Second' },
          ],
          reversed: true,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('timeline');
      expect(result.html).toContain('Second');
      expect(result.html).toContain('First');
    });
  });

  // -------------------------------------------------------------------------
  // UC45: Echo/void return (EchoLayout)
  // -------------------------------------------------------------------------
  describe('UC45: Echo-based void return', () => {
    it('renders EchoLayout with light theme', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('EchoLayout.php'),
        class: 'App\\Components\\EchoLayout',
        callable: 'render',
        args: { title: 'My App' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('echo-layout');
      expect(result.html).toContain('echo-layout-light');
      expect(result.html).toContain('My App');
    });

    it('renders EchoLayout with dark theme and footer', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('EchoLayout.php'),
        class: 'App\\Components\\EchoLayout',
        callable: 'render',
        args: { title: 'Dark Mode', theme: 'dark', footer: '© 2025' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('echo-layout-dark');
      expect(result.html).toContain('echo-layout-footer');
      expect(result.html).toContain('© 2025');
    });

    it('renders EchoLayout without footer', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('EchoLayout.php'),
        class: 'App\\Components\\EchoLayout',
        callable: 'render',
        args: { title: 'No Footer' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).not.toContain('echo-layout-footer');
    });
  });

  // -------------------------------------------------------------------------
  // Vite plugin: virtual module generation for new examples
  // -------------------------------------------------------------------------
  describe('Vite plugin: UC41-UC45 virtual modules', () => {
    const plugin = storybookPhpPlugin();
    const resolveId = (plugin as any).resolveId.bind(plugin);
    const load = (plugin as any).load.bind(plugin);

    it('UC41: ValueCard@render generates classMethod with readonly params', () => {
      const id = resolveId('./ValueCard.php@render', example('ValueCard.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('ValueCard');
      expect(code).toContain('label:');
      expect(code).toContain('value:');
      expect(code).toContain('unit:');
      expect(code).toContain('trend:');
    });

    it('UC42: DataRenderer@render generates classMethod with iterable/mixed', () => {
      const id = resolveId('./DataRenderer.php@render', example('DataRenderer.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('items:');
      expect(code).toContain('wrapper:');
      expect(code).toContain('transform:');
    });

    it('UC43: Visibility@badge generates enumMethod', () => {
      const id = resolveId('./Visibility.php@badge', example('Visibility.php'));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain('_case:');
    });

    it('UC43: Visibility@description generates enumMethod', () => {
      const id = resolveId('./Visibility.php@description', example('Visibility.php'));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain('_case:');
    });

    it('UC44: Timeline@render generates classMethod', () => {
      const id = resolveId('./Timeline.php@render', example('Timeline.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('events:');
      expect(code).toContain('reversed:');
    });

    it('UC45: EchoLayout@render generates classMethod', () => {
      const id = resolveId('./EchoLayout.php@render', example('EchoLayout.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('title:');
      expect(code).toContain('theme:');
      expect(code).toContain('footer:');
    });
  });

  // -------------------------------------------------------------------------
  // Parser: metadata extraction for new examples
  // -------------------------------------------------------------------------
  describe('Parser: new example metadata', () => {
    it('parses ValueCard with readonly no-visibility params', () => {
      const meta = parsePhpFile(example('ValueCard.php'));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe('ValueCard');
      expect(cls.constructorParams).toHaveLength(4);
      const label = cls.constructorParams[0]!;
      expect(label.name).toBe('label');
      expect(label.isPromoted).toBe(true);
      expect(label.type).toBe('string');
      const trend = cls.constructorParams[3]!;
      expect(trend.name).toBe('trend');
      expect(trend.nullable).toBe(true);
    });

    it('parses DataRenderer with iterable and mixed types', () => {
      const meta = parsePhpFile(example('DataRenderer.php'));
      const cls = meta.classes[0]!;
      expect(cls.constructorParams[0]!.type).toBe('iterable');
      const render = cls.methods[0]!;
      expect(render.params[0]!.type).toBe('mixed');
    });

    it('parses Visibility enum with multiple methods', () => {
      const meta = parsePhpFile(example('Visibility.php'));
      const vis = meta.classes[0]!;
      expect(vis.isEnum).toBe(true);
      expect(vis.enumBackingType).toBe('string');
      expect(vis.enumCases).toHaveLength(4);
      expect(vis.methods).toHaveLength(2);
    });

    it('parses Timeline with array return type', () => {
      const meta = parsePhpFile(example('Timeline.php'));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe('Timeline');
      const render = cls.methods[0]!;
      expect(render.returnType).toBe('array');
    });

    it('parses EchoLayout with void return type', () => {
      const meta = parsePhpFile(example('EchoLayout.php'));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe('EchoLayout');
      const render = cls.methods[0]!;
      expect(render.returnType).toBe('void');
      expect(cls.constructorParams).toHaveLength(3);
      const footer = cls.constructorParams[2]!;
      expect(footer.nullable).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // UC46: Float parameter + static factory (Temperature)
  // -------------------------------------------------------------------------
  describe('UC46: Float parameter + static factory', () => {
    it('renders Temperature with float value', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Temperature.php'),
        class: 'App\\Components\\Temperature',
        callable: 'render',
        args: { value: 22.5, unit: 'C' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('22.5');
      expect(result.html).toContain('temperature');
    });

    it('renders Temperature below zero with blue color', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Temperature.php'),
        class: 'App\\Components\\Temperature',
        callable: 'render',
        args: { value: -5.0, unit: 'C' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('-5.0');
      expect(result.html).toContain('#3b82f6');
    });

    it('renders Temperature via static fromFahrenheit', async () => {
      const result = await executor.execute({
        type: 'staticMethod',
        file: example('Temperature.php'),
        class: 'App\\Components\\Temperature',
        callable: 'fromFahrenheit',
        args: { degrees: 212 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('100.0');
      expect(result.html).toContain('temperature');
    });

    it('renders Temperature via static fromCelsius', async () => {
      const result = await executor.execute({
        type: 'staticMethod',
        file: example('Temperature.php'),
        class: 'App\\Components\\Temperature',
        callable: 'fromCelsius',
        args: { degrees: 38.0 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('38.0');
      expect(result.html).toContain('#ef4444');
    });
  });

  // -------------------------------------------------------------------------
  // UC47: Multiple render methods from same class (MediaCard)
  // -------------------------------------------------------------------------
  describe('UC47: Multiple render methods', () => {
    it('renders MediaCard full view', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('MediaCard.php'),
        class: 'App\\Components\\MediaCard',
        callable: 'full',
        args: { title: 'Test Article', description: 'Some description', category: 'tech' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('media-card-full');
      expect(result.html).toContain('Test Article');
      expect(result.html).toContain('Some description');
      expect(result.html).toContain('tech');
    });

    it('renders MediaCard compact view', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('MediaCard.php'),
        class: 'App\\Components\\MediaCard',
        callable: 'compact',
        args: { title: 'Quick Update', category: 'news' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('media-card-compact');
      expect(result.html).toContain('Quick Update');
      expect(result.html).toContain('news');
    });

    it('renders MediaCard header view', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('MediaCard.php'),
        class: 'App\\Components\\MediaCard',
        callable: 'header',
        args: { title: 'Featured' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('media-card-header');
      expect(result.html).toContain('Featured');
      expect(result.html).toContain('<h2');
    });
  });

  // -------------------------------------------------------------------------
  // UC48: Template with conditionals (hero)
  // -------------------------------------------------------------------------
  describe('UC48: Template with conditionals', () => {
    it('renders hero template with light theme', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/hero.php'),
        class: null,
        callable: null,
        args: { title: 'Welcome', subtitle: 'Get Started', ctaLabel: 'Learn More', theme: 'light' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('hero-light');
      expect(result.html).toContain('Welcome');
      expect(result.html).toContain('Get Started');
      expect(result.html).toContain('Learn More');
    });

    it('renders hero template with dark theme', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/hero.php'),
        class: null,
        callable: null,
        args: { title: 'Dark Hero', theme: 'dark' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('hero-dark');
      expect(result.html).toContain('#1f2937');
    });

    it('renders hero template with gradient theme', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/hero.php'),
        class: null,
        callable: null,
        args: { title: 'Gradient', theme: 'gradient' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('hero-gradient');
      expect(result.html).toContain('linear-gradient');
    });

    it('renders hero without optional elements', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/hero.php'),
        class: null,
        callable: null,
        args: { title: 'Minimal' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Minimal');
      expect(result.html).not.toContain('hero-cta');
    });
  });

  // -------------------------------------------------------------------------
  // UC49: Stats template with grid and conditionals
  // -------------------------------------------------------------------------
  describe('UC49: Stats template', () => {
    it('renders stats grid with items', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/stats.php'),
        class: null,
        callable: null,
        args: {
          items: [
            { label: 'Users', value: '12,345' },
            { label: 'Revenue', value: '$89K' },
          ],
          columns: 2,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('stats-grid');
      expect(result.html).toContain('12,345');
      expect(result.html).toContain('$89K');
    });

    it('renders colored variant with icons', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/stats.php'),
        class: null,
        callable: null,
        args: {
          items: [{ label: 'Downloads', value: '1M', icon: '📦' }],
          columns: 1,
          variant: 'colored',
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('stats-colored');
      expect(result.html).toContain('stat-icon');
    });

    it('renders empty stats', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/stats.php'),
        class: null,
        callable: null,
        args: { items: [], columns: 3 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('stats-empty');
    });
  });

  // -------------------------------------------------------------------------
  // UC50: Unit enum with multiple methods (HttpMethod)
  // -------------------------------------------------------------------------
  describe('UC50: Unit enum with multiple methods', () => {
    it('renders HttpMethod::badge for GET', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('HttpMethod.php'),
        class: 'App\\Components\\HttpMethod',
        callable: 'badge',
        args: { _case: 'GET' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('http-method-GET');
      expect(result.html).toContain('#22c55e');
      expect(result.html).toContain('GET');
    });

    it('renders HttpMethod::badge for DELETE', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('HttpMethod.php'),
        class: 'App\\Components\\HttpMethod',
        callable: 'badge',
        args: { _case: 'DELETE' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('http-method-DELETE');
      expect(result.html).toContain('#ef4444');
    });

    it('renders HttpMethod::endpoint with path and description', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('HttpMethod.php'),
        class: 'App\\Components\\HttpMethod',
        callable: 'endpoint',
        args: { _case: 'POST', path: '/api/users', description: 'Create user' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('endpoint');
      expect(result.html).toContain('/api/users');
      expect(result.html).toContain('Create user');
      expect(result.html).toContain('POST');
    });

    it('renders HttpMethod::endpoint without description', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('HttpMethod.php'),
        class: 'App\\Components\\HttpMethod',
        callable: 'endpoint',
        args: { _case: 'GET', path: '/api/health' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('/api/health');
      expect(result.html).not.toContain('endpoint-desc');
    });
  });

  // -------------------------------------------------------------------------
  // UC51: Generator return (Tabs)
  // -------------------------------------------------------------------------
  describe('UC51: Generator return with complex iteration', () => {
    it('renders Tabs with active tab', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Tabs.php'),
        class: 'App\\Components\\Tabs',
        callable: 'render',
        args: {
          tabs: [
            { label: 'Overview', content: '<p>Overview</p>' },
            { label: 'Details', content: '<p>Details</p>' },
          ],
          activeIndex: 0,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('tabs-nav');
      expect(result.html).toContain('tab-active');
      expect(result.html).toContain('Overview');
      expect(result.html).toContain('tab-panel');
    });

    it('renders Tabs with second tab active', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Tabs.php'),
        class: 'App\\Components\\Tabs',
        callable: 'render',
        args: {
          tabs: [
            { label: 'Code', content: '<pre>code</pre>' },
            { label: 'Preview', content: '<p>preview</p>' },
          ],
          activeIndex: 1,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Preview');
    });

    it('renders empty Tabs', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Tabs.php'),
        class: 'App\\Components\\Tabs',
        callable: 'render',
        args: { tabs: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('tabs-empty');
    });
  });

  // -------------------------------------------------------------------------
  // UC52: Invocable class with enum param (Divider)
  // -------------------------------------------------------------------------
  describe('UC52: Invocable class with enum param', () => {
    it('renders Divider with solid style', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Divider.php'),
        class: 'App\\Components\\Divider',
        callable: '__invoke',
        args: { style: 'solid' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('divider');
      expect(result.html).toContain('solid');
    });

    it('renders Divider with dashed style and custom color', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Divider.php'),
        class: 'App\\Components\\Divider',
        callable: '__invoke',
        args: { style: 'dashed', color: '#3b82f6' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('dashed');
      expect(result.html).toContain('#3b82f6');
    });

    it('renders Divider with label', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Divider.php'),
        class: 'App\\Components\\Divider',
        callable: '__invoke',
        args: { label: 'OR', style: 'solid' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('divider-labeled');
      expect(result.html).toContain('OR');
    });
  });

  // -------------------------------------------------------------------------
  // UC53: Void return countdown (echo-based with loop)
  // -------------------------------------------------------------------------
  describe('UC53: Void return countdown', () => {
    it('renders Countdown from 10', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Countdown.php'),
        class: 'App\\Components\\Countdown',
        callable: 'render',
        args: { from: 5, finishMessage: 'Go!' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('countdown');
      expect(result.html).toContain('countdown-num');
      expect(result.html).toContain('countdown-finish');
      expect(result.html).toContain('Go!');
    });

    it('renders Countdown without zero', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Countdown.php'),
        class: 'App\\Components\\Countdown',
        callable: 'render',
        args: { from: 3, showZero: false },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('countdown-num');
    });
  });

  // -------------------------------------------------------------------------
  // UC54: Global function with array param (KeyValue)
  // -------------------------------------------------------------------------
  describe('UC54: Global function with array param', () => {
    it('renders key-value list', async () => {
      const result = await executor.execute({
        type: 'function',
        file: example('KeyValue.php'),
        class: null,
        callable: 'keyValueList',
        args: { items: { Name: 'John', Email: 'john@example.com' } },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('kv-list');
      expect(result.html).toContain('John');
      expect(result.html).toContain('john@example.com');
      expect(result.html).toContain('<dl');
    });

    it('renders horizontal key-value list', async () => {
      const result = await executor.execute({
        type: 'function',
        file: example('KeyValue.php'),
        class: null,
        callable: 'keyValueList',
        args: { items: { Status: 'Active' }, horizontal: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('flex');
    });

    it('renders empty key-value list', async () => {
      const result = await executor.execute({
        type: 'function',
        file: example('KeyValue.php'),
        class: null,
        callable: 'keyValueList',
        args: { items: {}, emptyMessage: 'Nothing here' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('kv-empty');
      expect(result.html).toContain('Nothing here');
    });
  });

  // -------------------------------------------------------------------------
  // UC55: Class with self-return methods (FlexGrid)
  // -------------------------------------------------------------------------
  describe('UC55: Class with method params', () => {
    it('renders FlexGrid with items', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('FlexGrid.php'),
        class: 'App\\Components\\FlexGrid',
        callable: 'render',
        args: { id: 'test-grid', items: ['A', 'B', 'C'], columns: 3, gap: '16px' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('flex-grid');
      expect(result.html).toContain('test-grid');
      expect(result.html).toContain('flex-grid-item');
    });

    it('renders empty FlexGrid', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('FlexGrid.php'),
        class: 'App\\Components\\FlexGrid',
        callable: 'render',
        args: { items: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('flex-grid-empty');
    });

    it('renders FlexGrid with two columns', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('FlexGrid.php'),
        class: 'App\\Components\\FlexGrid',
        callable: 'render',
        args: { id: 'two', items: ['X', 'Y'], columns: 2 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('repeat(2, 1fr)');
    });
  });

  // -------------------------------------------------------------------------
  // Vite plugin: virtual module generation for UC46-UC55
  // -------------------------------------------------------------------------
  describe('Vite plugin: UC46-UC55 virtual modules', () => {
    const plugin = storybookPhpPlugin();
    const resolveId = (plugin as any).resolveId.bind(plugin);
    const load = (plugin as any).load.bind(plugin);

    it('UC46: Temperature@render generates classMethod with float param', () => {
      const id = resolveId('./Temperature.php@render', example('Temperature.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('value:');
      expect(code).toContain('unit:');
    });

    it('UC46: Temperature@fromFahrenheit generates staticMethod', () => {
      const id = resolveId('./Temperature.php@fromFahrenheit', example('Temperature.php'));
      const code = load(id);
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain('degrees:');
    });

    it('UC47: MediaCard@full generates classMethod', () => {
      const id = resolveId('./MediaCard.php@full', example('MediaCard.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('title:');
      expect(code).toContain('description:');
      expect(code).toContain('category:');
    });

    it('UC47: MediaCard@compact generates classMethod', () => {
      const id = resolveId('./MediaCard.php@compact', example('MediaCard.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("__callable: \"compact\"");
    });

    it('UC47: MediaCard@header generates classMethod', () => {
      const id = resolveId('./MediaCard.php@header', example('MediaCard.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("__callable: \"header\"");
    });

    it('UC50: HttpMethod@badge generates enumMethod for unit enum', () => {
      const id = resolveId('./HttpMethod.php@badge', example('HttpMethod.php'));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain('_case:');
    });

    it('UC50: HttpMethod@endpoint generates enumMethod with params', () => {
      const id = resolveId('./HttpMethod.php@endpoint', example('HttpMethod.php'));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain('_case:');
      expect(code).toContain('path:');
      expect(code).toContain('description:');
    });

    it('UC51: Tabs@render generates classMethod', () => {
      const id = resolveId('./Tabs.php@render', example('Tabs.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('tabs:');
      expect(code).toContain('activeIndex:');
    });

    it('UC52: Divider@__invoke generates classMethod', () => {
      const id = resolveId('./Divider.php@__invoke', example('Divider.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("__callable: \"__invoke\"");
      expect(code).toContain('style:');
      expect(code).toContain('label:');
    });

    it('UC54: KeyValue@keyValueList generates function', () => {
      const id = resolveId('./KeyValue.php@keyValueList', example('KeyValue.php'));
      const code = load(id);
      expect(code).toContain("__type: 'function'");
      expect(code).toContain('items:');
      expect(code).toContain('horizontal:');
    });

    it('UC55: FlexGrid@render generates classMethod', () => {
      const id = resolveId('./FlexGrid.php@render', example('FlexGrid.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('items:');
      expect(code).toContain('columns:');
    });
  });

  // -------------------------------------------------------------------------
  // Parser: metadata extraction for UC46-UC55
  // -------------------------------------------------------------------------
  describe('Parser: UC46-UC55 metadata', () => {
    it('parses Temperature with float param and static methods', () => {
      const meta = parsePhpFile(example('Temperature.php'));
      const cls = meta.classes.find(c => c.name === 'Temperature');
      expect(cls).toBeDefined();
      const value = cls!.constructorParams.find(p => p.name === 'value');
      expect(value).toBeDefined();
      expect(value!.type).toBe('float');
      const staticMethods = cls!.methods.filter(m => m.isStatic);
      expect(staticMethods).toHaveLength(2);
      expect(staticMethods.map(m => m.name)).toContain('fromFahrenheit');
      expect(staticMethods.map(m => m.name)).toContain('fromCelsius');
    });

    it('parses MediaCard with three render methods', () => {
      const meta = parsePhpFile(example('MediaCard.php'));
      const cls = meta.classes.find(c => c.name === 'MediaCard');
      expect(cls).toBeDefined();
      expect(cls!.constructorParams).toHaveLength(4);
      const methodNames = cls!.methods.map(m => m.name);
      expect(methodNames).toContain('compact');
      expect(methodNames).toContain('full');
      expect(methodNames).toContain('header');
    });

    it('parses HttpMethod as unit enum with multiple methods', () => {
      const meta = parsePhpFile(example('HttpMethod.php'));
      const cls = meta.classes.find(c => c.name === 'HttpMethod');
      expect(cls).toBeDefined();
      expect(cls!.isEnum).toBe(true);
      expect(cls!.enumBackingType).toBeNull();
      expect(cls!.enumCases).toHaveLength(5);
      expect(cls!.enumCases).toContain('GET');
      expect(cls!.enumCases).toContain('DELETE');
      expect(cls!.methods).toHaveLength(2);
      const endpoint = cls!.methods.find(m => m.name === 'endpoint');
      expect(endpoint).toBeDefined();
      expect(endpoint!.params).toHaveLength(2);
    });

    it('parses Tabs with Generator return type', () => {
      const meta = parsePhpFile(example('Tabs.php'));
      const cls = meta.classes.find(c => c.name === 'Tabs');
      expect(cls).toBeDefined();
      const render = cls!.methods.find(m => m.name === 'render');
      expect(render).toBeDefined();
      expect(render!.returnType).toContain('Generator');
    });

    it('parses Divider class and DividerStyle enum', () => {
      const meta = parsePhpFile(example('Divider.php'));
      const divEnum = meta.classes.find(c => c.name === 'DividerStyle');
      expect(divEnum).toBeDefined();
      expect(divEnum!.isEnum).toBe(true);
      expect(divEnum!.enumBackingType).toBe('string');
      expect(divEnum!.enumCases).toHaveLength(4);
      const divider = meta.classes.find(c => c.name === 'Divider');
      expect(divider).toBeDefined();
      const invoke = divider!.methods.find(m => m.name === '__invoke');
      expect(invoke).toBeDefined();
    });

    it('parses Countdown with void return and int params', () => {
      const meta = parsePhpFile(example('Countdown.php'));
      const cls = meta.classes.find(c => c.name === 'Countdown');
      expect(cls).toBeDefined();
      const render = cls!.methods.find(m => m.name === 'render');
      expect(render!.returnType).toBe('void');
      const from = cls!.constructorParams.find(p => p.name === 'from');
      expect(from!.type).toBe('int');
    });

    it('parses keyValueList global function', () => {
      const meta = parsePhpFile(example('KeyValue.php'));
      expect(meta.functions).toHaveLength(1);
      const fn = meta.functions[0]!;
      expect(fn.name).toBe('keyValueList');
      expect(fn.params).toHaveLength(3);
      expect(fn.params[0]!.type).toBe('array');
      expect(fn.params[1]!.name).toBe('horizontal');
      expect(fn.params[1]!.type).toBe('bool');
    });

    it('parses FlexGrid with self return type method', () => {
      const meta = parsePhpFile(example('FlexGrid.php'));
      const cls = meta.classes.find(c => c.name === 'FlexGrid');
      expect(cls).toBeDefined();
      const configure = cls!.methods.find(m => m.name === 'configure');
      expect(configure).toBeDefined();
      expect(configure!.returnType).toBe('self');
      const render = cls!.methods.find(m => m.name === 'render');
      expect(render).toBeDefined();
      expect(render!.params).toHaveLength(3);
    });
  });

  // -------------------------------------------------------------------------
  // UC56: Meter - int|float union type constructor param
  // -------------------------------------------------------------------------
  describe('UC56: Meter with int|float union type', () => {
    it('renders Meter with int value', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Meter.php'),
        class: 'App\\Components\\Meter',
        callable: 'render',
        args: { value: 75 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('meter');
      expect(result.html).toContain('meter-fill');
      expect(result.html).toContain('75.0%');
    });

    it('renders Meter with float value and custom range', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Meter.php'),
        class: 'App\\Components\\Meter',
        callable: 'render',
        args: { value: 33.7, min: 0, max: 50, label: 'Temp' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('meter-label');
      expect(result.html).toContain('Temp');
      expect(result.html).toContain('67.4%');
    });

    it('renders Meter with custom color', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Meter.php'),
        class: 'App\\Components\\Meter',
        callable: 'render',
        args: { value: 100, color: '#3b82f6' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('#3b82f6');
      expect(result.html).toContain('100.0%');
    });

    it('renders Meter with low value (red)', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Meter.php'),
        class: 'App\\Components\\Meter',
        callable: 'render',
        args: { value: 10 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('#ef4444');
    });

    it('parser detects int|float union type', () => {
      const meta = parsePhpFile(example('Meter.php'));
      const cls = meta.classes.find(c => c.name === 'Meter');
      expect(cls).toBeDefined();
      const value = cls!.constructorParams.find(p => p.name === 'value');
      expect(value).toBeDefined();
      expect(value!.type).toBe('int|float');
      expect(value!.required).toBe(true);
      const min = cls!.constructorParams.find(p => p.name === 'min');
      expect(min!.type).toBe('int|float');
      expect(min!.required).toBe(false);
      const render = cls!.methods.find(m => m.name === 'render');
      expect(render).toBeDefined();
      expect(render!.params[0]!.name).toBe('color');
      expect(render!.params[0]!.nullable).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // UC57: Dropdown - class implementing multiple interfaces
  // -------------------------------------------------------------------------
  describe('UC57: Dropdown with multiple interfaces', () => {
    it('renders Dropdown toggle closed', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Dropdown.php'),
        class: 'App\\Components\\Dropdown',
        callable: 'toggle',
        args: { label: 'Options', items: ['Edit', 'Delete'] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('dropdown-closed');
      expect(result.html).toContain('Options');
      expect(result.html).toContain('Edit');
      expect(result.html).toContain('Delete');
    });

    it('renders Dropdown toggle open', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Dropdown.php'),
        class: 'App\\Components\\Dropdown',
        callable: 'toggle',
        args: { label: 'Actions', items: ['Copy', 'Move'], open: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('dropdown-open');
      expect(result.html).toContain('display: block');
    });

    it('renders Dropdown toggle with placeholder', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Dropdown.php'),
        class: 'App\\Components\\Dropdown',
        callable: 'toggle',
        args: { label: 'Filter', items: ['A'], open: true, placeholder: 'Pick one...' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Pick one...');
    });

    it('renders Dropdown search with results', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Dropdown.php'),
        class: 'App\\Components\\Dropdown',
        callable: 'search',
        args: { label: 'Search', items: ['Apple', 'Banana', 'Cherry'], query: 'an' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('dropdown-search');
      expect(result.html).toContain('Banana');
    });

    it('renders Dropdown search no results', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Dropdown.php'),
        class: 'App\\Components\\Dropdown',
        callable: 'search',
        args: { label: 'Search', items: ['One', 'Two'], query: 'xyz' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('dropdown-empty');
      expect(result.html).toContain('xyz');
    });

    it('parser detects multiple interfaces', () => {
      const meta = parsePhpFile(example('Dropdown.php'));
      const cls = meta.classes.find(c => c.name === 'Dropdown');
      expect(cls).toBeDefined();
      expect(cls!.implements).toContain('Togglable');
      expect(cls!.implements).toContain('Searchable');
      expect(cls!.methods).toHaveLength(2);
      expect(cls!.methods.map(m => m.name).sort()).toEqual(['search', 'toggle']);
    });
  });

  // -------------------------------------------------------------------------
  // UC58: TextFormatter - multiple global functions without namespace
  // -------------------------------------------------------------------------
  describe('UC58: TextFormatter global functions', () => {
    it('renders truncate with short text', async () => {
      const result = await executor.execute({
        type: 'function',
        file: example('TextFormatter.php'),
        class: null,
        callable: 'truncate',
        args: { text: 'Hello' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('truncated-full');
      expect(result.html).toContain('Hello');
    });

    it('renders truncate with long text', async () => {
      const result = await executor.execute({
        type: 'function',
        file: example('TextFormatter.php'),
        class: null,
        callable: 'truncate',
        args: { text: 'This is a very long string that should be truncated', length: 20 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('truncated-cut');
      expect(result.html).toContain('...');
    });

    it('renders truncate with custom suffix', async () => {
      const result = await executor.execute({
        type: 'function',
        file: example('TextFormatter.php'),
        class: null,
        callable: 'truncate',
        args: { text: 'A really long piece of text for testing', length: 15, suffix: ' [more]' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('[more]');
    });

    it('renders highlight with matching term', async () => {
      const result = await executor.execute({
        type: 'function',
        file: example('TextFormatter.php'),
        class: null,
        callable: 'highlight',
        args: { text: 'The quick brown fox', term: 'fox' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('highlight-mark');
      expect(result.html).toContain('fox');
    });

    it('renders highlight with custom color', async () => {
      const result = await executor.execute({
        type: 'function',
        file: example('TextFormatter.php'),
        class: null,
        callable: 'highlight',
        args: { text: 'Hello World', term: 'World', color: '#bbf7d0' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('#bbf7d0');
    });

    it('renders slugify', async () => {
      const result = await executor.execute({
        type: 'function',
        file: example('TextFormatter.php'),
        class: null,
        callable: 'slugify',
        args: { text: 'Hello World Example' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('slug');
      expect(result.html).toContain('hello-world-example');
    });

    it('renders slugify with custom separator', async () => {
      const result = await executor.execute({
        type: 'function',
        file: example('TextFormatter.php'),
        class: null,
        callable: 'slugify',
        args: { text: 'My Blog Post', separator: '_' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('my_blog_post');
    });

    it('parser detects all three global functions', () => {
      const meta = parsePhpFile(example('TextFormatter.php'));
      expect(meta.namespace).toBeNull();
      expect(meta.functions).toHaveLength(3);
      const names = meta.functions.map(f => f.name);
      expect(names).toContain('truncate');
      expect(names).toContain('highlight');
      expect(names).toContain('slugify');
      // Verify FQN has no namespace prefix
      const truncate = meta.functions.find(f => f.name === 'truncate')!;
      expect(truncate.fqn).toBe('truncate');
      expect(truncate.params).toHaveLength(3);
      expect(truncate.params[0]!.type).toBe('string');
      expect(truncate.params[1]!.type).toBe('int');
    });
  });

  // -------------------------------------------------------------------------
  // UC59: Pricing template with match expression
  // -------------------------------------------------------------------------
  describe('UC59: Pricing template', () => {
    it('renders pricing grid with USD plans', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/pricing.php'),
        class: null,
        callable: null,
        args: {
          plans: [
            { name: 'Starter', price: 9, features: ['5 Projects', '1 GB'] },
            { name: 'Pro', price: 29, features: ['Unlimited', '10 GB', 'Support'] },
          ],
          currency: 'USD',
          period: 'month',
          highlighted: 'Pro',
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('pricing-grid');
      expect(result.html).toContain('Starter');
      expect(result.html).toContain('$9.00');
      expect(result.html).toContain('$29.00');
      expect(result.html).toContain('pricing-highlighted');
      expect(result.html).toContain('Popular');
      expect(result.html).toContain('/ month');
    });

    it('renders pricing with EUR currency', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/pricing.php'),
        class: null,
        callable: null,
        args: {
          plans: [{ name: 'Basic', price: 19, features: ['API'] }],
          currency: 'EUR',
          period: 'year',
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('€19.00');
      expect(result.html).toContain('/ year');
    });

    it('renders pricing with JPY (no decimals)', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/pricing.php'),
        class: null,
        callable: null,
        args: {
          plans: [{ name: 'Plan', price: 980, features: [] }],
          currency: 'JPY',
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('¥980');
    });

    it('renders empty pricing', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/pricing.php'),
        class: null,
        callable: null,
        args: { plans: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('pricing-empty');
    });
  });

  // -------------------------------------------------------------------------
  // UC60: Carousel - variadic constructor params + __toString
  // -------------------------------------------------------------------------
  describe('UC60: Carousel with variadic params', () => {
    it('renders Carousel with string items', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Carousel.php'),
        class: 'App\\Components\\Carousel',
        callable: 'render',
        args: { items: ['First', 'Second', 'Third'] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('carousel');
      expect(result.html).toContain('carousel-active');
      expect(result.html).toContain('First');
      expect(result.html).toContain('Second');
      expect(result.html).toContain('Slide 1 of 3');
    });

    it('renders Carousel with second slide active', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Carousel.php'),
        class: 'App\\Components\\Carousel',
        callable: 'render',
        args: { items: ['A', 'B'], activeIndex: 1 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Slide 2 of 2');
    });

    it('renders Carousel with autoplay', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Carousel.php'),
        class: 'App\\Components\\Carousel',
        callable: 'render',
        args: { items: ['Slide'], autoplay: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('data-autoplay="true"');
    });

    it('renders empty Carousel', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Carousel.php'),
        class: 'App\\Components\\Carousel',
        callable: 'render',
        args: { items: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('carousel-empty');
    });

    it('parser detects Carousel with variadic constructor and method params', () => {
      const meta = parsePhpFile(example('Carousel.php'));
      const cls = meta.classes.find(c => c.name === 'Carousel');
      expect(cls).toBeDefined();
      const ctorSlides = cls!.constructorParams.find(p => p.name === 'slides');
      expect(ctorSlides).toBeDefined();
      expect(ctorSlides!.isVariadic).toBe(true);
      expect(ctorSlides!.type).toBe('Slide');
      const render = cls!.methods.find(m => m.name === 'render');
      expect(render).toBeDefined();
      const items = render!.params.find(p => p.name === 'items');
      expect(items).toBeDefined();
      expect(items!.isVariadic).toBe(true);
      expect(items!.type).toBe('string');
    });

    it('parser detects Slide class with __toString', () => {
      const meta = parsePhpFile(example('Carousel.php'));
      const slide = meta.classes.find(c => c.name === 'Slide');
      expect(slide).toBeDefined();
      expect(slide!.methods.some(m => m.name === '__toString')).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Vite plugin: virtual module generation for UC56-UC60
  // -------------------------------------------------------------------------
  describe('Vite plugin: UC56-UC60 virtual modules', () => {
    const plugin = storybookPhpPlugin();
    const resolveId = (plugin as any).resolveId.bind(plugin);
    const load = (plugin as any).load.bind(plugin);

    it('UC56: Meter@render generates classMethod with union type', () => {
      const id = resolveId('./Meter.php@render', example('Meter.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('Meter');
      expect(code).toContain('value:');
      expect(code).toContain('min:');
      expect(code).toContain('max:');
      expect(code).toContain('color:');
    });

    it('UC57: Dropdown@toggle generates classMethod', () => {
      const id = resolveId('./Dropdown.php@toggle', example('Dropdown.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('Dropdown');
      expect(code).toContain('label:');
      expect(code).toContain('items:');
      expect(code).toContain('open:');
    });

    it('UC57: Dropdown@search generates classMethod for second interface method', () => {
      const id = resolveId('./Dropdown.php@search', example('Dropdown.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('query:');
    });

    it('UC58: TextFormatter@truncate generates function', () => {
      const id = resolveId('./TextFormatter.php@truncate', example('TextFormatter.php'));
      const code = load(id);
      expect(code).toContain("__type: 'function'");
      expect(code).toContain('text:');
      expect(code).toContain('length:');
      expect(code).toContain('suffix:');
    });

    it('UC58: TextFormatter@highlight generates function', () => {
      const id = resolveId('./TextFormatter.php@highlight', example('TextFormatter.php'));
      const code = load(id);
      expect(code).toContain("__type: 'function'");
      expect(code).toContain('text:');
      expect(code).toContain('term:');
      expect(code).toContain('color:');
    });

    it('UC58: TextFormatter@slugify generates function', () => {
      const id = resolveId('./TextFormatter.php@slugify', example('TextFormatter.php'));
      const code = load(id);
      expect(code).toContain("__type: 'function'");
      expect(code).toContain('text:');
      expect(code).toContain('separator:');
    });

    it('UC60: Carousel@render generates classMethod', () => {
      const id = resolveId('./Carousel.php@render', example('Carousel.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('Carousel');
      expect(code).toContain('items:');
    });
  });

  // -------------------------------------------------------------------------
  // UC61: Enum implementing interface
  // -------------------------------------------------------------------------
  describe('UC61: Enum implementing interface', () => {
    it('parses LogLevel enum with implements HasLabel', () => {
      const meta = parsePhpFile(example('LogLevel.php'));
      const logLevel = meta.classes.find(c => c.name === 'LogLevel');
      expect(logLevel).toBeDefined();
      expect(logLevel!.isEnum).toBe(true);
      expect(logLevel!.enumBackingType).toBe('string');
      expect(logLevel!.implements).toContain('HasLabel');
      expect(logLevel!.enumCases).toContain('Debug');
      expect(logLevel!.enumCases).toContain('Critical');
    });

    it('renders LogLevel::badge for info case', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('LogLevel.php'),
        class: 'App\\Components\\LogLevel',
        callable: 'badge',
        args: { _case: 'info' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('log-badge-info');
      expect(result.html).toContain('Info');
    });

    it('renders LogLevel::entry with timestamp', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('LogLevel.php'),
        class: 'App\\Components\\LogLevel',
        callable: 'entry',
        args: { _case: 'error', message: 'DB down', timestamp: '2025-01-01 00:00:00' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('log-entry-error');
      expect(result.html).toContain('DB down');
      expect(result.html).toContain('2025-01-01');
    });
  });

  // -------------------------------------------------------------------------
  // UC62: Multiple traits in one class
  // -------------------------------------------------------------------------
  describe('UC62: Multiple traits', () => {
    it('parses Widget with HasIcon, HasBadge, HasActions traits', () => {
      const meta = parsePhpFile(example('Widget.php'));
      const widget = meta.classes.find(c => c.name === 'Widget');
      expect(widget).toBeDefined();
      expect(widget!.traits).toContain('HasIcon');
      expect(widget!.traits).toContain('HasBadge');
      expect(widget!.traits).toContain('HasActions');
    });

    it('renders Widget@icon (from HasIcon trait)', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Widget.php'),
        class: 'App\\Components\\Widget',
        callable: 'icon',
        args: { title: 'Test', name: 'star', size: 32 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('icon-star');
      expect(result.html).toContain('32px');
    });

    it('renders Widget@badge (from HasBadge trait)', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Widget.php'),
        class: 'App\\Components\\Widget',
        callable: 'badge',
        args: { title: 'Test', text: 'HOT', color: '#ef4444' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('HOT');
      expect(result.html).toContain('#ef4444');
    });

    it('renders Widget@actionBar (from HasActions trait)', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Widget.php'),
        class: 'App\\Components\\Widget',
        callable: 'actionBar',
        args: { title: 'Test', primaryLabel: 'Save', secondaryLabel: 'Cancel' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Save');
      expect(result.html).toContain('Cancel');
      expect(result.html).toContain('btn-primary');
    });
  });

  // -------------------------------------------------------------------------
  // UC63: Array return format
  // -------------------------------------------------------------------------
  describe('UC63: Array return with html key', () => {
    it('parses StatsCard with array return type', () => {
      const meta = parsePhpFile(example('ArrayReturn.php'));
      const cls = meta.classes.find(c => c.name === 'StatsCard');
      expect(cls).toBeDefined();
      const render = cls!.methods.find(m => m.name === 'render');
      expect(render).toBeDefined();
      expect(render!.returnType).toBe('array');
    });

    it('renders StatsCard with change indicator', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('ArrayReturn.php'),
        class: 'App\\Components\\StatsCard',
        callable: 'render',
        args: { label: 'Revenue', value: 12450, unit: 'USD', change: 12.5 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Revenue');
      expect(result.html).toContain('12,450');
      expect(result.html).toContain('USD');
      expect(result.html).toContain('12.5%');
    });

    it('renders StatsCard without change', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('ArrayReturn.php'),
        class: 'App\\Components\\StatsCard',
        callable: 'render',
        args: { label: 'Uptime', value: 99.9, unit: '%' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Uptime');
      expect(result.html).toContain('99.9');
    });
  });

  // -------------------------------------------------------------------------
  // UC64: __toString object return
  // -------------------------------------------------------------------------
  describe('UC64: Stringable return', () => {
    it('parses FragmentBuilder with HtmlFragment return type', () => {
      const meta = parsePhpFile(example('HtmlFragment.php'));
      const builder = meta.classes.find(c => c.name === 'FragmentBuilder');
      expect(builder).toBeDefined();
      const render = builder!.methods.find(m => m.name === 'render');
      expect(render).toBeDefined();
      expect(render!.returnType).toBe('HtmlFragment');
    });

    it('renders FragmentBuilder with heading and body', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('HtmlFragment.php'),
        class: 'App\\Components\\FragmentBuilder',
        callable: 'render',
        args: { heading: 'My Title', body: 'My content' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('My Title');
      expect(result.html).toContain('My content');
      expect(result.html).toContain('<article>');
    });

    it('renders FragmentBuilder with heading only', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('HtmlFragment.php'),
        class: 'App\\Components\\FragmentBuilder',
        callable: 'render',
        args: { heading: 'Solo Heading' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Solo Heading');
      expect(result.html).not.toContain('<p');
    });
  });

  // -------------------------------------------------------------------------
  // UC65: Multiple static methods utility class
  // -------------------------------------------------------------------------
  describe('UC65: Multiple static methods', () => {
    it('parses MarkupHelper with three static methods', () => {
      const meta = parsePhpFile(example('MarkupHelper.php'));
      const cls = meta.classes.find(c => c.name === 'MarkupHelper');
      expect(cls).toBeDefined();
      expect(cls!.constructorParams).toHaveLength(0);
      const statics = cls!.methods.filter(m => m.isStatic);
      expect(statics).toHaveLength(3);
    });

    it('renders MarkupHelper::button', async () => {
      const result = await executor.execute({
        type: 'staticMethod',
        file: example('MarkupHelper.php'),
        class: 'App\\Components\\MarkupHelper',
        callable: 'button',
        args: { label: 'Submit', variant: 'danger' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Submit');
      expect(result.html).toContain('markup-btn-danger');
    });

    it('renders MarkupHelper::button disabled', async () => {
      const result = await executor.execute({
        type: 'staticMethod',
        file: example('MarkupHelper.php'),
        class: 'App\\Components\\MarkupHelper',
        callable: 'button',
        args: { label: 'Disabled', disabled: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('disabled');
      expect(result.html).toContain('not-allowed');
    });

    it('renders MarkupHelper::link external', async () => {
      const result = await executor.execute({
        type: 'staticMethod',
        file: example('MarkupHelper.php'),
        class: 'App\\Components\\MarkupHelper',
        callable: 'link',
        args: { text: 'GitHub', href: 'https://github.com', external: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('target="_blank"');
      expect(result.html).toContain('noopener');
      expect(result.html).toContain('GitHub');
    });

    it('renders MarkupHelper::image with defaults', async () => {
      const result = await executor.execute({
        type: 'staticMethod',
        file: example('MarkupHelper.php'),
        class: 'App\\Components\\MarkupHelper',
        callable: 'image',
        args: { alt: 'Placeholder' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('200px');
      expect(result.html).toContain('150px');
      expect(result.html).toContain('Placeholder');
    });
  });

  // -------------------------------------------------------------------------
  // UC66: FAQ template
  // -------------------------------------------------------------------------
  describe('UC66: FAQ template', () => {
    it('renders FAQ template with items', async () => {
      const result = await executor.execute({
        type: 'template',
        file: resolve(examplesDir, 'templates/faq.php'),
        class: null,
        callable: null,
        args: {
          title: 'Help',
          items: [
            { question: 'How?', answer: 'Like this.' },
            { question: 'Why?', answer: 'Because.' },
          ],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Help');
      expect(result.html).toContain('How?');
      expect(result.html).toContain('Like this.');
      expect(result.html).toContain('Why?');
    });

    it('renders FAQ template with numbered items', async () => {
      const result = await executor.execute({
        type: 'template',
        file: resolve(examplesDir, 'templates/faq.php'),
        class: null,
        callable: null,
        args: {
          title: 'Steps',
          numbered: true,
          items: [
            { question: 'First step', answer: 'Do this.' },
          ],
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('1. First step');
    });

    it('renders FAQ template with empty items', async () => {
      const result = await executor.execute({
        type: 'template',
        file: resolve(examplesDir, 'templates/faq.php'),
        class: null,
        callable: null,
        args: { title: 'Empty FAQ', items: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('No questions yet');
    });
  });

  // -------------------------------------------------------------------------
  // Vite plugin: UC61-UC66 virtual modules
  // -------------------------------------------------------------------------
  describe('Vite plugin: UC61-UC66 virtual modules', () => {
    const plugin = storybookPhpPlugin();
    const resolveId = (plugin as any).resolveId.bind(plugin);
    const load = (plugin as any).load.bind(plugin);

    it('UC61: LogLevel@badge generates enumMethod', () => {
      const id = resolveId('./LogLevel.php@badge', example('LogLevel.php'));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain('LogLevel');
      expect(code).toContain('_case:');
    });

    it('UC61: LogLevel@entry generates enumMethod with params', () => {
      const id = resolveId('./LogLevel.php@entry', example('LogLevel.php'));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain('message:');
      expect(code).toContain('timestamp:');
    });

    it('UC62: Widget@icon generates classMethod from trait', () => {
      const id = resolveId('./Widget.php@icon', example('Widget.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('Widget');
      expect(code).toContain('name:');
      expect(code).toContain('size:');
    });

    it('UC62: Widget@badge generates classMethod from second trait', () => {
      const id = resolveId('./Widget.php@badge', example('Widget.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('text:');
    });

    it('UC62: Widget@actionBar generates classMethod from third trait', () => {
      const id = resolveId('./Widget.php@actionBar', example('Widget.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('primaryLabel:');
    });

    it('UC63: ArrayReturn@render generates classMethod', () => {
      const id = resolveId('./ArrayReturn.php@render', example('ArrayReturn.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('label:');
      expect(code).toContain('value:');
    });

    it('UC64: HtmlFragment@render generates classMethod for FragmentBuilder', () => {
      const id = resolveId('./HtmlFragment.php@render', example('HtmlFragment.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('heading:');
    });

    it('UC65: MarkupHelper@button generates staticMethod', () => {
      const id = resolveId('./MarkupHelper.php@button', example('MarkupHelper.php'));
      const code = load(id);
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain('label:');
      expect(code).toContain('variant:');
    });

    it('UC65: MarkupHelper@link generates staticMethod', () => {
      const id = resolveId('./MarkupHelper.php@link', example('MarkupHelper.php'));
      const code = load(id);
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain('text:');
      expect(code).toContain('href:');
    });

    it('UC65: MarkupHelper@image generates staticMethod', () => {
      const id = resolveId('./MarkupHelper.php@image', example('MarkupHelper.php'));
      const code = load(id);
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain('alt:');
      expect(code).toContain('width:');
    });

    // --- New examples ---

    it('UC66: Anchor@render generates classMethod with nullable param', () => {
      const id = resolveId('./Anchor.php@render', example('Anchor.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('text:');
      expect(code).toContain('href:');
      expect(code).toContain('target:');
      expect(code).toContain('underline:');
    });

    it('UC67: Money@render generates classMethod for final readonly class', () => {
      const id = resolveId('./Money.php@render', example('Money.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('amount:');
      expect(code).toContain('currency:');
    });

    it('UC67: Money@fromCents generates staticMethod', () => {
      const id = resolveId('./Money.php@fromCents', example('Money.php'));
      const code = load(id);
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain('cents:');
      expect(code).toContain('currency:');
    });

    it('UC67: Money@fromDollars generates staticMethod', () => {
      const id = resolveId('./Money.php@fromDollars', example('Money.php'));
      const code = load(id);
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain('dollars:');
      expect(code).toContain('currency:');
    });

    it('UC68: Severity@label generates enumMethod for interface-implementing enum', () => {
      const id = resolveId('./Severity.php@label', example('Severity.php'));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain('_case:');
    });

    it('UC68: Severity@banner generates enumMethod with message param', () => {
      const id = resolveId('./Severity.php@banner', example('Severity.php'));
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain('_case:');
      expect(code).toContain('message:');
    });

    it('UC69: Toggle@render generates classMethod', () => {
      const id = resolveId('./Toggle.php@render', example('Toggle.php'));
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('label:');
      expect(code).toContain('checked:');
      expect(code).toContain('disabled:');
      expect(code).toContain('size:');
    });
  });

  // -------------------------------------------------------------------------
  // UC66: Nullable param component (Anchor)
  // -------------------------------------------------------------------------
  describe('UC66: Nullable param component', () => {
    it('renders Anchor with all args', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Anchor.php'),
        class: 'App\\Components\\Anchor',
        callable: 'render',
        args: { text: 'Click here', href: 'https://example.com', target: '_blank', underline: false },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Click here');
      expect(result.html).toContain('https://example.com');
      expect(result.html).toContain('target="_blank"');
      expect(result.html).toContain('text-decoration: none');
    });

    it('renders Anchor with null href', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Anchor.php'),
        class: 'App\\Components\\Anchor',
        callable: 'render',
        args: { text: 'Placeholder' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('href="#"');
      expect(result.html).toContain('Placeholder');
    });
  });

  // -------------------------------------------------------------------------
  // UC67: Final readonly class with static factories (Money)
  // -------------------------------------------------------------------------
  describe('UC67: Final readonly class + static factory', () => {
    it('renders Money via render()', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Money.php'),
        class: 'App\\Components\\Money',
        callable: 'render',
        args: { amount: 1999, currency: 'USD' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('$19.99');
      expect(result.html).toContain('money');
    });

    it('renders Money::fromCents', async () => {
      const result = await executor.execute({
        type: 'staticMethod',
        file: example('Money.php'),
        class: 'App\\Components\\Money',
        callable: 'fromCents',
        args: { cents: 4999 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('$49.99');
      expect(result.html).toContain('money-cents');
    });

    it('renders Money::fromDollars with EUR', async () => {
      const result = await executor.execute({
        type: 'staticMethod',
        file: example('Money.php'),
        class: 'App\\Components\\Money',
        callable: 'fromDollars',
        args: { dollars: 19.99, currency: 'EUR' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('19.99');
      expect(result.html).toContain('money-dollars');
    });
  });

  // -------------------------------------------------------------------------
  // UC68: Enum implementing interface (Severity)
  // -------------------------------------------------------------------------
  describe('UC68: Enum implementing interface', () => {
    it('renders Severity::label for info', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('Severity.php'),
        class: 'App\\Components\\Severity',
        callable: 'label',
        args: { _case: 'info' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('severity-info');
      expect(result.html).toContain('Info');
      expect(result.html).toContain('#3b82f6');
    });

    it('renders Severity::label for critical', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('Severity.php'),
        class: 'App\\Components\\Severity',
        callable: 'label',
        args: { _case: 'critical' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('severity-critical');
      expect(result.html).toContain('Critical');
    });

    it('renders Severity::banner with message', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('Severity.php'),
        class: 'App\\Components\\Severity',
        callable: 'banner',
        args: { _case: 'warning', message: 'Check your settings' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('banner-warning');
      expect(result.html).toContain('Warning');
      expect(result.html).toContain('Check your settings');
    });
  });

  // -------------------------------------------------------------------------
  // UC69: Bool-heavy component (Toggle)
  // -------------------------------------------------------------------------
  describe('UC69: Bool-heavy component', () => {
    it('renders Toggle unchecked', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Toggle.php'),
        class: 'App\\Components\\Toggle',
        callable: 'render',
        args: { label: 'Enable' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Enable');
      expect(result.html).toContain('toggle');
    });

    it('renders Toggle checked and disabled', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Toggle.php'),
        class: 'App\\Components\\Toggle',
        callable: 'render',
        args: { label: 'Locked', checked: true, disabled: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Locked');
      expect(result.html).toContain('checked');
      expect(result.html).toContain('disabled');
      expect(result.html).toContain('not-allowed');
    });

    it('renders Toggle with size', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Toggle.php'),
        class: 'App\\Components\\Toggle',
        callable: 'render',
        args: { label: 'Small toggle', size: 'small' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('toggle-small');
    });
  });

  // -------------------------------------------------------------------------
  // UC70: Login template
  // -------------------------------------------------------------------------
  describe('UC70: Login template', () => {
    it('renders login form with defaults', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/login.php'),
        class: null,
        callable: null,
        args: { title: 'Sign In' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Sign In');
      expect(result.html).toContain('login-form');
      expect(result.html).toContain('Remember me');
      expect(result.html).toContain('Forgot password?');
    });

    it('renders login with error message', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/login.php'),
        class: null,
        callable: null,
        args: { title: 'Sign In', error: 'Invalid credentials' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('login-error');
      expect(result.html).toContain('Invalid credentials');
    });

    it('renders minimal login without remember/forgot', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/login.php'),
        class: null,
        callable: null,
        args: { title: 'Login', showRemember: false, showForgot: false, buttonText: 'Log In' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Log In');
      expect(result.html).not.toContain('Remember me');
      expect(result.html).not.toContain('Forgot password?');
    });
  });

  // -------------------------------------------------------------------------
  // UC71: Error page template
  // -------------------------------------------------------------------------
  describe('UC71: Error page template', () => {
    it('renders 404 error page', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/error.php'),
        class: null,
        callable: null,
        args: { code: 404 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('404');
      expect(result.html).toContain('Not Found');
      expect(result.html).toContain('error-page');
      expect(result.html).toContain('Go Home');
    });

    it('renders 500 error page', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/error.php'),
        class: null,
        callable: null,
        args: { code: 500 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('500');
      expect(result.html).toContain('Internal Server Error');
    });

    it('renders error page with custom message', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/error.php'),
        class: null,
        callable: null,
        args: { code: 404, message: 'Article not found' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Article not found');
    });

    it('renders error page without home link', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/error.php'),
        class: null,
        callable: null,
        args: { code: 503, showHome: false },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Service Unavailable');
      expect(result.html).not.toContain('Go Home');
    });
  });

  // -------------------------------------------------------------------------
  // Parser: new fixtures
  // -------------------------------------------------------------------------
  describe('Parser: new fixture metadata', () => {
    it('parses ReadonlyClass fixture', () => {
      const meta = parsePhpFile(fixture('ReadonlyClass.php'));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe('Settings');
      expect(cls.isReadonly).toBe(true);
      expect(cls.constructorParams).toHaveLength(3);
    });

    it('parses DefaultNewExpression fixture', () => {
      const meta = parsePhpFile(fixture('DefaultNewExpression.php'));
      expect(meta.classes).toHaveLength(2);
      const widget = meta.classes[1]!;
      expect(widget.name).toBe('Widget');
      const optionsParam = widget.constructorParams.find(p => p.name === 'options')!;
      expect(optionsParam.type).toBe('Options');
      expect(optionsParam.required).toBe(false);
    });

    it('parses EnumWithInterface fixture', () => {
      const meta = parsePhpFile(fixture('EnumWithInterface.php'));
      const level = meta.classes.find(c => c.name === 'Level')!;
      expect(level.isEnum).toBe(true);
      expect(level.implements).toContain('Renderable');
      expect(level.enumCases).toEqual(['Low', 'Medium', 'High']);
    });

    it('parses FinalReadonlyClass fixture', () => {
      const meta = parsePhpFile(fixture('FinalReadonlyClass.php'));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe('Coordinate');
      expect(cls.isFinal).toBe(true);
      expect(cls.isReadonly).toBe(true);
      expect(cls.methods).toHaveLength(2);
    });

    it('parses Anchor with nullable param', () => {
      const meta = parsePhpFile(example('Anchor.php'));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe('Anchor');
      const hrefParam = cls.constructorParams.find(p => p.name === 'href')!;
      expect(hrefParam.nullable).toBe(true);
      expect(hrefParam.required).toBe(false);
    });

    it('parses Money as final readonly class', () => {
      const meta = parsePhpFile(example('Money.php'));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe('Money');
      expect(cls.isFinal).toBe(true);
      expect(cls.isReadonly).toBe(true);
      const staticMethods = cls.methods.filter(m => m.isStatic);
      expect(staticMethods).toHaveLength(2);
      expect(staticMethods.map(m => m.name).sort()).toEqual(['fromCents', 'fromDollars']);
    });

    it('parses Severity enum implementing Labelable interface', () => {
      const meta = parsePhpFile(example('Severity.php'));
      const iface = meta.classes.find(c => c.name === 'Labelable')!;
      expect(iface).toBeDefined();
      const severity = meta.classes.find(c => c.name === 'Severity')!;
      expect(severity.isEnum).toBe(true);
      expect(severity.implements).toContain('Labelable');
      expect(severity.enumCases).toEqual(['Info', 'Warning', 'Error', 'Critical']);
      expect(severity.methods).toHaveLength(2);
    });

    it('parses Settings as readonly class', () => {
      const meta = parsePhpFile(example('Settings.php'));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe('Settings');
      expect(cls.isReadonly).toBe(true);
      expect(cls.isFinal).toBe(false);
      expect(cls.constructorParams).toHaveLength(3);
      expect(cls.constructorParams.map(p => p.name)).toEqual(['theme', 'fontSize', 'animations']);
    });

    it('parses StyledCard with object param and new default', () => {
      const meta = parsePhpFile(example('StyledCard.php'));
      const cardStyle = meta.classes.find(c => c.name === 'CardStyle')!;
      expect(cardStyle.isReadonly).toBe(true);
      expect(cardStyle.constructorParams).toHaveLength(4);
      const styledCard = meta.classes.find(c => c.name === 'StyledCard')!;
      const styleParam = styledCard.constructorParams.find(p => p.name === 'style')!;
      expect(styleParam.type).toBe('CardStyle');
      expect(styleParam.required).toBe(false);
    });

    it('parses Checklist with variadic constructor and Generator return', () => {
      const meta = parsePhpFile(example('Checklist.php'));
      const cls = meta.classes[0]!;
      expect(cls.name).toBe('Checklist');
      const itemsParam = cls.constructorParams.find(p => p.name === 'items')!;
      expect(itemsParam.isVariadic).toBe(true);
      const renderMethod = cls.methods.find(m => m.name === 'render')!;
      expect(renderMethod.returnType).toBe('\\Generator');
    });
  });

  // -------------------------------------------------------------------------
  // UC72: Readonly class (non-final)
  // -------------------------------------------------------------------------
  describe('UC72: Readonly class', () => {
    it('renders Settings with default args', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Settings.php'),
        class: 'App\\Components\\Settings',
        callable: 'render',
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('light');
      expect(result.html).toContain('14px');
      expect(result.html).toContain('enabled');
    });

    it('renders Settings with dark theme', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Settings.php'),
        class: 'App\\Components\\Settings',
        callable: 'render',
        args: { theme: 'dark', fontSize: 18, animations: false },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('dark');
      expect(result.html).toContain('18px');
      expect(result.html).toContain('disabled');
      expect(result.html).toContain('#1f2937');
    });
  });

  // -------------------------------------------------------------------------
  // UC73: Object params with new default expression
  // -------------------------------------------------------------------------
  describe('UC73: Object params with new default', () => {
    it('renders StyledCard with default CardStyle', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('StyledCard.php'),
        class: 'App\\Components\\StyledCard',
        callable: 'render',
        args: { title: 'Hello' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Hello');
      expect(result.html).toContain('styled-card');
    });

    it('renders StyledCard with body text', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('StyledCard.php'),
        class: 'App\\Components\\StyledCard',
        callable: 'render',
        args: { title: 'Card', body: 'Body text here' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Card');
      expect(result.html).toContain('Body text here');
    });
  });

  // -------------------------------------------------------------------------
  // UC74: Generator return
  // -------------------------------------------------------------------------
  describe('UC74: Generator return', () => {
    it('renders Checklist with items via yield', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Checklist.php'),
        class: 'App\\Components\\Checklist',
        callable: 'render',
        args: { title: 'Tasks', items: ['A', 'B', 'C'] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Tasks');
      expect(result.html).toContain('<li');
      expect(result.html).toContain('A');
      expect(result.html).toContain('B');
      expect(result.html).toContain('C');
    });

    it('renders Checklist as numbered list', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Checklist.php'),
        class: 'App\\Components\\Checklist',
        callable: 'render',
        args: { title: 'Steps', items: ['First', 'Second'], numbered: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('<ol');
      expect(result.html).toContain('First');
    });

    it('renders empty Checklist', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Checklist.php'),
        class: 'App\\Components\\Checklist',
        callable: 'render',
        args: { title: 'Empty' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('No items');
    });
  });

  // -------------------------------------------------------------------------
  // UC75: Inventory template
  // -------------------------------------------------------------------------
  describe('UC75: Inventory template', () => {
    it('renders inventory with products', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/inventory.php'),
        class: null,
        callable: null,
        args: {
          products: [
            { name: 'Widget', price: 19.99, stock: 10 },
          ],
          currency: 'USD',
          showStock: true,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Widget');
      expect(result.html).toContain('19.99');
      expect(result.html).toContain('Stock');
    });

    it('renders inventory without stock column', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/inventory.php'),
        class: null,
        callable: null,
        args: {
          products: [{ name: 'Item', price: 5.00 }],
          showStock: false,
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Item');
      expect(result.html).not.toContain('Stock');
    });

    it('renders empty inventory', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/inventory.php'),
        class: null,
        callable: null,
        args: { products: [] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('No products');
    });
  });

  // -------------------------------------------------------------------------
  // Vite plugin: new examples
  // -------------------------------------------------------------------------
  describe('Vite plugin: new example virtual modules', () => {
    const plugin = storybookPhpPlugin();
    const resolveId = (plugin as any).resolveId.bind(plugin);
    const load = (plugin as any).load.bind(plugin);

    it('generates virtual module for Settings.php@render', () => {
      const id = resolveId('./Settings.php@render', example('Settings.php'));
      expect(id).toContain('storybook-php:');
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("export const Settings");
    });

    it('generates virtual module for StyledCard.php@render', () => {
      const id = resolveId('./StyledCard.php@render', example('StyledCard.php'));
      expect(id).toContain('storybook-php:');
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("export const StyledCard");
    });

    it('generates virtual module for Checklist.php@render', () => {
      const id = resolveId('./Checklist.php@render', example('Checklist.php'));
      expect(id).toContain('storybook-php:');
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain("export const Checklist");
    });

    it('generates virtual module for AbstractShape.php@render (both subclasses)', () => {
      const id = resolveId('./AbstractShape.php@render', example('AbstractShape.php'));
      expect(id).toContain('storybook-php:');
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('export const Circle');
      expect(code).toContain('export const Square');
    });

    it('generates virtual module for HttpStatus.php@badge (enum)', () => {
      const id = resolveId('./HttpStatus.php@badge', example('HttpStatus.php'));
      expect(id).toContain('storybook-php:');
      const code = load(id);
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain('export const HttpStatus');
      expect(code).toContain('_case:');
    });

    it('generates virtual module for FluentBuilder.php@heading (static)', () => {
      const id = resolveId('./FluentBuilder.php@heading', example('FluentBuilder.php'));
      expect(id).toContain('storybook-php:');
      const code = load(id);
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain('export const FluentBuilder');
      expect(code).toContain('text:');
      expect(code).toContain('level:');
    });

    it('generates virtual module for FormField.php@render', () => {
      const id = resolveId('./FormField.php@render', example('FormField.php'));
      expect(id).toContain('storybook-php:');
      const code = load(id);
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain('export const FormField');
      expect(code).toContain('label:');
      expect(code).toContain('id:');
    });
  });

  // -------------------------------------------------------------------------
  // UC76: Abstract class with concrete subclasses
  // -------------------------------------------------------------------------
  describe('UC76: Abstract class with concrete subclasses', () => {
    it('renders Circle with defaults', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('AbstractShape.php'),
        class: 'App\\Components\\Circle',
        callable: 'render',
        args: { color: '#3b82f6', size: 80 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('shape-circle');
      expect(result.html).toContain('80px');
      expect(result.html).toContain('#3b82f6');
    });

    it('renders Square with border radius', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('AbstractShape.php'),
        class: 'App\\Components\\Square',
        callable: 'render',
        args: { color: '#f59e0b', size: 100, radius: 16 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('shape-square');
      expect(result.html).toContain('100px');
      expect(result.html).toContain('border-radius: 16px');
    });
  });

  // -------------------------------------------------------------------------
  // UC77: Int-backed enum with match expression
  // -------------------------------------------------------------------------
  describe('UC77: Int-backed enum (HttpStatus)', () => {
    it('renders HttpStatus::badge for 404', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('HttpStatus.php'),
        class: 'App\\Components\\HttpStatus',
        callable: 'badge',
        args: { _case: 404 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('404');
      expect(result.html).toContain('NotFound');
      expect(result.html).toContain('http-status');
    });

    it('renders HttpStatus::page for 500 with custom message', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('HttpStatus.php'),
        class: 'App\\Components\\HttpStatus',
        callable: 'page',
        args: { _case: 500, message: 'Service unavailable' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('500');
      expect(result.html).toContain('ServerError');
      expect(result.html).toContain('Service unavailable');
    });

    it('renders HttpStatus::page for 200 with default message', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('HttpStatus.php'),
        class: 'App\\Components\\HttpStatus',
        callable: 'page',
        args: { _case: 200 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('200');
      expect(result.html).toContain('successful');
    });
  });

  // -------------------------------------------------------------------------
  // UC78: Mixed promoted/non-promoted constructor params
  // -------------------------------------------------------------------------
  describe('UC78: Mixed promoted/non-promoted params (FormField)', () => {
    it('renders FormField with auto-generated id', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('FormField.php'),
        class: 'App\\Components\\FormField',
        callable: 'render',
        args: { label: 'Email Address', type: 'email', required: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('email-address');
      expect(result.html).toContain('Email Address');
      expect(result.html).toContain('type="email"');
      expect(result.html).toContain('required');
    });

    it('renders FormField with explicit id and placeholder', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('FormField.php'),
        class: 'App\\Components\\FormField',
        callable: 'render',
        args: { label: 'Phone', type: 'tel', id: 'user-phone', placeholder: '+1 555-0100' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('user-phone');
      expect(result.html).toContain('Phone');
      expect(result.html).toContain('+1 555-0100');
    });
  });

  // -------------------------------------------------------------------------
  // UC79: Static factory methods (FluentBuilder)
  // -------------------------------------------------------------------------
  describe('UC79: Static factory methods (FluentBuilder)', () => {
    it('renders FluentBuilder::heading', async () => {
      const result = await executor.execute({
        type: 'staticMethod',
        file: example('FluentBuilder.php'),
        class: 'App\\Components\\FluentBuilder',
        callable: 'heading',
        args: { text: 'Welcome', level: 1 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('<h1');
      expect(result.html).toContain('Welcome');
    });

    it('renders FluentBuilder::badge', async () => {
      const result = await executor.execute({
        type: 'staticMethod',
        file: example('FluentBuilder.php'),
        class: 'App\\Components\\FluentBuilder',
        callable: 'badge',
        args: { text: 'New', bg: '#22c55e' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('fb-badge');
      expect(result.html).toContain('New');
      expect(result.html).toContain('#22c55e');
    });

    it('renders FluentBuilder::divider', async () => {
      const result = await executor.execute({
        type: 'staticMethod',
        file: example('FluentBuilder.php'),
        class: 'App\\Components\\FluentBuilder',
        callable: 'divider',
        args: { style: 'dashed', color: '#3b82f6' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('fb-divider');
      expect(result.html).toContain('dashed');
      expect(result.html).toContain('#3b82f6');
    });

    it('renders FluentBuilder instance render', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('FluentBuilder.php'),
        class: 'App\\Components\\FluentBuilder',
        callable: 'render',
        args: { text: 'Hello', bg: '#fef3c7', padding: 16 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Hello');
      expect(result.html).toContain('#fef3c7');
    });
  });

  // -------------------------------------------------------------------------
  // UC80: Contact form template
  // -------------------------------------------------------------------------
  describe('UC80: Contact template', () => {
    it('renders empty contact form', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/contact.php'),
        class: null,
        callable: null,
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('contact-form');
      expect(result.html).toContain('Contact Us');
      expect(result.html).toContain('Send Message');
    });

    it('renders prefilled contact form', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/contact.php'),
        class: null,
        callable: null,
        args: {
          name: 'Alice',
          email: 'alice@example.com',
          subject: 'Support',
          message: 'Need help',
          submitLabel: 'Submit',
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Alice');
      expect(result.html).toContain('alice@example.com');
      expect(result.html).toContain('Support');
      expect(result.html).toContain('Need help');
      expect(result.html).toContain('Submit');
    });
  });

  // -------------------------------------------------------------------------
  // UC81: Variadic parameters (TagList)
  // -------------------------------------------------------------------------
  describe('UC81: Variadic parameters', () => {
    it('renders TagList with variadic tags', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('TagList.php'),
        class: 'App\\Components\\TagList',
        callable: 'render',
        args: { label: 'Skills', color: '#3b82f6', tags: ['PHP', 'TypeScript'] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Skills');
      expect(result.html).toContain('PHP');
      expect(result.html).toContain('TypeScript');
    });

    it('renders TagList with no tags', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('TagList.php'),
        class: 'App\\Components\\TagList',
        callable: 'render',
        args: { label: 'Empty' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Empty');
    });

    it('renders TagList.inline static method with variadic tags', async () => {
      const result = await executor.execute({
        type: 'staticMethod',
        file: example('TagList.php'),
        class: 'App\\Components\\TagList',
        callable: 'inline',
        args: { separator: ' | ', tags: ['Home', 'About', 'Contact'] },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Home');
      expect(result.html).toContain('|');
      expect(result.html).toContain('Contact');
    });
  });

  // -------------------------------------------------------------------------
  // UC82: Class constants (StatusBanner)
  // -------------------------------------------------------------------------
  describe('UC82: Class constants', () => {
    it('renders info banner', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('StatusBanner.php'),
        class: 'App\\Components\\StatusBanner',
        callable: 'render',
        args: { message: 'Test info', level: 'info' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Test info');
      expect(result.html).toContain('status-info');
    });

    it('renders error banner with dismiss', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('StatusBanner.php'),
        class: 'App\\Components\\StatusBanner',
        callable: 'render',
        args: { message: 'Error occurred', level: 'error', dismissible: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('status-error');
      expect(result.html).toContain('&times;');
    });

    it('renders success banner without icon', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('StatusBanner.php'),
        class: 'App\\Components\\StatusBanner',
        callable: 'render',
        args: { message: 'Saved!', level: 'success', showIcon: false },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Saved!');
      expect(result.html).toContain('status-success');
    });
  });

  // -------------------------------------------------------------------------
  // UC83: Interface implementation (Panel)
  // -------------------------------------------------------------------------
  describe('UC83: Interface implementation', () => {
    it('renders Panel with body', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Panel.php'),
        class: 'App\\Components\\Panel',
        callable: 'render',
        args: { heading: 'Test Panel', body: 'Body content' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Test Panel');
      expect(result.html).toContain('Body content');
      expect(result.html).toContain('panel');
    });

    it('renders collapsed Panel', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Panel.php'),
        class: 'App\\Components\\Panel',
        callable: 'render',
        args: { heading: 'Collapsed', body: 'Hidden', collapsible: true, collapsed: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('display: none;');
    });
  });

  // -------------------------------------------------------------------------
  // UC84: Readonly properties with mixed promotion (UserProfile)
  // -------------------------------------------------------------------------
  describe('UC84: Readonly promoted properties', () => {
    it('renders UserProfile with initials', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('UserProfile.php'),
        class: 'App\\Components\\UserProfile',
        callable: 'render',
        args: { name: 'Jane Doe', email: 'jane@example.com' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Jane Doe');
      expect(result.html).toContain('jane@example.com');
      expect(result.html).toContain('JD');
    });

    it('renders admin role badge', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('UserProfile.php'),
        class: 'App\\Components\\UserProfile',
        callable: 'render',
        args: { name: 'Alice', email: 'alice@test.com', role: 'admin' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Admin');
    });
  });

  // -------------------------------------------------------------------------
  // UC85: Unit enum implementing interface (Weekday)
  // -------------------------------------------------------------------------
  describe('UC85: Unit enum with interface', () => {
    it('renders Friday badge', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('Weekday.php'),
        class: 'App\\Components\\Weekday',
        callable: 'badge',
        args: { _case: 'Friday' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Friday');
      expect(result.html).toContain('Almost weekend!');
    });

    it('renders Saturday badge as weekend', async () => {
      const result = await executor.execute({
        type: 'enumMethod',
        file: example('Weekday.php'),
        class: 'App\\Components\\Weekday',
        callable: 'badge',
        args: { _case: 'Saturday' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Saturday');
      expect(result.html).toContain('Weekend');
    });
  });

  // -------------------------------------------------------------------------
  // UC86: Object params with new defaults (StyledText)
  // -------------------------------------------------------------------------
  describe('UC86: Object param with new default', () => {
    it('renders with default TextStyle', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('StyledText.php'),
        class: 'App\\Components\\StyledText',
        callable: 'render',
        args: { text: 'Hello world' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Hello world');
      expect(result.html).toContain('system-ui');
    });

    it('renders with custom style object', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('StyledText.php'),
        class: 'App\\Components\\StyledText',
        callable: 'render',
        args: { text: 'Styled', tag: 'h1', style: { fontFamily: 'Georgia', fontSize: 32, color: '#7c3aed', fontWeight: 'bold' } },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Styled');
      expect(result.html).toContain('Georgia');
      expect(result.html).toContain('#7c3aed');
    });
  });

  // -------------------------------------------------------------------------
  // UC87: Inheritance (BaseCard / FeatureCard)
  // -------------------------------------------------------------------------
  describe('UC87: Class inheritance', () => {
    it('renders BaseCard', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('FeatureCard.php'),
        class: 'App\\Components\\BaseCard',
        callable: 'render',
        args: { title: 'Base Card', body: 'Simple card.' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Base Card');
      expect(result.html).toContain('base-card');
    });

    it('renders FeatureCard with icon and accent', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('FeatureCard.php'),
        class: 'App\\Components\\FeatureCard',
        callable: 'render',
        args: { title: 'Feature', body: 'Description', icon: '⚡', accentColor: '#10b981' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Feature');
      expect(result.html).toContain('feature-card');
      expect(result.html).toContain('#10b981');
    });
  });

  // -------------------------------------------------------------------------
  // UC88: __toString return pattern (Duration)
  // -------------------------------------------------------------------------
  describe('UC88: __toString return', () => {
    it('renders Duration with hours, minutes, seconds', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Duration.php'),
        class: 'App\\Components\\Duration',
        callable: 'render',
        args: { hours: 2, minutes: 30, seconds: 15 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('2h');
      expect(result.html).toContain('30m');
      expect(result.html).toContain('15s');
    });

    it('renders zero duration', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('Duration.php'),
        class: 'App\\Components\\Duration',
        callable: 'render',
        args: { hours: 0, minutes: 0, seconds: 0 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('0s');
    });
  });

  // -------------------------------------------------------------------------
  // UC89: Testimonial template
  // -------------------------------------------------------------------------
  describe('UC89: Testimonial template', () => {
    it('renders card variant with rating', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/testimonial.php'),
        class: null,
        callable: null,
        args: { quote: 'Amazing!', author: 'Sarah', role: 'Developer', rating: 5 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Amazing!');
      expect(result.html).toContain('Sarah');
      expect(result.html).toContain('Developer');
      expect(result.html).toContain('testimonial');
    });

    it('renders minimal variant', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/testimonial.php'),
        class: null,
        callable: null,
        args: { quote: 'Simple.', author: 'Alex', variant: 'minimal' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Simple.');
      expect(result.html).toContain('blockquote');
    });
  });

  // -------------------------------------------------------------------------
  // UC90: Notification template
  // -------------------------------------------------------------------------
  describe('UC90: Notification template', () => {
    it('renders unread info notification', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/notification.php'),
        class: null,
        callable: null,
        args: { title: 'New comment', message: 'Alice replied.', type: 'info', time: '2 min ago', unread: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('New comment');
      expect(result.html).toContain('Alice replied.');
      expect(result.html).toContain('notification-item');
    });

    it('renders read notification without dot', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/notification.php'),
        class: null,
        callable: null,
        args: { title: 'Old alert', type: 'warning', time: 'yesterday', unread: false },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Old alert');
      expect(result.html).toContain('background: white;');
    });
  });

  // -------------------------------------------------------------------------
  // UC91: Multiple classes in one file (PageHeader)
  // -------------------------------------------------------------------------
  describe('UC91: Multiple classes in one file (PageHeader)', () => {
    it('renders PageHeader with title and logo', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('PageSection.php'),
        class: 'App\\Components\\PageHeader',
        callable: 'render',
        args: { title: 'Home', logo: 'Acme' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Acme');
      expect(result.html).toContain('Home');
      expect(result.html).toContain('header');
    });

    it('renders sticky PageHeader', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('PageSection.php'),
        class: 'App\\Components\\PageHeader',
        callable: 'render',
        args: { title: 'Dashboard', logo: 'MyApp', sticky: true },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('sticky');
      expect(result.html).toContain('MyApp');
    });
  });

  // -------------------------------------------------------------------------
  // UC92: Multiple classes in one file (PageFooter)
  // -------------------------------------------------------------------------
  describe('UC92: Multiple classes in one file (PageFooter)', () => {
    it('renders dark PageFooter', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('PageSection.php'),
        class: 'App\\Components\\PageFooter',
        callable: 'render',
        args: { copyright: 'Acme Inc', year: 2025 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Acme Inc');
      expect(result.html).toContain('2025');
      expect(result.html).toContain('footer');
    });

    it('renders light PageFooter', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('PageSection.php'),
        class: 'App\\Components\\PageFooter',
        callable: 'render',
        args: { copyright: 'Test Corp', theme: 'light' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Test Corp');
      expect(result.html).toContain('#f9fafb');
    });
  });

  // -------------------------------------------------------------------------
  // UC93: No-namespace class (SimpleBox)
  // -------------------------------------------------------------------------
  describe('UC93: No-namespace class (SimpleBox)', () => {
    it('renders SimpleBox with content', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('SimpleBox.php'),
        class: 'SimpleBox',
        callable: 'render',
        args: { content: 'Hello Box' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Hello Box');
      expect(result.html).toContain('simple-box');
    });

    it('renders SimpleBox with custom style', async () => {
      const result = await executor.execute({
        type: 'classMethod',
        file: example('SimpleBox.php'),
        class: 'SimpleBox',
        callable: 'render',
        args: { content: 'Styled', borderColor: '#3b82f6', padding: 24 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('#3b82f6');
      expect(result.html).toContain('24px');
    });
  });

  // -------------------------------------------------------------------------
  // UC94: Sidebar template
  // -------------------------------------------------------------------------
  describe('UC94: Sidebar template', () => {
    it('renders sidebar with items and active state', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/sidebar.php'),
        class: null,
        callable: null,
        args: { title: 'Navigation', items: ['Dashboard', 'Projects', 'Settings'], activeItem: 'Dashboard' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Navigation');
      expect(result.html).toContain('Dashboard');
      expect(result.html).toContain('Projects');
      expect(result.html).toContain('sidebar');
    });

    it('renders dark sidebar', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/sidebar.php'),
        class: null,
        callable: null,
        args: { title: 'Menu', items: ['Home', 'About'], theme: 'dark' },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Menu');
      expect(result.html).toContain('#1f2937');
    });
  });

  // -------------------------------------------------------------------------
  // UC95: Weather template
  // -------------------------------------------------------------------------
  describe('UC95: Weather template', () => {
    it('renders sunny weather card', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/weather.php'),
        class: null,
        callable: null,
        args: { city: 'Tokyo', temperature: 28, condition: 'sunny', humidity: 55, windSpeed: 8 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Tokyo');
      expect(result.html).toContain('28');
      expect(result.html).toContain('weather-card');
    });

    it('renders snowy weather card', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/weather.php'),
        class: null,
        callable: null,
        args: { city: 'Helsinki', temperature: -5, condition: 'snowy', humidity: 70, windSpeed: 15 },
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Helsinki');
      expect(result.html).toContain('-5');
      expect(result.html).toContain('#3b82f6');
    });

    it('renders with default values', async () => {
      const result = await executor.execute({
        type: 'template',
        file: example('templates/weather.php'),
        class: null,
        callable: null,
        args: {},
      });
      expect(result.error).toBeUndefined();
      expect(result.html).toContain('Tokyo');
      expect(result.html).toContain('22');
    });
  });

  // -------------------------------------------------------------------------
  // Vite plugin: UC81-UC90 virtual modules
  // -------------------------------------------------------------------------
  describe('Vite plugin: UC81-UC90 virtual modules', () => {
    const plugin = storybookPhpPlugin({});
    const resolveId = (plugin as any).resolveId.bind(plugin);
    const load = (plugin as any).load.bind(plugin);

    it('resolves TagList.php@render', async () => {
      const id = await resolveId('./TagList.php@render', example('TagList.stories.ts'));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain('TagList');
    });

    it('resolves TagList.php@inline', async () => {
      const id = await resolveId('./TagList.php@inline', example('TagListInline.stories.ts'));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain('inline');
    });

    it('resolves StatusBanner.php@render', async () => {
      const id = await resolveId('./StatusBanner.php@render', example('StatusBanner.stories.ts'));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain('StatusBanner');
    });

    it('resolves Panel.php@render', async () => {
      const id = await resolveId('./Panel.php@render', example('Panel.stories.ts'));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain('Panel');
    });

    it('resolves UserProfile.php@render', async () => {
      const id = await resolveId('./UserProfile.php@render', example('UserProfile.stories.ts'));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain('UserProfile');
    });

    it('resolves Weekday.php@badge', async () => {
      const id = await resolveId('./Weekday.php@badge', example('Weekday.stories.ts'));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain('Weekday');
    });

    it('resolves StyledText.php@render', async () => {
      const id = await resolveId('./StyledText.php@render', example('StyledText.stories.ts'));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain('StyledText');
    });

    it('resolves FeatureCard.php@render', async () => {
      const id = await resolveId('./FeatureCard.php@render', example('FeatureCard.stories.ts'));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain('FeatureCard');
    });

    it('resolves Duration.php@render', async () => {
      const id = await resolveId('./Duration.php@render', example('Duration.stories.ts'));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain('Duration');
    });

    it('resolves PageSection.php@render for PageHeader', async () => {
      const id = await resolveId('./PageSection.php@render', example('PageSectionHeader.stories.ts'));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain('PageHeader');
    });

    it('resolves PageSection.php@render for PageFooter', async () => {
      const id = await resolveId('./PageSection.php@render', example('PageSectionFooter.stories.ts'));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain('PageFooter');
    });

    it('resolves SimpleBox.php@render (no namespace)', async () => {
      const id = await resolveId('./SimpleBox.php@render', example('SimpleBox.stories.ts'));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain('SimpleBox');
    });

    it('resolves sidebar.php template', async () => {
      const id = await resolveId('./sidebar.php', example('templates/sidebar.stories.ts'));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain('template');
    });

    it('resolves weather.php template', async () => {
      const id = await resolveId('./weather.php', example('templates/weather.stories.ts'));
      expect(id).toBeDefined();
      const code = await load(id);
      expect(code).toContain('template');
    });
  });
});
