<template>
  <div>
    <!-- 麵包屑 -->
    <Breadcrumb name1="权限管理" name2="权限列表" />

    <!-- 卡片 -->
    <el-card>
      <el-table :data="rightsList" style="width: 100%" border stripe>
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="authName" label="权限名称"> </el-table-column>
        <el-table-column prop="path" label="路徑"> </el-table-column>
        <el-table-column prop="level" label="等級权限">
          <template slot-scope="scope">
            <div>
              <el-tag v-if="scope.row.level === '0'">一級</el-tag>
              <el-tag v-if="scope.row.level === '1'" type="success"
                >二級</el-tag
              >
              <el-tag v-if="scope.row.level === '2'" type="warning"
                >三級</el-tag
              >
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import Breadcrumb from '../Breadcrumb.vue'
export default {
  name: 'RightsPage',
  components: { Breadcrumb },
  data() {
    return {
      type: 'list',
      rightsList: []
    }
  },
  methods: {
    async getRightsList() {
      const { data: res } = await this.$http.get(`rights/${this.type}`)
      if (res.meta.status !== 200) {
        return this.$$message.error('获取权限列表失败')
      } else {
        this.rightsList = res.data
      }
    }
  },
  created() {
    this.getRightsList()
  }
}
</script>
