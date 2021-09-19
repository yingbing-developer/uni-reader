import Vue from 'vue';
import Router from './router.js';

const guard = new Router();
/**
 * 路由前置守卫
*/
guard.beforeEach((to, from, next) => {
	next();
});


/**
 * 路由后置守卫
*/
guard.afterEach((to, from) => {
});


/**
 * 报错钩子
*/
guard.onError((errMsg) => {
    console.log('my route-guards error: ' + errMsg);
});
export default guard;