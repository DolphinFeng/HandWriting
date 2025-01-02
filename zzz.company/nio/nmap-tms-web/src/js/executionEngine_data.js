export let quantityData = {
    cpu: '', memory: ''
}

export let resourceData = {
    requests: {...quantityData}, limits: {...quantityData}
}
export let formData = {
    id: '',
    code: '',
    name: '',
    image: '',
    command: '',
    workingDir: '',
    gpu: '',
    resources: null,
    requestCpu: '',
    requestMemory: '',
    limitCpu: '',
    limitMemory: '',
    gpuCore: '',
    gpuMemory: '',
    mountPath: '',
    subPath: ''
}

// Job列表表格
export let tableColumn = [{prop: 'code', label: 'Job编码', width: 50},]

export let engineEnvColumn = [{prop: 'name', label: '变量名', width: 200}, {
    prop: 'value',
    label: '变量值',
    width: 300
},]

export let envForm = {
    id: '', engineId: '', name: '', value: '',
}