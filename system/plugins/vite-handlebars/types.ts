export interface GetPartialNameOptions {
  locallyPath: string,
  splitAfter?: string,
}

export type TPartials = Map<string, string>

export interface ContextOptions {
  file?: string,
  postfix?: string
  prefix?: string
  partials: TPartials
}