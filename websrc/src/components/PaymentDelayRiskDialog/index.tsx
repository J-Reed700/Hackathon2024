import React, { useContext } from 'react';
import { Autocomplete, Card, CardContent, CardHeader, Checkbox, Dialog, DialogContent, DialogProps, DialogTitle, FormControlLabel, LinearProgress, TextField } from '@mui/material';
import RiskAssessment from '../RiskAssessment';
import ProjectTimeline from '../ProjectTimeline';
import { AccountBalanceWalletOutlined, ApprovalOutlined, ArrowRightAltOutlined, CheckOutlined, CloseOutlined, CreateOutlined, EmailOutlined, GroupAddOutlined, PendingActionsOutlined, PhoneInTalkOutlined, ReceiptLongOutlined, ShowChart, TimelineOutlined, UpdateOutlined, WarningAmberOutlined } from '@mui/icons-material';
import AssignDialog, { DunningType } from '../AssignDialog';
import DunningStatus from '../DunningStatus';

import dunningEmailLogo from '../../assets/dunning-email-logo.svg';
import walletLogo from '../../assets/wallet-graphic.svg';
import ameliaLogo from '../../assets/amelia-watson.svg';
import ameryLogo from '../../assets/amery-west.svg';
import sparkle from '../../assets/sparkle.svg';
import { AppContext } from '../../App';

const NET_TERMS_OPTIONS = ['Net 7', 'Net 15', 'Net 30', 'Net 45'];
const REMINDER_OPTIONS = ['1 day before', '2 days before', '1 week before', '2 weeks before'];
const OVERTIME_AMT = 10456.76;

type PaymentDelayRiskDialogProps = DialogProps & {
   showDunningStatus: boolean;
   setShowDunningStatus: (showDunningStatus: boolean) => void;
}

const PaymentDelayRiskDialog: React.FC<PaymentDelayRiskDialogProps> = props => {
   const [actionTaken, setActionTaken] = React.useState<DunningType | undefined>();

   const { invoices } = useContext(AppContext);

   const totalInvoicesAmount = React.useMemo(() => invoices.reduce((acc, i) => acc + i.Amt, 0), [invoices]);
   
   const totalAmt = React.useMemo(() => totalInvoicesAmount + OVERTIME_AMT, [totalInvoicesAmount]);

   const onClickAssign = React.useCallback((type: DunningType) => {
      setActionTaken(type);
   }, []);

   const onCloseAssignDialog = React.useCallback(() => {
      setActionTaken(undefined);
   }, []);

   const onDunningComplete = React.useCallback(() => {
      props.setShowDunningStatus(true);
   }, []);

   const onCloseDialog = React.useCallback((_: any) => {
      props.onClose?.({}, 'backdropClick');
   }, [props.onClose]);

   return (
      <>
         <Dialog 
            {...props} 
            maxWidth='md' 
            fullWidth 
            style={{ fontFamily: 'inherit', maxHeight: '850px' }}
         >
            <DialogTitle 
               style={{ fontFamily: 'inherit', display: 'flex', justifyContent: 'space-between' }}
            >
               <span style={{ display: 'flex', gap: '0.5em', fontWeight: 700 }}><WarningAmberOutlined style={{ color: '#B50C00', fontSize: '24px' }} /> 3 Risks Detected</span>
               <div style={{ cursor: 'pointer' }} onClick={onCloseDialog}><CloseOutlined style={{ color: '#616161', fontSize: '24px' }} /></div>
            </DialogTitle>
            <DialogContent className='custom-scrollbar' style={{ backgroundColor: '#F4F8FD', padding: '2em' }}>
               <section>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                     <div>
                        <h3 style={{ margin: 0, fontSize: '22px' }}>Aging Invoice Payment Delays</h3>
                        <p style={{ color: '#616161' }}>Innovatech - Data Cloud Storage</p>
                     </div>
                     <button style={{ backgroundColor: '#DAE8F7', color: '#1F74CE', padding: '0.5em 0.75em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: '700', cursor: 'pointer' }}>
                        <span style={{ display: 'flex', gap: '0.25em', alignItems: 'center' }}>
                           View Project <ArrowRightAltOutlined style={{ marginLeft: '0.25em' }} />
                        </span>
                     </button>
                  </div>
               </section>

               <section style={{ marginTop: '1em' }}>
                  <p style={{ width: '720px' }}>
                     There are currently 3 overdue invoices with an outstanding balance of <strong>${totalAmt.toLocaleString()}.</strong> This will result 
                     in an <span style={{ color: '#DC2F18' }}>at-risk cash flow</span> if no action is taken.
                  </p>
               </section>
               
               <section style={{ marginTop: '2em', display: 'flex', ...props.showDunningStatus ? { gap: '3em' } : { justifyContent: 'space-around' } }}>
                  <RiskAssessment type='PaymentRisk' />
                  <ProjectTimeline type='PaymentRisk' />
                  {props.showDunningStatus && <DunningStatus />}
               </section>

               <section style={{ marginTop: '2em' }}>
                  <strong style={{ display: 'inline-block', marginBottom: '1em' }}>Recommended Actions:</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2em' }}>
                     <DunningEmailCard onClickAssign={() => onClickAssign('Email')} showDunningStatus={props.showDunningStatus} />
                     <LateFeesCard />
                     <WalletCard />
                     <CallCard onClickAssign={() => onClickAssign('Call')} />
                     <PaymentTermsCard />
                     <OvertimeEntriesCard />
                  </div>
               </section>
            </DialogContent>
         </Dialog>
         <AssignDialog 
            open={!!actionTaken} 
            dunningType={actionTaken!}
            onClose={onCloseAssignDialog}
            onDunningComplete={onDunningComplete}
         />
      </>
   )
}

export default PaymentDelayRiskDialog;


type DunningEmailCardProps = {
   onClickAssign: () => void;
   showDunningStatus: boolean;
}

const DunningEmailCard: React.FC<DunningEmailCardProps> = props => {

   const { invoices } = useContext(AppContext);

   const sortedInvoices = React.useMemo(() => invoices.sort((a, b) => {
      return new Date(a.Dt_Due).getTime() - new Date(b.Dt_Due).getTime();
   }), [invoices]);

   const totalInvoicesAmount = React.useMemo(() => sortedInvoices.reduce((acc, i) => acc + i.Amt, 0), [sortedInvoices]);

   return (
      <Card>
         <CardHeader 
            title={
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center' }}><EmailOutlined style={{ color: '#1F74CE', marginRight: '0.25em' }} /> <strong>Send Dunning Emails</strong></span>
                  <button style={{ color: '#1F74CE', backgroundColor: 'inherit', padding: '0.5em 0.75em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: '700', cursor: 'pointer', alignSelf: 'flex-end', display: 'flex', gap: '0.25em', alignItems: 'center' }}>
                     View A/R Invoices <ReceiptLongOutlined style={{ color: '#1F74CE', marginLeft: '0.25em' }} /> 
                  </button>
               </div>
            }
            titleTypographyProps={{ style: { fontFamily: 'inherit' } }}
         />
         <CardContent>
            <section>
               There are {invoices.length} outstanding invoices with significant balances from Innovatech. <strong>On average, this 
               client has paid 36% of invoices 32 days late over the past 6 months</strong>, making them a high risk client. 
            </section>

            <section style={{ marginTop: '1em' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr 1fr 1.25fr 1.25fr 1fr 1fr 1fr 1fr 1fr', borderBottom: '1px solid #E6E6E6', fontSize: '12px', padding: '0.5em', alignItems: 'center' }}>
                  <img src={dunningEmailLogo} style={{ border: '1px solid #CCCCCC', borderRadius: '50%' }} />
                  <div>
                     <strong style={{ fontSize: '16px' }}>Innovatech</strong>
                     <div style={{ fontSize: '12px' }}>Phase 1 - Data Cloud Storage</div>
                     {
                        props.showDunningStatus && 
                        <LinearProgress variant="determinate" value={20} style={{ height: '10px', borderRadius: '5px' }} />
                     }
                  </div>
                  <div style={{ color: '#1F74CE' }}>#16789</div>
                  <div>${sortedInvoices[0].Amt.toLocaleString()}</div>
                  <div>{sortedInvoices[0].Dt_Due.toLocaleDateString()}</div>
                  <div style={{ display: 'inline-flex', gap: '0.25em' }}>
                     <span style={{ color: '#B50C00', fontSize: '16px' }}>3</span> <PendingActionsOutlined style={{ fontSize: '20px', color: '#616161' }} />
                  </div>
                  <div>
                     <strong>Overdue</strong>
                     <strong style={{ display: 'block', color: '#B50C00' }}>{Math.floor((Date.parse(new Date().toUTCString()) - Date.parse(sortedInvoices[0].Dt_Due.toUTCString())) / 86400000)} days</strong>
                  </div>
                  <ReceiptLongOutlined style={{ color: '#616161' }} />
                  {
                     props.showDunningStatus 
                        ? <img src={sparkle} style={{ width: '40px', height: '40px' }} />
                        : <div></div> 
                  }
                  <button 
                     style={{ backgroundColor: props.showDunningStatus ? '#1F74CE' : '#DAE8F7', color: props.showDunningStatus ? 'white' : '#1F74CE', padding: '0.25em 0.5em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '0.25em', alignItems: 'center' }}
                     onClick={props.onClickAssign}
                  >
                     {
                        props.showDunningStatus 
                           ? <>Review <ArrowRightAltOutlined style={{ marginLeft: '0.25em', fontSize: '16px' }} /></>
                           : <><GroupAddOutlined style={{ marginRight: '0.25em', fontSize: '16px' }} /> Assign</>
                     }
                  </button>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr 1fr 1.25fr 1.25fr 1fr 1fr 1fr 1fr 1fr', borderBottom: '1px solid #E6E6E6', fontSize: '12px', padding: '0.5em', alignItems: 'center' }}>
                  <img src={dunningEmailLogo} style={{ border: '1px solid #CCCCCC', borderRadius: '50%' }} />
                  <div>
                     <strong style={{ fontSize: '16px' }}>Innovatech</strong>
                     <div style={{ fontSize: '12px' }}>Phase 2 - Cloud Migration</div>
                  </div>
                  <div style={{ color: '#1F74CE' }}>#47629</div>
                  <div>${sortedInvoices[1].Amt.toLocaleString()}</div>
                  <div>{sortedInvoices[1].Dt_Due.toLocaleDateString()}</div>
                  <div style={{ display: 'inline-flex', gap: '0.25em' }}>
                     <span style={{ color: '#E67E00', fontSize: '16px' }}>2</span> <PendingActionsOutlined style={{ fontSize: '20px', color: '#616161' }} />
                  </div>
                  <div>
                     <strong>Overdue</strong>
                     <strong style={{ display: 'block', color: '#E67E00' }}>{Math.floor((Date.parse(new Date().toUTCString()) - Date.parse(sortedInvoices[1].Dt_Due.toUTCString())) / 86400000)} days</strong>
                  </div>
                  <ReceiptLongOutlined style={{ color: '#616161' }} />
                  <div></div>
                  <button 
                     style={{ backgroundColor: '#DAE8F7', color: '#1F74CE', padding: '0.25em 0.5em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '0.25em', alignItems: 'center' }}
                     onClick={props.onClickAssign}
                  >
                     <GroupAddOutlined style={{ color: '#1F74CE', marginRight: '0.25em', fontSize: '16px' }} /> Assign
                  </button>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr 1fr 1.25fr 1.25fr 1fr 1fr 1fr 1fr 1fr', borderBottom: '1px solid #E6E6E6', fontSize: '12px', padding: '0.5em', alignItems: 'center' }}>
                  <img src={dunningEmailLogo} style={{ border: '1px solid #CCCCCC', borderRadius: '50%' }} />
                  <div>
                     <strong style={{ fontSize: '16px' }}>Innovatech</strong>
                     <div style={{ fontSize: '12px' }}>Phase 3 - Implementation</div>
                  </div>
                  <div style={{ color: '#1F74CE' }}>#89370</div>
                  <div>${sortedInvoices[2].Amt.toLocaleString()}</div>
                  <div>{sortedInvoices[2].Dt_Due.toLocaleDateString()}</div>
                  <div style={{ display: 'inline-flex', gap: '0.25em' }}>
                     <span style={{ color: '#E67E00', fontSize: '16px' }}>2</span> <PendingActionsOutlined style={{ fontSize: '20px', color: '#616161' }} />
                  </div>
                  <div>
                     <strong>Overdue</strong>
                     <strong style={{ display: 'block', color: '#E67E00' }}>{Math.floor((Date.parse(new Date().toUTCString()) - Date.parse(sortedInvoices[2].Dt_Due.toUTCString())) / 86400000)} days</strong>
                  </div>
                  <ReceiptLongOutlined style={{ color: '#616161' }} />
                  <div></div>
                  <button 
                     style={{ backgroundColor: '#DAE8F7', color: '#1F74CE', padding: '0.25em 0.5em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '0.25em', alignItems: 'center' }}
                     onClick={props.onClickAssign}
                  >
                     <GroupAddOutlined style={{ color: '#1F74CE', marginRight: '0.25em', fontSize: '16px' }} /> Assign
                  </button>
               </div>
            </section>

            <section style={{ fontSize: '16px', marginTop: '1em' }}>
               <strong>Outstanding Balance:</strong> <span style={{ color: '#B50C00' }}> - ${totalInvoicesAmount.toLocaleString()}</span>
            </section>
         </CardContent>
      </Card>
   )
}

const LateFeesCard: React.FC = () => {
   const [netTermsValue, setNetTermsValue] = React.useState<string>(NET_TERMS_OPTIONS[2]);
   const [netTermsValue2, setNetTermsValue2] = React.useState<string>(NET_TERMS_OPTIONS[0]);
   const [netTermsValue3, setNetTermsValue3] = React.useState<string>(NET_TERMS_OPTIONS[1]);

   return (
      <Card>
         <CardHeader 
            title={
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center' }}><EmailOutlined style={{ color: '#1F74CE', marginRight: '0.25em' }} /> <strong>Apply Late Fees</strong></span>
                  <button style={{ color: '#1F74CE', backgroundColor: 'inherit', padding: '0.5em 0.75em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: '700', cursor: 'pointer', alignSelf: 'flex-end', display: 'flex', gap: '0.25em', alignItems: 'center' }}>
                     View WIP Invoices <CreateOutlined style={{ color: '#1F74CE', marginLeft: '0.25em' }} /> 
                  </button>
               </div>
            }
            titleTypographyProps={{ style: { fontFamily: 'inherit' } }}
         />
         <CardContent>
            <section>
               <strong>Late Fees have not been applied to any future invoices for Innovatech.</strong> You can review invoices 
               below and add Late Fee terms to encourage prompt payments.
            </section>

            <section style={{ marginTop: '1em' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 2fr 1.4fr', borderBottom: '1px solid #E6E6E6', fontSize: '12px', padding: '0.5em', alignItems: 'center' }}>
                  <img src={dunningEmailLogo} style={{ border: '1px solid #CCCCCC', borderRadius: '50%' }} />
                  <div>
                     <strong style={{ fontSize: '16px' }}>Innovatech</strong>
                     <div style={{ fontSize: '12px' }}>AWS Migration</div>
                  </div>
                  <div style={{ color: '#1F74CE' }}>#90345</div>
                  <div>$15,678.23</div>
                  <div>6/29/24</div>
                  <div>
                     <Autocomplete 
                        options={NET_TERMS_OPTIONS}
                        value={netTermsValue}
                        onChange={(_, newValue) => setNetTermsValue(newValue)}
                        renderInput={(params) => <TextField {...params} InputLabelProps={{ ...params.InputLabelProps, style: { fontFamily: 'inherit', color: '#595959', fontWeight: 700 }}} sx={{ '.MuiOutlinedInput-root': { paddingBottom: '3px', fontFamily: 'inherit' }}} />}
                        sx={{ width: 130 }}
                        disableClearable
                     />
                  </div>
                  <button 
                     style={{ backgroundColor: '#DAE8F7', color: '#1F74CE', padding: '0.25em 0.5em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer' }}
                  >
                     Apply Late Fee
                  </button>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 2fr 1.4fr', borderBottom: '1px solid #E6E6E6', fontSize: '12px', padding: '0.5em', alignItems: 'center' }}>
                  <img src={dunningEmailLogo} style={{ border: '1px solid #CCCCCC', borderRadius: '50%' }} />
                  <div>
                     <strong style={{ fontSize: '16px' }}>Innovatech</strong>
                     <div style={{ fontSize: '12px' }}>Data Server Migration</div>
                  </div>
                  <div style={{ color: '#1F74CE' }}>#12678</div>
                  <div>$8,800.00</div>
                  <div>6/31/24</div>
                  <div>
                     <Autocomplete 
                        options={NET_TERMS_OPTIONS}
                        value={netTermsValue2}
                        onChange={(_, newValue) => setNetTermsValue2(newValue)}
                        renderInput={(params) => <TextField {...params} InputLabelProps={{ ...params.InputLabelProps, style: { fontFamily: 'inherit', color: '#595959', fontWeight: 700 }}} sx={{ '.MuiOutlinedInput-root': { paddingBottom: '3px', fontFamily: 'inherit' }}} />}
                        sx={{ width: 130 }}
                        disableClearable
                     />
                  </div>
                  <button 
                     style={{ backgroundColor: '#DAE8F7', color: '#1F74CE', padding: '0.25em 0.5em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer' }}
                  >
                     Apply Late Fee
                  </button>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 2fr 1.4fr', borderBottom: '1px solid #E6E6E6', fontSize: '12px', padding: '0.5em', alignItems: 'center' }}>
                  <img src={dunningEmailLogo} style={{ border: '1px solid #CCCCCC', borderRadius: '50%' }} />
                  <div>
                     <strong style={{ fontSize: '16px' }}>Innovatech</strong>
                     <div style={{ fontSize: '12px' }}>Data Storage</div>
                  </div>
                  <div style={{ color: '#1F74CE' }}>#27890</div>
                  <div>$16,740.00</div>
                  <div>7/10/24</div>
                  <div>
                     <Autocomplete 
                        options={NET_TERMS_OPTIONS}
                        value={netTermsValue3}
                        onChange={(_, newValue) => setNetTermsValue3(newValue)}
                        renderInput={(params) => <TextField {...params} InputLabelProps={{ ...params.InputLabelProps, style: { fontFamily: 'inherit', color: '#595959', fontWeight: 700 }}} sx={{ '.MuiOutlinedInput-root': { paddingBottom: '3px', fontFamily: 'inherit' }}} />}
                        sx={{ width: 130 }}
                        disableClearable
                     />
                  </div>
                  <button 
                     style={{ backgroundColor: '#DAE8F7', color: '#1F74CE', padding: '0.25em 0.5em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer' }}
                  >
                     Apply Late Fee
                  </button>
               </div>
            </section>

            <section style={{ display: 'flex', justifyContent: 'space-around', marginTop: '1em' }}>
               <button style={{ color: '#1F74CE', backgroundColor: 'inherit', padding: '0.5em 0.75em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: '700', cursor: 'pointer', alignSelf: 'flex-end', display: 'flex', gap: '0.25em', alignItems: 'center' }}>
                  View all 13 <ArrowRightAltOutlined style={{ color: '#1F74CE', marginLeft: '0.25em' }} /> 
               </button>
            </section>
         </CardContent>
      </Card>
   )
}

const WalletCard: React.FC = () => {

   return (
      <Card>
         <CardHeader 
            title={<span style={{ display: 'flex', alignItems: 'center' }}><AccountBalanceWalletOutlined style={{ color: '#1F74CE', marginRight: '0.25em' }} /> <strong>Enroll in Wallet</strong></span>}
            titleTypographyProps={{ style: { fontFamily: 'inherit' } }}
         />
         <CardContent>
            <section style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-evenly' }}>
               <div style={{ maxWidth: '330px' }}>
                  <strong style={{ display: 'block', color: '#1F74CE', fontSize: '16px' }}>Get paid up to 3x faster by enabling Wallet</strong>
                  <strong style={{ fontSize: '16px' }}>BigTime’s digital payment solution</strong>
                  <div style={{ marginTop: '1em' }}>Streamline your payment process and allow your clients to pay on time from anywhere.</div>
               </div>
               <img src={walletLogo} style={{ width: '15em' }} />
               <div>
                  <button 
                     // onClick={onClickReview} 
                     style={{ width: '120px', display: 'flex', alignItems: 'center', backgroundColor: '#C4F5FF', color: '#1F74CE', padding: '0.25em 0.5em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer' }}
                  >
                     Enroll Now <ArrowRightAltOutlined style={{ marginLeft: '0.25em' }} />
                  </button>
                  <button 
                     // onClick={onClickReview} 
                     style={{ width: '120px', marginTop: '0.5em', backgroundColor: 'inherit', color: '#1F74CE', padding: '0.25em 0.5em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer' }}
                  >
                     Book a Demo
                  </button>
               </div>
            </section>
         </CardContent>
      </Card>
   )
}

type CallCardProps = {
   onClickAssign: () => void;
}


const CallCard: React.FC<CallCardProps> = props => {

   return (
      <Card>
         <CardHeader 
            title={<span style={{ display: 'flex', alignItems: 'center' }}><PhoneInTalkOutlined style={{ color: '#1F74CE', marginRight: '0.25em' }} /> <strong>Call Innovatech</strong></span>}
            titleTypographyProps={{ style: { fontFamily: 'inherit' } }}
         />
         <CardContent>
            <section>
               <strong>Assign an AI Agent to automate follow-up phone calls</strong> with Innovatech for overdue notices and payment instructions.
            </section>
            
            <section style={{ marginTop: '1em' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '0.75fr 2.75fr 1.5fr 1.75fr 1.5fr 1fr 1fr', borderBottom: '1px solid #E6E6E6', fontSize: '12px', padding: '0.5em', alignItems: 'center' }}>
                  <img src={dunningEmailLogo} style={{ border: '1px solid #CCCCCC', borderRadius: '50%' }} />
                  <div>
                     <strong style={{ fontSize: '16px' }}>Innovatech</strong>
                     <div style={{ fontSize: '12px' }}>Data Cloud Storage</div>
                  </div>
                  <strong style={{ color: '#B50C00' }}>- $72,981.15</strong>
                  <div>
                     <strong style={{ display: 'block' }}>3 Past Due Invoices</strong>
                     <div>Net 30+</div>
                  </div>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: '0.25em', color: '#DC2F18' }}>
                     <WarningAmberOutlined /> 4th Notice
                  </strong>
                  <ReceiptLongOutlined style={{ color: '#7D7D7D' }} />
                  <button 
                     onClick={props.onClickAssign} 
                     style={{ backgroundColor: '#DAE8F7', color: '#1F74CE', padding: '0.25em 0.5em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '0.25em', alignItems: 'center' }}
                  >
                     <GroupAddOutlined style={{ color: '#1F74CE', marginRight: '0.25em', fontSize: '16px' }} /> Assign
                  </button>
               </div>
            </section>
         </CardContent>
      </Card>
   )
}

const PaymentTermsCard: React.FC = () => {
   const [netTermsValue, setNetTermsValue] = React.useState<string>(NET_TERMS_OPTIONS[0]);
   const [reminderValue, setReminderValue] = React.useState<string>(REMINDER_OPTIONS[0]);

   return (
      <Card>
         <CardHeader 
            title={<span style={{ display: 'flex', alignItems: 'center' }}><UpdateOutlined style={{ color: '#1F74CE', marginRight: '0.25em' }} /> <strong>Update Payment Terms</strong></span>}
            titleTypographyProps={{ style: { fontFamily: 'inherit' } }}
         />
         <CardContent>
            <section>
               <strong>You can review the recommended terms below to apply it to all future invoices.</strong> Currently your invoice terms are set to Net 45 with no reminders for Innovatech. 
            </section>
            
            <section style={{ marginTop: '1em' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '0.25fr 1fr 0.75fr 1.5fr 1.25fr 1.25fr', gap: '0.75em', borderBottom: '1px solid #E6E6E6', fontSize: '12px', padding: '0.5em', alignItems: 'center' }}>
                  <img src={dunningEmailLogo} style={{ border: '1px solid #CCCCCC', borderRadius: '50%' }} />
                  <strong style={{ fontSize: '16px' }}>Innovatech</strong>
                  <div>
                     <div style={{ fontSize: '14px', color: '#616161', marginBottom: '0.25em' }}>Net Terms</div>
                     <Autocomplete 
                        options={NET_TERMS_OPTIONS}
                        value={netTermsValue}
                        onChange={(_, newValue) => setNetTermsValue(newValue)}
                        renderInput={(params) => <TextField {...params} InputLabelProps={{ ...params.InputLabelProps, style: { fontFamily: 'inherit', color: '#595959', fontWeight: 700 }}} sx={{ '.MuiOutlinedInput-root': { paddingBottom: '3px', fontFamily: 'inherit' }}} />}
                        sx={{ width: 130 }}
                        disableClearable
                     />
                  </div>
                  <div>
                     <div style={{ fontSize: '14px', color: '#616161', marginBottom: '0.25em' }}>Reminders</div>
                     <Autocomplete 
                        options={REMINDER_OPTIONS}
                        value={reminderValue}
                        onChange={(_, newValue) => setReminderValue(newValue)}
                        renderInput={(params) => <TextField {...params} InputLabelProps={{ ...params.InputLabelProps, style: { fontFamily: 'inherit', color: '#595959', fontWeight: 700 }}} sx={{ '.MuiOutlinedInput-root': { paddingBottom: '3px', fontFamily: 'inherit' }}} />}
                        sx={{ width: 130 }}
                        disableClearable
                     />
                  </div>
                  <FormControlLabel control={<Checkbox defaultChecked style={{ paddingRight: 0 }} />} label="Use as Default" slotProps={{ typography: { style: { fontFamily: 'inherit' }}}} />
                  <button 
                     style={{ backgroundColor: '#DAE8F7', color: '#1F74CE', padding: '0.25em 0.5em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '0.25em', alignItems: 'center' }}
                  >
                     Update Terms <CheckOutlined style={{ color: '#1F74CE', marginLeft: '0.25em' }} /> 
                  </button>
               </div>
            </section>
         </CardContent>
      </Card>
   )
}

const OvertimeEntriesCard: React.FC = () => {

   return (
      <Card>
         <CardHeader 
            title={
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center' }}><TimelineOutlined style={{ color: '#1F74CE', marginRight: '0.25em' }} /> <strong>Review Overtime Entries</strong></span>
                  <button style={{ color: '#1F74CE', backgroundColor: 'inherit', padding: '0.5em 0.75em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: '700', cursor: 'pointer', alignSelf: 'flex-end', display: 'flex', gap: '0.25em', alignItems: 'center' }}>
                     View Pending Approvals <ApprovalOutlined style={{ color: '#1F74CE', marginLeft: '0.25em' }} /> 
                  </button>
               </div>
            }
            titleTypographyProps={{ style: { fontFamily: 'inherit' } }}
         />
         <CardContent>
            <section>
               Megan Smith and Amery West have recorded <strong>50 unexpected overtime hours.</strong> In the entry notes they both mentioned onboarding time, training, and troubleshooting roadblocks. 
            </section>
            
            <section style={{ marginTop: '1em' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '0.5fr 1fr 1fr 2.5fr 0.75fr', gap: '0.5em', borderBottom: '1px solid #E6E6E6', fontSize: '12px', padding: '0.5em', alignItems: 'center' }}>
                  <img src={ameliaLogo} style={{ border: '1px solid #CCCCCC', borderRadius: '50%', width: '4em' }} />
                  <div>
                     <strong style={{ fontSize: '16px' }}>Amelia Watson</strong>
                     <div style={{ fontSize: '12px' }}>Sr. Developer</div>
                  </div>
                  <div>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span><strong>60h</strong> / 40h</span>
                        <span style={{ color: '#C03728' }}>- $5,000.09</span>
                     </div>
                     <div style={{ width: '100%', backgroundColor: '#DC2F18', color: 'white', padding: '0.25em', borderRadius: '5px'}}>
                        150%
                     </div>
                  </div>
                  <div style={{ padding: '0 1.5em'}}>
                     I am facing difficulties in getting up to speed with the new tools required for the project. These hours are for the additional research
                  </div>
                  <button 
                     // onClick={onClickReview} 
                     style={{ backgroundColor: '#DAE8F7', color: '#1F74CE', padding: '0.25em 0.5em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '0.25em', alignItems: 'center' }}
                  >
                     Review <ArrowRightAltOutlined style={{ color: '#1F74CE', marginLeft: '0.25em' }} /> 
                  </button>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '0.5fr 1fr 1fr 2.5fr 0.75fr', gap: '0.5em', borderBottom: '1px solid #E6E6E6', fontSize: '12px', padding: '0.5em', alignItems: 'center' }}>
                  <img src={ameryLogo} style={{ border: '1px solid #CCCCCC', borderRadius: '50%', width: '4em' }} />
                  <div>
                     <strong style={{ fontSize: '16px' }}>Amery West</strong>
                     <div style={{ fontSize: '12px' }}>Sr. Developer</div>
                  </div>
                  <div>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span><strong>70h</strong> / 40h</span>
                        <span style={{ color: '#C03728' }}>- $5,456.67</span>
                     </div>
                     <div style={{ width: '100%', backgroundColor: '#DC2F18', color: 'white', padding: '0.25em', borderRadius: '5px'}}>
                        175%
                     </div>
                  </div>
                  <div style={{ padding: '0 1.5em'}}>
                     Research Overtime: significant time spent learning the new tech stack
                  </div>
                  <button 
                     // onClick={onClickReview} 
                     style={{ backgroundColor: '#DAE8F7', color: '#1F74CE', padding: '0.25em 0.5em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '0.25em', alignItems: 'center' }}
                  >
                     Review <ArrowRightAltOutlined style={{ color: '#1F74CE', marginLeft: '0.25em' }} /> 
                  </button>
               </div>
            </section>
         </CardContent>
      </Card>
   )
}