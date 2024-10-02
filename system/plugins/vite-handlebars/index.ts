import handlebars from 'handlebars';
import { registerPartials } from "./actions/partial.ts";
import { createContext } from "./actions/context.ts";
import { TPartials } from "./types.ts";

interface ViteHandlebarsOptions {
  partialsDir: string
}

//@ts-ignore
export default function viteHandlebars ({ partialsDir }: ViteHandlebarsOptions): PluginOption {
  const partialsMap: TPartials = new Map();

  return {
    name: 'vite-handlebars',
    transformIndexHtml: {
      order: 'pre',
      async handler(html: any) {
        if (partialsDir) {
          await registerPartials(partialsDir, partialsMap)
        }

        const template = handlebars.compile(html);

        const context = createContext({
          partials: partialsMap
        });

        return template( context );
      },
    },
  };
}