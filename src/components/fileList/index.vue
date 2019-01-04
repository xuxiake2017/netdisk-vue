<template>
  <section>
    <!--列表-->
    <el-table :data="tableData.rows"
              highlight-current-row v-loading="listLoading"
              @selection-change="selsChange"
              @cell-click="getSublist"
              :cell-style="showPointer"
              class="table-list">
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
      <el-table-column v-if="type !== 'allFile' || searching" prop="uploadTime" label="文件路径" width="200">
        <template scope="scope">
          <el-tag type="info">{{scope.row.pathname}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="400">
        <template scope="scope">
          <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
          <el-button type="info" size="small" @click="handleReName(scope.$index, scope.row)">重命名</el-button>
          <el-button v-if="type === 'allFile'" type="primary" size="small" @click="handleMove(scope.$index, scope.row)">移动</el-button>
          <el-button v-if="scope.row.fileType!=0" type="success" size="small" @click="handleDownload(scope.$index, scope.row)">下载</el-button>
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

    <!--重命名对话框-->
    <el-dialog
      title="提示"
      :visible.sync="reNameDialogVisible"
      :before-close="reNameDialogClose"
      width="30%">
      <el-input v-model="oldName" placeholder="请输入文件夹名称"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="reNameDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="reName">确 定</el-button>
      </span>
    </el-dialog>

  </section>
</template>

<script>
import util from '../../common/util'
import { ReName } from '../../api/file'

export default {
  name: 'fileList',
  data () {
    return {
      // listLoading: false,
      sels: [], // 列表选中列
      // 重命名
      reNameDialogVisible: false,
      oldName: '',
      reNameRow: null
    }
  },
  props: {
    filters: {
      type: Object,
      required: true
    },
    tableData: {
      type: Object,
      required: true
    },
    type: {
      type: String,
      default: 'allFile'
    },
    listLoading: {
      type: Boolean
    },
    searching: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    // 显示文件图标
    // 文件夹 0
    // 文档 1 txt
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
        case 1 :
          return require('../../assets/file_ico/Text_24_dd1b3d8.png')
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
      return util.formatFileSize(row.fileSize)
    },
    // 格式化文件时间
    formatFileTime (row) {
      return util.formatDate.format(new Date(row.uploadTime), 'yyyy-MM-dd hh:mm:ss')
    },
    selsChange: function (sels) {
      this.sels = sels;
    },
    // 文件删除
    handleDel (index, row) {},
    // 文件移动
    handleMove (index, row) {
      this.$emit('file-move', index, row)
    },
    // 文件下载
    handleDownload (index, row) {
      window.open(`${process.env.BASE_API}/file/downLoad?fileSaveName=${row.fileSaveName}`, '_blank');
    },
    // 打开重命名对话框
    handleReName (index, row) {
      this.reNameDialogVisible = true
      this.oldName = row.fileRealName.substring(0, row.isDir && row.fileExtName ? row.fileRealName.lastIndexOf('.') : row.fileRealName.length)
      this.reNameRow = {...row}
    },
    getFileList () {
    },
    // 使鼠标变成手型
    showPointer ({row, column, rowIndex, columnIndex}) {
      if (row.fileType === 0 && columnIndex === 3) {
        return 'cursor: pointer'
      }
      return ''
    },
    // 批量删除
    batchRemove () {},
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
        this.reacquireData()
      })
    },
    // 分页页码改变
    handleCurrentChange (val) {
      this.$emit('handle-current-change', val)
    },
    // 关闭重命名对话框
    reNameDialogClose (done) {
      console.log('reNameDialogClose')
      done()
    },
    // 重新请求数据
    reacquireData () {
      this.$emit('reacquire-data')
    },
    // 查询文件下的列表
    getSublist (row, column, cell, event) {
      if (this.type === 'allFile') {
        this.$emit('get-sublist', row, column, cell, event)
      }
    }
  }
}

</script>

<style scoped>
  .table-list {
    width: 100%;
    overflow-y: auto;
    height: 756px;
  }
  /*滚动条整体样式*/
  /*高宽分别对应横竖滚动条的尺寸*/
  .table-list::-webkit-scrollbar {
    width: 10px;
    height: 1px;
  }
  /*滚动条里面小方块*/
  .table-list::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
    background: #535353;
  }
  /*滚动条里面轨道*/
  .table-list::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
    border-radius: 10px;
    background: #EDEDED;
  }
</style>
