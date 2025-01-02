import axios from "axios";
import { ElMessage } from "element-plus";
import router from "../router/index";
import store from "../store";

function createAxiosInstance(baseURL) {
    const instance = axios.create({
        baseURL: baseURL,
        timeout: 10000,
    });

    instance.interceptors.request.use((config: any) => {
        config.headers.Authorization = store.state.token;
        return config;
    });

    instance.interceptors.response.use((res: any) => {
        if (res.data.msg === '登录过期，请重新登录' || res.data.code === 4003) {
            ElMessage.error(res.data.msg ?? '登录过期，请重新登录');
            sessionStorage.removeItem('token');
            router.replace({ path: '/login' });
            return Promise.reject();
        }
        return Promise.resolve(res);
    });

    return instance;
}

const ticketRequest = createAxiosInstance((window as any).api.ticketURL);
const taskRequest = createAxiosInstance((window as any).api.taskURL);
const positionManRequest = createAxiosInstance((window as any).api.positionManURL);
const executorRequest = createAxiosInstance((window as any).api.executorURL);
const receiverRequest = createAxiosInstance((window as any).api.receiverURL);

export { ticketRequest, taskRequest, positionManRequest, executorRequest, receiverRequest };