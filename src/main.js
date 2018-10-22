// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import store from '../store'
import App from './App'

import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import Banner from '@/components/Banner'
import Dashboard from '@/components/Dashboard'
import Detail from '@/components/Detail'
import Rankbar from '@/components/Rankbar'
import Rankbutton from '@/components/Rankbutton'
import StoryRow from '@/components/StoryRow'
import StoryDetail from '@/components/StoryDetail'
import ModalDialog from '@/components/ModalDialog'
import AdminMenu from '@/components/AdminMenu'
import ElectionDetail from '@/components/ElectionDetail'
import ElectionList from '@/components/ElectionList'
import ElectionRow from '@/components/ElectionRow'
import VoterList from '@/components/VoterList'
import ProfileMenu from '@/components/ProfileMenu'
import MyProfile from '@/components/MyProfile'
import AdminHeader from '@/components/AdminHeader'
import AdminFooter from '@/components/AdminFooter'

import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'

import Vue2TouchEvents from 'vue2-touch-events'
 

Vue.config.productionTip = false

Vue.use(BootstrapVue);
Vue.use(Vue2TouchEvents,{
	swipeTolerance: 60
})

Vue.component('banner', Banner)
Vue.component('dashboard', Dashboard)
Vue.component('detail', Detail)
Vue.component('icon', Icon)
Vue.component('rank-bar', Rankbar)
Vue.component('rank-button', Rankbutton)
Vue.component('story-row', StoryRow)
Vue.component('story-detail', StoryDetail)
Vue.component('modal-dialog', ModalDialog)
Vue.component('admin-menu', AdminMenu)
Vue.component('election-detail', ElectionDetail)
Vue.component('election-list', ElectionList)
Vue.component('election-row', ElectionRow)
Vue.component('voter-list', VoterList)
Vue.component('profile-menu', ProfileMenu)
Vue.component('my-profile', MyProfile)
Vue.component('admin-header', AdminHeader)
Vue.component('admin-footer', AdminFooter)


/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  components: { App },
  template: '<App/>'
})
