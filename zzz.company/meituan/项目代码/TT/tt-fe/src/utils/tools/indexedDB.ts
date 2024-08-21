import * as api from '@/api';

const dbName = 'ttCtiTreeDB';

export function getDataFromDb (ctiVersion, options: any = {
    scope: '',
    space: ''
}) {
    return new Promise(async (resolve, reject) => {
        let trees = [];
        const { space } = options;
        // 如果浏览器不支持indexedDB
        if (!window.indexedDB) {
            trees = await getTrees(options);
            resolve(trees);
            return ;
        }
        // 如果version为0，则为外部用户，必须通过接口拉取tree
        if (ctiVersion === 0) {
            trees = await getTrees(options);
            resolve(trees);
        } else {
            let DBOpenRequest = window.indexedDB.open(dbName);
            let db = null;
            DBOpenRequest.onsuccess = async (e) => {
                db = e.target.result;
                let objectStore = db.transaction(dbName).objectStore(dbName);
                objectStore.openCursor().onsuccess = async (e) => {
                    let transaction = db.transaction([dbName], 'readwrite');
                    let objectStoreRequest = transaction.objectStore(dbName).get(space);
                    objectStoreRequest.onsuccess = async (e) => {
                        const oldData = objectStoreRequest.result;
                        const oldVersion = oldData && oldData.version;
                        if (oldVersion && ctiVersion && oldVersion === ctiVersion) {
                            resolve(oldData.tree);
                        } else {
                            let trees = await getTrees(options);
                            resolve(trees);
                            // 新启一个transaction，存库
                            let newTransaction = db.transaction([dbName], 'readwrite');
                            newTransaction.objectStore(dbName).put({
                                version: ctiVersion,
                                tree: trees,
                                space: space
                            });
                        }
                    };
                    objectStoreRequest.onerror = async (e) => {
                        let trees = await getTrees(options);
                        resolve(trees);
                        let transaction = db.transaction([dbName], 'readwrite');
                        transaction.objectStore(dbName).put({
                            version: ctiVersion,
                            tree: trees,
                            space: space
                        });
                    };
                };
            };
            DBOpenRequest.onerror = async (e) => {
                console.log('Error opening db', e);
                // reject('Error');
                // 如果数据库打开失败，则返回请求所得的tree
                let trees = await getTrees(options);
                resolve(trees);
            };
            DBOpenRequest.onupgradeneeded = async (e) => {
                db = e.target.result;
                db.createObjectStore(dbName, { keyPath: 'space' });
            };
        }
    });
}

async function getCategoryTree (scope?) {
    const res: Ajax.AxiosResponse = await api.ctiApi.getCategoryTree({
        scope: scope
    });
    const trees = res.data.items;
    return trees;
}
async function getSpaceTree () {
    const res: Ajax.AxiosResponse = await api.spaceApi.getSpaceCti();
    const trees = res.data.items;
    return trees;
}
async function getTrees (options: any) {
    const { scope } = options;
    if (options.space === 'ALL') {
        return getCategoryTree(scope);
    } else {
        return getSpaceTree();
    }
}
