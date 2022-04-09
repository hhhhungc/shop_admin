<template>
  <div>
    <!-- 麵包屑 -->
    <Breadcrumb name1="用戶管理" name2="用戶列表" />

    <!-- 卡片 -->
    <el-card>
      <!-- 搜尋框 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            @clear="getUserList"
            clearable
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >新增用戶</el-button
          >
        </el-col>
      </el-row>

      <!-- 表單 -->
      <el-table :data="userList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"> </el-table-column>
        <el-table-column prop="mobile" label="手机号"> </el-table-column>
        <el-table-column prop="email" label="邮箱"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="handleChangeState(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editDialog(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUser(scope.row.id)"
            ></el-button>
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分頁 -->
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

    <!-- 添加用戶對話框 -->
    <el-dialog
      title="添加用戶"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        label-width="80px"
        :rules="addFormRules"
      >
        <el-form-item
          v-for="item in addFormLabel"
          :key="item.name"
          :label="item.label"
          :prop="item.name"
        >
          <el-input v-model="addForm[item.name]" :type="item.type"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addUser">确定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用戶對話框 -->
    <el-dialog
      title="修改用戶"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        label-width="80px"
        :rules="editFormRules"
      >
        <el-form-item label="用戶名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="editUser">确定</el-button>
      </span>
    </el-dialog>

    <!-- 分配属性對話框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClose"
    >
      <div>
        <p>当前的用户: {{ userInfo.username }}</p>
        <p>当前的角色: {{ userInfo.role_name }}</p>
        <p>
          当前新角色:
          <el-select v-model="newRoleId" placeholder="请选择新角色">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRole">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Breadcrumb from '../Breadcrumb.vue'
export default {
  name: 'UserPage',
  components: { Breadcrumb },
  data() {
    const checkEmail = (rule, value, cb) => {
      const reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-]{2,4})$/
      if (reg.test(value)) {
        return cb()
      } else {
        cb(new Error('请输入合法的邮箱'))
      }
    }
    const checkMobile = (rule, value, cb) => {
      const reg =
        /^(13[0-9]|14[01456789]|15[0-3,5-9]|16[2567]|17[0-8]|18[0-9]|19[0-3,5-9])\d{8}$/
      if (reg.test(value)) {
        return cb()
      } else {
        cb(new Error('请输入合法的手机号'))
      }
    }
    return {
      // 获取用戶列表參數對象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      userList: [],
      total: 0,
      addDialogVisible: false,
      addForm: {
        username: 'test',
        password: '1234',
        email: 'test@test.test',
        mobile: '18388888888'
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入用戶名', trigger: 'blur' },
          { min: 4, max: 10, message: '长度在 4 到 10 個字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 4, max: 10, message: '长度在 4 到 10 個字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },
      addFormLabel: [
        {
          label: '用戶名',
          name: 'username',
          type: 'text'
        },
        {
          label: '密码',
          name: 'password',
          type: 'password'
        },
        {
          label: '邮箱',
          name: 'email',
          type: 'email'
        },
        {
          label: '手机号',
          name: 'mobile',
          type: 'tel'
        }
      ],
      editDialogVisible: false,
      editForm: {
        id: '',
        username: '',
        email: '',
        mobile: ''
      },
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },
      setRoleDialogVisible: false,
      userInfo: {},
      newRoleId: '',
      rolesList: []
    }
  },
  methods: {
    // 获取用户列表
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$$message.error('获取用戶列表失败')
      } else {
        this.userList = res.data.users
        this.total = res.data.total
      }
    },
    // 監聽pagesize改變的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 監聽頁碼值改變的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 改變用戶状态
    async handleChangeState(user) {
      const { data: res } = await this.$http.put(
        `users/${user.id}/state/${user.mg_state}`
      )
      if (res.meta.status !== 200) {
        user.mg_state = !user.mg_state
        return this.$message.error('改变用戶状态失败！')
      } else {
        this.$message.success('改变用戶状态成功！')
      }
    },
    // 監聽添加用戶對話框關閉
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加新用戶
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加用戶失败')
        this.addDialogVisible = false
        this.getUserList()
        this.$message.success('添加用戶成功')
      })
    },
    // 展示修改對話框
    async editDialog(id) {
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用戶信息失败')
      } else {
        this.editDialogVisible = true
        this.editForm = res.data
      }
    },
    // 監聽修改用戶對話框關閉
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
      this.editForm = {}
    },
    // 修改用戶信息並提交
    editUser() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `users/${this.editForm.id}`,
          { email: this.editForm.email, mobile: this.editForm.mobile }
        )
        if (res.meta.status !== 200) return this.$message.error('修改用戶失败')
        this.editDialogVisible = false
        this.getUserList()
        this.$message.success('修改用戶成功')
      })
    },
    // 確認删除 對話框
    async removeUser(id) {
      const confirmResult = await this.$confirm('确认删除該用戶嗎？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      // console.log(confirmResult)
      // 確認 --> confirm
      // 取消 --> cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`users/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除用戶失败')
      this.getUserList()
      this.$message.success('删除用戶成功')
    },
    // 分配角色 對話框
    async setRole(user) {
      this.userInfo = user
      this.setRoleDialogVisible = true
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      } else {
        this.rolesList = res.data
      }
    },
    // 点击按钮分配角色
    async saveRole() {
      if (!this.newRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role
`,
        { rid: this.newRoleId }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('分配角色权限失败')
      } else {
        this.getUserList()
        this.setRoleDialogVisible = false
        this.$message.success('更新角色权限成功')
      }
    },
    // 监听分配角色对话框关闭
    setRoleDialogClose() {
      this.newRoleId = ''
      this.userInfo = {}
    }
  },
  created() {
    this.getUserList()
  }
}
</script>
