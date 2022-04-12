<template>
  <div>
    <!-- 麵包屑 -->
    <Breadcrumb name1="商品管理" name2="修改商品" />

    <!-- 卡片 -->
    <el-card>
      <!-- 警告 -->
      <el-alert
        title="修改商品信息"
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
        :model="goodsForm"
        :rules="goodsFormRules"
        ref="goodsFormRef"
        label-position="top"
      >
        <el-tabs
          tab-position="left"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="goodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input
                v-model="goodsForm.goods_price"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input
                v-model="goodsForm.goods_weight"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input
                v-model="goodsForm.goods_number"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="goodsForm.goods_cat"
                :options="cateList"
                :props="cateProps"
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
                  v-for="item2 in item.attr_vals"
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
              <el-input v-model="item.attr_value"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <div
              class="edit_picture"
              v-for="(item, index) in uploadPic"
              :key="index"
            >
              <img :src="item.pics_mid_url" class="cover-fit" alt="图片预览" />
            </div>
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
            <quill-editor v-model="goodsForm.goods_introduce"> </quill-editor>
            <!-- 修改商品按钮 -->
            <el-button type="primary" class="upload_btn" @click="editGoods"
              >修改商品</el-button
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
export default {
  name: 'GoodsEditPage',
  components: { Breadcrumb },
  data() {
    return {
      id: '',
      activeIndex: '0',
      goodsForm: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      goodsFormRules: {
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
    // 获取商品资讯
    async getGoodsById() {
      const { data: res } = await this.$http.get(`goods/${this.id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品数据失败')
      } else {
        this.goodsForm = res.data
        // 把商品分类重新组合成数组
        this.goodsForm.goods_cat = [
          res.data.cat_one_id,
          res.data.cat_two_id,
          res.data.cat_three_id
        ]
      }
      this.getParams()
      this.getAttr()
    },
    // 获取商品分类
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      } else {
        this.cateList = res.data
      }
    },
    // 检查基本信息的必填栏位
    checkForm() {
      this.$refs.goodsFormRef.validate((valid) => {
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
    },
    // 获取商品參數
    async getParams() {
      this.manyTableData = this.goodsForm.attrs.filter(
        (item) => item.attr_sel === 'many'
      )
      this.manyTableData.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.attr_value = item.attr_value ? item.attr_value.split(' ') : []
      })
    },
    // 获取商品属性
    async getAttr() {
      this.onlyTableData = this.goodsForm.attrs.filter(
        (item) => item.attr_sel === 'only'
      )
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
      const fileIndex = this.goodsForm.pics.findIndex(
        (item) => item.pic === filePath
      )
      this.goodsForm.pics.splice(fileIndex, 1)
    },
    // 监听图片上传成功的事件
    handleSuccess(res) {
      if (res.meta.status !== 200) {
        return this.$message.error('上传图片失败')
      } else {
        // 上传成功 得到图片回传 -> 将图片信息对象push到pics数组中
        const picture = { pic: res.data.tmp_path }
        this.goodsForm.pics.push(picture)
      }
    },
    // 修改商品
    async editGoods() {
      const form = {
        goods_name: this.goodsForm.goods_name,
        goods_price: this.goodsForm.goods_price,
        goods_number: this.goodsForm.goods_number,
        goods_weight: this.goodsForm.goods_weight,
        goods_introduce: this.goodsForm.goods_introduce,
        goods_cat: this.goodsForm.goods_cat.join(','),
        pics: this.goodsForm.pics,
        attrs: []
      }

      this.manyTableData.forEach((item) => {
        form.attrs.push({
          attr_id: item.attr_id,
          attr_value: item.attr_value.join(' ')
        })
      })
      this.onlyTableData.forEach((item) => {
        form.attrs.push({
          attr_id: item.attr_id,
          attr_value: item.attr_value
        })
      })
      const { data: res } = await this.$http.put(`goods/${this.id}`, form)
      // console.log('修改成功', res)
      if (res.meta.status !== 200) {
        return this.$message.error('修改商品失败')
      } else {
        this.$message.success('修改商品成功')
        this.$router.push('/goods')
      }
    }
  },
  created() {
    this.id = this.$route.query.id
    this.getCateList()
    this.getGoodsById()
  },
  computed: {
    // 读取商品资料时，有图片的要预览出来，刚上传的不需要出现
    uploadPic() {
      const arr = []
      this.goodsForm.pics.forEach((item) => {
        if (item.pics_mid_url) {
          arr.push(item)
        }
      })
      return arr
    }
  }
}
</script>

<style lang="scss" scoped>
.el-checkbox {
  margin: 0 10px 10px 0 !important;
}
.upload_btn {
  margin-top: 15px;
}
.edit_picture {
  height: 200px;
  width: 300px;
  margin-bottom: 20px;
  position: relative;
}
.remove_btn {
  position: absolute;
  right: 0;
  top: 0;
}
</style>
