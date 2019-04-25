<template>
  <div class="app-container">
    <div class="filter-container el-form-item">
      <el-input v-model="listQuery.userName" :placeholder="$t('admin.userName')" style="width: 200px;margin-right: 10px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="button" @click="handleFilter">
        {{ $t('admin.query') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="success" @click="handleCreate">
        {{ $t('admin.add') }}
      </el-button>
      <el-button class="filter-item" type="danger" :disabled="multipleSelection.length <= 0" @click="batchDeletion">
        {{ $t('admin.batchDeletion') }}
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      @selection-change="handleSelectionChange"
    >
      <el-table-column
      type="selection"
      width="50">
      </el-table-column>
      <el-table-column align="center" label="ID" width="80">
        <template slot-scope="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('admin.userName')" align="center">
        <template slot-scope="scope">
          {{ scope.row.user_name }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('admin.email')" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.email }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('admin.mobile')" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.mobile }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" :label="$t('admin.status')" width="110" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" :label="$t('admin.createTime')" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.create_time | parseTime()}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="操作" width="200">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            {{ $t('admin.modify') }}
          </el-button>
          <el-button v-if="row.status!='注销'" size="mini" type="danger" @click="handleModifyStatus(row,'注销')">
            {{ $t('admin.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="80px" style="width: 400px; margin-left:50px;">
        <el-form-item :label="$t('admin.userName')" prop="user_name">
          <el-input v-model="temp.user_name" placeholder="登录账号" />
        </el-form-item>
        <el-form-item :label="$t('admin.password')" prop="password">
          <el-input type="password" v-model="temp.password" :placeholder="$t('admin.password')" />
        </el-form-item>
        <el-form-item :label="$t('admin.confirmPassword')" prop="confirm_password">
          <el-input type="password" v-model="temp.confirm_password" :placeholder="$t('admin.confirmPassword')" />
        </el-form-item>
        <el-form-item :label="$t('admin.email')" prop="email">
          <el-input v-model="temp.email" :placeholder="$t('admin.email')" />
        </el-form-item>
        <el-form-item :label="$t('admin.mobile')" prop="mobile">
          <el-input v-model="temp.mobile" :placeholder="$t('admin.mobile')" />
        </el-form-item>
        <el-form-item :label="$t('admin.role')">
        </el-form-item>
        <el-form-item :label="$t('admin.status')">
          <el-radio-group v-model="temp.status">
            <el-radio :label="1">禁用</el-radio>
            <el-radio :label="0">正常</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('admin.cancel') }}
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          {{ $t('admin.confirm') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getList, createAdmin, updateAdmin } from '@/api/table'
import { parseTime } from '@/utils'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        '正常': 'success',
        '禁用': 'gray',
        '注销': 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'));
      } else {
        if (this.temp.password !== '') {
          // this.$refs.dataForm.validateField('password');
          callback();
        }
        // callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.temp.password) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    var validateMobile = (rule, value, callback) => {
      let reg = /^1\d{10}$/;
      if (value === '' ) {
        callback(new Error('手机号不能为空!'));
      } else if (value && !reg.test(value)) {
         callback(new Error('手机号格式错误!'));
      } else {
        callback();
      }
    };
    return {
      list: null,
      listLoading: true,
      listQuery: {
        id: undefined,
        user_name: undefined,
        email: undefined,
        mobile: undefined,
        status: undefined,
        create_time: undefined,
        sort: '+id'
      },
      temp: {
        user_name: '',
        password: '',
        confirm_password: '',
        email: '',
        mobile: '',
        status: 0
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改',
        create: '新增'
      },
      rules: {
        user_name: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
        password: [{ required: true, validator: validatePass, trigger: 'blur'}],
        confirm_password: [{  required: true, validator: validatePass2, trigger: 'blur'}],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        mobile: [{ required: true, validator: validateMobile, trigger: 'blur' }]
      },
      multipleSelection: []
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getList().then(response => {
        this.list = response.data.items
        this.listLoading = false
      })
    },
    handleFilter() {
      this.fetchData()
    },
    resetTemp() {
      this.temp = {
        user_name: '',
        password: '',
        confirm_password: '',
        email: '',
        mobile: '',
        status: 0
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    batchDeletion() {
      let arr = Object.assign([], this.list)
      arr.forEach((l, index) => {
        this.multipleSelection.forEach(m => {
          if (m.id === l.id) {
            // arr.push(l);
            arr.splice(index, 1)
          }
        })
      })
      this.list = arr
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.create_time = new Date().getTime();
          this.temp.status = this.temp.status > 0 ? '禁用' : '正常'
          createAdmin(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.create_time = new Date(this.temp.create_time)
      this.temp.status = this.temp.status === '注销' ? undefined : this.temp.status === '禁用' ? 1 : 0
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.create_time = +new Date(tempData.create_time) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          this.temp.status = this.temp.status > 0 ? '禁用' : '正常'
          updateAdmin(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
    },
  }
}
</script>
