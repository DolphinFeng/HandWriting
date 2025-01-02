<template>
	<!-- 搜索工具栏组件 -->
	<div id="ColloctTaskTool" :loading="parkingLoading">
		<el-form inline :data="collectTaskForm" ref="form" @submit.prevent="onSearch">
			<el-form-item label="业务场景类型：" name="businessType">
				<el-select v-model.trim="collectTaskForm.businessType" placeholder="请选择业务类型（必填）"
					@change="chageSearchBusinessType" style="width: 160px">
					<el-option v-for="item in businessTypeOptions" :key="item.name" :label="item.desc" :value="item.name">
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="业务场景id：" name="businessId">
				<el-input v-model="collectTaskForm.businessId" placeholder="请输入业务场景id" style="width: 160px;"
					clearable></el-input>
			</el-form-item>
			<el-form-item label="采集任务类型：" name="collectTaskType">
				<el-select v-model="collectTaskForm.collectTaskType" placeholder="请选择采集任务类型" clearable style="width: 160px">
					<el-option v-for="item in collectTypeOptions" :key="item.name" :label="item.desc"
						:value="item.name"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="采集平台编号：" name="collectTaskId">
				<el-input v-model="collectTaskForm.collectTaskId" placeholder="请输入采集平台编号" style="width: 160px;" clearable></el-input>
			</el-form-item>
			<el-form-item label="采集状态：" prop="collectTaskStatus">
				<el-select v-model="collectTaskForm.collectTaskStatus" placeholder="请选择一个采集状态" clearable style="width: 160px">
					<el-option v-for="item in taskStatusOptions" :key="item.name" :label="item.desc"
						:value="item.name"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="地图版本:" name="mapVsn">
				<el-input v-model="collectTaskForm.mapVsn" placeholder="请输入地图版本" style="width: 160px;" clearable></el-input>
			</el-form-item>

			<div>
				<el-button :icon="Search" type="primary" native-type="submit" class="button_style">查询</el-button>
				<el-button :icon="Refresh" @click="reSet" class="button_style">重置</el-button>
				<el-button type="success" @click="exportDetail"  >下载</el-button>
			</div>
		</el-form>
		<div>

		</div>
	</div>
</template>

<script>
// 引入js数据
import { Search, Refresh, FolderAdd, UploadFilled } from "@element-plus/icons-vue";

export default {
	name: "CollectTaskTool",
	// 接收父组件传来的参数
	props: {
		collectTaskForm: Object,
		colloctTaskTypeOptions: Array,
		collectTypeOptions: Array,
		businessTypeOptions: Array,
		taskStatusOptions: Array,
		parkingOptions: Array,
		parkingLoading: Boolean,
	},
	data() {
		return {
		}
	},
	setup() {
		return {
			Search, Refresh, FolderAdd, UploadFilled,
		}
	},
	methods: {

		// 筛选查询功能
		onSearch() {
			this.$emit('onSearch')
		},

		// 重置功能
		reSet() {
			this.$emit('reSet')
		},
		// 触发云端建图
		startPipline() {
			this.$emit('startPipline')
		},
		chageSearchBusinessType(query) {
			this.$emit('chageSearchBusinessType', query)
		},

		exportDetail(){
			this.$emit('exportDetail')
		}
	}
}
</script>

<style scoped>
#ColloctTaskTool {
	padding: 5px 0 5px 20px;
	text-align: left;
	color: black;
	font-size: 15px;
}

.el-form-item {
	margin-bottom: 10px;
}
</style>
