declare global {
    interface Navigator {
        userLanguage: string;
    }
}

declare module 'vue/types/vue' {
    interface VueConstructor {
        $getText: any;
        $i18nClient: any;
    }

    interface Vue {
        $getText: any;
        $i18nClient: any;
    }
}

export { };
