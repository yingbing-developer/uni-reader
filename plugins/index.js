import Vue from "vue";
import { Route } from '@/plugins/router/router.js';
import Router from '@/plugins/router';
import Http from '@/plugins/request'
import Dom from '@/plugins/dom'
Vue.prototype.$http = Http;
Vue.prototype.$dom = Dom;
Vue.prototype.$Router = Router;
Vue.prototype.$Route = new Route();