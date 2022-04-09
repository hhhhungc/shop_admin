<template>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>{{ name1 }}</el-breadcrumb-item>
    <el-breadcrumb-item>{{ name2 }}</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
export default {
  name: 'BreadCrumb',
  props: {
    name1: String,
    name2: String
  }
}
</script>
