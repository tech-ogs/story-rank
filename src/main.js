// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import store from '../store'
import App from './App'

import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import Dashboard from '@/components/Dashboard'
import Rankbar from '@/components/Rankbar'
import Rankbutton from '@/components/Rankbutton'
import StoryRow from '@/components/StoryRow'
import StoryDetail from '@/components/StoryDetail'

import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'

import Vue2TouchEvents from 'vue2-touch-events'
 

Vue.config.productionTip = false

Vue.use(BootstrapVue);
Vue.use(Vue2TouchEvents,{
	swipeTolerance: 60,
	tapTolerance: 10
})

Vue.component('dashboard', Dashboard)
Vue.component('icon', Icon)
Vue.component('rank-bar', Rankbar)
Vue.component('rank-button', Rankbutton)
Vue.component('story-row', StoryRow)
Vue.component('story-detail', StoryDetail)


/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  components: { App },
  template: '<App/>'
})
