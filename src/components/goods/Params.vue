<template>
  <div>
    <!-- 麵包屑 -->
    <Breadcrumb name1="商品管理" name2="分类参数" />
    <!-- 卡片 -->
    <el-card>
      <!-- 警告区 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
        show-icon
      >
      </el-alert>

      <!-- 选择商品分类区 -->
      <el-row class="options">
        <el-col>
          <span> 选择商品分类： </span>
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            :props="cateProps"
            @change="cateChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab区域 -->
      <el-tabs v-model="active" @tab-click="handleTabClick">
        <!-- 动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            :disabled="isBtnDisable"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  :key="item"
                  v-for="(item, index) in scope.row.attr_vals"
                  closable
                  @close="handleClose(scope.row, index)"
                >
                  {{ item }}
                </el-tag>
                <!-- 动态输入 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column
              prop="attr_name"
              label="参数名称"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            :disabled="isBtnDisable"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  :key="item"
                  v-for="(item, index) in scope.row.attr_vals"
                  closable
                  @close="handleClose(scope.row, index)"
                >
                  {{ item }}
                </el-tag>
                <!-- 动态输入 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column
              prop="attr_name"
              label="属性名称"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加' + dialogTitle"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addFormClose"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        label-width="100px"
        :rules="addFormRules"
      >
        <el-form-item :label="dialogTitle" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addParams">确定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改' + dialogTitle"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editFormClose"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        label-width="100px"
        :rules="addFormRules"
      >
        <el-form-item :label="dialogTitle" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="editParams">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Breadcrumb from '../Breadcrumb.vue'
export default {
  name: 'ParamsPage',
  components: { Breadcrumb },
  data() {
    return {
      cateList: [],
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      selectedKeys: [],
      active: 'many',
      manyTableData: [],
      onlyTableData: [],
      addDialogVisible: false,
      addForm: {
        attr_name: '',
        attr_sel: ''
      },
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          }
        ]
      },
      editDialogVisible: false,
      editForm: {
        attr_name: '',
        attr_sel: ''
      }
    }
  },
  methods: {
    // 获取所有商品分类
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 3 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      } else {
        this.cateList = res.data
      }
    },
    // 选择框变化
    cateChange() {
      // 如果不是三级分类
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        // this.$message.error('只允许为第三级分类设置相关参数！')
      } else {
        this.getParamsData()
      }
    },
    // tab点击事件函数
    handleTabClick() {
      this.getParamsData()
    },
    // 获取表格资料
    async getParamsData() {
      // 根据选中分类的id，获取对应资料
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.active } }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品参数失败!')
      } else {
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          item.inputVisible = false
          item.inputValue = ''
        })
        if (this.active === 'many') {
          this.manyTableData = res.data
        } else {
          this.onlyTableData = res.data
        }
      }
      // console.log(res.data)
    },
    // 监听添加表格 关闭
    addFormClose() {
      this.$refs.addFormRef.resetFields()
      this.addForm = {}
    },
    // 添加参数
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.active
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error(`添加${this.dialogTitle}失败`)
        } else {
          this.getParamsData()
          this.addDialogVisible = false
          this.$message.success(`添加${this.dialogTitle}成功`)
        }
      })
    },
    // 显示修改对话框
    async showEditDialog(id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${id}`,
        {
          attr_sel: this.editForm.attr_sel
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error(`获取${this.dialogTitle}失败`)
      } else {
        this.editForm = res.data
      }
    },
    // 监听修改表格 关闭
    editFormClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改参数
    editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.active
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error(`修改${this.dialogTitle}失败`)
        } else {
          this.getParamsData()
          this.editDialogVisible = false
          this.$message.success(`修改${this.dialogTitle}成功`)
        }
      })
    },
    // 删除参数
    async removeParams(id) {
      const confitmResult = await this.$confirm(
        `确認删除该${this.dialogTitle}吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      if (confitmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${id}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error(`删除${this.dialogTitle}失败`)
      } else {
        this.getParamsData()
        this.$message.success(`删除${this.dialogTitle}成功`)
      }
    },
    // input失去焦点或按下enter触发事件
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
      } else {
        row.attr_vals.push(row.inputValue)
        row.inputValue = ''
        // 发起请求存入资料库
        this.saveAttrValues(row)
      }
    },
    // 点击按钮显示input
    showInput(row) {
      row.inputVisible = true
      // 让input自动获取焦点
      // $nextTick 当页面上的元素被重新渲染后，才会指定回调函数中的代码
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 对 attr_vals 的操作
    async saveAttrValues(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.active,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('添加参数项目失败')
      } else {
        this.$message.success('添加参数项目成功')
        row.inputVisible = false
      }
    },
    // 删除对应的参数
    async handleClose(row, index) {
      row.attr_vals.splice(index, 1)
      this.saveAttrValues(row)
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    isBtnDisable() {
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    dialogTitle() {
      if (this.active === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.options {
  margin-top: 15px;
  span {
    font-size: 16px;
  }
}
.el-cascader {
  width: 400px;
}
.button-new-tag {
  margin: 8px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin: 8px;
  vertical-align: bottom;
}
</style>
