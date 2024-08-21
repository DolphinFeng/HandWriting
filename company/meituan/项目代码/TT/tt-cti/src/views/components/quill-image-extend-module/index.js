/**
 *@description 观察者模式 全局监听富文本编辑器
 */
export const QuillWatch = {
    watcher: {}, // 登记编辑器信息
    active: null, // 当前触发的编辑器
    on: function (imageExtendId, ImageExtend) { // 登记注册使用了ImageEXtend的编辑器
        if (!this.watcher[imageExtendId]) {
            this.watcher[imageExtendId] = ImageExtend;
        }
    },
    emit: function (activeId, type = 1) { // 事件发射触发
        this.active = this.watcher[activeId];
        if (type === 1) {
            imgHandler();
        }
    }
};

/**
 * @description 图片功能拓展： 增加上传 拖动 复制
 */
export class ImageExtend {
    /**
     * @param quill {Quill}富文本实例
     * @param config {Object} options
     * config  keys: action, headers, editForm start end error  size response
     */
    constructor(quill, config = {}) {
        this.id = Math.random();
        this.quill = quill;
        this.quill.id = this.id;
        this.config = config;
        this.file = ''; // 要上传的图片
        this.imgURL = ''; // 图片地址
        quill.root.addEventListener('paste', this.pasteHandle.bind(this), false);
        // quill.root.addEventListener('drop', this.dropHandle.bind(this), false)
        quill.root.addEventListener('dropover', function (e) {
            e.preventDefault();
        }, false);
        this.cursorIndex = 0;
        QuillWatch.on(this.id, this);
    }

    /**
     * @description 粘贴
     * @param e
     */
    pasteHandle(e) {
        QuillWatch.emit(this.quill.id, 0);
        const clipboardData = e.clipboardData;
        let i = 0;
        let items, item, types;

        if (clipboardData) {
            items = clipboardData.items;

            if (!items) {
                return;
            }
            // console.log('items', items[0], items[1])
            item = items[0];
            types = clipboardData.types || [];

            for (; i < types.length; i++) {
                if (types[i] === 'Files') {
                    item = items[i];
                    break;
                }
            }
            // 纯图片的场景
            if (item && item.kind === 'file' && item.type.match(/^image\//i)) {
                // 如果是图片，要先阻止默认事件
                e.preventDefault();
                this.file = item.getAsFile();
                const self = this;
                // 如果图片限制大小
                if (self.config.size && self.file.size >= self.config.size * 1024 * 1024) {
                    if (self.config.sizeError) {
                        self.config.sizeError();
                    }
                    return;
                }
                if (this.config.action) {
                    setTimeout(() => {
                        this.uploadImg();
                    }, 0);
                } else {
                    QuillWatch.active.uploading();
                    QuillWatch.active.uploadSuccess();
                    // this.toBase64()
                }
            }
            // else if (item && item.kind === 'string') { // 图片标签复制（实际为文本格式）需要先下载再上传
            //     let fileGetData = clipboardData.getData('text/html');
            //     const imageUrls = this.getImageUrls(fileGetData);
            //     if (!imageUrls.length) return ;
            // }
        }
    }

    /**
     * 拖拽
     * @param e
     */
    dropHandle(e) {
        QuillWatch.emit(this.quill.id, 0);
        const self = this;
        e.preventDefault();
        // 如果图片限制大小
        if (self.config.size && self.file.size >= self.config.size * 1024 * 1024) {
            if (self.config.sizeError) {
                self.config.sizeError();
            }
            return;
        }
        self.file = e.dataTransfer.files[0]; // 获取到第一个上传的文件对象
        if (this.config.action) {
            setTimeout(() => {
                self.uploadImg();
            }, 0);
        }
        // else {
        //     self.toBase64()
        // }
    }

    /**
     * @description 将图片转为base4
     */
    toBase64() {
        const self = this;
        const reader = new FileReader();
        reader.onload = (e) => {
            // 返回base64
            self.imgURL = e.target.result;
            self.insertImg();
        };
        reader.readAsDataURL(self.file);
    }

    /**
     * @description 上传图片到服务器
     */
    uploadImg() {
        const self = this;
        const config = self.config;
        // 构造表单
        const formData = new FormData();
        formData.append(config.name, self.file);
        // 自定义修改表单
        if (config.editForm) {
            config.editForm(formData);
        }
        // 创建ajax请求
        const xhr = new XMLHttpRequest();
        xhr.open('post', config.action, true);
        // 如果有设置请求头
        if (config.headers) {
            config.headers(xhr);
        }
        if (config.change) {
            config.change(xhr, formData);
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr && xhr.status === 200) {
                    // success
                    const res = JSON.parse(xhr.responseText);
                    self.imgURL = config.response(res);
                    self.insertImg();
                    QuillWatch.active.uploadSuccess();
                    setTimeout(() => {
                        self.setCursorPosition();
                    }, 0);
                    if (self.config.success) {
                        self.config.success();
                    }
                } else {
                    // error
                    if (self.config.error) {
                        self.config.error();
                    }
                    QuillWatch.active.uploadError(xhr);
                }
            }
        };
        // 开始上传数据
        xhr.upload.onloadstart = function () {
            QuillWatch.active.uploading();
            // let length = (self.quill.getSelection() || {}).index || self.quill.getLength()
            // self.quill.insertText(length, '[uploading...]', { 'color': 'red'}, true)
            if (config.start) {
                config.start();
            }
        };
        // 上传过程
        xhr.upload.onprogress = function (e) {
            const complete = (e.loaded / e.total * 100 | 0) + '%';
            QuillWatch.active.progress(complete);
        };
        // 当发生网络异常的时候会触发，如果上传数据的过程还未结束
        xhr.upload.onerror = function () {
            QuillWatch.active.uploadError();
            if (config.error) {
                config.error();
            }
        };
        // 上传数据完成（成功或者失败）时会触发
        xhr.upload.onloadend = function () {
            if (config.end) {
                config.end();
            }
        };
        xhr.send(formData);
    }

    /**
     * @description 往富文本编辑器插入图片
     */
    insertImg() {
        const self = QuillWatch.active;
        self.quill.insertEmbed(QuillWatch.active.cursorIndex, 'image', self.imgURL);
        self.quill.update();
    }

    /**
     * @description 更新插入后位置
     */
    setCursorPosition() {
        const self = QuillWatch.active;
        self.quill.setSelection(self.cursorIndex + 1);
    }

    /**
     * @description 显示上传的进度
     */
    progress(pro) {
        pro = '[' + 'uploading' + pro + ']';
        QuillWatch.active.quill.root.innerHTML =
            QuillWatch.active.quill.root.innerHTML.replace(/\[uploading.*?\]/, pro);
    }

    /**
     * 开始上传
     */
    uploading() {
        const length = (QuillWatch.active.quill.getSelection() || {}).index || QuillWatch.active.quill.getLength();
        QuillWatch.active.cursorIndex = length;
        QuillWatch.active.quill.insertText(QuillWatch.active.cursorIndex, '[uploading...]', {}, true);
    }

    /**
     * 上传失败
     */
    uploadError(xhr) {
        const res = JSON.parse(xhr.responseText);
        const errText = res.data && res.data.errorMsg ? '图片上传失败：' + res.data.errorMsg : '[upload error]';
        QuillWatch.active.quill.root.innerHTML =
            QuillWatch.active.quill.root.innerHTML.replace(/\[uploading.*?\]/, errText);
    }

    uploadSuccess() {
        QuillWatch.active.quill.root.innerHTML =
            QuillWatch.active.quill.root.innerHTML.replace(/\[uploading.*?\]/, '');
    }
}

/**
 * @description 点击图片上传
 */
export function imgHandler() {
    let fileInput = document.querySelector('.quill-image-input');
    if (fileInput === null) {
        fileInput = document.createElement('input');
        fileInput.setAttribute('type', 'file');
        fileInput.classList.add('quill-image-input');
        fileInput.style.display = 'none';
        // 监听选择文件
        fileInput.addEventListener('change', function () {
            const self = QuillWatch.active;
            self.file = fileInput.files[0];
            fileInput.value = '';
            // 如果图片限制大小
            if (self.config.size && self.file.size >= self.config.size * 1024 * 1024) {
                if (self.config.sizeError) {
                    self.config.sizeError();
                }
                return;
            }
            if (self.config.action) {
                setTimeout(() => {
                    self.uploadImg();
                }, 0);
            }
            // else {
            //     self.toBase64()
            // }
        });
        document.body.appendChild(fileInput);
    }
    fileInput.click();
}

export function getImageUrls (fileGetData) {
    const imgReg = /<img.*?(?:>|\/>)/gi;
    // FIXME: 这个正则表达式里 ' 前面的 \ 反斜杠是不需要的
    // eslint-disable-next-line no-useless-escape
    const srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;

    const imgs = fileGetData.match(imgReg);
    const imgSrcs = imgs.map(img => {
        const imgItem = img.match(srcReg);
        return imgItem[1];
    });
    return imgSrcs;
}

/**
 *@description 全部工具栏
 */
export const container = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ header: 1 }, { header: 2 }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ direction: 'rtl' }],
    [{ size: ['small', false, 'large', 'huge'] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],
    ['clean'],
    ['link', 'image', 'video']
];
