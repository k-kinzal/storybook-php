/** Ambient type declarations for PHP module imports */

declare module "*.php" {
  const component: import("./dist/types.js").PhpComponent;
  export default component;
}

declare module "*.php@*" {
  const component: import("./dist/types.js").PhpComponent;
  export default component;
  export { component };
}
