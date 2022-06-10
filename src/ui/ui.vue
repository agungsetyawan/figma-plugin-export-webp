<template>
  <div
    v-if="images.length"
    class="container text-xs"
  >
    <div
      v-if="errorMessage"
      class="container sticky top-0 bg-red-500 text-white rounded-md p-4 z-10"
      role="alert"
    >
      <span class="font-bold">Error</span> {{ errorMessage }}
    </div>
    <div class="container pb-44">
      <div class="flex flex-col">
        <div class="overflow-x-auto">
          <div class="min-w-full inline-block align-middle">
            <div class="border rounded-lg overflow-hidden dark:border-gray-700">
              <table
                class="table-fixed min-w-full divide-y divide-gray-200 dark:divide-gray-700"
                aria-label="images"
              >
                <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      class="py-2 pl-3 w-1/12 sticky top-0"
                    >
                      <div class="flex items-center h-5">
                        <input
                          id="isSelectAll"
                          type="checkbox"
                          class="border-gray-200 rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                          v-model="isSelectAll"
                          @click="handleSelectAll()"
                        />
                        <label
                          for="isSelectAll"
                          class="sr-only"
                        >
                          Checkbox
                        </label>
                      </div>
                    </th>
                    <th
                      scope="col"
                      class="px-2 py-2 pl-4 w-3/12 sticky top-0 text-xs text-gray-500 uppercase text-left"
                    >
                      Image
                    </th>
                    <th
                      scope="col"
                      class="px-2 py-2 w-2/12 sticky top-0 text-xs text-gray-500 uppercase text-left"
                    >
                      Size
                    </th>
                    <th
                      scope="col"
                      class="px-2 py-2 w-3/12 sticky top-0 text-xs text-gray-500 uppercase text-left"
                    >
                      Name
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr
                    v-for="image of imageList"
                    :key="'images' + image.id"
                    class="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <td class="py-2 pl-3">
                      <div class="flex items-center h-5">
                        <input
                          :id="'checkboxImage' + image.id"
                          v-model="image.checked"
                          :disabled="processing"
                          type="checkbox"
                          class="border-gray-200 rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                        />
                        <label
                          :for="'checkboxImage' + image.id"
                          class="sr-only"
                        >
                          Checkbox
                        </label>
                      </div>
                    </td>
                    <td class="px-2 py-2 pl-4">
                      <div class="min-w-12 min-h-12 w-12 h-12">
                        <img
                          class="bg-gray-200 rounded-md object-contain w-full h-full"
                          :src="getImageBlob(image)"
                          alt="image"
                          loading="lazy"
                        />
                      </div>
                    </td>
                    <td class="px-2 py-2 text-xs text-gray-800 dark:text-gray-200">
                      {{ image.size | toMB }}MB
                    </td>
                    <td class="px-2 py-2 text-xs text-gray-800 dark:text-gray-200 text-ellipsis overflow-hidden whitespace-nowrap max-w-0">
                      {{ image.name }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="fixed bottom-0 p-3 border-t dark:border-gray-700 bg-primary">
      <div class="container options mb-2">
        <label class="block text-sm font-medium mb-2 text-gray-800 dark:text-gray-500">
          Options
        </label>
        <div class="flex flex-col">
          <div class="flex mb-1 h-8">
            <div class="flex items-center">
              <input
                type="checkbox"
                id="compressImage"
                class="relative shrink-0 w-11 h-6 bg-gray-100 checked:bg-none checked:bg-blue-600 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 ring-1 ring-transparent focus:border-blue-600 focus:ring-blue-600 ring-offset-white focus:outline-none appearance-none dark:bg-gray-700 dark:checked:bg-blue-600 dark:focus:ring-offset-gray-800 before:inline-block before:w-5 before:h-5 before:bg-white checked:before:bg-blue-200 before:translate-x-0 checked:before:translate-x-full before:shadow before:rounded-full before:transform before:ring-0 before:transition before:ease-in-out before:duration-200 dark:before:bg-gray-400 dark:checked:before:bg-blue-200"
                v-model="isCompressImage"
                :disabled="processing"
              />
              <label
                for="compressImage"
                class="text-xs text-gray-500 ml-3 dark:text-gray-400"
              >
                Compress Image
              </label>
            </div>
          </div>
          <div class="flex justify-between mb-1 h-8">
            <div class="flex items-center">
              <input
                type="checkbox"
                id="disableMiniImage"
                class="relative shrink-0 w-11 h-6 bg-gray-100 checked:bg-none checked:bg-blue-600 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 ring-1 ring-transparent focus:border-blue-600 focus:ring-blue-600 ring-offset-white focus:outline-none appearance-none dark:bg-gray-700 dark:checked:bg-blue-600 dark:focus:ring-offset-gray-800 before:inline-block before:w-5 before:h-5 before:bg-white checked:before:bg-blue-200 before:translate-x-0 checked:before:translate-x-full before:shadow before:rounded-full before:transform before:ring-0 before:transition before:ease-in-out before:duration-200 dark:before:bg-gray-400 dark:checked:before:bg-blue-200"
                v-model="isDisableMiniImage"
                :disabled="processing"
              />
              <label
                for="disableMiniImage"
                class="text-xs text-gray-500 ml-3 dark:text-gray-400"
              >
                Disable Image
              </label>
            </div>
            <div class="relative w-2/5">
              <input
                type="number"
                class="block py-2 px-4 pr-16 w-full border-gray-200 shadow-sm rounded-md text-xs focus:z-10 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 text-gray-500 dark:text-gray-400 appearance-none"
                placeholder="0"
                v-model="maxSize"
              />
              <div class="absolute pr-1 inset-y-0 right-0 flex items-center text-gray-500 dark:text-gray-400">
                <label
                  for="sizeType"
                  class="sr-only"
                >
                  Size Type
                </label>
                <select
                  id="sizeType"
                  name="sizeType"
                  class="block py-1.5 w-full border-transparent rounded-md focus:ring-blue-600 focus:border-blue-600 dark:bg-gray-800"
                  v-model="sizeType"
                >
                  <option value="B">Bytes</option>
                  <option value="KB">KB</option>
                  <option value="MB">MB</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="container action">
        <div class="flex justify-between items-end">
          <label
            v-if="uploading"
            class="w-full mr-1 text-gray-500 dark:text-gray-400"
          >
            Uploading zip to convert
          </label>
          <label
            v-else-if="processing"
            class="w-full mr-1 text-gray-500 dark:text-gray-400"
          >
            Zipping {{ selectedImagesCount }} images
          </label>
          <label
            v-else
            class="w-full mr-1 text-gray-500 dark:text-gray-400"
          >
            Selected {{ selectedImagesCount }}/{{ imageListCount }} images ({{
              totalSize
            }}
            MB)
          </label>
          <button
            v-if="!processing || !uploading"
            type="button"
            class="py-2 px-3 w-3/5 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all text-xs"
            :disabled="!hasSelectedImage || processing"
            @click="handleExport()"
          >
            <span
              v-if="processing"
              class="animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent text-white rounded-full"
              role="status"
              aria-label="loading"
            />
            {{ !processing ? 'Export to .webp' : 'Zipping' }}
          </button>

          <button
            v-else-if="uploading"
            type="button"
            class="py-2 px-3 w-3/5 inline-flex justify-center items-center gap-2 rounded-md border border-gray-200 font-semibold text-blue-500 hover:text-white hover:bg-red-500 hover:border-red-500 transition-all text-xs dark:border-gray-700 dark:hover:border-red-500"
            :disabled="!hasSelectedImage"
            @click="abortExport()"
            @mouseenter="isUploadHovering = true"
            @mouseleave="isUploadHovering = false"
          >
            <span
              v-if="!isUploadHovering"
              class="animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent text-blue-500 rounded-full"
              role="status"
              aria-label="loading"
            />
            {{ isUploadHovering ? 'Cancel' : 'Uploading' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div
    v-else
    class="flex flex-col items-center justify-center h-full"
  >
    <img
      src="@/assets/img/icon-webp.png"
      width="100px"
      height="100px"
      alt="icon"
    />
    <label class="block text-sm font-medium mt-2 text-gray-800 dark:text-gray-200">Select image...</label>
  </div>
</template>

<script>
import { dispatch, handleEvent } from '@/utils/ui-message-handler'
import { zipImages, fetchConvert } from '@/utils/image-process'

let controller

export default {
  filters: {
    toMB(size) {
      return (size / 1048576).toFixed(2)
    }
  },
  data() {
    return {
      message: '',
      images: [],
      processing: false,
      uploading: false,
      isCompressImage: false,
      isDisableMiniImage: false,
      errorMessage: '',
      isUploadHovering: false,
      isSelectAll: true,
      maxSize: 200, // in Bytes,
      sizeType: 'B'
    }
  },
  mounted() {
    if (document.querySelector('html').classList.contains('figma-dark')) {
      document.querySelector('html').classList.add('dark')
    }

    // The following shows how messages from the main code can be handled in the UI code.
    handleEvent('nodeCreated', nodeID => {
      this.message = `Node ${nodeID} was created!`
    })

    handleEvent('getImages', images => {
      if (!this.processing)
        this.images = [
          ...images?.map(image => {
            const size = image.bytes?.byteLength
            return {
              ...image,
              checked: this.checkedImage(size),
              size
            }
          })
        ]
    })
  },
  computed: {
    imageList() {
      return this.images.filter(image => this.checkedImage(image.size))
    },
    imageListCount() {
      return this.imageList.length
    },
    selectedImages() {
      return this.images.filter(image => image.checked)
    },
    selectedImagesCount() {
      return this.selectedImages.length
    },
    hasSelectedImage() {
      return this.selectedImagesCount > 0
    },
    totalSize() {
      const size = this.selectedImages.reduce(
        (total, image) => total + image.bytes.byteLength,
        0
      )
      return (size / 1048576).toFixed(2)
    },
    threshold() {
      switch (this.sizeType) {
        case 'KB':
          return this.maxSize * 1024
        case 'MB':
          return this.maxSize * 1048576
        default:
          return this.maxSize
      }
    }
  },
  methods: {
    createNode() {
      // This shows how the UI code can send messages to the main code.
      dispatch('createNode')
    },
    async handleExport() {
      try {
        controller = new AbortController()
        this.clearErrorMessage()
        this.processing = true
        const zipImage = await zipImages(this.selectedImages)

        this.uploading = true
        const outputFile = await fetchConvert(
          zipImage,
          this.isCompressImage,
          controller.signal
        )
        const file = window.URL.createObjectURL(outputFile)
        window.location.assign(file)
      } catch (error) {
        console.error(error)
        this.errorMessage = error
      } finally {
        this.resetProcessState()
      }
    },
    abortExport() {
      controller.abort()
      this.resetProcessState()
    },
    getImageBlob(data) {
      const blob = new Blob([new Uint8Array(data.bytes)], {
        type: data.mimetype
      })
      return URL.createObjectURL(blob)
    },
    clearErrorMessage() {
      this.errorMessage = ''
    },
    resetProcessState() {
      this.processing = false
      this.uploading = false
    },
    handleSelectAll() {
      this.isSelectAll = !this.isSelectAll
      if (this.isSelectAll) {
        this.images.forEach(
          image => (image.checked = this.checkedImage(image.size))
        )
        return
      }
      this.images.forEach(image => (image.checked = false))
    },
    checkedImage(imageSize) {
      return this.isDisableMiniImage ? imageSize >= this.threshold : true
    },
    setSelectAll() {
      this.isSelectAll = this.selectedImagesCount === this.imageListCount
    }
  },
  watch: {
    images() {
      this.clearErrorMessage()
      this.resetProcessState()
    },
    isDisableMiniImage() {
      this.images.forEach(image => {
        if (image.size < this.threshold) {
          image.checked = false
        }
      })
    },
    imageListCount() {
      this.setSelectAll()
    },
    selectedImagesCount() {
      this.setSelectAll()
    }
  }
}
</script>

<style lang="scss" scoped>
  .bg-primary {
    background-color: var(--figma-color-bg);
  }
</style>
