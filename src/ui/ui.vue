<template lang="pug">
div
  div(v-if='images.length')
    .sticky-top(:class='errorMessage ? "fade-in" : ""')
      .flex
        .label.label--error {{ errorMessage }}
        .icon.icon--close.icon--white(@click='clearErrorMessage()')
    .image-list
      .section
        .section-title Images
        .section-container.column.align-items-start
          .image-items(v-for='image of imageList')
            .image-items__checkbox.checkbox
              input.checkbox__box(
                type='checkbox',
                :id='"checkboxImage" + image.id',
                v-model='image.checked',
                :disabled='processing'
              ) 
              label.checkbox__label(:for='"checkboxImage" + image.id')
            .image-items__picture
              img(:src='getImageBlob(image)')
            .image-items__size.type.pl-xxsmall {{ image.size | toMB }}MB
            .image-items__name.type.pl-xxsmall.pr-xxsmall {{ image.name }}
    .sticky-bottom
      .section
        .section-title Options
        .section-container.column
          .switch
            input#compressImage.switch__toggle(
              type='checkbox',
              v-model='isCompressImage',
              :disabled='processing'
            )
            label.switch__label(for='compressImage') Compress Image
          .flex.align-items-center
            .switch
              input#disableMiniImage.switch__toggle(
                type='checkbox',
                v-model='isDisableMiniImage',
                :disabled='processing'
              )
              label.switch__label(for='disableMiniImage') Disable Image
            .input.input--byte
              input.input__field(type='number', v-model='threshold')
              .type Bytes
      .section.pb-xxsmall
        .flex.justify-content-between.align-items-end
          .label {{ textLabel }}
          button.button.button--primary.mr-xxxsmall(
            :disabled='!hasImages || processing'
          )(
            @click='handleExport()'
          ) Export to .webp
            .icon.icon--spinner.icon--spin.icon--white(v-if='processing')
    //- button.button.button--primary(@click='createNode') Create a node
    //- p.type.type--small {{ message }}
  .section-container.section-container--empty(v-else)
    img(src='../assets/img/icon-webp.png', width='100px', height='100px')
    .type.type--large.justify-content-center Select image...
</template>

<script>
// Add these lines to import the interactive figma-ui components as needed.
import { selectMenu, disclosure } from 'figma-plugin-ds'
import { dispatch, handleEvent } from './uiMessageHandler'
import { zipImages, fetchConvert } from '../utils'

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
      isCompressImage: false,
      isDisableMiniImage: false,
      errorMessage: '',
      threshold: 200 // in Bytes
    }
  },
  mounted() {
    // Add these lines to initialize the interactive figma-ui components as needed.
    selectMenu.init()
    disclosure.init()

    // The following shows how messages from the main code can be handled in the UI code.
    handleEvent('nodeCreated', nodeID => {
      this.message = `Node ${nodeID} was created!`
    })

    handleEvent('getImages', images => {
      this.images = [
        ...images.map(image => {
          const size = image.bytes.byteLength
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
    textLabel() {
      return this.processing
        ? `Processing ${this.imagesCount} images`
        : `Selected ${this.imagesCount} images (${this.totalSize} MB)`
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
        this.processing = true
        this.clearErrorMessage()
        const zipImage = await zipImages(this.checkedImage)
        const outputFile = await fetchConvert(zipImage, this.isCompressImage)
        const file = window.URL.createObjectURL(outputFile)
        window.location.assign(file)
      } catch (error) {
        console.error(error)
        this.errorMessage = error
      } finally {
        this.processing = false
      }
    },
    getImageBlob(data) {
      const blob = new Blob([new Uint8Array(data.bytes)], {
        type: data.mimetype
      })
      return URL.createObjectURL(blob)
    },
    clearErrorMessage() {
      this.errorMessage = ''
    }
  },
  watch: {
    images() {
      this.clearErrorMessage()
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
      // padding: 0 calc(var(--size-xxsmall) / 2) 0 var(--size-xxsmall);
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
          // background-color: var(--silver);
          border-radius: var(--border-radius-med);
          object-fit: cover;
          width: 100%;
          height: 100%;
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
