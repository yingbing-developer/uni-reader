import Vue from "vue";
import Utils from './util.js';
import Config from './config.js';
import Business from './business.js';

Vue.prototype.$utils = Utils;
Vue.prototype.$config = Config;
Vue.prototype.$business = Business;