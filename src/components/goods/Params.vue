<template>
  <div>
    <!-- 麵包屑 -->
    <Breadcrumb name1="商品管理" name2="分类参数" />
    <!-- 卡片 -->
    <el-card></el-card>
  </div>
</template>

<script>
import Breadcrumb from '../Breadcrumb.vue'
export default {
  name: 'ParamsPage',
  components: { Breadcrumb },
  data() {
    return {}
  }
}
</script>
