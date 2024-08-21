export const InspectionSideBar = [
    {
        value: 'toInspect',
        label: '待我质检任务'
    }, {
        value: 'toSubmit',
        label: '待我提交任务'
    }, {
        value: 'finished',
        label: '我已完成任务'
    }, {
        value: 'cancelled',
        label: '已取消任务'
    }
];
// 路由与质检员子任务状态的映射关系
export const InspectionRouteStatusMap = {
    toInspect: 'TODO',
    toSubmit: 'TO_SUBMIT',
    finished: 'COMPLETED',
    cancelled: 'CANCELLED'
};
export const RouteInspectionStatusMap = {
    TODO: 'toInspect',
    TO_SUBMIT: 'toSubmit',
    COMPLETED: 'finished'
};
// 父任务中英文映射关系
export const TaskStatusMap = {
    TO_DRAW: '待抽取',
    TODO: '待开始',
    IN_PROGRESS: '进行中',
    TO_SUBMIT: '待提交',
    COMPLETED: '已完成',
    FAILED: '已失败',
    CANCELLED: '已取消'
};
// 父任务状态选项、状态主题
export const TaskStatusOptionMap = [
    {
        value: 'TO_DRAW',
        label: '待抽取',
        theme: 'gray'
    }, {
        value: 'TODO',
        label: '待开始',
        theme: 'red'
    }, {
        value: 'IN_PROGRESS',
        label: '进行中',
        theme: 'blue'
    }, {
        value: 'TO_SUBMIT',
        label: '待提交',
        theme: 'orange'
    }, {
        value: 'COMPLETED',
        label: '已完成',
        theme: 'green'
    }, {
        value: 'FAILED',
        label: '已失败',
        theme: 'red'
    }, {
        value: 'CANCELLED',
        label: '已取消',
        theme: 'gray'
    }
];
// 质检任务管理-按钮逻辑
export const TaskListOperationMap = {
    TO_DRAW: '取消',
    TODO: '取消',
    IN_PROGRESS: '取消',
    TO_SUBMIT: '下载质检结果',
    COMPLETED: '下载质检结果',
    FAILED: '下载质检结果',
    CANCELLED: '删除'
};
// 质检任务管理-子任务状态映射关系
export const TaskListInspectorTaskStatusOption = {
    TODO: {
        label: '待开始',
        theme: 'red'
    },
    IN_PROGRESS: {
        label: '进行中',
        theme: 'blue'
    },
    TO_SUBMIT: {
        label: '待提交',
        theme: 'orange'
    },
    COMPLETED: {
        label: '已完成',
        theme: 'green'
    }
};
export const TaskStatusThemeMap = {
    TO_DRAW: {
        label: '待抽取',
        theme: 'gray'
    },
    TODO: {
        label: '待开始',
        theme: 'red'
    },
    IN_PROGRESS: {
        label: '进行中',
        theme: 'blue'
    },
    TO_SUBMIT: {
        label: '待提交',
        theme: 'orange'
    },
    COMPLETED: {
        label: '已完成',
        theme: 'green'
    },
    FAILED: {
        label: '已失败',
        theme: 'red'
    },
    CANCELLED: {
        label: '已取消',
        theme: 'gray'
    }
};
// 质检工作台 - 质检员视角映射关系
export const InspectorTaskStatusMap = {
    TODO: '待我质检',
    TO_SUBMIT: '待我提交',
    COMPLETED: '我已完成',
    CANCELLED: '已取消任务'
};
export const InspectorTaskThemeMap = {
    TODO: 'red',
    TO_SUBMIT: 'orange',
    COMPLETED: 'green',
    CANCELLED: 'gray'
};
export const InspectorTicketStatusMap = {
    TODO: '待质检',
    COMPLETED: '已质检'
};
export const InspectorTicketOperationMap = {
    TODO: '去质检',
    COMPLETED: '查看'
};
export const InspectorTaskOptionBtnMap = {
    TODO: '去质检',
    COMPLETED: '下载质检结果',
    TO_SUBMIT: '提交质检结果'
};
export const InspectorTicketStatusOption = [
    {
        value: 'TODO',
        label: '待质检',
        theme: 'red'
    }, {
        value: 'COMPLETED',
        label: '已质检',
        theme: 'green'
    }
];

export const QualityFormBtnMap = {
    notLast: {
        ordinaryLabel: '确定',
        primaryLabel: '确定并质检下一条'
    },
    isLast: {
        ordinaryLabel: '',
        primaryLabel: '确定'
    },
    reInspect: {
        ordinaryLabel: '重新质检',
        primaryLabel: ''
    },
    unSubmitNotLastReInspect: {
        ordinaryLabel: '取消',
        primaryLabel: '确定修改'
    },
    unSubmitLastReInspect: {
        ordinaryLabel: '取消',
        primaryLabel: '确定修改'
    },
    submitedReInspect: {
        ordinaryLabel: '取消',
        primaryLabel: '确定修改并提交'
    }
};

export const QualityConfirmMap = {
    hasSubmited: {
        title: '确定修改并提交质检结果吗？',
        message: '点击确定后，重新质检工单生效，且系统会再次通过大象通知质检管理员和处理人下载查看相关工单的质检结果。',
        okText: '确定',
        cancelText: '取消'
    },
    notSubmit: {
        title: '您已完成该任务所有工单质检，但需要提交质检结果才能完成任务哦',
        message: '提交质检结果后，系统会通过大象通知质检管理员和处理人下载查看相关工单的质检结果。',
        okText: '提交质检结果',
        cancelText: '暂不提交'
    }
};
