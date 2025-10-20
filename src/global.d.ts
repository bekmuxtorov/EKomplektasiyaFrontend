declare module "*.css";
declare module "html-docx-js/dist/html-docx";
declare module "mammoth";
declare module "file-saver";
declare module "react-quill";
declare module "*.png"
declare module "mammoth/mammoth.browser";

declare module "mammoth/mammoth.browser" {
  export function convertToHtml(input: { arrayBuffer: ArrayBuffer }): Promise<{ value: string }>;
}