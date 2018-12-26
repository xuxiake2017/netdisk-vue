<template>
<section>
  <!--工具条-->
  <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
    <el-form :inline="true" :model="filters">
      <el-form-item>
        <el-input v-model="filters.fileRealName" placeholder="文件名"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button plain type="primary" v-on:click.prevent="getFileList2">查询</el-button>
        <el-button plain type="primary" @click="handleReset">重置</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="success" @click="openUploadDialog">上传</el-button>
        <el-button type="primary" @click="dirDialogVisible = true">新建文件夹</el-button>
      </el-form-item>
    </el-form>
  </el-col>

  <el-breadcrumb separator="/">
    <el-breadcrumb-item v-for="(item, index) in pathStore" :key="item.parentId" @click.native="jump(item, index)" style="cursor: pointer; font-weight: bold">{{item.fileRealName}}</el-breadcrumb-item>
  </el-breadcrumb>

  <!--列表-->
  <el-table :data="tableData.rows"
            highlight-current-row v-loading="listLoading"
            @selection-change="selsChange"
            @cell-click="getFileList"
            :cell-style="showPointer"
            height="500px"
            style="width: 100%;">
    <el-table-column type="selection" width="55">
    </el-table-column>
    <el-table-column type="index" width="60">
    </el-table-column>
    <el-table-column width="50">
      <template slot-scope="scope">
        <img :src="fileIcoFilter(scope.row)" height="26" width="26" style="margin-top: 5px;"/>
      </template>
    </el-table-column>
    <el-table-column prop="fileRealName" label="文件名" width="250" sortable>
    </el-table-column>
    <el-table-column prop="fileSize" label="文件大小" width="100" :formatter="formatFileSize" sortable>
    </el-table-column>
    <el-table-column prop="uploadTime" label="上传时间" width="200" :formatter="formatFileTime" sortable>
    </el-table-column>
    <el-table-column label="操作" width="400">
      <template scope="scope">
        <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
        <el-button v-if="scope.row.fileType!=0" type="success" size="small" @click="handleDownload(scope.$index, scope.row)">下载</el-button>
        <el-button type="primary" size="small" @click="handleMove(scope.$index, scope.row)">移动</el-button>
        <el-button type="info" size="small" @click="handleReName(scope.$index, scope.row)">重命名</el-button>
      </template>
    </el-table-column>
  </el-table>

  <!--工具条-->
  <el-col :span="24" class="toolbar">
    <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
    <el-pagination
      background
      layout="prev, pager, next"
      @current-change="handleCurrentChange"
      :page-size="tableData.pagination.pageSize"
      :total="tableData.pagination.total"
      :current-page="tableData.pagination.pageNum"
      style="float:right;">
    </el-pagination>
  </el-col>

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
      <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
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
    width="30%">
    <el-input v-model="newDir" placeholder="请输入文件夹名称"></el-input>
    <span slot="footer" class="dialog-footer">
    <el-button @click="dirDialogClose">取 消</el-button>
    <el-button type="primary" @click="mkDir">确 定</el-button>
  </span>
  </el-dialog>

  <!--重命名对话框-->
  <el-dialog
    title="提示"
    :visible.sync="reNameDialogVisible"
    :before-close="dirDialogClose"
    width="30%">
    <el-input v-model="oldName" placeholder="请输入文件夹名称"></el-input>
    <span slot="footer" class="dialog-footer">
    <el-button @click="reNameDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="reName">确 定</el-button>
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

</section>
</template>

<script>
// import axios from 'axios';
import util from '../../common/util'
// import NProgress from 'nprogress'
import { GetFileList, UploadMD5, ListAllDir, MkDir, MoveFile, ReName } from '../../api/file'
import GetFileMD5 from '../../common/getFileMD5'

export default {
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
          pageSize: 10
        },
        rows: []
      },
      listLoading: false,
      sels: [], // 列表选中列
      uploaDialogVisible: false,
      uploadData: {
        parentId: -1,
        md5Hex: '111',
        lastModifiedDate: null
      },
      uploadLimit: 10,
      uploadAction: `${process.env.BASE_API}/file/fileUpload`,
      moveDialogVisible: false,
      dirDialogVisible: false,
      dirs: [],
      newDir: '',
      movedFileSaveName: '',
      movedId: 0,
      reNameDialogVisible: false,
      oldName: '',
      reNameRow: null
    }
  },
  methods: {
    // 显示文件图标
    // 文件夹 0
    // 文档 1 txt pdf
    // doc docx 11
    // xls 12
    // ppt 13
    // pdf 14
    // 图片 2 png jpg jpeg gif
    // 音乐 3 mp3 ape flac
    // 视频 4 mp4 mkv avi rmvb flv
    // 压缩包 5 zip rar 7z
    // 安卓安装包 6 apk
    // 默认：其他 9
    fileIcoFilter (row) {
      switch (row.fileType) {
        case 0 :
          return require('../../assets/file_ico/Folder_24_e0cacad.png')
        case 11 :
          return require('../../assets/file_ico/Word_24_1e078ab.png')
        case 12 :
          return require('../../assets/file_ico/Excel_24_614e53a.png')
        case 13 :
          return require('../../assets/file_ico/PPT_24_0af6886.png')
        case 14 :
          return require('../../assets/file_ico/PDF_24_5caf7bf.png')
        case 2 :
          return require('../../assets/file_ico/Picture_24_dd06d30.png')
        case 3 :
          return require('../../assets/file_ico/Music_24_04cf4b7.png')
        case 4 :
          return require('../../assets/file_ico/Video_24_499ddeb.png')
        case 5 :
          return require('../../assets/file_ico/ZIP_24_3670294.png')
        case 6 :
          return require('../../assets/file_ico/Android_24_a529a3a.png')
        case 9 :
          return require('../../assets/file_ico/Misc_24_156416f.png')
      }
    },
    // 格式化文件大小
    formatFileSize: function (row, column) {
      return util.formatDate.formatFileSize(row.fileSize)
    },
    // 格式化文件时间
    formatFileTime (row) {
      return util.formatDate.format(new Date(row.uploadTime), 'yyyy-MM-dd hh:mm:ss')
    },
    // 页码改变时
    handleCurrentChange (val) {
      this.tableData.pagination.pageNum = val;
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
    getFileList2 () {
      this.getFileList()
    },
    // 获取文件列表
    getFileList (row, column, cell, event) {
      if (row) {
        if (row.fileType === 0 && column.property === 'fileRealName') {
          this.pathStore.push({parentId: row.id, fileRealName: row.fileRealName})
          this.filters.fileRealName = ''
          this.filters.parentId = row.id
        } else {
          return
        }
      }
      let param = {
        ...this.filters, ...this.tableData.pagination
      };
      this.listLoading = true;
      // NProgress.start();
      GetFileList(param).then((res) => {
        this.tableData.pagination.total = res.data.pageInfo.total;
        this.tableData.pagination.pageNum = res.data.pageInfo.pageNum;
        this.tableData.rows = res.data.pageInfo.list;
        this.listLoading = false;
        // NProgress.done();
      }).catch(reason => {
        this.listLoading = false;
      });
    },
    selsChange: function (sels) {
      this.sels = sels;
    },
    // 搜索重置
    handleReset () {
      this.filters.fileRealName = '';
      this.filters.parentId = -1
      this.tableData.pagination.pageNum = 1;
      this.pathStore.splice(1, this.pathStore.length)
      this.getFileList();
    },
    // 文件删除
    handleDel (index, row) {},
    // 文件下载
    handleDownload (index, row) {
      window.open(`${process.env.BASE_API}/file/downLoad?fileSaveName=${row.fileSaveName}`, '_blank');
    },
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
    // 打开重命名对话框
    handleReName (index, row) {
      this.reNameDialogVisible = true
      this.oldName = row.fileRealName.substring(0, row.isDir ? row.fileRealName.lastIndexOf('.') : row.fileRealName.length)
      this.reNameRow = {...row}
    },
    // 使鼠标变成手型
    showPointer ({row, column, rowIndex, columnIndex}) {
      if (row.fileType === 0 && columnIndex === 3) {
        return 'cursor: pointer'
      }
      return ''
    },
    batchRemove () {},
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
          message: `文件夹${this.newDir}新建成功！`,
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
    // 重命名
    reName () {
      ReName({
        parentId: this.filters.parentId,
        fileSaveName: this.reNameRow.fileSaveName,
        fileRealName: this.oldName + (this.reNameRow.fileType === 0 ? '' : ('.' + this.reNameRow.fileExtName)),
        isDir: this.reNameRow.isDir
      }).then(res => {
        this.$notify({
          duration: 2000,
          title: '提示',
          message: `文件重命名成功！`,
          type: 'success'
        })
        this.reNameDialogVisible = false
        this.getFileList()
      })
    }
  },
  mounted () {
    this.getFileList()
  }
}

</script>

<style scoped>
  .show-pointer {
    cursor: pointer;
  }
</style>
