declare module 'pdf-parse' {
  export interface PDFData {
    text: string;
    numpages: number;
    info: any;
    metadata: any;
    version: string;
  }

  export function PDFParse(dataBuffer: Buffer): Promise<PDFData>;
}
