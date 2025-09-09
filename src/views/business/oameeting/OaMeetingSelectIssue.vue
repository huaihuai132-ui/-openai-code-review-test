        <el-table-column label="上会状态" align="center" prop="issueStatus">
          <template #default="scope">
            <dict-tag :type="DICT_TYPE.ISSUE_STATUS" :value="scope.row.issueStatus" />
          </template>
        </el-table-column>