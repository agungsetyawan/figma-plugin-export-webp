import { dispatch, handleEvent } from './codeMessageHandler'
export interface Images {
  id: string
  name: string
  bytes: Uint8Array
  type: string
  mimetype: string
}

const getImages = async (nodes: ReadonlyArray<any>) => {
  try {
    const images: Array<Images> = []
    for (const node of nodes) {
      for (const fill of node.fills) {
        const { id, name } = node
        switch (fill.type) {
          case 'IMAGE':
            images.push({
              id,
              name,
              bytes: await figma.getImageByHash(fill.imageHash).getBytesAsync(),
              type: 'PNG',
              mimetype: 'image/png'
            })
            break
          case 'SOLID':
            images.push({
              id,
              name,
              bytes: await node.exportAsync({ format: 'SVG' }),
              type: 'SVG',
              mimetype: 'image/svg+xml'
            })
            break
        }
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
    const images = await getImages(selection)
    dispatch('getImages', images)
  } catch (error) {
    console.error(error)
  }
}

const main = async (): Promise<void> => {
  try {
    figma.showUI(__html__, { height: 450 })
    await dispatchGetImages()
    figma.on('selectionchange', async () => {
      await dispatchGetImages()
    })

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
