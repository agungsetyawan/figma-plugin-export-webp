<template>
  <div class="container flex" v-if="images.length">
    <div class="sticky-top" :class="[{ 'fade-in': errorMessage }]">
      <div class="flex">
        <div class="label label--error">{{ errorMessage }}</div>
        <div
          class="icon icon--close icon--white"
          @click="clearErrorMessage()"
        ></div>
      </div>
    </div>
    <div class="image-list">
      <div class="section">
        <div class="section-title">Images</div>
        <div class="section-container column align-items-start">
          <div
            class="image-items"
            v-for="image of imageList"
            :key="'image' + image.id"
          >
            <div class="image-items__checkbox checkbox">
              <input
                class="checkbox__box"
                type="checkbox"
                :id="'checkboxImage' + image.id"
                v-model="image.checked"
                :disabled="processing"
              />
              <label class="checkbox__label" :for="'checkboxImage' + image.id">
              </label>
            </div>
            <div class="image-items__picture">
              <img :src="getImageBlob(image)" alt="image" />
            </div>
            <div class="image-items__size type pl-xxsmall">
              {{ image.size | toMB }}MB
            </div>
            <div class="image-items__name type pl-xxsmall pr-xxsmall">
              {{ image.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="sticky-bottom">
      <div class="section">
        <div class="section-title">Options</div>
        <div class="section-container column">
          <div class="switch">
            <input
              class="switch__toggle"
              id="compressImage"
              type="checkbox"
              v-model="isCompressImage"
              :disabled="processing"
            />
            <label class="switch__label" for="compressImage">
              Compress Image
            </label>
          </div>
          <div class="flex align-items-center">
            <div class="switch">
              <input
                class="switch__toggle"
                id="disableMiniImage"
                type="checkbox"
                v-model="isDisableMiniImage"
                :disabled="processing"
              />
              <label class="switch__label" for="disableMiniImage">
                Disable Image
              </label>
            </div>
            <div class="input input--byte">
              <input class="input__field" type="number" v-model="threshold" />
              <div class="type">Bytes</div>
            </div>
          </div>
        </div>
      </div>
      <div class="section pb-xxsmall">
        <div class="flex justify-content-between align-items-end">
          <div class="label" v-if="uploading">Uploading zip to convert</div>
          <div class="label" v-else-if="processing">
            Zipping {{ imagesCount }} images
          </div>
          <div class="label" v-else>
            Selected {{ imagesCount }}/{{ imageList.length }} images ({{
              totalSize
            }}
            MB)
          </div>
          <button
            class="button button--primary mr-xxxsmall"
            v-if="!processing || !uploading"
            :disabled="!hasImages || processing"
            @click="handleExport()"
          >
            {{ !processing ? 'Export to .webp' : 'Zipping' }}
            <div
              class="icon icon--spinner icon--spin icon--white"
              v-if="processing"
            ></div>
          </button>
          <button
            class="button button--secondary mr-xxxsmall"
            v-else-if="uploading"
            :disabled="!hasImages"
            @click="abortExport()"
            @mouseover="isUploadHovering = true"
            @mouseout="isUploadHovering = false"
            :class="{ 'button--secondary-destructive': isUploadHovering }"
          >
            {{ isUploadHovering ? 'Cancel' : 'Uploading' }}
            <div
              class="icon icon--close icon--red"
              v-if="isUploadHovering"
            ></div>
            <div class="icon icon--spinner icon--spin" v-else></div>
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="section-container section-container--empty" v-else>
    <img
      src="@/assets/img/icon-webp.png"
      width="100px"
      height="100px"
      alt="icon"
    />
    <div class="type type--large justify-content-center">Select image...</div>
  </div>
</template>

<script>
// Add these lines to import the interactive figma-ui components as needed.
// import { selectMenu, disclosure } from 'figma-plugin-ds'
import { dispatch, handleEvent } from './uiMessageHandler'
import { zipImages, fetchConvert } from '../utils'

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
      threshold: 200, // in Bytes,
      isUploadHovering: false
    }
  },
  mounted() {
    // Add these lines to initialize the interactive figma-ui components as needed.
    // selectMenu.init()
    // disclosure.init()

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
              checked: this.isDisableMiniImage ? size >= this.threshold : true,
              size
            }
          })
        ]
    })
  },
  computed: {
    imageList() {
      return this.images.filter(image =>
        this.isDisableMiniImage ? image.size >= this.threshold : true
      )
    },
    checkedImage() {
      return this.images.filter(image => image.checked)
    },
    imagesCount() {
      return this.checkedImage.length
    },
    hasImages() {
      return this.imagesCount > 0
    },
    totalSize() {
      const size = this.checkedImage.reduce(
        (total, image) => total + image.bytes.byteLength,
        0
      )
      return (size / 1048576).toFixed(2)
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
        const zipImage = await zipImages(this.checkedImage)

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
    }
  }
}
</script>

<style lang="scss">
@import '~figma-plugin-ds/dist/figma-plugin-ds';

::-webkit-scrollbar {
  width: 5px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.image-list {
  padding-bottom: 155px;
}

.section {
  &:not(:first-child) {
    border-top: 1px solid var(--silver);
    margin-top: 8px;
    padding-top: 8px;
  }

  &-container {
    width: 100%;
    display: flex;
    cursor: default;
    user-select: none;

    &--empty {
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
  }
}

.image {
  &-items {
    display: flex;
    align-items: center;
    width: 100%;
    padding: var(--size-xxsmall) 0;
    border-top: 1px solid var(--silver);

    &:first-child {
      border-top: none;
      padding-top: 0;
    }

    &__name {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    &__picture {
      min-width: 48px;
      min-height: 48px;
      height: 48px;
      width: 48px;

      img {
        border-radius: var(--border-radius-med);
        object-fit: contain;
        width: 100%;
        height: 100%;
        border: 0.1px solid var(--silver);
        background-color: var(--silver);
      }
    }
  }
}

.label {
  &--error {
    color: var(--silver);
  }
}

.input {
  &--byte {
    display: flex;
    width: 100px;
    align-items: center;
  }
}

.sticky-bottom {
  position: fixed;
  width: 100%;
  bottom: 0;
  background-color: var(--white);
  border-top: 1px solid var(--silver);

  .container {
    display: flex;
    margin: 8px;
    justify-content: flex-end;
  }
}

.sticky-top {
  position: absolute;
  top: -50px;
  width: 100%;
  z-index: 2;
  background-color: var(--red);
  transition: all 0.5s;

  &.fade-in {
    position: sticky;
    top: 0;
  }
}
</style>
