// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import store from '../store'
import App from './App'
import router from './router'

import Dashboard from '@/components/Dashboard'
import RankUI from '@/components/RankUI'
import StoryRow from '@/components/StoryRow'

import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'


Vue.config.productionTip = false

Vue.component('icon', Icon)
Vue.component('rank-ui', RankUI)
Vue.component('story-row', StoryRow)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>'
})
