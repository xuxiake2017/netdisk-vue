<template>
  <div>
    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-form :inline="true" :model="filters" @submit.native.prevent @keyup.enter.native="handleSearch">
        <el-form-item>
          <el-input v-model="filters.fileRealName" placeholder="文件名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button plain type="primary" @click="handleSearch">查询</el-button>
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
      @handle-current-change="handleCurrentChange"
      @reacquire-data="getFileList"
      @get-sublist="getSublist"
      @share-file="shareFile"
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
          v-if="hackReset"
          highlight-current
          :default-expanded-keys="[-1]"
          check-on-click-node
          ref="tree"
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

    <!--分享成功对话框-->
    <el-dialog
      title="提示"
      :visible.sync="shareDialogVisible"
      :before-close="shareDialogClose"
      width="20%">
      <span>{{message}}</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="shareDialogVisible = false">取 消</el-button>
        <el-button type="primary" id="clipBoardBtn" :data-clipboard-text="clipboardText" @click="cipboard">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import FileList from '../../components/fileList'
import { GetFileList, UploadMD5, ListAllDir, MkDir, MoveFile, GetPathStore } from '../../api/file'
import { ShareFile } from '../../api/share'
import GetFileMD5 from '../../common/getFileMD5'
import ClipBoard from 'clipboard'

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
      // 用于树组件的销毁
      hackReset: false,
      moveDialogVisible: false,
      dirs: [],
      movedFileSaveName: '',
      movedId: 0,
      // 新建文件夹
      dirDialogVisible: false,
      newDir: '',
      searching: false,
      // 文件分享
      shareDialogVisible: false,
      message: '',
      clipboardText: ''
    }
  },
  methods: {
    // 搜索
    handleSearch () {
      if (this.filters.fileRealName) {
        this.pathStore = [
          {parentId: -1, fileRealName: `搜索文件"${this.filters.fileRealName}"`}
        ]
        this.searching = true
        this.getFileList()
      }
    },
    // 搜索重置
    handleReset () {
      this.pathStore = [
        {parentId: -1, fileRealName: '全部文件'}
      ]
      this.searching = false
      this.filters.fileRealName = '';
      this.filters.parentId = -1
      this.tableData.pagination.pageNum = 1;
      this.pathStore.splice(1, this.pathStore.length)
      this.getFileList();
    },
    // 获取文件列表
    getFileList () {
      let param = {
        ...this.filters, ...this.tableData.pagination
      };
      this.listLoading = true;
      // NProgress.start();
      GetFileList(param).then((res) => {
        let path = this.$router.history.current.path;
        let obj = {}
        obj['parentId'] = this.filters.parentId
        this.$router.push({ path, query: obj });
        this.tableData.pagination.total = res.data.pageInfo.total;
        this.tableData.pagination.pageNum = res.data.pageInfo.pageNum;
        // this.tableData.rows = [ ...this.tableData.rows, ...res.data.pageInfo.list ]
        this.tableData.rows = res.data.pageInfo.list
        this.listLoading = false;
        // NProgress.done();
      }).catch(reason => {
        this.listLoading = false;
      });
    },
    // 查询文件下的列表
    getSublist (row, column, cell, event) {
      if (row.fileType === 0 && column.property === 'fileRealName') {
        this.tableData.pagination.pageNum = 1
        if (this.searching) {
          this.searching = false
          this.filters.fileRealName = ''
          GetPathStore({ fileId: row.id }).then(res => {
            this.pathStore = res.data
          })
        } else {
          this.pathStore.push({parentId: row.id, fileRealName: row.fileRealName})
        }
        this.filters.parentId = row.id
        this.getFileList()
      }
    },
    // 分页页码改变
    handleCurrentChange (val) {
      this.tableData.pagination.pageNum = val
      this.getFileList()
    },
    // 文件路径跳转
    jump (item, index) {
      if ((this.pathStore.length === 1) || (this.pathStore.length > 1 && index + 1 === this.pathStore.length)) {
        return
      }
      this.tableData.pagination.pageNum = 1
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
      if (!node.key) {
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
    // 打开文件移动对话框
    handleMove (index, row) {
      this.movedFileSaveName = row.fileSaveName
      this.movedId = row.id
      this.moveDialogVisible = true
      this.hackReset = false;// 销毁组件
      this.$nextTick(() => {
        this.hackReset = true;// 重建组件
      });
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
        GetFileMD5(file.raw, file.uid, this.filters.parentId)
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
    // 文件分享
    shareFile (index, row) {
      ShareFile({ fileSaveName: row.fileSaveName }).then(res => {
        this.shareDialogVisible = true
        this.clipboardText = `链接：${res.data.serverHost}/#/home/s/${res.data.shareFile.shareId} 密码：${res.data.shareFile.sharePwd}`
        this.message = `文件分享成功，点击"确定"复制链接及密码（${this.clipboardText}）`
      })
    },
    // 复制到剪贴板
    cipboard () {
      let clipboard_ = new ClipBoard('#clipBoardBtn')
      clipboard_.on('success', () => {
        this.$message({
          message: '复制成功！',
          type: 'success'
        })
        this.shareDialogVisible = false
      })
      clipboard_.on('error', () => {
        this.$message({
          message: '复制失败，请手动选择复制！',
          type: 'error'
        })
      })
    },
    // 关闭提示分享成功对话框
    shareDialogClose (done) {
      done()
    }
  },
  mounted () {
    const parentId = this.$route.query.parentId
    if (parentId) {
      this.filters.parentId = this.$route.query.parentId
    }
    this.getFileList()
    GetPathStore({ fileId: this.filters.parentId }).then(res => {
      this.pathStore = res.data
    })
  }
}

</script>

<style scoped>
  .el-breadcrumb::after {
     clear: none;
  }
</style>
