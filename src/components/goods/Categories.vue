<template>
  <div>
    <!-- 面包屑导航区域 -->
    <Breadcrumb name1="商品管理" name2="商品分类" />
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-button type="primary" @click="showAddDialog">添加分类</el-button>
      </el-row>
      <el-row>
        <!-- 表格 -->
        <tree-table
          :data="cateList"
          :expand-type="false"
          :selection-type="false"
          show-index
          index-text="#"
          stripe
          border
          :show-row-hover="false"
          :columns="columns"
          class="treetable"
        >
          <!-- 是否有效 -->
          <template slot="isValid" slot-scope="scope">
            <i class="el-icon-success" v-if="!scope.row.cat_deleted"></i>
            <i class="el-icon-error" v-else></i>
          </template>
          <!-- 排序 -->
          <template slot="order" slot-scope="scope">
            <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag size="mini" type="success" v-if="scope.row.cat_level === 1"
              >二级</el-tag
            >
            <el-tag size="mini" type="warning" v-if="scope.row.cat_level === 2"
              >三级</el-tag
            >
          </template>
          <!-- 操作 -->
          <template slot="operate" slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.cat_id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeCate(scope.row.cat_id)"
              >删除</el-button
            >
          </template>
        </tree-table>
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
      </el-row>
    </el-card>

    <!-- 添加对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <el-form
        :model="addForm"
        ref="addFormRef"
        label-width="100px"
        :rules="addFormRules"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options 用来指定数据 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addCate">确定</el-button>
      </span>
    </el-dialog>

    <!-- 修改对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <el-form
        :model="editForm"
        ref="editFormRef"
        label-width="100px"
        :rules="addFormRules"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="editCate">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Breadcrumb from '../Breadcrumb.vue'
export default {
  name: 'CategoriesPage',
  components: { Breadcrumb },
  data() {
    return {
      cateList: [],
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      // 为table指定列的定义
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        { label: '是否有效', type: 'template', template: 'isValid' },
        { label: '排序', type: 'template', template: 'order' },
        { label: '操作', type: 'template', template: 'operate' }
      ],
      addDialogVisible: false,
      // 添加分类的表单数据，cat_pid父级分类id，cat_level分类的等级
      addForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      parentCateList: [],
      // cascader 配置项
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: 'true'
      },
      selectedKeys: [],
      editDialogVisible: false,
      editForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      }
    }
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败!')
      } else {
        this.cateList = res.data.result
        this.total = res.data.total
      }
    },
    // 监听pagesize改变
    handleSizeChange(newValue) {
      this.queryInfo.pagesize = newValue
      this.getCateList()
    },
    // 监听页码的改变
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage
      this.getCateList()
    },
    // 添加分类对话框
    showAddDialog() {
      this.getParentCateList()
      this.addDialogVisible = true
    },
    // 监听分类对话框关闭
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
      this.selectedKeys = []
      this.addForm.cat_pid = 0
      this.addForm.cat_level = 0
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类失败!')
      } else {
        this.parentCateList = res.data
      }
    },
    // cascader change时触发
    parentCateChange() {
      if (this.selectedKeys.length) {
        this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addForm.cat_level = this.selectedKeys.length
      } else {
        this.addForm.cat_pid = 0
        this.addForm.cat_level = 0
      }
    },
    // cascader添加分类
    addCate() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败!')
        } else {
          this.getCateList()
          this.addDialogVisible = false
          this.$message.success('添加分类成功')
        }
      })
    },
    // 监听分类对话框关闭
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
      this.selectedKeys = []
      this.addForm.cat_pid = 0
      this.addForm.cat_level = 0
    },
    // 编辑分类对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`categories/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品失败!')
      } else {
        this.editForm = res.data
        this.editDialogVisible = true
      }
    },
    // 修改分类
    editCate() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.editForm.cat_id}`,
          { cat_name: this.editForm.cat_name }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改商品失败!')
        } else {
          this.getCateList()
          this.editDialogVisible = false
          this.$message.success('修改商品成功')
        }
      })
    },
    // 删除分类
    async removeCate(id) {
      const confirmResult = await this.$confirm('确认删除該分类嗎', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      } else {
        const { data: res } = await this.$http.delete(`categories/${id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除分类失败')
        } else {
          this.$message.success('删除分类成功')
          this.getCateList()
        }
      }
    }
  },
  created() {
    this.getCateList()
  }
}
</script>

<style lang="scss" scoped>
.treetable {
  margin-top: 15px;
}
.el-icon-success {
  color: lightgreen;
}
.el-icon-error {
  color: red;
}
</style>
