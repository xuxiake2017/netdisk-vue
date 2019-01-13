<template>
  <el-row>
    <el-row :gutter="20" style="margin-bottom: 20px" v-if="messages.length === 0">
      <el-col :span="10">
        <el-alert :closable="false" type="info" title="暂时未收到消息"></el-alert>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-bottom: 20px" v-for="(item, index) in messages" :key="index">
      <el-col :span="10">
        <el-alert :closable="false" :type="types[item.type]" :title="item.title" :description="item.description"></el-alert>
      </el-col>
      <el-col :span="3">
        <el-tag>{{formateDate(item.createTime)}}</el-tag>
      </el-col>
      <el-col :span="3">
        <el-button size="small" @click="haveRead(item.id, index)">已读</el-button>
      </el-col>
    </el-row>
  </el-row>
</template>

<script>
import util from '../../common/util'
import { HaveRead } from '../../api/message'

export default {
  name: 'myMessage',
  data () {
    return {
      messages: [],
      types: [
        'success',
        'info',
        'warning',
        'error'
      ]
    }
  },
  methods: {
    formateDate (date) {
      return util.formatDate.format(new Date(date), 'yyyy-MM-dd hh:mm:ss')
    },
    haveRead (id, index) {
      HaveRead({ id }).then(res => {
        this.messages.splice(index, 1)
        if (this.messages.length === 0) {
          this.$store.commit('clearMessages')
        }
      })
    }
  },
  mounted () {
    const user = this.$store.getters.getUser
    this.messages = user.messages
  }
}
</script>

<style scoped>

</style>
