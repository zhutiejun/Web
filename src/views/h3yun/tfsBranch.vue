<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
        <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="服务器名称">
              <a-select
                name="serverNameSelect"
                v-model="queryParam.serverName"
                style="width: 100%"
                @change="reloadList"
              >
                <a-select-option value>全部</a-select-option>
                <a-select-option
                  v-for="item in queryList"
                  v-model="item.serverName"
                  v-bind:key="item.serverName"
                >{{item.serverName}}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="服务器IP">
              <a-select
                name="sliceNoSelect"
                v-model="queryParam.serverIp"
                style="width: 100%"
                @change="reloadList"
              >
                <a-select-option value>全部</a-select-option>
                <a-select-option
                  v-for="item in queryList"
                  v-model="item.serverIp"
                  v-bind:key="item.serverIp"
                >{{item.serverIp}}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="全文检索">
              <a-input v-model="queryParam.key"
                      @blur.native="" @pressEnter="reloadList" style="width: 100%"/>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="() => showModal()">新建</a-button>
      <a-modal
        :visible="formVisible"
        title="服务器信息"
        okText="确认"
        @cancel="() => handleCancel()"
        @ok="() =>handleSave()"
      >
          <a-form layout="vertical" :form="form">
              <a-form-item label="服务器名称">
                  <a-input v-decorator="['serverName',{rules: [{ required: true, message: '请自定义服务器名称' }],}]" />
              </a-form-item>
              <a-form-item label="服务器IP">
                  <a-input v-bind:disabled="form.getFieldValue('id')!=null" v-decorator="['serverIp',{rules: [{ required: true, message: '请输入服务器IP' }],}]" />
              </a-form-item>
              <a-form-item label="外网IP">
                  <a-input v-decorator="['EIP',{rules: [{ required: true, message: '请输入外网IP' }],}]" />
              </a-form-item>
              <a-form-item label="服务器账号">
                  <a-input v-decorator="['serverAccount',{rules: [{ required: true, message: '请输入服务器账号' }],}]" />
              </a-form-item>
              <a-form-item label="服务器密码">
                  <a-input v-decorator="['serverPwd',{rules: [{ required: true, message: '请输入服务器密码' }],}]" />
              </a-form-item>
              <a-form-item label="备注">
                  <a-input v-decorator="['remarks',{rules: [{ message: '备注可选' }],}]" />
              </a-form-item>
          </a-form>

      </a-modal>
    </div>

    <s-table
      ref="table"
      size="default"
      :columns="columns"
      :data="loadData"
      :showAlertInfo="true"
      @onSelect="onChange"
    >
      <template
        v-for="(col, index) in columns"
        v-if="col.scopedSlots"
        :slot="col.dataIndex"
        slot-scope="text, record, index"
      >
        <div :key="index">
          <a-input
            v-if="record.editable"
            style="margin: -5px 0"
            :value="text"
            @change="e => handleChange(e.target.value, record.key, col)"
          />
          <template v-else>{{ text }}</template>
        </div>
      </template>
      <template slot="action" slot-scope="text, record, index">
        <div class="editable-row-operations">
          <span v-if="record.editable">
            <a @click="() => save(record)">保存</a>
            <a-divider type="vertical"/>
            <a-popconfirm title="真的放弃编辑吗?" @confirm="() => cancel(record)">
              <a>取消</a>
            </a-popconfirm>
          </span>
          <span v-else>
            <a class="edit" @click="() => edit(record)">修改</a>
            <a-divider type="vertical"/>
            <a class="delete" @click="() => del(record)">删除</a>
          </span>
        </div>
      </template>
    </s-table>
  </a-card>
</template>

<script>
import STable from "@/components/table/";
import { h3yunBranch } from "@/api/h3yunBranch";
import { contains } from "@/utils/util/";

export default {
  name: "tfsBranch",
  components: {
    STable
  },
    data: function () {
        return {
            queryList: [],
            formVisible: false,
            form: this.$form.createForm(this),
            // 高级搜索 展开/关闭
            advanced: false,
            // 查询参数
            queryParam: {
                serverName: '',
                serverIp: '',
                key: ''
            },
            // 表头
            columns: [
                {
                    title: "服务器名称",
                    dataIndex: "serverName",
                    sorter: true,
                    scopedSlots: {customRender: "serverName"}
                },
                {
                    title: "服务器IP",
                    dataIndex: "serverIp",
                    scopedSlots: {customRender: "serverIp"}
                },
                {
                    title: "外网IP",
                    dataIndex: "EIP",
                    scopedSlots: {customRender: "EIP"}
                },
                {
                    title: "服务器账号",
                    dataIndex: "serverAccount",
                    scopedSlots: {customRender: "serverAccount"}
                },
                {
                    title: "备注",
                    dataIndex: "remarks",
                    scopedSlots: {customRender: "remarks"}
                },
                {
                    table: "操作",
                    dataIndex: "action",
                    width: "120px",
                    scopedSlots: {customRender: "action"}
                }
            ],
            //加载数据方法 必须为 Promise 对象
            loadData: parameter => {
                return serverManage.getServerList(Object.assign(parameter, this.queryParam)).
                then(res => {
                    var res = JSON.parse(res);
                    return res.result;
                });
            },

            selectedRowKeys: [],
            selectedRows: []
        };
    },
    mounted: function() {
    this.init();
    },
  methods: {
      init() {
          var that = this;
          var temp = [];
          serverManage.getServerList().then(res => {
              var res = JSON.parse(res);
              that.queryList = [];
              res.result.forEach(e => {
                  if (!contains(temp, e.serverName)) {
                      temp.push(e.serverName);
                      that.queryList.push(e);
                  }
              });
          });
      },
    showModal() {
      this.init();
      this.form.resetFields();
      this.formVisible = true;
    },
    handleChange(value, key, column) {
      console.log(value, key, column);
    },
      handleCancel() {
      this.form.resetFields();
      this.formVisible = false;
      },
      handleSave() {
      var that = this;
      this.form.validateFields((err, values) => {
        if (!err) {
          var promise = null;
          if (values.id) {
              promise = serverManage.updateServer({
                  id: values.id,
                  serverName: values.serverName,
                  serverIp: values.serverIp,
                  EIP: values.EIP,
                  serverAccount: values.serverAccount,
                  serverPwd: values.serverPwd,
                  remarks: values.remarks
              });
          } else {
            promise = serverManage.addServer({
                serverName: values.serverName,
                serverIp: values.serverIp,
                EIP: values.EIP,
                serverAccount: values.serverAccount,
                serverPwd: values.serverPwd,
                remarks: values.remarks
            });
          }
          promise
            .then(res => {
              that.$message.success("成功！");
              that.formVisible = false;
              that.queryParam.key = '';
              that.$refs.table.refresh();
              that.form.resetFields();
            })
            .catch(err => {
              that.$message.error("添加失败" + err);
            });
        }
      });

    },
      edit: function (row) {
        this.form.getFieldValue("id");
        this.form.getFieldValue("serverName");
        this.form.getFieldValue("serverIp");
        this.form.getFieldValue("EIP");
        this.form.getFieldValue("serverAccount");
        this.form.getFieldValue("serverPwd");
        this.form.getFieldValue("remarks");
        this.formVisible = true;
        this.form.setFieldsValue({
            id: row.id,
            serverName: row.serverName,
            serverIp: row.serverIp,
            EIP: row.EIP,
            serverAccount: row.serverAccount,
            serverPwd: "",
            remarks: row.remarks
        });
      },
    // eslint-disable-next-line
    del(row) {
      var that = this;
      this.$confirm({
        title: "警告",
        content: "真的要删除吗?",
        okText: "删除",
        okType: "danger",
        cancelText: "取消",
        onOk() {
          return new Promise((resolve, reject) => {
            setTimeout(function() {
              serverManage
                .deleteServer({id: row.id})
                .then(res => {
                  that.$message.success("服务器" + row.serverName + "删除成功！");
                  that.$refs.table.refresh();
                  resolve();
                })
                .catch(err => {
                  reject(err);
                  that.$message.error("删除失败，" + err);
                });
            }, 1000);
          }).catch(() => console.log("Oops errors!"));
        },
        onCancel() {
          console.log("Cancel");
          that.$message.success("取消成功");
          that.$refs.table.refresh();
        }
      });
    },
    save(row) {
      delete row.editable;
      this.$refs.table.updateEdit();
    },
    cancel(row) {
      delete row.editable;
      this.$refs.table.updateEdit();
    },

    onChange(row) {
      this.selectedRowKeys = row.selectedRowKeys;
      this.selectedRows = row.selectedRows;
    },
    toggleAdvanced() {
      this.advanced = !this.advanced
    },
    reloadList() {
      this.$refs.table.refresh();
    }
  },
  watch: {
    /*
            'selectedRows': function (selectedRows) {
              this.needTotalList = this.needTotalList.map(item => {
                return {
                  ...item,
                  total: selectedRows.reduce( (sum, val) => {
                    return sum + val[item.dataIndex]
                  }, 0)
                }
              })
            }
            */
  }
}
</script>

<style lang="less" scoped>
  /*.search {*/
    /*margin-bottom: 54px;*/
  /*}*/

  /*.fold {*/
    /*width: calc(100% - 216px);*/
    /*display: inline-block*/
  /*}*/

  /*.operator {*/
    /*margin-bottom: 18px;*/
  /*}*/

  /*@media screen and (max-width: 900px) {*/
    /*.fold {*/
      /*width: 100%;*/
    /*}*/
  /*}*/
</style>