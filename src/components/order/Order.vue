<template>
  <div>
    <!-- 麵包屑 -->
    <Breadcrumb name1="订单管理" name2="订单详情" />

    <!-- 卡片 -->
    <el-card>
      <el-form :model="order" label-width="100px">
        <el-form-item label="会员编号">
          <el-input v-model="order.user_id" disabled></el-input>
        </el-form-item>
        <el-form-item label="订单编号">
          <el-input v-model="order.order_number" disabled></el-input>
        </el-form-item>
        <el-form-item label="订单金额">
          <el-input v-model="order.order_price" disabled></el-input>
        </el-form-item>
        <el-form-item label="付款方式">
          <el-radio-group v-model="order.order_pay">
            <el-radio label="0" v-if="order.order_pay === '0'">未支付</el-radio>
            <el-radio label="1">支付宝</el-radio>
            <el-radio label="2">微信</el-radio>
            <el-radio label="3">银行卡</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出货状态">
          <el-radio-group v-model="order.is_send" disabled>
            <el-radio label="否">未出货</el-radio>
            <el-radio label="是">已出货</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="订单成立时间">
          <el-input v-model="order.create_time" disabled> </el-input>
        </el-form-item>
        <el-button type="primary" @click="handleChange">修改订单</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import Breadcrumb from '../Breadcrumb.vue'
export default {
  name: 'OrderPage',
  components: { Breadcrumb },
  data() {
    return {
      id: '',
      order: {}
    }
  },
  methods: {
    async getOrder() {
      const { data: res } = await this.$http.get(`orders/${this.id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单失败')
      } else {
        this.order = res.data
      }
    },
    async handleChange() {
      const status = {
        order_pay: this.order.order_pay,
        order_price: this.order.order_price
      }

      const { data: res } = await this.$http.put(`orders/${this.id}`, status)
      if (res.meta.status !== 201) {
        return this.$message.error('修改订单失败')
      } else {
        this.$router.push('/orders')
        this.$message.success('修改订单成功')
      }
    }
  },
  created() {
    this.id = this.$route.query.id
    this.getOrder()
  }
}
</script>
