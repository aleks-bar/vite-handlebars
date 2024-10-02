import { PluginOption } from "vite";
import { viteRewriteUrlInCssOptions } from "./types";

/**
 * @param paths
 * @description Принимает объект в котором "ключи" это паттерн для поиска в регулярном выражении,
 *              а "значения" это на что заменять путь. Для ключа вложенность не указывать т.к. он
 *              ищет совпадение и меняет само совпадение и всё что было до него на переданное значение.
 *              Например объект {"/media": "../media"}. По ключу найдется путь "../../../../media/images/img.jpg"
 *              или "./media/img.jpg" и заменит на "../media/images/img.jpg" и "../media/img.jpg"
 */
export default function viteRewriteUrlInCss({ paths }: viteRewriteUrlInCssOptions): PluginOption {
  return {
    name: 'vite-rewrite-url-in-css',
    apply: 'build',
    enforce: 'post',
    //@ts-ignore
    generateBundle(options, bundle) {
      // Проходим по всем файлам бандла
      for (const fileName in bundle) {
        const chunk = bundle[fileName];

        // @ts-ignore
        if (fileName.endsWith('.css') && chunk.source) {
          const pathKeysString = Object.keys(paths).join('|')
          const regexForMainCode = new RegExp(`url\\((['"]?)\.?(${pathKeysString})[^'")]*?['"]?\\)`, 'g')

          // @ts-ignore
          chunk.source = chunk.source.replace( regexForMainCode, ( match ) => {
            const urlRegex = /url\((['"]?)([^'")]+)\1\)/;

            /**
             * Меняем урлы для найденных совпадений
             */
            for ( let oldPath in paths ) {
              if ( match.includes( oldPath ) ) {
                const matchValues = match.match( urlRegex );

                if ( matchValues && matchValues[ 2 ] && matchValues[ 2 ].includes( oldPath ) ) {
                  const quotes = matchValues[ 1 ]
                  const pathAfterPattern = matchValues[ 2 ].split( oldPath )[ 1 ]

                  return `url(${ quotes + paths[ oldPath ] + pathAfterPattern + quotes })`;
                }
              }
            }
            return match;
          } )
        }
      }
    }
  };
}