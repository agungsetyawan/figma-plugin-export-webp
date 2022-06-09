import Vue from 'vue'
import App from './ui.vue'

import 'preline/dist/hs-ui.bundle.js'
import '@/assets/style/tailwind.css'

window.onload = () => {
  new Vue({
    el: '#app',
    render: h => h(App)
  })
}
