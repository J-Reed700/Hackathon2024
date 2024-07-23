import { AddOutlined, ApprovalOutlined, ArrowRightAltOutlined, CloseOutlined, GroupAddOutlined, Star, WarningAmberOutlined } from '@mui/icons-material';
import { Card, CardContent, CardHeader, Chip, Dialog, DialogContent, DialogProps, DialogTitle } from '@mui/material';
import React from 'react';
import RiskAssessment from '../RiskAssessment';
import ProjectTimeline from '../ProjectTimeline';

import rohanLogo from '../../assets/rohan-adair.svg';
import stephanieLogo from '../../assets/stephanie-billinger.svg';
import georgiaLogo from '../../assets/georgia-kim.svg';

const STAFFER_ONE_SKILLS: Record<string, number> = {
   'Python': 5,
   'MySQL': 5,
   'JavaScript': 5,
   'Azure': 3.5,
   'AWS': 5
};

const STAFFER_TWO_SKILLS: Record<string, number> = {
   'Python': 5,
   'MySQL': 4,
   'JavaScript': 4,
   'Azure': 3.5,
   'AWS': 1
};

type StaffingRiskDialogProps = DialogProps & {};

const StaffingRiskDialog: React.FC<StaffingRiskDialogProps> = props => {

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
               <span style={{ display: 'flex', gap: '0.5em', fontWeight: 700 }}><WarningAmberOutlined style={{ color: '#E67E00', fontSize: '24px' }} /> 1 Risk Detected</span>
               <div style={{ cursor: 'pointer' }} onClick={onCloseDialog}><CloseOutlined style={{ color: '#616161', fontSize: '24px' }} /></div>
            </DialogTitle>
            <DialogContent className='custom-scrollbar' style={{ backgroundColor: '#F4F8FD', padding: '2em' }}>
               <section>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                     <div>
                        <h3 style={{ margin: 0, fontSize: '22px' }}>Critical Tasks Are Blocked</h3>
                        <p style={{ color: '#616161' }}>Norris Design - Server Rebuild</p>
                     </div>
                     <button style={{ backgroundColor: '#DAE8F7', color: '#1F74CE', padding: '0.5em 0.75em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: '700', cursor: 'pointer' }}>
                        <span style={{ display: 'flex', gap: '0.25em', alignItems: 'center' }}>
                           View Project <ArrowRightAltOutlined style={{ marginLeft: '0.25em' }} />
                        </span>
                     </button>
                  </div>
               </section>

               <section style={{ marginTop: '1em' }}>
                  <p style={{ width: '700px' }}>
                     The project end date was moved out 2 weeks due to additional scope, and planned resources for the project are 
                     currently assigned to other tasks. <strong>New staffers need to be assigned from 6/31/24 - 7/15/24.</strong> This will result in 
                     projected loss of <span style={{ color: '#E67E00' }}>-$27,456.23</span> for time and materials if no staffers are assigned.
                  </p>
               </section>
               
               <section style={{ marginTop: '2em', display: 'flex', justifyContent: 'space-around' }}>
                  <RiskAssessment type='StaffingGap' />
                  <ProjectTimeline type='StaffingGap' />
               </section>

               <section style={{ marginTop: '2em' }}>
                  <strong style={{ display: 'inline-block', marginBottom: '1em' }}>Recommended Actions:</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2em' }}>
                     <AssignStaffCard />
                     <ReviewTimeOffApprovals />
                  </div>
               </section>
            </DialogContent>
         </Dialog>
      </>
   )
}

export default StaffingRiskDialog;

const AssignStaffCard: React.FC = () => {

   return (
      <Card>
         <CardHeader 
            title={
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center' }}><GroupAddOutlined style={{ color: '#1F74CE', marginRight: '0.25em' }} /> <strong>Assign Staff</strong></span>
                  <button style={{ color: '#1F74CE', backgroundColor: 'inherit', padding: '0.5em 0.75em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: '700', cursor: 'pointer', alignSelf: 'flex-end', display: 'flex', gap: '0.25em', alignItems: 'center' }}>
                     View All Team Members <ArrowRightAltOutlined style={{ color: '#1F74CE', marginLeft: '0.25em' }} /> 
                  </button>
               </div>
            }
            titleTypographyProps={{ style: { fontFamily: 'inherit' } }}
         />
         <CardContent>
            <section>
               Here are the top staff assignment recommendations 
               based on <strong>required skills, availability, cost rate, and speed</strong> to complete <strong>Norris Design - Server Rebuild.</strong>
            </section>
            
            <section style={{ marginTop: '1em', display: 'grid', gridAutoColumns: 'minmax(0, 1fr)', gridAutoFlow: 'column', gap: '2em' }}>
               <div style={{ padding: '1em', border: '1px solid #B4D1EF', borderRadius: '5px' }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                     <img src={rohanLogo} style={{ marginRight: '1em' }} /> Rohan Adair
                  </div>
                  <div style={{ height: '100px', marginTop: '1em' }}>
                     Rohan has extensive experience with Firewall configuration and completes work 21% faster than projected on average.
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5em 2em', marginTop: '0.5em' }}>
                     <div><span style={{ color: '#616161' }}>Available:</span> 6/31-7/15</div>
                     <div><span style={{ color: '#616161' }}>Cost Rate:</span> $125.00</div>
                     <div><span style={{ color: '#616161' }}>Average Revenue:</span> $7k</div>
                     <div><span style={{ color: '#616161' }}>Bill Rate:</span> $175.00</div>
                  </div>
                  <div style={{ display: 'flex', gap: '1em', flexWrap: 'wrap', marginTop: '1em' }}>
                     {
                        Object.entries(STAFFER_ONE_SKILLS).map(([skill, rating]) => (
                           <Chip 
                              label={
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', justifyContent: 'space-evenly' }}>
                                    <span style={{ color: '#01579B', fontSize: '16px' }}>
                                       {skill}
                                    </span> 
                                    <span style={{ backgroundColor: 'white', border: '1px solid black', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.25em', padding: '0 0.5em', fontSize: '15px' }}>
                                       <Star style={{ color: '#F5B102' }} /> <span style={{ color: '#212121', fontWeight: 700 }}></span> 
                                       {rating}
                                    </span>
                                 </div>
                              }
                              style={{ fontFamily: 'inherit', backgroundColor: rating > 2 ? '#E1F5FE' : '#FBEAE6', border: `1px solid ${rating > 2 ? '#B3E5FC' : '#EAAA9F'}` }}
                           />
                        ))
                     }
                  </div>
                  <button 
                     style={{ marginTop: '2em', backgroundColor: '#1F74CE', color: 'white', padding: '0.25em 0.5em', border: 'none', borderRadius: '5px', fontFamily: 'inherit', cursor: 'pointer', display: 'flex', gap: '0.25em', alignItems: 'center' }}
                  >
                     Assign <AddOutlined style={{ marginLeft: '0.25em' }} /> 
                  </button>
               </div>

               <div style={{ padding: '1em', border: '1px solid #B4D1EF', borderRadius: '5px' }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                     <img src={stephanieLogo} style={{ marginRight: '1em' }} /> Stephanie Billinger
                  </div>
                  <div style={{ height: '100px', marginTop: '1em' }}>
                     Stephanie has experience with Firewall configuration and completes work 5% faster than projected on average, 
                     but does not meet full requirements for AWS skill expertise.
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5em 2em', marginTop: '0.5em' }}>
                     <div><span style={{ color: '#616161' }}>Available:</span> 6/31-7/15</div>
                     <div><span style={{ color: '#616161' }}>Cost Rate:</span> $100.00</div>
                     <div><span style={{ color: '#616161' }}>Average Revenue:</span> $2k</div>
                     <div><span style={{ color: '#616161' }}>Bill Rate:</span> $125.00</div>
                  </div>
                  <div style={{ display: 'flex', gap: '1em', flexWrap: 'wrap', marginTop: '1em' }}>
                     {
                        Object.entries(STAFFER_TWO_SKILLS).map(([skill, rating]) => (
                           <Chip 
                              label={
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', justifyContent: 'space-evenly' }}>
                                    <span style={{ color: '#01579B', fontSize: '16px' }}>
                                       {skill}
                                    </span> 
                                    <span style={{ backgroundColor: 'white', border: '1px solid black', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.25em', padding: '0 0.5em', fontSize: '15px' }}>
                                       <Star style={{ color: '#F5B102' }} /> <span style={{ color: '#212121', fontWeight: 700 }}></span> 
                                       {rating}
                                    </span>
                                 </div>
                              }
                              style={{ fontFamily: 'inherit', backgroundColor: rating > 2 ? '#E1F5FE' : '#FBEAE6', border: `1px solid ${rating > 2 ? '#B3E5FC' : '#EAAA9F'}` }}
                           />
                        ))
                     }
                  </div>
                  <button 
                     style={{ marginTop: '2em', backgroundColor: '#1F74CE', color: 'white', padding: '0.25em 0.5em', border: 'none', borderRadius: '5px', fontFamily: 'inherit', cursor: 'pointer', display: 'flex', gap: '0.25em', alignItems: 'center' }}
                  >
                     Assign <AddOutlined style={{ marginLeft: '0.25em' }} /> 
                  </button>
               </div>
            </section>
         </CardContent>
      </Card>
   )
}

const ReviewTimeOffApprovals: React.FC = () => {

   return (
      <Card>
         <CardHeader 
            title={
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center' }}><ApprovalOutlined style={{ color: '#1F74CE', marginRight: '0.25em' }} /> <strong>Review Time Off Approval Details</strong></span>
                  <button style={{ color: '#1F74CE', backgroundColor: 'inherit', padding: '0.5em 0.75em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: '700', cursor: 'pointer', display: 'flex', gap: '0.25em', alignItems: 'center' }}>
                     View All Time Off <ArrowRightAltOutlined style={{ color: '#1F74CE', marginLeft: '0.25em' }} /> 
                  </button>
               </div>
            }
            titleTypographyProps={{ style: { fontFamily: 'inherit' } }}
         />
         <CardContent>
            <section>
               You can review Georgia Kim's time off notes and manager approval below.
            </section>

            <section style={{ marginTop: '1em' }}>
               <div style={{ padding: '1em', border: '1px solid #B4D1EF', borderRadius: '5px', width: '50%' }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                     <img src={georgiaLogo} style={{ marginRight: '1em' }} /> 
                     <div>
                        <div style={{ fontSize: '16px', fontWeight: 700 }}>Georgia Kim</div>
                        <div style={{ fontSize: '14px', color: '#666666' }}>Team Lead, Sr. Developer</div>
                     </div>
                  </div>
                  <div style={{ marginTop: '1em', color: '#616161' }}>
                     “Refresh Days”
                  </div>
                  <div style={{ marginTop: '1em' }}>
                     <div><span style={{ color: '#616161' }}>Requested:</span> 6/31/2024 - 7/15/2024</div>
                     <div><span style={{ color: '#616161' }}>Approved By:</span> Samantha Nundusa</div>
                  </div>
                  <button 
                     style={{ marginTop: '2em', backgroundColor: '#1F74CE', color: 'white', padding: '0.25em 0.5em', border: 'none', borderRadius: '5px', fontFamily: 'inherit', cursor: 'pointer', display: 'flex', gap: '0.25em', alignItems: 'center' }}
                  >
                     View Details <ArrowRightAltOutlined style={{ marginLeft: '0.25em' }} /> 
                  </button>
               </div>
            </section>
         </CardContent>
      </Card>
   )
}