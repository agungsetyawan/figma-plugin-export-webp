import Vue from 'vue'
import App from './ui.vue'

import '@/assets/style/tailwind.css'
import 'preline/dist/hs-ui.bundle.js'

window.onload = () => {
  try {
    new Vue({
      el: '#app',
      render: h => h(App)
    })
  } catch (e) {}
}
