<template>
  <div>
    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-form :inline="true" :model="filters" @keyup.enter.native="handleSearch">
        <el-form-item>
          <el-input v-model="filters.fileRealName" placeholder="文件名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button plain type="primary" v-on:click.prevent="handleSearch">查询</el-button>
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
      @reacquire-data="getDocumentList"
      type="document"
    >
    </file-list>
  </div>
</template>

<script>
import FileList from '../../components/fileList'
import { GetDocumentList } from '../../api/file'

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
          pageSize: 10
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
        this.getDocumentList()
      }
    },
    // 搜索重置
    handleReset () {
      this.filters.fileRealName = '';
      this.tableData.pagination.pageNum = 1;
      this.getDocumentList();
    },
    // 获取文件列表
    getDocumentList () {
      let param = {
        ...this.filters, ...this.tableData.pagination
      };
      this.listLoading = true;
      // NProgress.start();
      GetDocumentList(param).then((res) => {
        this.tableData.pagination.total = res.data.total;
        this.tableData.pagination.pageNum = res.data.pageNum;
        this.tableData.rows = res.data.list;
        this.listLoading = false;
        // NProgress.done();
      }).catch(reason => {
        this.listLoading = false;
      });
    },
    // 分页页码改变
    handleCurrentChange (pageNum) {
      this.tableData.pagination.pageNum = pageNum;
      this.getDocumentList();
    }
  },
  mounted () {
    this.getDocumentList()
  }
}
</script>

<style scoped>

</style>
