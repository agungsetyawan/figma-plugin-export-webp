import JSZip from 'jszip/dist/jszip.min.js'

export interface Images {
  id: string
  name: string
  bytes: Uint8Array
  type: string
  mimetype: string
}

export const zipImages = (images: Array<Images>): Promise<string> => {
  return new Promise((resolve, reject) => {
    const zip = new JSZip()

    for (const image of images) {
      const { bytes, name, type, mimetype } = image
      const extension = type.toLowerCase()
      const blob = new Blob([new Uint8Array(bytes)], { type: mimetype })
      zip.file(`${name}.${extension}`, blob, { base64: true })
    }

    zip
      .generateAsync({ type: 'base64' })
      .then(content => resolve(content))
      .catch(err => reject(err))
  })
}

export const fetchConvert = (
  file: string,
  compress: boolean = false,
  signal: AbortSignal
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const body = { file, compress }
    const params = new URLSearchParams()
    for (const key in body) {
      params.append(key, body[key])
    }

    const url = 'https://setyawan.api.stdlib.com/convert-webp@dev/convert'
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params,
      signal
    })
      //   .then(response => {
      //     response.ok
      //       ? resolve(response.blob())
      //       : reject(`API: ${response.json().error.message}`)
      //   })
      .then(res => resolve(res.blob()))
      .catch(err => reject(err))
  })
}
