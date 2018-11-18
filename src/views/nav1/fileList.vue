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
      </el-form-item>
      <el-form-item>
        <el-button plain type="primary" @click="handleReset">重置</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="success" @click="openUploadDialog">上传</el-button>
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
    <el-table-column label="操作" width="150">
      <template scope="scope">
        <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
        <el-button v-if="scope.row.fileType!=0" type="success" size="small" @click="handleDownload(scope.$index, scope.row)">下载</el-button>
      </template>
    </el-table-column>
  </el-table>

  <!--工具条-->
  <el-col :span="24" class="toolbar">
    <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
    <el-pagination background layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="tableData.pagination.pageSize" :total="tableData.pagination.total" style="float:right;">
    </el-pagination>
  </el-col>

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
      multiple
      :auto-upload="false"
      :limit="3"
      :on-exceed="handleExceed"
      :data="uploadData">
      <el-button size="small" type="primary">点击上传</el-button>
      <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
      <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
    </el-upload>
    <span slot="footer" class="dialog-footer">
      <el-button @click="uploaDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="uploaDialogVisible = false">确 定</el-button>
    </span>
  </el-dialog>

</section>
</template>

<script>
// import axios from 'axios';
import util from '../../common/util'
// import NProgress from 'nprogress'
import { GetFileList } from '../../api/api'
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
        fileList: [],
        parentId: -1,
        md5Hex: '111',
        lastModifiedDate: null
      },
      uploadAction: ''
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
    handleCurrentChange (val) {
      this.tableData.pagination.pageNum = val;
      this.getFileList();
    },
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
        ...this.filters, ...this.tableData.pagination, that: this
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
    handleReset () {
      this.filters.fileRealName = '';
      this.filters.parentId = -1
      this.tableData.pagination.pageNum = 1;
      this.pathStore.splice(1, this.pathStore.length)
      this.getFileList();
    },
    handleDel (index, row) {},
    handleDownload (index, row) {
      window.open(`${process.env.BASE_API}/file/downLoad?fileSaveName=${row.fileSaveName}`, '_blank');
    },
    showPointer ({row, column, rowIndex, columnIndex}) {
      if (row.fileType === 0 && columnIndex === 3) {
        return 'cursor: pointer'
      }
      return ''
    },
    batchRemove () {},
    openUploadDialog () {
      this.uploaDialogVisible = true
    },
    handleClose (done) {
      done()
    },
    handleExceed (files, fileList) {
      this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    },
    beforeRemove (file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`);
    },
    beforeUpload () {
      this.uploadData.lastModifiedDate = new Date().getTime()
    },
    handlePreview (file) {
      GetFileMD5(file.raw, this)
    },
    onFileChange (file, fileList) {
      // console.log(file)
    },
    submitUpload () {
      this.$refs.upload.submit();
    }
  },
  mounted () {
    this.uploadAction = `${process.env.BASE_API}/file/fileUpload`
    this.getFileList();
  }
}

</script>

<style scoped>
  .show-pointer {
    cursor: pointer;
  }
</style>
