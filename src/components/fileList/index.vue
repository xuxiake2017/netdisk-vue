<template>
  <section>
    <!--列表-->
    <el-table :data="tableData.rows"
              highlight-current-row v-loading="listLoading"
              @selection-change="selsChange"
              @cell-click="cellClickHandler"
              :cell-style="showPointer"
              class="table-list"
              :style="{height: computeHeight + 'px'}"
              :row-class-name="tableRowClassName">
      <el-table-column type="selection" width="55">
      </el-table-column>
      <el-table-column type="index" width="60">
      </el-table-column>
      <el-table-column width="50">
        <template slot-scope="scope">
          <img :src="fileIcoFilter(scope.row)" height="26" width="26" style="margin-top: 5px;"/>
        </template>
      </el-table-column>
      <el-table-column prop="fileName" label="文件名" width="220" sortable>
      </el-table-column>
      <el-table-column prop="fileSize" label="文件大小" width="100" :formatter="formatFileSize" sortable>
      </el-table-column>
      <el-table-column
        v-if="type === 'allFile' || type === 'document' || type === 'music' || type === 'pic' || type === 'video'"
        prop="updateTime"
        label="上传时间"
        width="200"
        :formatter="formatFileTime"
        sortable>
      </el-table-column>
      <el-table-column
        v-if="type === 'recycle'"
        prop="deleteTime"
        label="删除时间"
        width="200"
        :formatter="formatFileTime"
        sortable>
      </el-table-column>
      <el-table-column
        v-if="type === 'recycle'"
        prop="overTime"
        label="过期时间"
        width="200"
        :formatter="formatFileTime"
        sortable>
      </el-table-column>
      <el-table-column
        v-if="type === 'share'"
        prop="shareTime"
        label="分享时间"
        width="200"
        :formatter="formatFileTime"
        sortable>
      </el-table-column>
      <el-table-column
        v-if="type === 'share'"
        prop="accessTimes"
        label="访问次数"
        width="100"
        sortable>
      </el-table-column>
      <el-table-column
        v-if="type === 'share'"
        prop="downloadTimes"
        label="下载次数"
        width="100"
        sortable>
      </el-table-column>
      <el-table-column
        v-if="type === 'share'"
        prop="saveTimes"
        label="保存次数"
        width="100"
        sortable>
      </el-table-column>
      <el-table-column v-if="(type !== 'allFile' || searching) && !(type === 'recycle' || type === 'share')" prop="filePath" label="文件路径" width="150">
        <template scope="scope">
          <el-tag type="info">{{scope.row.filePath}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template scope="scope">
          <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
          <el-button v-if="type === 'recycle'" type="info" size="small" @click="handleRestore(scope.$index, scope.row)">还原</el-button>
          <el-button id="clipBoardBtn" v-if="type === 'share'" type="info" size="small" @click="copyLink(scope.$index, scope.row)">复制链接</el-button>
          <el-button v-if="!(type === 'recycle' || type === 'share')" type="info" size="small" @click="handleReName(scope.$index, scope.row)">重命名</el-button>
          <el-button v-if="type === 'allFile'" type="warning" size="small" @click="shareFile(scope.$index, scope.row)">分享</el-button>
          <el-button v-if="type === 'allFile'" type="primary" size="small" @click="handleMove(scope.$index, scope.row)">移动</el-button>
          <el-button v-if="scope.row.fileType != 0 && !(type === 'recycle' || type === 'share')" type="success" size="small" @click="handleDownload(scope.$index, scope.row)">下载</el-button>
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
      :close-on-click-modal="false"
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
import { ReName, DeleteFile } from '../../api/file'
import { DeleteRecycle } from '../../api/recycle'
import { DeleteShare } from '../../api/share'
import $ from 'jquery'
import usermixin from '@/mixins/userInfo'

export default {
  name: 'fileList',
  mixins: [usermixin],
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
      type: Object
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
    fileIcoFilter (row) {
      switch (row.fileType) {
        case this.$NetdiskConstant.FILE_TYPE_OF_DIR :
          return require('../../assets/file_ico/Folder_24_e0cacad.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_TXT :
          return require('../../assets/file_ico/Text_24_dd1b3d8.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_WORD :
          return require('../../assets/file_ico/Word_24_1e078ab.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_EXCEL :
          return require('../../assets/file_ico/Excel_24_614e53a.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_POWERPOINT :
          return require('../../assets/file_ico/PPT_24_0af6886.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_PDF :
          return require('../../assets/file_ico/PDF_24_5caf7bf.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_PIC :
          return require('../../assets/file_ico/Picture_24_dd06d30.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_MUSIC :
          return require('../../assets/file_ico/Music_24_04cf4b7.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_VIDEO :
          return require('../../assets/file_ico/Video_24_499ddeb.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_ZIP :
          return require('../../assets/file_ico/ZIP_24_3670294.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_APK :
          return require('../../assets/file_ico/Android_24_a529a3a.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_OTHER :
          return require('../../assets/file_ico/Misc_24_156416f.png')
      }
    },
    // 格式化文件大小
    formatFileSize: function (row, column) {
      return util.formatFileSize(row.fileSize)
    },
    // 格式化文件时间
    formatFileTime (row, column) {
      switch (column.property) {
        case 'updateTime':
          return util.formatDate.format(new Date(row.updateTime), 'yyyy-MM-dd hh:mm:ss')
        case 'deleteTime':
          return util.formatDate.format(new Date(row.deleteTime), 'yyyy-MM-dd hh:mm:ss')
        case 'overTime':
          return util.formatDate.format(new Date(row.overTime), 'yyyy-MM-dd hh:mm:ss')
        case 'shareTime':
          return util.formatDate.format(new Date(row.shareTime), 'yyyy-MM-dd hh:mm:ss')
      }
    },
    selsChange: function (sels) {
      this.sels = sels;
    },
    // 删除
    handleDel (index, row) {
      if (this.type === 'allFile' ||
        this.type === 'document' ||
        this.type === 'music' ||
        this.type === 'pic' ||
        this.type === 'video') {
        this.$confirm('确认删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          DeleteFile({ fileKey: row.key }).then(res => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.reacquireData()
            this.getInfo()
          })
        })
      } else if (this.type === 'share') {
        console.log(row)
        this.$confirm('确认删除该分享, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          DeleteShare(row.id).then(res => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.reacquireData()
          })
        })
      } else if (this.type === 'recycle') {
        this.$confirm('确认彻底删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          DeleteRecycle(row.recycleId).then(res => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.reacquireData()
          })
        })
      }
    },
    // 回收站文件还原
    handleRestore (index, row) {
      this.$emit('file-restore', index, row)
    },
    // 重新复制分享链接
    copyLink (index, row) {
      this.$emit('copy-link', index, row)
    },
    // 文件移动
    handleMove (index, row) {
      this.$emit('file-move', index, row)
    },
    // 文件下载
    handleDownload (index, row) {
      window.open(`${process.env.BASE_API}/file/downLoad?fileKey=${row.key}`, '_blank');
    },
    // 打开重命名对话框
    handleReName (index, row) {
      this.reNameDialogVisible = true
      this.oldName = row.fileName.substring(0, row.isDir && row.fileExtName ? row.fileName.lastIndexOf('.') : row.fileName.length)
      this.reNameRow = {...row}
    },
    getFileList () {
    },
    // 使鼠标变成手型
    showPointer ({row, column, rowIndex, columnIndex}) {
      if (columnIndex === 3) {
        return 'cursor: pointer'
      }
      return ''
    },
    // 给表格行加class（表格行的颜色）
    tableRowClassName ({row, rowIndex}) {
      switch (rowIndex) {
        case 1:
          return 'warning-row'
        case 3:
          return 'success-row'
        case 5:
          return 'warning-row'
        case 7:
          return 'success-row'
        case 9:
          return 'warning-row'
        case 11:
          return 'success-row'
        case 13:
          return 'warning-row'
        case 15:
          return 'success-row'
        case 17:
          return 'warning-row'
        case 19:
          return 'success-row'
        default:
          return ''
      }
    },
    // 批量删除
    batchRemove () {},
    // 重命名
    reName () {
      console.log(this.reNameRow)
      ReName({
        parentId: this.filters.parentId,
        key: this.reNameRow.key,
        fileName: this.oldName + (this.reNameRow.isDir === 0 ? '' : ('.' + this.reNameRow.fileExtName)),
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
    cellClickHandler (row, column, cell, event) {
      if (column.property === 'fileName') {
        // 查询文件夹下的文件列表
        if (row.fileType === this.$NetdiskConstant.FILE_TYPE_OF_DIR) {
          this.$emit('get-sublist', row, column, cell, event)
        } else if (this.type !== 'recycle' && this.type !== 'share') {
          if (row.fileType === this.$NetdiskConstant.FILE_TYPE_OF_MUSIC) {
            this.$router.push({
              path: '/home/audioPlay',
              query: {
                fileKey: row.key
              }
            })
          } else if (row.fileType === this.$NetdiskConstant.FILE_TYPE_OF_VIDEO) {
            this.$router.push({
              path: '/home/videoPlay',
              query: {
                fileKey: row.key
              }
            })
          }
        }
      }
    },
    // 文件分享
    shareFile (index, row) {
      this.$emit('share-file', index, row)
    }
  },
  computed: {
    computeHeight () {
      return $(document).height() - 240
    }
  }
}

</script>

<style scoped>
  .table-list {
    width: 100%;
    overflow-y: auto;
    /*height: 756px;*/
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
