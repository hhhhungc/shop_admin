<template>
  <div>
    <!-- 麵包屑 -->
    <Breadcrumb name1="商品管理" name2="商品分类" />
    <!-- 卡片 -->
    <el-card>
      <el-row>
        <el-button type="primary">添加分类</el-button>
      </el-row>

      <tree-table :data="cateList" :columns="columns"> </tree-table>

      <!-- <el-table :data="cateList" style="width: 100%" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="cat_name" label="分类名称"></el-table-column>
        <el-table-column label="分类名称"></el-table-column>
        <el-table-column label="排序"></el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button type="primary" icon="el-icon-edit" size="mini"
              >编辑</el-button
            >
            <el-button type="danger" icon="el-icon-delete" size="mini"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table> -->

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
import Breadcrumb from '../Breadcrumb.vue'
export default {
  name: 'CategoriesPage',
  components: { Breadcrumb },
  data() {
    return {
      queryInfo: {
        type: 1,
        pagenum: 1,
        pagesize: 5
      },
      cateList: [],
      total: 0,
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        { label: '是否启用', prop: 'cat_deleted' },
        { label: '排序' },
        { label: '操作', type: 'template' }
      ]
    }
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      } else {
        this.cateList = res.data.result
        this.total = res.data.total
      }
      console.log(res.data)
    },
    // 监听pagesize
    handleSizeChange(value) {
      this.queryInfo.pagesize = value
      this.getCateList()
    },
    // 监听currentPage
    handleCurrentChange(value) {
      this.queryInfo.pagenum = value
      this.getCateList()
    }
  },
  created() {
    this.getCateList()
  }
}
</script>
