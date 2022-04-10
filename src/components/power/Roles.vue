<template>
  <div>
    <!-- 麵包屑 -->
    <Breadcrumb name1="权限管理" name2="角色列表" />

    <!-- 卡片 -->
    <el-card>
      <el-row>
        <el-button type="primary" @click="addDialogVisible = true"
          >添加角色</el-button
        >
      </el-row>

      <el-table :data="rolesList" border stripe>
        <!-- 展開列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1, key1) in scope.row.children"
              :key="item1.id"
              :class="[key1 === 0 ? '' : 'border-top', 'flex-center']"
            >
              <el-col :span="5">
                <el-tag>{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  v-for="(item2, key2) in item1.children"
                  :key="item2.id"
                  :class="[key2 === 0 ? '' : 'border-top', 'flex-center']"
                >
                  <el-col :span="6">
                    <el-tag type="success">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      :span="14"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="400px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRole(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="setRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      width="50%"
      :visible.sync="addDialogVisible"
      @close="addDialogClose"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        label-width="80px"
        :rules="addFormRules"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addRoles">确定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色對話框 -->
    <el-dialog
      title="修改角色"
      width="50%"
      :visible.sync="editDialogVisible"
      @close="editDialogClose"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        label-width="80px"
        :rules="addFormRules"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="editRoles">确定</el-button>
      </span>
    </el-dialog>

    <!-- 修改权限對話框 -->
    <el-dialog
      title="修改角色权限"
      width="50%"
      :visible.sync="setRightVisible"
      @close="setRightClose"
    >
      <!-- 樹形 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defaultKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightVisible = false">取消</el-button>
        <el-button type="primary" @click="allotRights()">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Breadcrumb from '../Breadcrumb.vue'
export default {
  name: 'RolesPage',
  components: { Breadcrumb },
  data() {
    return {
      rolesList: [],
      addDialogVisible: false,
      addForm: { roleName: '', roleDesc: '' },
      addFormRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          {
            required: true,
            message: '请输入角色描述',
            trigger: 'blur'
          }
        ]
      },
      editDialogVisible: false,
      editForm: { roleName: '', roleDesc: '' },
      setRightVisible: false,
      rightsList: [],
      // 樹形控件的屬性
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默認選取的id值
      defaultKeys: [],
      rightsDialogId: ''
    }
  },
  methods: {
    // 獲取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.danger('获取角色列表失败')
      } else {
        this.rolesList = res.data
      }
    },
    // 監聽添加對話框關閉
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加角色
    async addRoles() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('/roles', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        } else {
          this.addDialogVisible = false
          this.getRolesList()
          this.$message.success('添加角色成功')
        }
      })
    },
    // 打開編輯對話框
    async editDialog(id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.danger('获取角色失败')
      } else {
        this.editForm = res.data
      }
    },
    // 監聽修改對話框關閉
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改角色
    editRoles() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `roles/${this.editForm.roleId}`,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改角色失败')
        } else {
          this.editDialogVisible = false
          this.getRolesList()
          this.$message.success('添加角色成功')
        }
      })
    },
    // 删除
    async removeRole(id) {
      const confitmResult = await this.$confirm('确認删除该角色吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (confitmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败')
      } else {
        this.getRolesList()
        this.$message.success('删除角色成功')
      }
    },
    // 根據id删除权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm('确认删除該权限嗎？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      } else {
        // 這樣會整個重新渲染，展開列會被關閉
        // this.getRolesList()
        role.children = res.data
        this.$message.success('删除权限成功')
      }
    },
    // 打開分配权限對話框
    async setRightDialog(role) {
      this.rightsDialogId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限數據失败')
      } else {
        this.rightsList = res.data
      }
      this.getLeafKeys(role, this.defaultKeys)
      this.setRightVisible = true
    },
    // 通過遞歸获取角色下所有三級权限的id，並保存到defaultKeys數組中
    getLeafKeys(role, arr) {
      // 當前節點不包含children，是三級節點
      if (!role.children) {
        return arr.push(role.id)
      }
      role.children.forEach((item) => {
        this.getLeafKeys(item, arr)
      })
    },
    // 監聽分配权限對話框關閉
    setRightClose() {
      this.defaultKeys = []
    },
    // 分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]

      const string = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.rightsDialogId}/rights`,
        { rids: string }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('更新权限失败')
      } else {
        this.getRolesList()
        this.setRightVisible = false
        this.$message.success('更新权限成功')
      }
    }
  },
  created() {
    this.getRolesList()
  }
}
</script>

<style lang="scss" scoped>
.el-tag {
  margin: 8px;
}
.border-top {
  border-top: 1px solid #eee;
}
.flex-center {
  display: flex;
  align-items: center;
}
</style>
