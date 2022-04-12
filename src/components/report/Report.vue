<template>
  <div>
    <!-- 麵包屑 -->
    <Breadcrumb name1="数据统计" name2="数据报表" />

    <!-- 卡片 -->
    <el-card>
      <!-- 2. 为echarts准备一个容器 -->
      <div id="main" style="width: 700px; height: 400px"></div>
    </el-card>
  </div>
</template>

<script>
import Breadcrumb from '../Breadcrumb.vue'
// 1. 导入
import * as echarts from 'echarts'
import _ from 'lodash'
export default {
  name: 'ReportPage',
  components: { Breadcrumb },
  data() {
    return {
      // 需要合并的数据
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  async mounted() {
    // 3. 初始化准备好的dom元素
    const myChart = echarts.init(document.getElementById('main'))

    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('获取折线图数据失败')
    }

    // 4. 准备数据和配置像
    const result = _.merge(res.data, this.options)
    // 5.展示数据
    myChart.setOption(result)
  }
}
</script>
