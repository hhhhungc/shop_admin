<template>
  <div>
    <!-- 麵包屑 -->
    <Breadcrumb name1="订单管理" name2="订单列表" />

    <!-- 卡片 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            v-model="queryInfo.query"
            clearable
            @clear="getOrderList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getOrderList"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="order_pay" label="是否付款">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.order_pay === '0'"
              >未付款</el-tag
            >
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">
            {{ scope.row.create_time | date }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showAddressDialog"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="showProgress"
            ></el-button>
            <el-button
              type="warning"
              icon="el-icon-search"
              size="mini"
              @click="goOrderPage(scope.row.order_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 页码 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 修改地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressVisible"
      width="50%"
      @close="addressDialogClose"
    >
      <el-form
        :model="addressForm"
        :rules="addressRules"
        ref="addressFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="city">
          <el-cascader
            :options="cityOptions"
            :props="cityProps"
            v-model="addressForm.city"
            clearable
          >
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="addressForm.address"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取消</el-button>
        <el-button type="primary" @click="editAddress">确定</el-button>
      </span>
    </el-dialog>

    <!-- 展示物流进度对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in progressInfo"
          :key="index"
          :timestamp="item.time"
        >
          {{ item.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import Breadcrumb from '../Breadcrumb.vue'
import citydata from './citydata'
export default {
  name: 'OrderList',
  components: { Breadcrumb },
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      orderList: [],
      total: 0,
      addressVisible: false,
      addressForm: {
        city: '',
        address: ''
      },
      addressRules: {
        city: [{ required: true, message: '请选择省市区/县', trigger: 'blur' }],
        address: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      cityOptions: citydata,
      cityProps: {
        label: 'label',
        value: 'value',
        children: 'children',
        expandTrigger: 'hover'
      },
      progressVisible: false,
      progressInfo: []
    }
  },
  methods: {
    // 获取订单列表
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败')
      } else {
        this.orderList = res.data.goods
        this.total = res.data.total
      }
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // 显示修改对话框
    showAddressDialog() {
      this.addressVisible = true
    },
    // 清空地址表单
    addressDialogClose() {
      this.$refs.addressFormRef.resetFields()
    },
    // 编辑地址
    editAddress() {
      this.$refs.addressFormRef.validate((valid) => {
        if (!valid) return
        this.addressVisible = false
      })
    },
    // 显示物流状况对话框
    async showProgress() {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败')
      } else {
        this.progressInfo = res.data
        this.progressVisible = true
      }
    },
    // 前往订单页
    goOrderPage(id) {
      this.$router.push(`order?id=${id}`)
    }
  },
  created() {
    this.getOrderList()
  }
}
</script>
