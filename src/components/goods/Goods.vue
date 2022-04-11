<template>
  <div>
    <!-- 麵包屑 -->
    <Breadcrumb name1="商品管理" name2="商品列表" />

    <!-- 卡片 -->
    <el-card>
      <!-- 搜尋框 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            @clear="getGoodsList"
            clearable
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 商品表格 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column
          prop="goods_price"
          label="价格(元)"
          width="80px"
        ></el-table-column>
        <el-table-column
          prop="goods_weight"
          label="重量"
          width="80px"
        ></el-table-column>
        <el-table-column prop="add_time" label="添加时间" width="160px">
          <template slot-scope="scope">
            {{ scope.row.add_time | date }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="goEditPage(scope.row.goods_id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeGoodsById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 页码 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 50, 100]"
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
  name: 'GoodsPage',
  components: { Breadcrumb },
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      goodsList: [],
      total: 0
    }
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('取得商品列表失败')
      } else {
        this.goodsList = res.data.goods
        this.total = res.data.total
      }
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 删除
    async removeGoodsById(id) {
      const confirmResult = await this.$confirm('确认删除該用戶嗎？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      } else {
        const { data: res } = await this.$http.delete(`goods/${id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除商品失败')
        } else {
          this.getGoodsList()
          this.$message.success('删除商品成功')
        }
      }
    },
    // 跳转添加商品页面
    goAddPage() {
      this.$router.push('/goods/add')
    },
    // 跳转修改商品页面
    goEditPage(id) {
      this.$router.push(`/goods/edit?id=${id}`)
    }
  },
  created() {
    this.getGoodsList()
  }
}
</script>
