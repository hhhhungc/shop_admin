<template>
  <div>
    <!-- 麵包屑 -->
    <Breadcrumb name1="商品管理" name2="添加商品" />
    <el-card>
      <!-- 警告 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 步骤 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tabs栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-position="top"
      >
        <el-tabs
          tab-position="left"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="cateChange"
                clearable
              >
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_value">
                <el-checkbox
                  :label="item2"
                  v-for="item2 in item.attr_total_value"
                  :key="item2"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 图片要上传到后台api的地址 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
              multiple
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">
                只能上传jpg/png文件，且不超过500kb
              </div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"> </quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="upload_btn" @click="addGoods"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" class="cover-fit" alt="图片预览" />
    </el-dialog>
  </div>
</template>

<script>
import Breadcrumb from '../Breadcrumb.vue'
import _ from 'lodash'
export default {
  name: 'GoodsAddPage',
  components: { Breadcrumb },
  data() {
    return {
      activeIndex: '0',
      addForm: {
        goods_name: '电视',
        goods_price: 1,
        goods_number: 1,
        goods_weight: 1,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      cateList: [],
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      manyTableData: [],
      onlyTableData: [],
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewVisible: false,
      previewPath: '',
      formValid: false
    }
  },
  methods: {
    // 获取商品分类
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      } else {
        this.cateList = res.data
      }
    },
    // 选择框变化
    cateChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 检查基本信息的必填栏位
    checkForm() {
      this.$refs.addFormRef.validate((valid) => {
        if (!valid) {
          this.$message.error('请填写表单中必填栏位')
          this.formValid = false
          return
        }
        this.formValid = true
      })
    },
    // 离开原本tab之前触发
    beforeTabLeave(activeName, oldActiveName) {
      // 检查基本信息的必填栏位
      if (oldActiveName === '0') {
        this.checkForm()
        if (this.formValid === false) return false
      }
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('請選擇商品分類')
        return false
      }
    },
    // tab被点击时
    tabClicked() {
      if (this.activeIndex === '1') {
        this.getParams()
      } else if (this.activeIndex === '2') {
        this.getAttr()
      }
    },
    // 获取商品參數
    async getParams() {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: 'many' } }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品参数失败')
      } else {
        res.data.forEach((item) => {
          item.attr_total_value = item.attr_vals
            ? item.attr_vals.split(' ')
            : []
          item.attr_value = item.attr_vals ? item.attr_vals.split(' ') : []
        })
        this.manyTableData = res.data
      }
    },
    // 获取商品属性
    async getAttr() {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: 'only' } }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品属性失败')
      } else {
        this.onlyTableData = res.data
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 处理图片移除效果
    handleRemove(file) {
      // 获取要删除的图片的路径 -> 从pics中找到图片对应的索引值 -> 调用数组的splice 把图片从数组中删除
      const filePath = file.response.data.tmp_path
      const fileIndex = this.addForm.pics.findIndex(
        (item) => item.pic === filePath
      )
      this.addForm.pics.splice(fileIndex, 1)
    },
    // 监听图片上传成功的事件
    handleSuccess(res) {
      if (res.meta.status !== 200) {
        return this.$message.error('上传图片失败')
      } else {
        // 上传成功 得到图片回传 -> 将图片信息对象push到pics数组中
        const picture = { pic: res.data.tmp_path }
        this.addForm.pics.push(picture)
      }
    },
    // 添加商品
    async addGoods() {
      // this.$refs.addFormRef.validate((valid) => {
      //   if (!valid) return this.$message.error('请填写表单中必填栏位')
      // })

      // 使用lodash cloneDeep深拷贝，不要对原本的资料修改
      const form = _.cloneDeep(this.addForm)
      form.goods_cat = form.goods_cat.join(',')

      this.manyTableData.forEach((item) => {
        form.attrs.push({
          attr_id: item.attr_id,
          attr_value: item.attr_value.join(' ')
        })
      })
      this.onlyTableData.forEach((item) => {
        form.attrs.push({
          attr_id: item.attr_id,
          attr_value: item.attr_vals
        })
      })
      const { data: res } = await this.$http.post('goods', form)
      console.log('添加成功 ', res)
      if (res.meta.status !== 201) {
        return this.$message.error('添加商品失败')
      } else {
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      }
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="scss" scoped>
.el-cascader {
  width: 100%;
}
.el-checkbox {
  margin: 0 10px 10px 0 !important;
}
.upload_btn {
  margin-top: 15px;
}
</style>
