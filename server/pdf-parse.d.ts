declare module 'pdf-parse' {
  export interface PDFParseOptions {
    data: Buffer;
  }

  export interface PDFTextResult {
    text: string;
  }

  export class PDFParse {
    constructor(options: PDFParseOptions);
    getText(): Promise<PDFTextResult>;
    destroy(): Promise<void>;
  }

  export interface VerbosityLevel {
    ERRORS: number;
    WARNINGS: number;
    INFOS: number;
  }

  export const VerbosityLevel: VerbosityLevel;
  export function getHeader(buffer: Buffer): Promise<any>;
}
