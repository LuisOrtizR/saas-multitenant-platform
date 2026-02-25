import 'vfonts/Lato.css'
import 'vfonts/FiraCode.css'

import { createApp, h } from 'vue'
import { createPinia } from 'pinia'
import naive, {
  NMessageProvider
} from 'naive-ui'

import App from './App.vue'
import router from './router'

const app = createApp({
  render() {
    return h(NMessageProvider, null, {
      default: () => h(App)
    })
  }
})

app.use(createPinia())
app.use(router)
app.use(naive)
app.mount('#app')
