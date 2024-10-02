import { basename, dirname } from "path";
import { firstCharToUpper, getFilesRecursively } from "../../../actions.ts";
import { readFileSync } from 'node:fs';
import handlebars from 'handlebars';
import { normalizePath } from 'vite';
import { GetPartialNameOptions, TPartials } from "../types.ts";

export const getPartialName = (
  {
    locallyPath,
    splitAfter
  }: GetPartialNameOptions ) =>
{
  let pathArray = locallyPath.split('/')
  const fileName = basename(locallyPath)

  while ( splitAfter && pathArray.includes(splitAfter) ) {
    const firstWordIndex = pathArray.findIndex(folder => folder === splitAfter )
    const secondWordIndex = firstWordIndex + 1
    const isCurrentNestingDir = secondWordIndex + 1 === pathArray.length - 1

    if ( !isCurrentNestingDir || !pathArray[secondWordIndex] || pathArray[secondWordIndex] === fileName ) {
      break;
    }

    return pathArray[firstWordIndex] + firstCharToUpper(pathArray[secondWordIndex])
  }

  return basename(dirname(locallyPath))
}

export async function registerPartials(directoryPath: string, partialsMap: TPartials) {

  try {
    const partials = getFilesRecursively(directoryPath, '.hbs')
    const normalizedDirectoryPath = normalizePath(directoryPath);

    partials.forEach(partialPath => {
      let partialLocallyPath = partialPath.replace(normalizedDirectoryPath, '')
      partialLocallyPath = partialLocallyPath.startsWith('/') ? partialLocallyPath.replace('/', '') : partialLocallyPath

      const partialNameOptions: GetPartialNameOptions = {
        locallyPath: partialLocallyPath
      }

      const partialName = getPartialName(partialNameOptions)
      const content = readFileSync(partialPath, { encoding: 'utf8' })
      partialsMap.set(partialName, partialPath)
      handlebars.registerPartial(partialName, content)
    })
  } catch (e) {
    //@ts-ignore
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }
}