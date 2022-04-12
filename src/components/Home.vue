<template>
  <el-container class="home_container">
    <el-header>
      <div>
        <div class="home_logo">
          <img src="../assets/logo.png" alt="Logo" class="cover-fit" />
        </div>
        <span>後台管理系統</span>
      </div>
      <el-button type="info" @click="logout">登出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle_button" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#757575"
          text-color="#fff"
          active-text-color="#FFC107"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一級菜單 index 只接受字串 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menuList"
            :key="item.id"
          >
            <!-- 一級菜單的模板區域 -->
            <template slot="title">
              <i class="iconfont" :class="iconsObject[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二級菜單 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)"
            >
              <i class="el-icon-menu"></i>{{ subItem.authName }}</el-menu-item
            >
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      menuList: [],
      iconsObject: {
        125: 'icon-users',
        103: 'icon-tijikongjian',
        101: 'icon-shangpin',
        102: 'icon-danju',
        145: 'icon-baobiao'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有菜單
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      } else {
        this.menuList = res.data
      }
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  }
}
</script>

<style lang="scss" scoped>
.home_container {
  height: 100%;
}
.el-header {
  background-color: #212121;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  > div {
    display: flex;
    align-items: center;
    font-size: 16px;
  }
  .home_logo {
    width: 30px;
    height: 30px;
    margin-right: 20px;
  }
}
.el-aside {
  background-color: #757575;
  .toggle_button {
    background-color: #bdbdbd;
    font-size: 14px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 2px;
    cursor: pointer;
  }
  .el-menu {
    border: transparent;
  }
}

.el-main {
  background-color: #eee;
}

.iconfont {
  margin: 0 4px;
}
</style>
