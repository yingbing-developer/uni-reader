import Vue from 'vue'
import App from './App'
import store from './store'//引入vuex
import '@/plugins'
import '@/assets/js'
import api from '@/assets/api'

Vue.config.productionTip = false

Vue.prototype.$api = api

App.mpType = 'app'

const app = new Vue({
    ...App,
	store
})
app.$mount()
