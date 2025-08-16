<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="128px"
      v-loading="formLoading"
    >
      <el-form-item label="融资租赁单编号" prop="leaseId">
        <el-input v-model="formData.leaseId" placeholder="请输入融资租赁单编号" />
      </el-form-item>
      <el-form-item label="企业id" prop="companyId">
        <el-select v-model="formData.companyId" placeholder="请选择企业id">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="租赁总额" prop="leaseAmount">
        <el-input v-model="formData.leaseAmount" placeholder="请输入租赁总额" />
      </el-form-item>
      <el-form-item label="租赁余额" prop="leaseAmountSurplus">
        <el-input v-model="formData.leaseAmountSurplus" placeholder="请输入租赁余额" />
      </el-form-item>
      <el-form-item label="检查人的用户编号" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入检查人的用户编号" />
      </el-form-item>
      <el-form-item label="检查日期" prop="manageDate">
        <el-date-picker
          v-model="formData.manageDate"
          type="date"
          value-format="x"
          placeholder="选择检查日期"
        />
      </el-form-item>
      <el-form-item label="企业名称是否发生变更" prop="corpNameChanged" label-width="388px">
        <el-radio-group v-model="formData.corpNameChanged">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="法人代表是否发生变更" prop="legalRepChanged" label-width="388px">
        <el-radio-group v-model="formData.legalRepChanged">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="实际控制人是否发生变更" prop="actualControllerChanged" label-width="388px">
        <el-radio-group v-model="formData.actualControllerChanged">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="企业主要管理层是否发生变动" prop="mgmtTeamChanged" label-width="388px">
        <el-radio-group v-model="formData.mgmtTeamChanged">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="企业注册资本是否发生变化" prop="regCapitalChanged" label-width="388px">
        <el-radio-group v-model="formData.regCapitalChanged">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="企业营业执照是否通过年检" prop="licenseAnnualOk" label-width="388px">
        <el-radio-group v-model="formData.licenseAnnualOk">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="企业经营场所是否发生变化" prop="bizAddrChanged" label-width="388px">
        <el-radio-group v-model="formData.bizAddrChanged">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="企业股权结构是否发生变化" prop="equityStructChanged" label-width="388px">
        <el-radio-group v-model="formData.equityStructChanged">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="资金是否存在在关联方流转" prop="fundCircleInRelated" label-width="388px">
        <el-radio-group v-model="formData.fundCircleInRelated">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="所在行业是否发生变化" prop="industryChanged" label-width="388px">
        <el-radio-group v-model="formData.industryChanged">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="主营业务和主要产品是否发生变化" prop="mainBizChanged" label-width="388px">
        <el-radio-group v-model="formData.mainBizChanged">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="主要客户是否发生变化" prop="keyCustomersChanged" label-width="388px">
        <el-radio-group v-model="formData.keyCustomersChanged">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="上游企业是否发生变化" prop="upstreamChanged" label-width="388px">
        <el-radio-group v-model="formData.upstreamChanged">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="生产工艺及技术是否发生变化" prop="processTechChanged" label-width="388px">
        <el-radio-group v-model="formData.processTechChanged">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="生产用电量、用水量及纳税数额是否显著下降" prop="utilityTaxDecline" label-width="388px">
        <el-radio-group v-model="formData.utilityTaxDecline">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="近期开工情况是否正常" prop="startupNormal" label-width="388px">
        <el-radio-group v-model="formData.startupNormal">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="办公秩序是否混乱，人员稀少" prop="officeDisorder" label-width="388px">
        <el-radio-group v-model="formData.officeDisorder">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否实施新项目" prop="newProjectLaunched" label-width="388px">
        <el-radio-group v-model="formData.newProjectLaunched">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="企业是否有新增征信不良记录" prop="newBadCredit" label-width="388px">
        <el-radio-group v-model="formData.newBadCredit">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="企业是否涉及司法诉讼" prop="involvedLawsuit" label-width="388px">
        <el-radio-group v-model="formData.involvedLawsuit">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="企业是否涉及行政处罚" prop="involvedPenalty" label-width="388px">
        <el-radio-group v-model="formData.involvedPenalty">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="企业是否正常缴纳税金" prop="taxPaymentNormal" label-width="388px">
        <el-radio-group v-model="formData.taxPaymentNormal">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="企业是否按期支付员工工资" prop="salaryPaidOnTime" label-width="388px">
        <el-radio-group v-model="formData.salaryPaidOnTime">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="企业是否配合贷后管理工作" prop="cooperatePostLoan" label-width="388px">
        <el-radio-group v-model="formData.cooperatePostLoan">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="租赁物件是否在约定使用场所" prop="leaseInPlace" label-width="388px">
        <el-radio-group v-model="formData.leaseInPlace">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="租赁物件情况是否正常" prop="leaseNormal" label-width="388px">
        <el-radio-group v-model="formData.leaseNormal">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="其他检查情况说明" prop="otherDescriptions">
        <el-input v-model="formData.otherDescriptions" placeholder="请输入其他检查情况说明" />
      </el-form-item>
      <el-form-item label="总资产" prop="totalAssets">
        <el-input v-model="formData.totalAssets" placeholder="请输入总资产" />
      </el-form-item>
      <el-form-item label="总资产备注" prop="totalAssetsRemark">
        <el-input v-model="formData.totalAssetsRemark" placeholder="请输入总资产备注" />
      </el-form-item>
      <el-form-item label="存货" prop="inventory">
        <el-input v-model="formData.inventory" placeholder="请输入存货" />
      </el-form-item>
      <el-form-item label="存货备注" prop="inventoryRemark">
        <el-input v-model="formData.inventoryRemark" placeholder="请输入存货备注" />
      </el-form-item>
      <el-form-item label="应收账款" prop="accountsReceivable">
        <el-input v-model="formData.accountsReceivable" placeholder="请输入应收账款" />
      </el-form-item>
      <el-form-item label="应收账款备注" prop="accountsReceivableRemark">
        <el-input v-model="formData.accountsReceivableRemark" placeholder="请输入应收账款备注" />
      </el-form-item>
      <el-form-item label="总负债" prop="totalLiabilities">
        <el-input v-model="formData.totalLiabilities" placeholder="请输入总负债" />
      </el-form-item>
      <el-form-item label="总负债备注" prop="totalLiabilitiesRemark">
        <el-input v-model="formData.totalLiabilitiesRemark" placeholder="请输入总负债备注" />
      </el-form-item>
      <el-form-item label="银行借款" prop="bankLoans">
        <el-input v-model="formData.bankLoans" placeholder="请输入银行借款" />
      </el-form-item>
      <el-form-item label="银行借款备注" prop="bankLoansRemark">
        <el-input v-model="formData.bankLoansRemark" placeholder="请输入银行借款备注" />
      </el-form-item>
      <el-form-item label="应付账款" prop="accountsPayable">
        <el-input v-model="formData.accountsPayable" placeholder="请输入应付账款" />
      </el-form-item>
      <el-form-item label="应付账款备注" prop="accountsPayableRemark">
        <el-input v-model="formData.accountsPayableRemark" placeholder="请输入应付账款备注" />
      </el-form-item>
      <el-form-item label="主营业务收入" prop="mainBizIncome">
        <el-input v-model="formData.mainBizIncome" placeholder="请输入主营业务收入" />
      </el-form-item>
      <el-form-item label="主营业务收入备注" prop="mainBizIncomeRemark">
        <el-input v-model="formData.mainBizIncomeRemark" placeholder="请输入主营业务收入备注" />
      </el-form-item>
      <el-form-item label="净利润" prop="netProfit">
        <el-input v-model="formData.netProfit" placeholder="请输入净利润" />
      </el-form-item>
      <el-form-item label="净利润备注" prop="netProfitRemark">
        <el-input v-model="formData.netProfitRemark" placeholder="请输入净利润备注" />
      </el-form-item>
      <el-form-item label="资产负债率(%)" prop="debtAssetRatio">
        <el-input v-model="formData.debtAssetRatio" placeholder="请输入资产负债率(%)" />
      </el-form-item>
      <el-form-item label="资产负债率(%)备注" prop="debtAssetRatioRemark">
        <el-input v-model="formData.debtAssetRatioRemark" placeholder="请输入资产负债率(%)备注" />
      </el-form-item>
      <el-form-item label="财务报表是否明显不实" prop="fsObviouslyFalse" label-width="388px">
        <el-radio-group v-model="formData.fsObviouslyFalse">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="财务报表是否明显不实原因" prop="fsObviouslyFalseReason" label-width="388px">
        <el-input v-model="formData.fsObviouslyFalseReason" placeholder="请输入财务报表是否明显不实原因" />
      </el-form-item>
      <el-form-item label="应收账款有无大幅增加，收回拖延" prop="arSharpRiseDelay" label-width="388px">
        <el-radio-group v-model="formData.arSharpRiseDelay">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="应收账款有无大幅增加，收回拖延原因" prop="arSharpRiseDelayReason" label-width="388px">
        <el-input v-model="formData.arSharpRiseDelayReason" placeholder="请输入应收账款有无大幅增加，收回拖延原因" />
      </el-form-item>
      <el-form-item label="存货是否较大，有无突然增加" prop="inventorySurge" label-width="388px">
        <el-radio-group v-model="formData.inventorySurge">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="存货是否较大，有无突然增加原因" prop="inventorySurgeReason" label-width="388px">
        <el-input v-model="formData.inventorySurgeReason" placeholder="请输入存货是否较大，有无突然增加原因" />
      </el-form-item>
      <el-form-item label="银行债务有无大量增加" prop="bankDebtRise" label-width="388px">
        <el-radio-group v-model="formData.bankDebtRise">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="银行债务有无大量增加原因" prop="bankDebtRiseReason" label-width="388px">
        <el-input v-model="formData.bankDebtRiseReason" placeholder="请输入银行债务有无大量增加原因" />
      </el-form-item>
      <el-form-item label="资产负债结构有无重大变化" prop="debtStructChange" label-width="388px">
        <el-radio-group v-model="formData.debtStructChange">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="资产负债结构有无重大变化原因" prop="debtStructChangeReason" label-width="388px">
        <el-input v-model="formData.debtStructChangeReason" placeholder="请输入资产负债结构有无重大变化原因" />
      </el-form-item>
      <el-form-item label="流动比远低于正常值" prop="currentRatioLow" label-width="388px">
        <el-radio-group v-model="formData.currentRatioLow">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="流动比远低于正常值原因" prop="currentRatioLowReason" label-width="388px">
        <el-input v-model="formData.currentRatioLowReason" placeholder="请输入流动比远低于正常值原因" />
      </el-form-item>
      <el-form-item label="成本上升或利润下降" prop="costUpProfitDown" label-width="388px">
        <el-radio-group v-model="formData.costUpProfitDown">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="成本上升或利润下降原因" prop="costUpProfitDownReason" label-width="388px">
        <el-input v-model="formData.costUpProfitDownReason" placeholder="请输入成本上升或利润下降原因" />
      </el-form-item>
      <el-form-item label="货币资金余额是否不断下降" prop="cashBalanceDecline" label-width="388px">
        <el-radio-group v-model="formData.cashBalanceDecline">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="货币资金余额是否不断下降原因" prop="cashBalanceDeclineReason" label-width="388px">
        <el-input v-model="formData.cashBalanceDeclineReason" placeholder="请输入货币资金余额是否不断下降原因" />
      </el-form-item>
      <el-form-item label="是否拖延支付用款费用" prop="paymentDelay" label-width="388px">
        <el-radio-group v-model="formData.paymentDelay">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否拖延支付用款费用原因" prop="paymentDelayReason" label-width="388px">
        <el-input v-model="formData.paymentDelayReason" placeholder="请输入是否拖延支付用款费用原因" />
      </el-form-item>
      <el-form-item label="财务其他风险" prop="financialSituation" label-width="388px">
        <el-input v-model="formData.financialSituation" placeholder="请输入财务其他风险" />
      </el-form-item>
      <el-form-item label="对项目风险状况的总体评价" prop="overallRiskEval">
        <el-input v-model="formData.overallRiskEval" placeholder="请输入对项目风险状况的总体评价" />
      </el-form-item>
      <el-form-item label="对租赁物件状况的总体评价" prop="overallLeaseEval">
        <el-input v-model="formData.overallLeaseEval" placeholder="请输入对租赁物件状况的总体评价" />
      </el-form-item>
      <el-form-item label="对该项目的风险管理策略建议" prop="riskMgmtSuggestion">
        <el-input v-model="formData.riskMgmtSuggestion" placeholder="请输入对该项目的风险管理策略建议" />
      </el-form-item>
      <el-form-item label="文件路径" prop="filePath">
        <el-input v-model="formData.filePath" placeholder="请输入文件路径" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { getBoolDictOptions, DICT_TYPE } from '@/utils/dict'
import { FinanceManageApi, FinanceManageVO } from '@/api/business/financemanage'

/** 融资租赁租后管理 表单 */
defineOptions({ name: 'FinanceManageForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  leaseId: undefined,
  companyId: undefined,
  leaseAmount: undefined,
  leaseAmountSurplus: undefined,
  userId: undefined,
  manageDate: undefined,
  corpNameChanged: undefined,
  legalRepChanged: undefined,
  actualControllerChanged: undefined,
  mgmtTeamChanged: undefined,
  regCapitalChanged: undefined,
  licenseAnnualOk: undefined,
  bizAddrChanged: undefined,
  equityStructChanged: undefined,
  fundCircleInRelated: undefined,
  industryChanged: undefined,
  mainBizChanged: undefined,
  keyCustomersChanged: undefined,
  upstreamChanged: undefined,
  processTechChanged: undefined,
  utilityTaxDecline: undefined,
  startupNormal: undefined,
  officeDisorder: undefined,
  newProjectLaunched: undefined,
  newBadCredit: undefined,
  involvedLawsuit: undefined,
  involvedPenalty: undefined,
  taxPaymentNormal: undefined,
  salaryPaidOnTime: undefined,
  cooperatePostLoan: undefined,
  leaseInPlace: undefined,
  leaseNormal: undefined,
  otherDescriptions: undefined,
  totalAssets: undefined,
  totalAssetsRemark: undefined,
  inventory: undefined,
  inventoryRemark: undefined,
  accountsReceivable: undefined,
  accountsReceivableRemark: undefined,
  totalLiabilities: undefined,
  totalLiabilitiesRemark: undefined,
  bankLoans: undefined,
  bankLoansRemark: undefined,
  accountsPayable: undefined,
  accountsPayableRemark: undefined,
  mainBizIncome: undefined,
  mainBizIncomeRemark: undefined,
  netProfit: undefined,
  netProfitRemark: undefined,
  debtAssetRatio: undefined,
  debtAssetRatioRemark: undefined,
  fsObviouslyFalse: undefined,
  fsObviouslyFalseReason: undefined,
  arSharpRiseDelay: undefined,
  arSharpRiseDelayReason: undefined,
  inventorySurge: undefined,
  inventorySurgeReason: undefined,
  bankDebtRise: undefined,
  bankDebtRiseReason: undefined,
  debtStructChange: undefined,
  debtStructChangeReason: undefined,
  currentRatioLow: undefined,
  currentRatioLowReason: undefined,
  costUpProfitDown: undefined,
  costUpProfitDownReason: undefined,
  cashBalanceDecline: undefined,
  cashBalanceDeclineReason: undefined,
  paymentDelay: undefined,
  paymentDelayReason: undefined,
  financialSituation: undefined,
  overallRiskEval: undefined,
  overallLeaseEval: undefined,
  riskMgmtSuggestion: undefined,
  filePath: undefined,
  status: undefined,
  processInstanceId: undefined,
  deptId: undefined,
})
const formRules = reactive({
  leaseId: [{ required: true, message: '融资租赁单编号不能为空', trigger: 'blur' }],
  companyId: [{ required: true, message: '企业id不能为空', trigger: 'change' }],
  leaseAmount: [{ required: true, message: '租赁总额不能为空', trigger: 'blur' }],
  leaseAmountSurplus: [{ required: true, message: '租赁余额不能为空', trigger: 'blur' }],
  userId: [{ required: true, message: '检查人的用户编号不能为空', trigger: 'blur' }],
  manageDate: [{ required: true, message: '检查日期不能为空', trigger: 'blur' }],
  corpNameChanged: [{ required: true, message: '企业名称是否发生变更不能为空', trigger: 'blur' }],
  legalRepChanged: [{ required: true, message: '法人代表是否发生变更不能为空', trigger: 'blur' }],
  actualControllerChanged: [{ required: true, message: '实际控制人是否发生变更不能为空', trigger: 'blur' }],
  mgmtTeamChanged: [{ required: true, message: '企业主要管理层是否发生变动不能为空', trigger: 'blur' }],
  regCapitalChanged: [{ required: true, message: '企业注册资本是否发生变化不能为空', trigger: 'blur' }],
  licenseAnnualOk: [{ required: true, message: '企业营业执照是否通过年检不能为空', trigger: 'blur' }],
  bizAddrChanged: [{ required: true, message: '企业经营场所是否发生变化不能为空', trigger: 'blur' }],
  equityStructChanged: [{ required: true, message: '企业股权结构是否发生变化不能为空', trigger: 'blur' }],
  fundCircleInRelated: [{ required: true, message: '资金是否存在在关联方流转不能为空', trigger: 'blur' }],
  industryChanged: [{ required: true, message: '所在行业是否发生变化不能为空', trigger: 'blur' }],
  mainBizChanged: [{ required: true, message: '主营业务和主要产品是否发生变化不能为空', trigger: 'blur' }],
  keyCustomersChanged: [{ required: true, message: '主要客户是否发生变化不能为空', trigger: 'blur' }],
  upstreamChanged: [{ required: true, message: '上游企业是否发生变化不能为空', trigger: 'blur' }],
  processTechChanged: [{ required: true, message: '生产工艺及技术是否发生变化不能为空', trigger: 'blur' }],
  utilityTaxDecline: [{ required: true, message: '生产用电量、用水量及纳税数额是否显著下降不能为空', trigger: 'blur' }],
  startupNormal: [{ required: true, message: '近期开工情况是否正常不能为空', trigger: 'blur' }],
  officeDisorder: [{ required: true, message: '办公秩序是否混乱，人员稀少不能为空', trigger: 'blur' }],
  newProjectLaunched: [{ required: true, message: '是否实施新项目不能为空', trigger: 'blur' }],
  newBadCredit: [{ required: true, message: '企业是否有新增征信不良记录不能为空', trigger: 'blur' }],
  involvedLawsuit: [{ required: true, message: '企业是否涉及司法诉讼不能为空', trigger: 'blur' }],
  involvedPenalty: [{ required: true, message: '企业是否涉及行政处罚不能为空', trigger: 'blur' }],
  taxPaymentNormal: [{ required: true, message: '企业是否正常缴纳税金不能为空', trigger: 'blur' }],
  salaryPaidOnTime: [{ required: true, message: '企业是否按期支付员工工资不能为空', trigger: 'blur' }],
  cooperatePostLoan: [{ required: true, message: '企业是否配合贷后管理工作不能为空', trigger: 'blur' }],
  leaseInPlace: [{ required: true, message: '租赁物件是否在约定使用场所不能为空', trigger: 'blur' }],
  leaseNormal: [{ required: true, message: '租赁物件情况是否正常不能为空', trigger: 'blur' }],
  totalAssets: [{ required: true, message: '总资产不能为空', trigger: 'blur' }],
  inventory: [{ required: true, message: '存货不能为空', trigger: 'blur' }],
  accountsReceivable: [{ required: true, message: '应收账款不能为空', trigger: 'blur' }],
  totalLiabilities: [{ required: true, message: '总负债不能为空', trigger: 'blur' }],
  bankLoans: [{ required: true, message: '银行借款不能为空', trigger: 'blur' }],
  accountsPayable: [{ required: true, message: '应付账款不能为空', trigger: 'blur' }],
  mainBizIncome: [{ required: true, message: '主营业务收入不能为空', trigger: 'blur' }],
  netProfit: [{ required: true, message: '净利润不能为空', trigger: 'blur' }],
  debtAssetRatio: [{ required: true, message: '资产负债率(%)不能为空', trigger: 'blur' }],
  fsObviouslyFalse: [{ required: true, message: '财务报表是否明显不实不能为空', trigger: 'blur' }],
  arSharpRiseDelay: [{ required: true, message: '应收账款有无大幅增加，收回拖延不能为空', trigger: 'blur' }],
  inventorySurge: [{ required: true, message: '存货是否较大，有无突然增加不能为空', trigger: 'blur' }],
  bankDebtRise: [{ required: true, message: '银行债务有无大量增加不能为空', trigger: 'blur' }],
  debtStructChange: [{ required: true, message: '资产负债结构有无重大变化不能为空', trigger: 'blur' }],
  currentRatioLow: [{ required: true, message: '流动比远低于正常值不能为空', trigger: 'blur' }],
  costUpProfitDown: [{ required: true, message: '成本上升或利润下降不能为空', trigger: 'blur' }],
  cashBalanceDecline: [{ required: true, message: '货币资金余额是否不断下降不能为空', trigger: 'blur' }],
  paymentDelay: [{ required: true, message: '是否拖延支付用款费用不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '单据状态不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await FinanceManageApi.getFinanceManage(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as FinanceManageVO
    if (formType.value === 'create') {
      await FinanceManageApi.createFinanceManage(data)
      message.success(t('common.createSuccess'))
    } else {
      await FinanceManageApi.updateFinanceManage(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    leaseId: undefined,
    companyId: undefined,
    leaseAmount: undefined,
    leaseAmountSurplus: undefined,
    userId: undefined,
    manageDate: undefined,
    corpNameChanged: undefined,
    legalRepChanged: undefined,
    actualControllerChanged: undefined,
    mgmtTeamChanged: undefined,
    regCapitalChanged: undefined,
    licenseAnnualOk: undefined,
    bizAddrChanged: undefined,
    equityStructChanged: undefined,
    fundCircleInRelated: undefined,
    industryChanged: undefined,
    mainBizChanged: undefined,
    keyCustomersChanged: undefined,
    upstreamChanged: undefined,
    processTechChanged: undefined,
    utilityTaxDecline: undefined,
    startupNormal: undefined,
    officeDisorder: undefined,
    newProjectLaunched: undefined,
    newBadCredit: undefined,
    involvedLawsuit: undefined,
    involvedPenalty: undefined,
    taxPaymentNormal: undefined,
    salaryPaidOnTime: undefined,
    cooperatePostLoan: undefined,
    leaseInPlace: undefined,
    leaseNormal: undefined,
    otherDescriptions: undefined,
    totalAssets: undefined,
    totalAssetsRemark: undefined,
    inventory: undefined,
    inventoryRemark: undefined,
    accountsReceivable: undefined,
    accountsReceivableRemark: undefined,
    totalLiabilities: undefined,
    totalLiabilitiesRemark: undefined,
    bankLoans: undefined,
    bankLoansRemark: undefined,
    accountsPayable: undefined,
    accountsPayableRemark: undefined,
    mainBizIncome: undefined,
    mainBizIncomeRemark: undefined,
    netProfit: undefined,
    netProfitRemark: undefined,
    debtAssetRatio: undefined,
    debtAssetRatioRemark: undefined,
    fsObviouslyFalse: undefined,
    fsObviouslyFalseReason: undefined,
    arSharpRiseDelay: undefined,
    arSharpRiseDelayReason: undefined,
    inventorySurge: undefined,
    inventorySurgeReason: undefined,
    bankDebtRise: undefined,
    bankDebtRiseReason: undefined,
    debtStructChange: undefined,
    debtStructChangeReason: undefined,
    currentRatioLow: undefined,
    currentRatioLowReason: undefined,
    costUpProfitDown: undefined,
    costUpProfitDownReason: undefined,
    cashBalanceDecline: undefined,
    cashBalanceDeclineReason: undefined,
    paymentDelay: undefined,
    paymentDelayReason: undefined,
    financialSituation: undefined,
    overallRiskEval: undefined,
    overallLeaseEval: undefined,
    riskMgmtSuggestion: undefined,
    filePath: undefined,
    status: undefined,
    processInstanceId: undefined,
    deptId: undefined,
  }
  formRef.value?.resetFields()
}
</script>
