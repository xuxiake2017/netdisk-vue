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
      @reacquire-data="getShareList"
      @copy-link="copyLink"
      type="share"
    >
    </file-list>
  </div>
</template>

<script>
import FileList from '../../components/fileList'
import { FindAll } from '../../api/share'
import ClipBoard from 'clipboard'

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
        serverHost: '',
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
        this.getShareList()
      }
    },
    // 搜索重置
    handleReset () {
      this.filters.fileRealName = '';
      this.tableData.pagination.pageNum = 1;
      this.getShareList();
    },
    // 获取文件列表
    getShareList () {
      let param = {
        ...this.filters, ...this.tableData.pagination
      };
      this.listLoading = true;
      // NProgress.start();
      FindAll(param).then((res) => {
        this.tableData.serverHost = res.data.serverHost
        this.tableData.pagination.total = res.data.pageInfo.total
        this.tableData.pagination.pageNum = res.data.pageInfo.pageNum
        this.tableData.rows = res.data.pageInfo.list
        this.listLoading = false
        // NProgress.done();
      }).catch(reason => {
        this.listLoading = false
      });
    },
    // 分页页码改变
    handleCurrentChange (pageNum) {
      this.tableData.pagination.pageNum = pageNum;
      this.getShareList();
    },
    // 复制分享链接
    copyLink (index, row) {
      new ClipBoard('#clipBoardBtn', {
        text: trigger => {
          return `链接：${this.tableData.serverHost}/#/home/s/${row.shareId} 密码：${row.sharePwd}`
        }
      })
      this.$message({
        message: '复制成功！',
        type: 'success'
      })
    }
  },
  mounted () {
    this.getShareList()
  }
}
</script>

<style scoped>

</style>
