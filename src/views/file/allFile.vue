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
        <el-form-item>
          <el-button type="success" @click="openUploadDialog">上传</el-button>
          <el-button type="primary" @click="dirDialogVisible = true">新建文件夹</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <el-breadcrumb separator="/" style="padding: 10px;">
      <el-breadcrumb-item v-for="(item, index) in pathStore" :key="item.parentId" @click.native="jump(item, index)" style="cursor: pointer; font-weight: bold">{{item.fileRealName}}</el-breadcrumb-item>
    </el-breadcrumb>
    <file-list
      :table-data="tableData"
      :filters="filters"
      :list-loading="listLoading"
      :searching="searching"
      :busy="busy"
      @handle-current-change="handleCurrentChange"
      @reacquire-data="reacquireData"
      @get-sublist="getSublist"
      @file-move="handleMove"
    >
    </file-list>

    <!--上传文件对话框-->
    <el-dialog
      title="提示"
      :visible.sync="uploaDialogVisible"
      width="30%"
      :before-close="handleClose">
      <el-upload
        ref="upload"
        :action="uploadAction"
        :before-remove="beforeRemove"
        :before-upload="beforeUpload"
        :on-preview="handlePreview"
        :on-change="onFileChange"
        :with-credentials="true"
        multiple
        :auto-upload="false"
        :limit="uploadLimit"
        :on-exceed="handleExceed"
        :data="uploadData">
        <el-button size="small" type="primary">点击上传</el-button>
        <!--<el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>-->
        <div slot="tip" class="el-upload__tip">文件个数不超过10个，文件大小不能超过500M</div>
      </el-upload>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeUploadDialog">取 消</el-button>
        <el-button type="primary" @click="submitUpload">确 定</el-button>
      </span>
    </el-dialog>

    <!--新建文件夹对话框-->
    <el-dialog
      title="提示"
      :visible.sync="dirDialogVisible"
      :before-close="dirDialogClose"
      width="30%" @keyup.enter.native="mkDir">
      <el-input v-model="newDir" placeholder="请输入文件夹名称"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dirDialogClose">取 消</el-button>
        <el-button type="primary" @click="mkDir">确 定</el-button>
      </span>
    </el-dialog>

    <!--移动文件对话框-->
    <el-dialog
      title="提示"
      :visible.sync="moveDialogVisible"
      width="30%"
      :before-close="moveDialogClose">
      <div class="block">
        <el-tree
          highlight-current
          :default-expanded-keys="[-1]"
          check-on-click-node
          ref="tree"
          @node-expand="nodeExpand"
          :lazy="true"
          :load="loadChildTree"
          accordion
          :data="dirs"
          node-key="id"
          :expand-on-click-node="false">
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <i class="fa fa-folder"></i>
            <span>{{ node.label }}</span>
          </span>
        </el-tree>
      </div>
      <span slot="footer" class="dialog-footer">
      <el-button @click="moveDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="moveFile">确 定</el-button>
    </span>
    </el-dialog>
  </div>
</template>

<script>
import FileList from '../../components/fileList'
import { GetFileList, UploadMD5, ListAllDir, MkDir, MoveFile } from '../../api/file'
import GetFileMD5 from '../../common/getFileMD5'

export default {
  name: 'allFile',
  components: {
    FileList
  },
  data () {
    return {
      pathStore: [
        {parentId: -1, fileRealName: '全部文件'}
      ],
      filters: {
        parentId: -1,
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
      // 文件上传
      uploaDialogVisible: false,
      uploadData: {
        parentId: -1,
        md5Hex: '111',
        lastModifiedDate: null
      },
      uploadLimit: 10,
      uploadAction: `${process.env.BASE_API}/file/fileUpload`,
      // 文件移动
      moveDialogVisible: false,
      dirs: [],
      movedFileSaveName: '',
      movedId: 0,
      // 新建文件夹
      dirDialogVisible: false,
      newDir: '',
      searching: false,
      busy: false
    }
  },
  methods: {
    // 搜索
    handleSearch () {
      if (this.filters.fileRealName) {
        this.searching = true
        this.getFileList()
      }
    },
    // 搜索重置
    handleReset () {
      this.searching = false
      this.filters.fileRealName = '';
      this.filters.parentId = -1
      this.tableData.pagination.pageNum = 1;
      this.pathStore.splice(1, this.pathStore.length)
      this.getFileList();
    },
    reacquireData () {
      console.log('reacquireData')
      this.getFileList();
      this.tableData.pagination.pageNum++;
    },
    // 获取文件列表
    getFileList () {
      // debugger
      let param = {
        ...this.filters, ...this.tableData.pagination
      };
      this.listLoading = true;
      // NProgress.start();
      GetFileList(param).then((res) => {
        // debugger
        // 数据全部加载完成
        if (res.data.pageInfo.list.length < this.tableData.pagination.pageSize) {
          this.busy = true
        } else {
          this.busy = false
        }
        // this.tableData.pagination.total = res.data.pageInfo.total;
        // this.tableData.pagination.pageNum = res.data.pageInfo.pageNum;
        this.tableData.rows = [ ...this.tableData.rows, ...res.data.pageInfo.list ]
        console.log('this.tableData.rows', this.tableData.rows)
        this.listLoading = false;
        // NProgress.done();
      }).catch(reason => {
        this.listLoading = false;
      });
    },
    // 查询文件下的列表
    getSublist (row, column, cell, event) {
      if (row.fileType === 0 && column.property === 'fileRealName') {
        this.searching = false
        this.pathStore.push({parentId: row.id, fileRealName: row.fileRealName})
        this.filters.fileRealName = ''
        this.filters.parentId = row.id
        this.getFileList()
      }
    },
    // 分页页码改变
    handleCurrentChange () {
      this.tableData.pagination.pageNum++;
      this.getFileList();
    },
    // 文件路径跳转
    jump (item, index) {
      console.log(this.pathStore.length, index)
      if ((this.pathStore.length === 1) || (this.pathStore.length > 1 && index + 1 === this.pathStore.length)) {
        return
      }
      this.pathStore.splice(index + 1, this.pathStore.length - 1)
      this.filters.parentId = item.parentId
      this.getFileList()
    },
    // 查询所有文件夹
    listAllDir (parentId) {
      ListAllDir({parentId}).then(res => {
        console.log(res.data)
        let nodes = []
        res.data.forEach((value, index) => {
          let node = {}
          node['id'] = value.id
          node['label'] = value.fileRealName
          nodes.push(node)
        })
      })
    },
    // 树的加载函数
    loadChildTree (node, resolve) {
      if (node.id === 0) {
        let nodes = []
        let node_ = {}
        node_['id'] = -1
        node_['label'] = '/'
        nodes.push(node_)
        resolve(nodes)
      } else {
        if (this.movedId === node.key) {
          this.$notify({
            duration: 2000,
            title: '警告',
            message: '不能移动到自身及其子目录',
            type: 'warning'
          })
          resolve([])
        } else {
          ListAllDir({parentId: node.key}).then(res => {
            let nodes = []
            res.data.forEach((value, index) => {
              let node_ = {}
              node_['id'] = value.id
              node_['label'] = value.fileRealName
              nodes.push(node_)
            })
            resolve(nodes)
          })
        }
      }
    },
    // 树被展开时调用（因为树不会每次去重新加载数据）
    nodeExpand (dir, node, tree) {
      if (this.movedId !== node.key) {
        window.setTimeout(() => {
          const theChildren = node.childNodes
          theChildren.splice(0, theChildren.length)
          ListAllDir({parentId: node.key}).then(res => {
            res.data.forEach((value, index) => {
              let node_ = {}
              node_['id'] = value.id
              node_['label'] = value.fileRealName
              node_['disabled'] = false
              this.$refs.tree.append(node_, node)
            })
          })
        }, 200)
      }
    },
    // 打开文件移动对话框
    handleMove (index, row) {
      this.movedFileSaveName = row.fileSaveName
      this.movedId = row.id
      this.moveDialogVisible = true
    },
    // 打开上传文件对话框
    openUploadDialog () {
      this.uploaDialogVisible = true
    },
    // 关闭上传文件对话框
    closeUploadDialog () {
      this.uploaDialogVisible = false
      this.$refs.upload.clearFiles();
      this.$store.commit('clearFile')
    },
    // 关闭上传文件对话框
    handleClose (done) {
      this.$refs.upload.clearFiles();
      this.$store.commit('clearFile')
      done()
    },
    // 文件数量限制
    handleExceed (files, fileList) {
      this.$message.warning(`当前限制选择 ${this.uploadLimit} 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    },
    // 在文件移除之前
    beforeRemove (file, fileList) {
      // return this.$confirm(`确定移除 ${file.name}？`).then(() => {
      //   this.$store.commit('delFile', file.uid)
      // });
      this.$store.commit('delFile', file.uid)
      return true
    },
    // 在文件上传之前
    beforeUpload (file) {
      const file_ = this.$store.getters.getFile(file.uid)
      if (!file_) {
        this.$notify({
          duration: 2000,
          title: '警告',
          message: 'MD5未计算完毕',
          type: 'warning'
        })
        throw new Error('MD5未计算完毕');
      } else {
        this.uploadData.lastModifiedDate = file_.lastModifiedDate
        this.uploadData.md5Hex = file_.md5Hex
        this.uploadData.parentId = this.filters.parentId
      }
      if (file_.isExist) {
        // 服务器已经存在该文件
        UploadMD5(file_).then(res => {
          this.$notify({
            duration: 2000,
            title: '提示',
            message: `${file.name}上传成功！`,
            type: 'success'
          })
        }).catch(res => {
        })
        return false
      } else {
        // 服务器不存在该文件，需要上传
        return true
      }
    },
    handlePreview (file) {
      console.log(file)
    },
    // 文件列表改变时，选择文件后开始计算文件md5值
    onFileChange (file, fileList) {
      if (file.status === 'ready') {
        GetFileMD5(file.raw, file.uid, this.filters.parentId, this)
      }
    },
    // 文件手动上传
    submitUpload () {
      this.$refs.upload.submit();
      let tag = true
      this.$refs.upload.uploadFiles.forEach((value, index) => {
        if (value.status !== 'success') {
          tag = false
        }
      })
      if (tag) {
        window.setTimeout(() => {
          this.closeUploadDialog()
          this.getFileList()
        }, 500)
      }
    },
    // 关闭移动文件对话框
    moveDialogClose (done) {
      done()
    },
    // 新建文件夹
    mkDir () {
      MkDir({fileRealName: this.newDir, parentId: this.filters.parentId}).then(res => {
        this.$notify({
          duration: 2000,
          title: '提示',
          message: `文件夹"${this.newDir}"新建成功！`,
          type: 'success'
        })
        this.getFileList()
        this.dirDialogVisible = false
        this.newDir = ''
      })
    },
    // 关闭新建文件夹对话框
    dirDialogClose () {
      this.newDir = ''
      this.dirDialogVisible = false
    },
    // 移动文件
    moveFile () {
      let parentId = this.$refs.tree.getCurrentKey()
      if (!parentId) {
        parentId = -1
      }
      if (this.movedId === parentId) {
        this.$notify({
          duration: 2000,
          title: '警告',
          message: '不能移动到自身及其子目录',
          type: 'warning'
        })
        return
      }
      MoveFile({parentId: parentId, fileSaveName: this.movedFileSaveName}).then(res => {
        this.$notify({
          duration: 2000,
          title: '提示',
          message: `文件移动成功！`,
          type: 'success'
        })
        this.moveDialogVisible = false
        this.getFileList()
      })
    },
    loadMore () {
      this.busy = true
      window.setTimeout(() => {
        this.getFileList()
        this.tableData.pagination.pageNum++
      }, 1000)
    }
  },
  mounted () {
    this.getFileList()
  }
}

</script>

<style scoped>

</style>
