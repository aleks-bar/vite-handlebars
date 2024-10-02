import { existsSync, readFileSync } from 'node:fs';
import { dirname } from "path";
import { ContextOptions } from "../types.ts";

export const createContext = ({
  file = 'context.json',
  postfix = 'Context',
  prefix = '',
  partials
}: ContextOptions) => {
  const context = new Map<string, object>

  partials.forEach((path, partialName) => {
    const contextFile = `${dirname(path)}/${file}`;
    const contextName = prefix + partialName + postfix;

    if ( existsSync(contextFile) ) {
      context.set(contextName, JSON.parse(readFileSync(contextFile, {encoding: "utf8"})))
    }
  })

  return Object.fromEntries(context.entries())
}