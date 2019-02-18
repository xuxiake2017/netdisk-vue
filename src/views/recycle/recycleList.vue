<template>
  <div>
    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-form :inline="true" :model="filters" @submit.native.prevent @keyup.enter.native="handleSearch">
        <el-form-item>
          <el-input v-model="filters.fileRealName" placeholder="文件名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button plain type="primary" v-on:click="handleSearch">查询</el-button>
          <el-button plain type="primary" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <file-list
      :table-data="tableData"
      :filters="filters"
      :list-loading="listLoading"
      :searching="searching"
      @handle-current-change="handleCurrentChange"
      @reacquire-data="getRecycleList"
      @file-restore="fileRestore"
      type="recycle"
    >
    </file-list>
  </div>
</template>

<script>
import FileList from '../../components/fileList'
import { GetRecycleList, Reback } from '../../api/recycle'

export default {
  name: 'document',
  data () {
    return {
      filters: {
        fileRealName: ''
      },
      tableData: {
        pagination: {
          total: 0,
          pageNum: 1,
          pageSize: 20
        },
        rows: []
      },
      listLoading: false,
      searching: false
    }
  },
  components: {FileList},
  methods: {
    // 搜索
    handleSearch () {
      if (this.filters.fileRealName) {
        this.searching = true
        this.getRecycleList()
      }
    },
    // 搜索重置
    handleReset () {
      this.filters.fileRealName = '';
      this.tableData.pagination.pageNum = 1;
      this.getRecycleList();
    },
    // 获取文件列表
    getRecycleList () {
      let param = {
        ...this.filters, ...this.tableData.pagination
      };
      this.listLoading = true;
      // NProgress.start();
      GetRecycleList(param).then((res) => {
        this.tableData.pagination.total = res.data.total;
        this.tableData.pagination.pageNum = res.data.pageNum;
        this.tableData.rows = res.data.list;
        this.listLoading = false;
        // NProgress.done();
      }).catch(reason => {
        this.listLoading = false;
      });
    },
    // 文件还原
    fileRestore (index, row) {
      Reback({ recycleId: row.recycleId, fileSaveName: row.fileSaveName }).then(res => {
        this.$message({
          message: '文件还原成功！',
          type: 'success'
        });
        this.getRecycleList()
      })
    },
    // 分页页码改变
    handleCurrentChange (pageNum) {
      this.tableData.pagination.pageNum = pageNum;
      this.getRecycleList();
    }
  },
  mounted () {
    this.getRecycleList()
  }
}
</script>

<style scoped>

</style>
