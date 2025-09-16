<template>
  <ContentWrap>
    <div class="process-form-container">
      <el-form
        :model="formData"
        label-width="100px"
        v-loading="detailLoading"
        :disabled="true"
      >
        <!-- 上部分：财务管理基本信息 -->
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          <div class="form-row">
            <el-form-item label="融资租赁单编号" prop="leaseIdText" label-width="140px">
              <el-input v-model="formData.leaseIdText" placeholder="无" readonly />
            </el-form-item>
            <el-form-item label="租后管理编码" prop="manageCode">
              <el-input v-model="formData.manageCode" placeholder="无" readonly />
            </el-form-item>
            <el-form-item label="企业名称" prop="companyName">
              <el-input v-model="formData.companyName" placeholder="无" readonly />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="租赁总额" prop="leaseAmount" label-width="140px">
              <el-input v-model="formData.leaseAmount" placeholder="无" readonly />
            </el-form-item>
            <el-form-item label="租赁余额" prop="leaseAmountSurplus">
              <el-input v-model="formData.leaseAmountSurplus" placeholder="无" readonly />
            </el-form-item>
            <el-form-item label="申请人编码" prop="userId">
              <el-input v-model="formData.userId" placeholder="无" readonly :disabled="true" />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="检查日期" prop="manageDateText">
              <el-input v-model="formData.manageDateText" placeholder="无" readonly />
            </el-form-item>
            <el-form-item label="" prop="">
              <div></div>
            </el-form-item>
            <el-form-item label="" prop="">
              <div></div>
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="其他检查情况说明" prop="otherDescriptions" class="full-width">
              <el-input
                v-model="formData.otherDescriptions"
                type="textarea"
                :rows="4"
                placeholder="无"
                readonly
              />
            </el-form-item>
          </div>
        </div>

        <!-- 下部分：Tab组件 -->
        <div class="form-section">
          <el-tabs v-model="activeTab" class="form-tabs">
            <!-- 企业基本情况 -->
            <el-tab-pane label="企业基本情况" name="basic">
              <div class="radio-content">
                <div class="radio-row">
                  <div class="radio-item">
                    <span class="radio-label">企业名称是否发生变更：</span>
                    <el-tag :type="getBooleanTagType(formData.corpNameChanged)" size="small">
                      {{ getBooleanText(formData.corpNameChanged) }}
                    </el-tag>
                  </div>
                  <div class="radio-item">
                    <span class="radio-label">法人代表是否发生变更：</span>
                    <el-tag :type="getBooleanTagType(formData.legalRepChanged)" size="small">
                      {{ getBooleanText(formData.legalRepChanged) }}
                    </el-tag>
                  </div>
                </div>
                <div class="radio-row">
                  <div class="radio-item">
                    <span class="radio-label">实际控制人是否发生变更：</span>
                    <el-tag :type="getBooleanTagType(formData.actualControllerChanged)" size="small">
                      {{ getBooleanText(formData.actualControllerChanged) }}
                    </el-tag>
                  </div>
                  <div class="radio-item">
                    <span class="radio-label">企业主要管理层是否发生变动：</span>
                    <el-tag :type="getBooleanTagType(formData.mgmtTeamChanged)" size="small">
                      {{ getBooleanText(formData.mgmtTeamChanged) }}
                    </el-tag>
                  </div>
                </div>
                <div class="radio-row">
                  <div class="radio-item">
                    <span class="radio-label">企业注册资本是否发生变化：</span>
                    <el-tag :type="getBooleanTagType(formData.regCapitalChanged)" size="small">
                      {{ getBooleanText(formData.regCapitalChanged) }}
                    </el-tag>
                  </div>
                  <div class="radio-item">
                    <span class="radio-label">企业营业执照是否通过年检：</span>
                    <el-tag :type="getBooleanTagType(formData.licenseAnnualOk)" size="small">
                      {{ getBooleanText(formData.licenseAnnualOk) }}
                    </el-tag>
                  </div>
                </div>
                <div class="radio-row">
                  <div class="radio-item">
                    <span class="radio-label">企业经营场所是否发生变化：</span>
                    <el-tag :type="getBooleanTagType(formData.bizAddrChanged)" size="small">
                      {{ getBooleanText(formData.bizAddrChanged) }}
                    </el-tag>
                  </div>
                  <div class="radio-item">
                    <span class="radio-label">企业股权结构是否发生变化：</span>
                    <el-tag :type="getBooleanTagType(formData.equityStructChanged)" size="small">
                      {{ getBooleanText(formData.equityStructChanged) }}
                    </el-tag>
                  </div>
                </div>
                <div class="radio-row">
                  <div class="radio-item">
                    <span class="radio-label">资金是否存在在关联方流转：</span>
                    <el-tag :type="getBooleanTagType(formData.fundCircleInRelated)" size="small">
                      {{ getBooleanText(formData.fundCircleInRelated) }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 企业经营情况 -->
            <el-tab-pane label="企业经营情况" name="operation">
              <div class="radio-content">
                <div class="radio-row">
                  <div class="radio-item">
                    <span class="radio-label">所在行业是否发生变化：</span>
                    <el-tag :type="getBooleanTagType(formData.industryChanged)" size="small">
                      {{ getBooleanText(formData.industryChanged) }}
                    </el-tag>
                  </div>
                  <div class="radio-item">
                    <span class="radio-label">主营业务和主要产品是否发生变化：</span>
                    <el-tag :type="getBooleanTagType(formData.mainBizChanged)" size="small">
                      {{ getBooleanText(formData.mainBizChanged) }}
                    </el-tag>
                  </div>
                </div>
                <div class="radio-row">
                  <div class="radio-item">
                    <span class="radio-label">主要客户是否发生变化：</span>
                    <el-tag :type="getBooleanTagType(formData.keyCustomersChanged)" size="small">
                      {{ getBooleanText(formData.keyCustomersChanged) }}
                    </el-tag>
                  </div>
                  <div class="radio-item">
                    <span class="radio-label">上游企业是否发生变化：</span>
                    <el-tag :type="getBooleanTagType(formData.upstreamChanged)" size="small">
                      {{ getBooleanText(formData.upstreamChanged) }}
                    </el-tag>
                  </div>
                </div>
                <div class="radio-row">
                  <div class="radio-item">
                    <span class="radio-label">生产工艺及技术是否发生变化：</span>
                    <el-tag :type="getBooleanTagType(formData.processTechChanged)" size="small">
                      {{ getBooleanText(formData.processTechChanged) }}
                    </el-tag>
                  </div>
                  <div class="radio-item">
                    <span class="radio-label">生产用电量、用水量及纳税数额是否显著下降：</span>
                    <el-tag :type="getBooleanTagType(formData.utilityTaxDecline)" size="small">
                      {{ getBooleanText(formData.utilityTaxDecline) }}
                    </el-tag>
                  </div>
                </div>
                <div class="radio-row">
                  <div class="radio-item">
                    <span class="radio-label">近期开工情况是否正常：</span>
                    <el-tag :type="getBooleanTagType(formData.startupNormal)" size="small">
                      {{ getBooleanText(formData.startupNormal) }}
                    </el-tag>
                  </div>
                  <div class="radio-item">
                    <span class="radio-label">办公秩序是否混乱，人员稀少：</span>
                    <el-tag :type="getBooleanTagType(formData.officeDisorder)" size="small">
                      {{ getBooleanText(formData.officeDisorder) }}
                    </el-tag>
                  </div>
                </div>
                <div class="radio-row">
                  <div class="radio-item">
                    <span class="radio-label">是否实施新项目：</span>
                    <el-tag :type="getBooleanTagType(formData.newProjectLaunched)" size="small">
                      {{ getBooleanText(formData.newProjectLaunched) }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 公共信息 -->
            <el-tab-pane label="公共信息" name="public">
              <div class="radio-content">
                <div class="radio-row">
                  <div class="radio-item">
                    <span class="radio-label">企业是否有新增征信不良记录：</span>
                    <el-tag :type="getBooleanTagType(formData.newBadCredit)" size="small">
                      {{ getBooleanText(formData.newBadCredit) }}
                    </el-tag>
                  </div>
                  <div class="radio-item">
                    <span class="radio-label">企业是否涉及司法诉讼：</span>
                    <el-tag :type="getBooleanTagType(formData.involvedLawsuit)" size="small">
                      {{ getBooleanText(formData.involvedLawsuit) }}
                    </el-tag>
                  </div>
                </div>
                <div class="radio-row">
                  <div class="radio-item">
                    <span class="radio-label">企业是否涉及行政处罚：</span>
                    <el-tag :type="getBooleanTagType(formData.involvedPenalty)" size="small">
                      {{ getBooleanText(formData.involvedPenalty) }}
                    </el-tag>
                  </div>
                  <div class="radio-item">
                    <span class="radio-label">企业是否正常缴纳税金：</span>
                    <el-tag :type="getBooleanTagType(formData.taxPaymentNormal)" size="small">
                      {{ getBooleanText(formData.taxPaymentNormal) }}
                    </el-tag>
                  </div>
                </div>
                <div class="radio-row">
                  <div class="radio-item">
                    <span class="radio-label">企业是否按期支付员工工资：</span>
                    <el-tag :type="getBooleanTagType(formData.salaryPaidOnTime)" size="small">
                      {{ getBooleanText(formData.salaryPaidOnTime) }}
                    </el-tag>
                  </div>
                  <div class="radio-item">
                    <span class="radio-label">企业是否配合贷后管理工作：</span>
                    <el-tag :type="getBooleanTagType(formData.cooperatePostLoan)" size="small">
                      {{ getBooleanText(formData.cooperatePostLoan) }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 对租赁物件检查情况 -->
            <el-tab-pane label="对租赁物件检查情况" name="lease">
              <div class="radio-content">
                <div class="radio-row">
                  <div class="radio-item">
                    <span class="radio-label">租赁物件是否在约定使用场所：</span>
                    <el-tag :type="getBooleanTagType(formData.leaseInPlace)" size="small">
                      {{ getBooleanText(formData.leaseInPlace) }}
                    </el-tag>
                  </div>
                  <div class="radio-item">
                    <span class="radio-label">租赁物件情况是否正常：</span>
                    <el-tag :type="getBooleanTagType(formData.leaseNormal)" size="small">
                      {{ getBooleanText(formData.leaseNormal) }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 财务指标情况 -->
            <el-tab-pane label="财务指标情况" name="financial">
              <div class="tab-content">
                <div class="form-row">
                  <el-form-item label="总资产" prop="totalAssets">
                    <el-input v-model="formData.totalAssets" placeholder="无" readonly />
                  </el-form-item>
                  <el-form-item label="总资产备注" prop="totalAssetsRemark">
                    <el-input v-model="formData.totalAssetsRemark" placeholder="无" readonly />
                  </el-form-item>
                  <div class="form-spacer"></div>
                </div>
                <div class="form-row">
                  <el-form-item label="存货" prop="inventory">
                    <el-input v-model="formData.inventory" placeholder="无" readonly />
                  </el-form-item>
                  <el-form-item label="存货备注" prop="inventoryRemark">
                    <el-input v-model="formData.inventoryRemark" placeholder="无" readonly />
                  </el-form-item>
                  <div class="form-spacer"></div>
                </div>
                <div class="form-row">
                  <el-form-item label="应收账款" prop="accountsReceivable">
                    <el-input v-model="formData.accountsReceivable" placeholder="无" readonly />
                  </el-form-item>
                  <el-form-item label="应收账款备注" prop="accountsReceivableRemark">
                    <el-input v-model="formData.accountsReceivableRemark" placeholder="无" readonly />
                  </el-form-item>
                  <div class="form-spacer"></div>
                </div>
                <div class="form-row">
                  <el-form-item label="总负债" prop="totalLiabilities">
                    <el-input v-model="formData.totalLiabilities" placeholder="无" readonly />
                  </el-form-item>
                  <el-form-item label="总负债备注" prop="totalLiabilitiesRemark">
                    <el-input v-model="formData.totalLiabilitiesRemark" placeholder="无" readonly />
                  </el-form-item>
                  <div class="form-spacer"></div>
                </div>
                <div class="form-row">
                  <el-form-item label="银行借款" prop="bankLoans">
                    <el-input v-model="formData.bankLoans" placeholder="无" readonly />
                  </el-form-item>
                  <el-form-item label="银行借款备注" prop="bankLoansRemark">
                    <el-input v-model="formData.bankLoansRemark" placeholder="无" readonly />
                  </el-form-item>
                  <div class="form-spacer"></div>
                </div>
                <div class="form-row">
                  <el-form-item label="应付账款" prop="accountsPayable">
                    <el-input v-model="formData.accountsPayable" placeholder="无" readonly />
                  </el-form-item>
                  <el-form-item label="应付账款备注" prop="accountsPayableRemark">
                    <el-input v-model="formData.accountsPayableRemark" placeholder="无" readonly />
                  </el-form-item>
                  <div class="form-spacer"></div>
                </div>
                <div class="form-row">
                  <el-form-item label="主营业务收入" prop="mainBizIncome">
                    <el-input v-model="formData.mainBizIncome" placeholder="无" readonly />
                  </el-form-item>
                  <el-form-item label="主营业务收入备注" prop="mainBizIncomeRemark">
                    <el-input v-model="formData.mainBizIncomeRemark" placeholder="无" readonly />
                  </el-form-item>
                  <div class="form-spacer"></div>
                </div>
                <div class="form-row">
                  <el-form-item label="净利润" prop="netProfit">
                    <el-input v-model="formData.netProfit" placeholder="无" readonly />
                  </el-form-item>
                  <el-form-item label="净利润备注" prop="netProfitRemark">
                    <el-input v-model="formData.netProfitRemark" placeholder="无" readonly />
                  </el-form-item>
                  <div class="form-spacer"></div>
                </div>
                <div class="form-row">
                  <el-form-item label="资产负债率(%)" prop="debtAssetRatio">
                    <el-input v-model="formData.debtAssetRatio" placeholder="无" readonly />
                  </el-form-item>
                  <el-form-item label="资产负债率(%)备注" prop="debtAssetRatioRemark">
                    <el-input v-model="formData.debtAssetRatioRemark" placeholder="无" readonly />
                  </el-form-item>
                  <div class="form-spacer"></div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 预警信号或关注事项 -->
            <el-tab-pane label="预警信号或关注事项" name="warning">
              <div class="radio-content">
                <div class="warning-item">
                  <div class="warning-row">
                    <div class="radio-item">
                      <span class="radio-label">财务报表是否明显不实：</span>
                      <el-tag :type="getBooleanTagType(formData.fsObviouslyFalse)" size="small">
                        {{ getBooleanText(formData.fsObviouslyFalse) }}
                      </el-tag>
                    </div>
                  </div>
                  <div class="radio-remark" v-if="formData.fsObviouslyFalse === true && formData.fsObviouslyFalseReason">
                    <span class="remark-label">备注：</span>
                    <span class="remark-value">{{ formData.fsObviouslyFalseReason }}</span>
                  </div>
                </div>
                
                <div class="warning-item">
                  <div class="warning-row">
                    <div class="radio-item">
                      <span class="radio-label">应收账款有无大幅增加，收回拖延：</span>
                      <el-tag :type="getBooleanTagType(formData.arSharpRiseDelay)" size="small">
                        {{ getBooleanText(formData.arSharpRiseDelay) }}
                      </el-tag>
                    </div>
                  </div>
                  <div class="radio-remark" v-if="formData.arSharpRiseDelay === true && formData.arSharpRiseDelayReason">
                    <span class="remark-label">备注：</span>
                    <span class="remark-value">{{ formData.arSharpRiseDelayReason }}</span>
                  </div>
                </div>
                
                <div class="warning-item">
                  <div class="warning-row">
                    <div class="radio-item">
                      <span class="radio-label">存货是否较大，有无突然增加：</span>
                      <el-tag :type="getBooleanTagType(formData.inventorySurge)" size="small">
                        {{ getBooleanText(formData.inventorySurge) }}
                      </el-tag>
                    </div>
                  </div>
                  <div class="radio-remark" v-if="formData.inventorySurge === true && formData.inventorySurgeReason">
                    <span class="remark-label">备注：</span>
                    <span class="remark-value">{{ formData.inventorySurgeReason }}</span>
                  </div>
                </div>
                
                <div class="warning-item">
                  <div class="warning-row">
                    <div class="radio-item">
                      <span class="radio-label">银行债务有无大量增加：</span>
                      <el-tag :type="getBooleanTagType(formData.bankDebtRise)" size="small">
                        {{ getBooleanText(formData.bankDebtRise) }}
                      </el-tag>
                    </div>
                  </div>
                  <div class="radio-remark" v-if="formData.bankDebtRise === true && formData.bankDebtRiseReason">
                    <span class="remark-label">备注：</span>
                    <span class="remark-value">{{ formData.bankDebtRiseReason }}</span>
                  </div>
                </div>
                
                <div class="warning-item">
                  <div class="warning-row">
                    <div class="radio-item">
                      <span class="radio-label">资产负债结构有无重大变化：</span>
                      <el-tag :type="getBooleanTagType(formData.debtStructChange)" size="small">
                        {{ getBooleanText(formData.debtStructChange) }}
                      </el-tag>
                    </div>
                  </div>
                  <div class="radio-remark" v-if="formData.debtStructChange === true && formData.debtStructChangeReason">
                    <span class="remark-label">备注：</span>
                    <span class="remark-value">{{ formData.debtStructChangeReason }}</span>
                  </div>
                </div>
                
                <div class="warning-item">
                  <div class="warning-row">
                    <div class="radio-item">
                      <span class="radio-label">流动比远低于正常值：</span>
                      <el-tag :type="getBooleanTagType(formData.currentRatioLow)" size="small">
                        {{ getBooleanText(formData.currentRatioLow) }}
                      </el-tag>
                    </div>
                  </div>
                  <div class="radio-remark" v-if="formData.currentRatioLow === true && formData.currentRatioLowReason">
                    <span class="remark-label">备注：</span>
                    <span class="remark-value">{{ formData.currentRatioLowReason }}</span>
                  </div>
                </div>
                
                <div class="warning-item">
                  <div class="warning-row">
                    <div class="radio-item">
                      <span class="radio-label">成本上升或利润下降：</span>
                      <el-tag :type="getBooleanTagType(formData.costUpProfitDown)" size="small">
                        {{ getBooleanText(formData.costUpProfitDown) }}
                      </el-tag>
                    </div>
                  </div>
                  <div class="radio-remark" v-if="formData.costUpProfitDown === true && formData.costUpProfitDownReason">
                    <span class="remark-label">备注：</span>
                    <span class="remark-value">{{ formData.costUpProfitDownReason }}</span>
                  </div>
                </div>
                
                <div class="warning-item">
                  <div class="warning-row">
                    <div class="radio-item">
                      <span class="radio-label">货币资金余额是否不断下降：</span>
                      <el-tag :type="getBooleanTagType(formData.cashBalanceDecline)" size="small">
                        {{ getBooleanText(formData.cashBalanceDecline) }}
                      </el-tag>
                    </div>
                  </div>
                  <div class="radio-remark" v-if="formData.cashBalanceDecline === true && formData.cashBalanceDeclineReason">
                    <span class="remark-label">备注：</span>
                    <span class="remark-value">{{ formData.cashBalanceDeclineReason }}</span>
                  </div>
                </div>
                
                <div class="warning-item">
                  <div class="warning-row">
                    <div class="radio-item">
                      <span class="radio-label">是否拖延支付用款费用：</span>
                      <el-tag :type="getBooleanTagType(formData.paymentDelay)" size="small">
                        {{ getBooleanText(formData.paymentDelay) }}
                      </el-tag>
                    </div>
                  </div>
                  <div class="radio-remark" v-if="formData.paymentDelay === true && formData.paymentDelayReason">
                    <span class="remark-label">备注：</span>
                    <span class="remark-value">{{ formData.paymentDelayReason }}</span>
                  </div>
                </div>
                
                <div class="warning-item">
                  <div class="warning-row">
                    <div class="radio-item full-width">
                      <span class="radio-label">财务其他风险：</span>
                      <span class="remark-value">{{ formData.financialOtherRisk || '无' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 检查结论及建议 -->
            <el-tab-pane label="检查结论及建议" name="conclusion">
              <div class="radio-content">
                <div class="conclusion-item">
                  <div class="form-row">
                    <el-form-item label="对项目风险状况的总体评价" prop="overallRiskEval" label-width="230px" class="full-width">
                      <el-input 
                        v-model="formData.overallRiskEval" 
                        placeholder="无" 
                        readonly 
                        type="textarea"
                        :rows="3" />
                    </el-form-item>
                  </div>
                  <div class="form-row">
                    <el-form-item label="对租赁物件状况的总体评价" prop="overallLeaseEval" label-width="230px" class="full-width">
                      <el-input 
                        v-model="formData.overallLeaseEval" 
                        placeholder="无" 
                        readonly 
                        type="textarea"
                        :rows="3" />
                    </el-form-item>
                  </div>
                  <div class="form-row">
                    <div class="radio-item full-width">
                      <span class="radio-label">对该项目的风险管理策略建议：</span>
                      <el-tag :type="getRiskSuggestionTagType(formData.riskMgmtSuggestion)" size="medium">
                        {{ formData.riskMgmtSuggestionText }}
                      </el-tag>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 附件上传 -->
            <el-tab-pane label="附件上传" name="upload">
              <div class="upload-content">
                <el-form-item label="附件文件" prop="fileList">
                  <BatchFileUpload ref="fileUploadRef" v-model:fileList="formData.fileList" mode="view" directory="business" />
                </el-form-item>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-form>
    </div>
  </ContentWrap>
</template>
<script lang="ts" setup>
import { formatDate } from '@/utils/formatTime'
import { propTypes } from '@/utils/propTypes'
import { FinanceManageApi, type FinanceManageVO } from 'src/api/business/finance/financemanage'
import { FinanceCompanyApi, type FinanceCompanyVO } from 'src/api/business/finance/financecompany'
import { FinanceLeaseApi } from 'src/api/business/finance/financelease'
import { Document } from '@element-plus/icons-vue'
import { BatchFileUpload } from '@/components/UploadFile'

defineOptions({ name: 'BpmOAFinanceManageDetail' })

const { query } = useRoute() // 查询参数

const props = defineProps({
    id: propTypes.oneOfType([propTypes.number, propTypes.string]).def(undefined),
    previewMode: propTypes.bool.def(false), // 是否为预览模式
    readonly: propTypes.bool.def(false), // 是否为只读模式
    modelInfo: propTypes.object.def({}), // 模型信息
    businessKey: propTypes.string.def(undefined) // 业务键
})

const fileUploadRef = ref() // 文件上传组件 Ref


const detailLoading = ref(false) // 表单的加载中
const detailData = ref<FinanceManageVO>({} as FinanceManageVO) // 详情数据
const queryId = query.id as unknown as number // 从 URL 传递过来的 id 编号
const activeTab = ref('basic') // 当前激活的tab
const companyList = ref<FinanceCompanyVO[]>([]) // 企业列表
const financeLeaseOptions = ref<any[]>([]) // 融资租赁选项

// 表单数据
const formData = ref({
  id: undefined,
  manageCode: '',
  leaseId: undefined,
  leaseIdText: '',
  companyId: undefined,
  companyName: '',
  leaseAmount: '',
  leaseAmountSurplus: '',
  userId: '',
  manageDate: undefined,
  manageDateText: '',
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
  otherDescriptions: '',
  totalAssets: '',
  totalAssetsRemark: '',
  inventory: '',
  inventoryRemark: '',
  accountsReceivable: '',
  accountsReceivableRemark: '',
  totalLiabilities: '',
  totalLiabilitiesRemark: '',
  bankLoans: '',
  bankLoansRemark: '',
  accountsPayable: '',
  accountsPayableRemark: '',
  mainBizIncome: '',
  mainBizIncomeRemark: '',
  netProfit: '',
  netProfitRemark: '',
  debtAssetRatio: '',
  debtAssetRatioRemark: '',
  fsObviouslyFalse: undefined,
  fsObviouslyFalseReason: '',
  arSharpRiseDelay: undefined,
  arSharpRiseDelayReason: '',
  inventorySurge: undefined,
  inventorySurgeReason: '',
  bankDebtRise: undefined,
  bankDebtRiseReason: '',
  debtStructChange: undefined,
  debtStructChangeReason: '',
  currentRatioLow: undefined,
  currentRatioLowReason: '',
  costUpProfitDown: undefined,
  costUpProfitDownReason: '',
  cashBalanceDecline: undefined,
  cashBalanceDeclineReason: '',
  paymentDelay: undefined,
  paymentDelayReason: '',
  financialOtherRisk: '',
  overallRiskEval: '',
  overallLeaseEval: '',
  riskMgmtSuggestion: undefined,
  riskMgmtSuggestionText: '',
  fileList: [] as string[], // 文件列表字段
  sequenceCode: '',
  status: undefined,
  processInstanceId: '',
  deptId: undefined
})

/** 获取布尔值文本 */
const getBooleanText = (value: boolean | undefined) => {
    if (value === true) return '是'
    if (value === false) return '否'
    return '未设置'
}

/** 获取布尔值标签类型 */
const getBooleanTagType = (value: boolean | undefined) => {
    if (value === true) return 'success'
    if (value === false) return 'danger'
    return 'info'
}

/** 获取风险管理建议文本 */
const getRiskMgmtSuggestionText = (suggestion: number) => {
    switch (suggestion) {
        case 1:
            return '正常维护'
        case 2:
            return '密切关注，加大检查频率'
        case 3:
            return '提前终止'
        default:
            return '未设置'
    }
}

/** 获取风险管理建议标签类型 */
const getRiskSuggestionTagType = (suggestion: number) => {
    switch (suggestion) {
        case 1:
            return 'success'  // 正常维护 - 绿色
        case 2:
            return 'warning'  // 密切关注 - 橙色
        case 3:
            return 'danger'   // 提前终止 - 红色
        default:
            return 'info'     // 未设置 - 灰色
    }
}

/** 获取状态文本 */
const getStatusText = (status: number) => {
    switch (status) {
        case 0:
            return '草稿'
        case 1:
            return '审批中'
        case 2:
            return '已通过'
        case 3:
            return '已拒绝'
        default:
            return '未知状态'
    }
}

/** 解析附件列表 */
const parseFileList = (fileData: any) => {
    if (!fileData) return []
    
    // 如果是字符串，尝试按逗号分割
    if (typeof fileData === 'string') {
        // 先尝试 JSON 解析
        try {
            return JSON.parse(fileData)
        } catch {
            // 如果 JSON 解析失败，尝试逗号分割
            return fileData.split(',').filter(id => id.trim() !== '')
        }
    }
    
    // 如果已经是数组，直接返回
    if (Array.isArray(fileData)) {
        return fileData
    }
    
    return []
}


/**
 * 加载财务管理数据
 */
const loadFinanceManageData = async (businessKey: string) => {
  try {
    detailLoading.value = true

    // 从后端获取财务管理详细数据
    const response = await FinanceManageApi.getFinanceManage(businessKey as any)
    if (response) {
      // 更新表单数据
      Object.keys(response).forEach(key => {
        if (key in formData.value) {
          formData.value[key] = response[key]
        }
      })
      
      // 处理数值类型转换为字符串用于显示
      formData.value.leaseAmount = response.leaseAmount ? String(response.leaseAmount) : ''
      formData.value.leaseAmountSurplus = response.leaseAmountSurplus ? String(response.leaseAmountSurplus) : ''
      formData.value.userId = response.userId ? String(response.userId) : ''
      
      // 处理财务指标数值
      formData.value.totalAssets = response.totalAssets ? String(response.totalAssets) : ''
      formData.value.inventory = response.inventory ? String(response.inventory) : ''
      formData.value.accountsReceivable = response.accountsReceivable ? String(response.accountsReceivable) : ''
      formData.value.totalLiabilities = response.totalLiabilities ? String(response.totalLiabilities) : ''
      formData.value.bankLoans = response.bankLoans ? String(response.bankLoans) : ''
      formData.value.accountsPayable = response.accountsPayable ? String(response.accountsPayable) : ''
      formData.value.mainBizIncome = response.mainBizIncome ? String(response.mainBizIncome) : ''
      formData.value.netProfit = response.netProfit ? String(response.netProfit) : ''
      formData.value.debtAssetRatio = response.debtAssetRatio ? String(response.debtAssetRatio) : ''
      
      // 处理日期显示
      formData.value.manageDateText = response.manageDate ? formatDate(response.manageDate, 'YYYY-MM-DD') : ''
      
      // 处理风险管理建议文本
      formData.value.riskMgmtSuggestionText = getRiskMgmtSuggestionText(response.riskMgmtSuggestion)
      
      // 处理文件列表
      const processedFileList = response.fileList ? (typeof response.fileList === 'string' ? response.fileList.split(',').filter(id => id.trim() !== '') : response.fileList) : []
      formData.value.fileList = processedFileList
      
      // 加载企业信息和租赁单信息
      await loadCompanyData()
      await loadLeaseData()
    }
  } catch (error) {
    console.error('获取财务管理数据失败:', error)
  } finally {
    detailLoading.value = false
  }
}

/** 加载企业数据 */
const loadCompanyData = async () => {
  try {
    const response = await FinanceCompanyApi.getSimpleFinanceCompanyList()
    companyList.value = response
    
    // 找到对应的企业名称
    const company = companyList.value.find(c => c.id === formData.value.companyId)
    formData.value.companyName = company?.enterpriseName || ''
  } catch (error) {
    console.error('加载企业数据失败:', error)
  }
}

/** 加载租赁单数据 */
const loadLeaseData = async () => {
  try {
    const list = await FinanceLeaseApi.getFinanceLeaseListApproved()
    financeLeaseOptions.value = Array.isArray(list) ? list : []
    
    // 找到对应的租赁单编号
    const lease = financeLeaseOptions.value.find(l => l.id === formData.value.leaseId)
    formData.value.leaseIdText = lease?.leasedCode || lease?.name || String(formData.value.leaseId || '')
  } catch (error) {
    console.error('加载租赁单数据失败:', error)
  }
}

/** 获得数据 */
const getInfo = async () => {
    // 优先使用 businessKey，再使用 modelInfo 中的 id
    let targetId = props.businessKey
    if (!targetId && props.modelInfo?.businessData?.id) {
        targetId = props.modelInfo.businessData.id
    }
    if (!targetId && props.modelInfo?.id) {
        targetId = props.modelInfo.id
    }
    if (!targetId && props.id) {
        targetId = props.id
    }
    if (!targetId && queryId) {
        targetId = queryId
    }
    
    if (!targetId) {
        console.error('没有找到有效的 ID 来加载数据')
        return
    }
    
    await loadFinanceManageData(targetId as string)
}

defineExpose({ 
    open: getInfo
}) // 提供 open 方法，用于打开弹窗

/** 初始化 **/
onMounted(() => {
    getInfo()
})

// 监听 props 变化
watch(
  () => [props.modelInfo, props.businessKey],
  () => {
    getInfo()
  },
  { deep: true }
)
</script>
<style scoped>
/* 流程表单容器样式 */
.process-form-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

/* 表单区域样式 */
.form-section {
  margin-bottom: 30px;
}

.section-title {
  margin: 0 0 20px 0;
  padding: 0 0 10px 0;
  border-bottom: 2px solid #e4e7ed;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

/* 一行三列布局 */
.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-row .el-form-item {
  flex: 1;
  margin-bottom: 0;
}

.form-row .el-form-item.full-width {
  flex: 1;
}

/* Tab组件样式 */
.form-tabs {
  margin-top: 20px;
}

.radio-content,
.upload-content {
  padding: 20px 0;
}

/* 指标项目样式 */
.radio-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fafbfc;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.radio-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.radio-label {
  font-weight: 500;
  color: #495057;
  margin-right: 10px;
  line-height: 1.4;
  flex-shrink: 0;
}

.radio-remark {
  display: flex;
  align-items: flex-start;
  padding-left: 20px;
  margin-top: 10px;
}

.remark-label {
  font-weight: 500;
  color: #6c757d;
  margin-right: 8px;
  white-space: nowrap;
}

.remark-value {
  color: #495057;
  line-height: 1.4;
  word-break: break-all;
}

.no-data {
  text-align: center;
  padding: 40px 0;
}

/* 文件列表样式 */
.file-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-item .el-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  width: fit-content;
}

.no-files {
  padding: 20px 0;
  text-align: center;
}

.no-file-text {
  color: #909399;
  font-style: italic;
}

/* 只读输入框样式优化 */
:deep(.el-input.is-disabled .el-input__inner) {
  background-color: #f8f9fa;
  border-color: #e9ecef;
  color: #495057;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

/* 表格样式优化 */
:deep(.el-table) {
  margin-top: 10px;
}

:deep(.el-table th) {
  background-color: #f8f9fa;
  color: #606266;
  font-weight: 600;
}

/* 标签样式 */
:deep(.el-tag) {
  border-radius: 4px;
}

/* 空状态组件样式 */
:deep(.el-empty) {
  padding: 20px 0;
}

/* 财务指标样式 */
.tab-content {
  padding: 20px 0;
}

.form-spacer {
  flex: 1;
}

/* 预警信号内容样式 */
.warning-item {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fafbfc;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.warning-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.warning-item .radio-item.full-width {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.warning-item .remark-value {
  word-break: break-word;
  white-space: pre-wrap;
}

/* 结论内容样式 */
.conclusion-item {
  padding: 20px;
  background-color: #fafbfc;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.conclusion-item .form-row {
  margin-bottom: 25px;
}

.conclusion-item .el-form-item.full-width {
  width: 100%;
}

.conclusion-item .radio-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

/* 只读文本区域样式优化 */
:deep(.el-textarea.is-disabled .el-textarea__inner) {
  background-color: #f8f9fa;
  border-color: #e9ecef;
  color: #495057;
  resize: none;
}
</style>
