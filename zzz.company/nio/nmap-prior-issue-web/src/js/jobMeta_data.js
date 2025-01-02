// Job表单
export let jobMetaFormData = {
    id: '',
    code: '',
    name: '',
    type: '',
    bucketCount: 1,
    taskMetaList: []
}

export let taskMetaFormData = {
    stage: '',
    type: '',
    coreEngineCode: '',
    parallelism: '',
    backoffLimit: '',
    timeout: '',
    initEngineCode: '',
    shareDir: ''
}

export let runInfoData = {
    stage: '',
    type: '',
    coreEngineCode: '',
    coreEngine: null,
    coreArgs: '',
    initEngineCode: '',
    initEngine: null,
    initArgs: ''
}

export let engineData = {
    image: '',
    command: '',
    gpu: '',
    workingDir: '',
    requestCpu: '',
    requestMemory: '',
    limitCpu: '',
    limitMemory: '',
    gpuCore: '',
    gpuMemory: '',
    resources: null,
    mountPath: '',
    subPath: '',
    envs: []
}

export let jobTypeOptions = [
    {name: "NORMAL", code: 'NORMAL'},
    {name: "FORK-JOIN", code: 'FORK-JOIN'}
]

export let workerTypeOptions = [
    {name: "simple-worker", code: 'simple-worker'},
    {name: "result-worker", code: 'result-worker'}
]

export let jobInstanceFormData = {
    uniqueId: '',
    jobCode: '',
    name: '',
    priority: '',
    type: '',
    runInfos: '',
}

export let instanceDetailData = {
    id: '',
    code: '',
    name: '',
    runArgs: '',
}

export let instanceStatusOptions = [
    {name: "排队中", code: "QUEUING"},
    {name: "运行中", code: "RUNNING"},
    {name: "已完成", code: "COMPLETED"},
    {name: "已失败", code: "FAILED"},
    {name: "已取消", code: "CANCELED"}
]

export let priorityOptions = [
    {name: "很低", code: 1},
    {name: "低", code: 2},
    {name: "正常", code: 3},
    {name: "高", code: 4},
    {name: "很高", code: 5},
]