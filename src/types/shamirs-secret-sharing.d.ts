declare module 'shamirs-secret-sharing' {
  function split(secret: Buffer, options: { shares: number; threshold: number }): Buffer[];
  function combine(shards: Buffer[]): Buffer;
  export = { split, combine };
}
