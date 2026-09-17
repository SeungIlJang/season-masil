import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { startLiveUpdate } from './services/liveUpdate.js'

createApp(App).mount('#app')
void startLiveUpdate()
