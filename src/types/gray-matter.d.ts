// Type declarations for gray-matter since @types/gray-matter doesn't exist
declare module "gray-matter" {
  interface GrayMatterFile<T = any> {
    data: T;
    content: string;
    excerpt?: string;
    orig: string | Buffer;
    language: string;
    matter: string;
    stringify(content: string): string;
  }

  interface GrayMatterOption<T = any> {
    excerpt?: boolean | ((file: GrayMatterFile<T>) => string);
    excerpt_separator?: string;
    engines?: {
      [key: string]: (input: string) => any;
    };
    language?: string;
    delimiters?: string | [string, string];
  }

  function matter<T = any>(
    input: string | Buffer,
    options?: GrayMatterOption<T>,
  ): GrayMatterFile<T>;

  namespace matter {
    function stringify<T = any>(
      content: string,
      data: T,
      options?: GrayMatterOption<T>,
    ): string;
  }

  export = matter;
}
