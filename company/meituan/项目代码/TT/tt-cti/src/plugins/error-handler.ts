import Vue from 'vue';

function formatComponentName (vm: { [key: string]: any }): string {
    if (vm.$root === vm) return 'root instance';
    const name = vm._isVue ? vm.$options.name || vm.$options._componentTag : vm.name;
    return (name ? `component <${name}>` : 'anonymous component') + (vm._isVue && vm.$options.__file ? ` at ${vm.$options.__file}` : '');
}

function extractVueSnapshot (vm: { [key: string]: any }) {
    const data: any = {};
    if (vm && Object.prototype.toString.call(vm) === '[object Object]') {
        data.componentName = formatComponentName(vm);
        data.componentProps = vm.$options.propsData;
        data.componentData = vm.$data;
    }
    return data;
}

export const handleError = function (error: Error, option?: object) {
    window.owl && window.owl('addError', error, option);
    if (process.env.NODE_ENV !== 'production') {
        console.error(error);
        console.log(option);
    }
};

const OwlErrorHandlePlugin = {
    install(_Vue: any) {
        _Vue.config.errorHandler = (
            error: Error,
            vm: { [key: string]: any },
            info: string
        ) => {
            const extra = extractVueSnapshot(vm);
            extra.lifecycleHook = info;
            window.Logan && window.Logan.log(`${JSON.stringify(extra)}`, 'owl');
            handleError(error);
        };
        _Vue.prototype.$handleError = function (error: Error, option?: object) {
            handleError(error, option);
        };
    }
};

Vue.use(OwlErrorHandlePlugin);

export default OwlErrorHandlePlugin;
