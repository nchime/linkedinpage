declare module 'pdf-text-extract' {
  export default function pdfTextExtract(
    filePath: string,
    callback: (err: Error | null, pages: string[]) => void
  ): void;
}