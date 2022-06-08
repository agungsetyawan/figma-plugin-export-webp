import debounce from 'debounce-promise'
import { dispatch, handleEvent } from './codeMessageHandler'

export interface Images {
  id: string
  name: string
  bytes: Uint8Array
  type: string
  mimetype: string
}

const setImage = (id: string, name: string, bytes: Uint8Array) => {
  const PNG = {
    id,
    name,
    bytes,
    type: 'PNG',
    mimetype: 'image/png'
  }
  const SVG = {
    id,
    name,
    bytes,
    type: 'SVG',
    mimetype: 'image/svg+xml'
  }
  return { PNG, SVG }
}

const getImagesFromNode = async (nodes: ReadonlyArray<any>) => {
  try {
    const images: Array<Images> = []
    for (const node of nodes) {
      const { id, name, fills } = node
      if (fills && fills.length) {
        for (const fill of fills) {
          switch (fill.type) {
            case 'IMAGE': {
              const bytes = await figma
                .getImageByHash(fill.imageHash)
                .getBytesAsync()
              images.push(setImage(id, name, bytes).PNG)
              break
            }
            case 'SOLID': {
              const bytes = await node.exportAsync({ format: 'SVG' })
              images.push(setImage(id, name, bytes).SVG)
              break
            }
          }
        }
      } else {
        const bytes = await node.exportAsync({ format: 'SVG' })
        images.push(setImage(id, name, bytes).SVG)
      }
    }
    return images
  } catch (error) {
    console.error(error)
  }
}

const dispatchGetImages = async (): Promise<void> => {
  try {
    const { selection } = figma.currentPage
    if (!selection.length) return
    dispatch('getImages', await getImagesFromNode(selection))
  } catch (error) {
    console.error(error)
  }
}

const main = async (): Promise<void> => {
  try {
    figma.showUI(__html__, { height: 470 })
    dispatchGetImages()
    const debounced = debounce(dispatchGetImages, 2000)
    figma.on('selectionchange', () => debounced())

    // The following shows how messages from the UI code can be handled in the main code.
    handleEvent('createNode', () => {
      const node = figma.createRectangle()
      node.name = node.id
      // This shows how the main code can send messages to the UI code.
      dispatch('nodeCreated', node.id)
    })
  } catch (error) {
    console.error(error)
  }
}

main()
