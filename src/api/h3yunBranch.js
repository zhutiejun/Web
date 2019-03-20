import { axios } from '@/utils/request'


export const h3yunBranch = {
    getServerList: function (parameter) {
        return axios({
            url: '/ServerManageList/',
            method: 'get',
            params: parameter
        })
    },
    getServer: function (parameter) {
        return axios({
            url: '/ServerManage/',
            method: 'get',
            params: parameter
        })
    },
    opTfsBranch: function (parameter) {
        return axios({
            url: '/h3yun/branch',
            method: 'post',
            data: parameter
          })
    },
    deleteServer: function (parameter) {
        return axios({
            url: '/ServerManage/',
            method: 'delete',
            params: parameter
        })
    },
    updateServer: function (parameter) {
        return axios({
            url: '/ServerManage/',
            method: 'put',
            data: parameter
        })
    }
}