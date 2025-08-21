<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" class="right-full-dia">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="128px"
      v-loading="formLoading"
    >
      <!-- 上部分：基本信息字段 -->
      <div class="form-section">
        <h3 class="section-title">基本信息</h3>
        <div class="form-row">
          <el-form-item label="融资租赁单编号" prop="leaseId">
            <el-input v-model="formData.leaseId" placeholder="请输入融资租赁单编号" />
          </el-form-item>
          <el-form-item label="租后管理编码" prop="manageCode">
            <el-input v-model="formData.manageCode" placeholder="请输入租后管理编码" />
          </el-form-item>
          <el-form-item label="企业名称" prop="companyId">
            <el-select v-model="formData.companyId" placeholder="请选择企业">
              <el-option
                v-for="item in companyList"
                :key="item.id"
                :label="item.enterpriseName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="租赁总额" prop="leaseAmount">
            <el-input v-model="formData.leaseAmount" placeholder="请输入租赁总额" />
          </el-form-item>
          <el-form-item label="租赁余额" prop="leaseAmountSurplus">
            <el-input v-model="formData.leaseAmountSurplus" placeholder="请输入租赁余额" />
          </el-form-item>
            <el-form-item label="申请人编码" prop="userId">
            <el-input v-model="formData.userId" placeholder="请输入申请人编码" readonly :disabled="true"/>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="检查日期" prop="manageDate">
            <el-date-picker
              v-model="formData.manageDate"
              type="date"
              value-format="x"
              placeholder="选择检查日期"
            />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="其他检查情况说明" prop="otherDescriptions" class="full-width">
            <el-input
              v-model="formData.otherDescriptions"
              type="textarea"
              :rows="4"
              placeholder="请输入其他检查情况说明"
            />
          </el-form-item>
          <el-form-item label="" prop="">
            <div></div>
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
                 <el-form-item label="企业名称是否发生变更" prop="corpNameChanged" label-width="220px">
                   <el-radio-group v-model="formData.corpNameChanged">
                     <el-radio
                       v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                       :key="String(dict.value)"
                       :label="dict.value"
                     >
                       {{ dict.label }}
                     </el-radio>
                   </el-radio-group>
                 </el-form-item>
                 <el-form-item label="法人代表是否发生变更" prop="legalRepChanged" label-width="220px">
                   <el-radio-group v-model="formData.legalRepChanged">
                     <el-radio
                       v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                       :key="String(dict.value)"
                       :label="dict.value"
                     >
                       {{ dict.label }}
                     </el-radio>
                   </el-radio-group>
                 </el-form-item>
               </div>
               <div class="radio-row">
                 <el-form-item label="实际控制人是否发生变更" prop="actualControllerChanged" label-width="220px">
                   <el-radio-group v-model="formData.actualControllerChanged">
                     <el-radio
                       v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                       :key="String(dict.value)"
                       :label="dict.value"
                     >
                       {{ dict.label }}
                     </el-radio>
                   </el-radio-group>
                 </el-form-item>
                 <el-form-item label="企业主要管理层是否发生变动" prop="mgmtTeamChanged" label-width="220px">
                   <el-radio-group v-model="formData.mgmtTeamChanged">
                     <el-radio
                       v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                       :key="String(dict.value)"
                       :label="dict.value"
                     >
                       {{ dict.label }}
                     </el-radio>
                   </el-radio-group>
                 </el-form-item>
               </div>
               <div class="radio-row">
                 <el-form-item label="企业注册资本是否发生变化" prop="regCapitalChanged" label-width="220px">
                   <el-radio-group v-model="formData.regCapitalChanged">
                     <el-radio
                       v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                       :key="String(dict.value)"
                       :label="dict.value"
                     >
                       {{ dict.label }}
                     </el-radio>
                   </el-radio-group>
                 </el-form-item>
                 <el-form-item label="企业营业执照是否通过年检" prop="licenseAnnualOk" label-width="220px">
                   <el-radio-group v-model="formData.licenseAnnualOk">
                     <el-radio
                       v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                       :key="String(dict.value)"
                       :label="dict.value"
                     >
                       {{ dict.label }}
                     </el-radio>
                   </el-radio-group>
                 </el-form-item>
               </div>
               <div class="radio-row">
                 <el-form-item label="企业经营场所是否发生变化" prop="bizAddrChanged" label-width="220px">
                   <el-radio-group v-model="formData.bizAddrChanged">
                     <el-radio
                       v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                       :key="String(dict.value)"
                       :label="dict.value"
                     >
                       {{ dict.label }}
                     </el-radio>
                   </el-radio-group>
                 </el-form-item>
                 <el-form-item label="企业股权结构是否发生变化" prop="equityStructChanged" label-width="220px">
                   <el-radio-group v-model="formData.equityStructChanged">
                     <el-radio
                       v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                       :key="String(dict.value)"
                       :label="dict.value"
                     >
                       {{ dict.label }}
                     </el-radio>
                   </el-radio-group>
                 </el-form-item>
               </div>
               <div class="radio-row">
                 <el-form-item label="资金是否存在在关联方流转" prop="fundCircleInRelated" label-width="220px">
                   <el-radio-group v-model="formData.fundCircleInRelated">
                     <el-radio
                       v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                       :key="String(dict.value)"
                       :label="dict.value"
                     >
                       {{ dict.label }}
                     </el-radio>
                   </el-radio-group>
                 </el-form-item>
                 <el-form-item label="" prop="">
                   <div></div>
                 </el-form-item>
               </div>
             </div>
           </el-tab-pane>

                     <!-- 企业经营情况 -->
           <el-tab-pane label="企业经营情况" name="operation">
             <div class="radio-content">
               <div class="radio-row">
                 <el-form-item label="所在行业是否发生变化" prop="industryChanged" label-width="220px">
                   <el-radio-group v-model="formData.industryChanged">
                     <el-radio
                       v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                       :key="String(dict.value)"
                       :label="dict.value"
                     >
                       {{ dict.label }}
                     </el-radio>
                   </el-radio-group>
                 </el-form-item>
                 <el-form-item label="主营业务和主要产品是否发生变化" prop="mainBizChanged" label-width="280px">
                   <el-radio-group v-model="formData.mainBizChanged">
                     <el-radio
                       v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                       :key="String(dict.value)"
                       :label="dict.value"
                     >
                       {{ dict.label }}
                     </el-radio>
                   </el-radio-group>
                 </el-form-item>
               </div>
               <div class="radio-row">
                 <el-form-item label="主要客户是否发生变化" prop="keyCustomersChanged" label-width="220px">
                   <el-radio-group v-model="formData.keyCustomersChanged">
                     <el-radio
                       v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                       :key="String(dict.value)"
                       :label="dict.value"
                     >
                       {{ dict.label }}
                     </el-radio>
                   </el-radio-group>
                 </el-form-item>
                 <el-form-item label="上游企业是否发生变化" prop="upstreamChanged" label-width="280px">
                   <el-radio-group v-model="formData.upstreamChanged">
                     <el-radio
                       v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                       :key="String(dict.value)"
                       :label="dict.value"
                     >
                       {{ dict.label }}
                     </el-radio>
                   </el-radio-group>
                 </el-form-item>
               </div>
               <div class="radio-row">
                 <el-form-item label="生产工艺及技术是否发生变化" prop="processTechChanged" label-width="220px">
                   <el-radio-group v-model="formData.processTechChanged">
                     <el-radio
                       v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                       :key="String(dict.value)"
                       :label="dict.value"
                     >
                       {{ dict.label }}
                     </el-radio>
                   </el-radio-group>
                 </el-form-item>
                 <el-form-item label="生产用电量、用水量及纳税数额是否显著下降" prop="utilityTaxDecline" label-width="280px">
                   <el-radio-group v-model="formData.utilityTaxDecline">
                     <el-radio
                       v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                       :key="String(dict.value)"
                       :label="dict.value"
                     >
                       {{ dict.label }}
                     </el-radio>
                   </el-radio-group>
                 </el-form-item>
               </div>
               <div class="radio-row">
                 <el-form-item label="近期开工情况是否正常" prop="startupNormal" label-width="220px">
                   <el-radio-group v-model="formData.startupNormal">
                     <el-radio
                       v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                       :key="String(dict.value)"
                       :label="dict.value"
                     >
                       {{ dict.label }}
                     </el-radio>
                   </el-radio-group>
                 </el-form-item>
                 <el-form-item label="办公秩序是否混乱，人员稀少" prop="officeDisorder" label-width="280px">
                   <el-radio-group v-model="formData.officeDisorder">
                     <el-radio
                       v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                       :key="String(dict.value)"
                       :label="dict.value"
                     >
                       {{ dict.label }}
                     </el-radio>
                   </el-radio-group>
                 </el-form-item>
               </div>
               <div class="radio-row">
                 <el-form-item label="是否实施新项目" prop="newProjectLaunched" label-width="220px">
                   <el-radio-group v-model="formData.newProjectLaunched">
                     <el-radio
                       v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                       :key="String(dict.value)"
                       :label="dict.value"
                     >
                       {{ dict.label }}
                     </el-radio>
                   </el-radio-group>
                 </el-form-item>
                 <el-form-item label="" prop="">
                   <div></div>
                 </el-form-item>
               </div>
             </div>
           </el-tab-pane>

                     <!-- 公共信息 -->
           <el-tab-pane label="公共信息" name="public">
             <div class="radio-content">
               <div class="radio-row">
                 <el-form-item label="企业是否有新增征信不良记录" prop="newBadCredit" label-width="220px">
                   <el-radio-group v-model="formData.newBadCredit">
                     <el-radio
                       v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                       :key="String(dict.value)"
                       :label="dict.value"
                     >
                       {{ dict.label }}
                     </el-radio>
                   </el-radio-group>
                 </el-form-item>
                 <el-form-item label="企业是否涉及司法诉讼" prop="involvedLawsuit" label-width="220px">
                   <el-radio-group v-model="formData.involvedLawsuit">
                     <el-radio
                       v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                       :key="String(dict.value)"
                       :label="dict.value"
                     >
                       {{ dict.label }}
                     </el-radio>
                   </el-radio-group>
                 </el-form-item>
               </div>
               <div class="radio-row">
                 <el-form-item label="企业是否涉及行政处罚" prop="involvedPenalty" label-width="220px">
                   <el-radio-group v-model="formData.involvedPenalty">
                     <el-radio
                       v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                       :key="String(dict.value)"
                       :label="dict.value"
                     >
                       {{ dict.label }}
                     </el-radio>
                   </el-radio-group>
                 </el-form-item>
                 <el-form-item label="企业是否正常缴纳税金" prop="taxPaymentNormal" label-width="220px">
                   <el-radio-group v-model="formData.taxPaymentNormal">
                     <el-radio
                       v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                       :key="String(dict.value)"
                       :label="dict.value"
                     >
                       {{ dict.label }}
                     </el-radio>
                   </el-radio-group>
                 </el-form-item>
               </div>
               <div class="radio-row">
                 <el-form-item label="企业是否按期支付员工工资" prop="salaryPaidOnTime" label-width="220px">
                   <el-radio-group v-model="formData.salaryPaidOnTime">
                     <el-radio
                       v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                       :key="String(dict.value)"
                       :label="dict.value"
                     >
                       {{ dict.label }}
                     </el-radio>
                   </el-radio-group>
                 </el-form-item>
                 <el-form-item label="企业是否配合贷后管理工作" prop="cooperatePostLoan" label-width="220px">
                   <el-radio-group v-model="formData.cooperatePostLoan">
                     <el-radio
                       v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                       :key="String(dict.value)"
                       :label="dict.value"
                     >
                       {{ dict.label }}
                     </el-radio>
                   </el-radio-group>
                 </el-form-item>
               </div>
             </div>
           </el-tab-pane>

                     <!-- 对租赁物件检查情况 -->
           <el-tab-pane label="对租赁物件检查情况" name="lease">
             <div class="radio-content">
               <div class="radio-row">
                 <el-form-item label="租赁物件是否在约定使用场所" prop="leaseInPlace" label-width="220px">
                   <el-radio-group v-model="formData.leaseInPlace">
                     <el-radio
                       v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                       :key="String(dict.value)"
                       :label="dict.value"
                     >
                       {{ dict.label }}
                     </el-radio>
                   </el-radio-group>
                 </el-form-item>
                 <el-form-item label="租赁物件情况是否正常" prop="leaseNormal" label-width="220px">
                   <el-radio-group v-model="formData.leaseNormal">
                     <el-radio
                       v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                       :key="String(dict.value)"
                       :label="dict.value"
                     >
                       {{ dict.label }}
                     </el-radio>
                   </el-radio-group>
                 </el-form-item>
               </div>
             </div>
           </el-tab-pane>

          <!-- 财务指标情况 -->
          <el-tab-pane label="财务指标情况" name="financial">
            <div class="tab-content">
              <div class="form-row">
                <el-form-item label="总资产" prop="totalAssets"  >
                  <el-input v-model="formData.totalAssets" placeholder="请输入总资产" />
                </el-form-item>
                <el-form-item label="总资产备注" prop="totalAssetsRemark"  >
                  <el-input v-model="formData.totalAssetsRemark" placeholder="请输入总资产备注" />
                </el-form-item>
              </div>
              <div class="form-row">
                <el-form-item label="存货" prop="inventory"  >
                  <el-input v-model="formData.inventory" placeholder="请输入存货" />
                </el-form-item>
                <el-form-item label="存货备注" prop="inventoryRemark"  >
                  <el-input v-model="formData.inventoryRemark" placeholder="请输入存货备注" />
                </el-form-item>
              </div>
              <div class="form-row">
                <el-form-item label="应收账款" prop="accountsReceivable"  >
                  <el-input v-model="formData.accountsReceivable" placeholder="请输入应收账款" />
                </el-form-item>
                <el-form-item label="应收账款备注" prop="accountsReceivableRemark"  >
                  <el-input v-model="formData.accountsReceivableRemark" placeholder="请输入应收账款备注" />
                </el-form-item>
              </div>
              <div class="form-row">
                <el-form-item label="总负债" prop="totalLiabilities"  >
                  <el-input v-model="formData.totalLiabilities" placeholder="请输入总负债" />
                </el-form-item>
                <el-form-item label="总负债备注" prop="totalLiabilitiesRemark"  >
                  <el-input v-model="formData.totalLiabilitiesRemark" placeholder="请输入总负债备注" />
                </el-form-item>
              </div>
              <div class="form-row">
                <el-form-item label="银行借款" prop="bankLoans"  >
                  <el-input v-model="formData.bankLoans" placeholder="请输入银行借款" />
                </el-form-item>
                <el-form-item label="银行借款备注" prop="bankLoansRemark"  >
                  <el-input v-model="formData.bankLoansRemark" placeholder="请输入银行借款备注" />
                </el-form-item>
              </div>
              <div class="form-row">
                <el-form-item label="应付账款" prop="accountsPayable"  >
                  <el-input v-model="formData.accountsPayable" placeholder="请输入应付账款" />
                </el-form-item>
                <el-form-item label="应付账款备注" prop="accountsPayableRemark"  >
                  <el-input v-model="formData.accountsPayableRemark" placeholder="请输入应付账款备注" />
                </el-form-item>
              </div>
              <div class="form-row">
                <el-form-item label="主营业务收入" prop="mainBizIncome"  >
                  <el-input v-model="formData.mainBizIncome" placeholder="请输入主营业务收入" />
                </el-form-item>
                <el-form-item label="主营业务收入备注" prop="mainBizIncomeRemark"  >
                  <el-input v-model="formData.mainBizIncomeRemark" placeholder="请输入主营业务收入备注" />
                </el-form-item>
              </div>
              <div class="form-row">
                <el-form-item label="净利润" prop="netProfit"  >
                  <el-input v-model="formData.netProfit" placeholder="请输入净利润" />
                </el-form-item>
                <el-form-item label="净利润备注" prop="netProfitRemark"  >
                  <el-input v-model="formData.netProfitRemark" placeholder="请输入净利润备注" />
                </el-form-item>
              </div>
              <div class="form-row">
                <el-form-item label="资产负债率(%)" prop="debtAssetRatio"  >
                  <el-input v-model="formData.debtAssetRatio" placeholder="请输入资产负债率(%)" />
                </el-form-item>
                <el-form-item label="资产负债率(%)备注" prop="debtAssetRatioRemark"  >
                  <el-input v-model="formData.debtAssetRatioRemark" placeholder="请输入资产负债率(%)备注" />
                </el-form-item>
              </div>
            </div>
          </el-tab-pane>

          <!-- 预警信号或关注事项 -->
          <el-tab-pane label="预警信号或关注事项" name="warning">
            <div class="radio-content">
              <div class="radio-row">
                 <el-form-item label="财务报表是否明显不实" prop="fsObviouslyFalse" label-width="220px">
                  <el-radio-group v-model="formData.fsObviouslyFalse">
                    <el-radio
                      v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                      :key="String(dict.value)"
                      :label="dict.value"
                    >
                      {{ dict.label }}
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="备注" prop="fsObviouslyFalseReason" v-if="formData.fsObviouslyFalse === true">
                  <el-input v-model="formData.fsObviouslyFalseReason" placeholder="请输入备注" />
                </el-form-item>
              </div>
              <div class="radio-row">
                 <el-form-item label="应收账款有无大幅增加，收回拖延" prop="arSharpRiseDelay" label-width="220px">
                  <el-radio-group v-model="formData.arSharpRiseDelay">
                    <el-radio
                      v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                      :key="String(dict.value)"
                      :label="dict.value"
                    >
                      {{ dict.label }}
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="备注" prop="arSharpRiseDelayReason" v-if="formData.arSharpRiseDelay === true">
                  <el-input v-model="formData.arSharpRiseDelayReason" placeholder="请输入备注" />
                </el-form-item>
              </div>
              <div class="radio-row">
                 <el-form-item label="存货是否较大，有无突然增加" prop="inventorySurge" label-width="220px">
                  <el-radio-group v-model="formData.inventorySurge">
                    <el-radio
                      v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                      :key="String(dict.value)"
                      :label="dict.value"
                    >
                      {{ dict.label }}
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="备注" prop="inventorySurgeReason" v-if="formData.inventorySurge === true">
                  <el-input v-model="formData.inventorySurgeReason" placeholder="请输入备注" />
                </el-form-item>
              </div>
              <div class="radio-row">
                 <el-form-item label="银行债务有无大量增加" prop="bankDebtRise" label-width="220px">
                  <el-radio-group v-model="formData.bankDebtRise">
                    <el-radio
                      v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                      :key="String(dict.value)"
                      :label="dict.value"
                    >
                      {{ dict.label }}
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="备注" prop="bankDebtRiseReason" v-if="formData.bankDebtRise === true">
                  <el-input v-model="formData.bankDebtRiseReason" placeholder="请输入备注" />
                </el-form-item>
              </div>
              <div class="radio-row">
                 <el-form-item label="资产负债结构有无重大变化" prop="debtStructChange" label-width="220px">
                  <el-radio-group v-model="formData.debtStructChange">
                    <el-radio
                      v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                      :key="String(dict.value)"
                      :label="dict.value"
                    >
                      {{ dict.label }}
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="备注" prop="debtStructChangeReason" v-if="formData.debtStructChange === true">
                  <el-input v-model="formData.debtStructChangeReason" placeholder="请输入备注" />
                </el-form-item>
              </div>
              <div class="radio-row">
                 <el-form-item label="流动比远低于正常值" prop="currentRatioLow" label-width="220px">
                  <el-radio-group v-model="formData.currentRatioLow">
                    <el-radio
                      v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                      :key="String(dict.value)"
                      :label="dict.value"
                    >
                      {{ dict.label }}
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="备注" prop="currentRatioLowReason" v-if="formData.currentRatioLow === true">
                  <el-input v-model="formData.currentRatioLowReason" placeholder="请输入备注" />
                </el-form-item>
              </div>
              <div class="radio-row">
                 <el-form-item label="成本上升或利润下降" prop="costUpProfitDown" label-width="220px">
                  <el-radio-group v-model="formData.costUpProfitDown">
                    <el-radio
                      v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                      :key="String(dict.value)"
                      :label="dict.value"
                    >
                      {{ dict.label }}
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="备注" prop="costUpProfitDownReason" v-if="formData.costUpProfitDown === true">
                  <el-input v-model="formData.costUpProfitDownReason" placeholder="请输入备注" />
                </el-form-item>
              </div>
              <div class="radio-row">
                 <el-form-item label="货币资金余额是否不断下降" prop="cashBalanceDecline" label-width="220px">
                  <el-radio-group v-model="formData.cashBalanceDecline">
                    <el-radio
                      v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                      :key="String(dict.value)"
                      :label="dict.value"
                    >
                      {{ dict.label }}
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="备注" prop="cashBalanceDeclineReason" v-if="formData.cashBalanceDecline === true">
                  <el-input v-model="formData.cashBalanceDeclineReason" placeholder="请输入备注" />
                </el-form-item>
              </div>
              <div class="radio-row">
                 <el-form-item label="是否拖延支付用款费用" prop="paymentDelay" label-width="220px">
                  <el-radio-group v-model="formData.paymentDelay">
                    <el-radio
                      v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                      :key="String(dict.value)"
                      :label="dict.value"
                    >
                      {{ dict.label }}
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="备注" prop="paymentDelayReason" v-if="formData.paymentDelay === true">
                  <el-input v-model="formData.paymentDelayReason" placeholder="请输入备注" />
                </el-form-item>
              </div>
              <div class="radio-row">
                <el-form-item label="财务其他风险" prop="financialOtherRisk" label-width="120px">
                  <el-input v-model="formData.financialOtherRisk" placeholder="请输入财务其他风险" />
                </el-form-item>
                <el-form-item label="" prop="">
                  <div></div>
                </el-form-item>
              </div>
            </div>
          </el-tab-pane>

          <!-- 检查结论及建议 -->
          <el-tab-pane label="检查结论及建议" name="conclusion">
            <div class="radio-content">
              <div class="radio-row">
                <el-form-item label="对项目风险状况的总体评价" prop="overallRiskEval" label-width="230px" >
                  <el-input v-model="formData.overallRiskEval" placeholder="请输入对项目风险状况的总体评价" />
                </el-form-item>
                <el-form-item label="" prop="">
                  <div></div>
                </el-form-item>
              </div>
              <div class="radio-row">
                <el-form-item label="对租赁物件状况的总体评价" prop="overallLeaseEval" label-width="230px" >
                  <el-input v-model="formData.overallLeaseEval" placeholder="请输入对租赁物件状况的总体评价" />
                </el-form-item>
                <el-form-item label="" prop="">
                  <div></div>
                </el-form-item>
              </div>
              <div class="radio-row">
                <el-form-item label="对该项目的风险管理策略建议" prop="riskMgmtSuggestion" label-width="230px" >
                  <el-radio-group v-model="formData.riskMgmtSuggestion">
                    <el-radio label="1">正常维护</el-radio>
                    <el-radio label="2">密切关注，加大检查频率</el-radio>
                    <el-radio label="3">提前终止</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="" prop="">
                  <div></div>
                </el-form-item>
              </div>
            </div>
          </el-tab-pane>

          <!-- 附件上传 -->
          <el-tab-pane label="附件上传" name="upload">
            <div class="radio-content">
              <el-form-item label="文件路径" prop="filePath">
                <UploadFile
                  v-model="formData.filePath"
                  :limit="10"
                  file-type="jpg,png,pdf,doc,docx"
                  :file-size="10"
                  :drag="true"
                  directory="uploads"
                />
              </el-form-item>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
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
import {FinanceCompanyApi, FinanceCompanyVO} from "@/api/business/financecompany";
import { UploadFile } from '@/components/UploadFile'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

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
  manageCode: undefined,
  leaseId: undefined,
  companyId: undefined,
  leaseAmount: undefined,
  leaseAmountSurplus: undefined,
  userId: userStore.getUser?.id,
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
  financialOtherRisk: undefined,
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
  financialOtherRisk: [{ required: true, message: '财务其他风险不能为空', trigger: 'blur' }],
  overallRiskEval: [{ required: true, message: '对项目风险状况的总体评价不能为空', trigger: 'blur' }],
  overallLeaseEval: [{ required: true, message: '对租赁物件状况的总体评价不能为空', trigger: 'blur' }],
  riskMgmtSuggestion: [{ required: true, message: '对该项目的风险管理策略建议不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '单据状态不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref
const companyList = ref<FinanceCompanyVO[]>([]) // 公司列表
const activeTab = ref('basic') // 当前激活的tab

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  formData.value.userId = userStore.getUser?.id
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await FinanceManageApi.getFinanceManage(id)
    } finally {
      formLoading.value = false
    }
  }
  const response = await FinanceCompanyApi.getSimpleFinanceCompanyList()
  companyList.value = response.data

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
    manageCode: undefined,
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
    financialOtherRisk: undefined,
    overallRiskEval: undefined,
    overallLeaseEval: undefined,
    riskMgmtSuggestion: undefined,
    filePath: undefined,
    status: 1,
    processInstanceId: undefined,
    deptId: undefined,
  }
  formRef.value?.resetFields()
}
</script>

<style scoped>
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

/* 单选部分一行两列布局 */
.radio-row {
  display: flex;
  margin-bottom: 30px;
}

.radio-row .el-form-item {
  margin-bottom: 0;
}

/* 单选按钮列样式 */
.radio-row .el-form-item:first-child {
  flex: 1;
}

/* 备注输入框列样式 */
.radio-row .el-form-item:last-child {
  flex: 1;
}
</style>
