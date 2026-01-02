/**
 * Allow import of HTML files
 */
declare module "*.html?raw" {
  const content: string;
  export default content;
}
