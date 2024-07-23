import React from 'react';

import paymentRiskChart from '../../assets/payment-risk-chart.png'; 
import staffingGapChart from '../../assets/staffing-gap-chart.png';

type ProjectTimelineProps = {
   type: 'PaymentRisk' | 'StaffingGap'
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = props => {

   return (
      <div>
         <strong style={{ display: 'block', marginBottom: '1em' }}>Project Timeline:</strong>
         <div style={{ display: 'flex', gap: '2em' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25em' }}>
               <div style={{ fontWeight: 700 }}>{props.type === 'PaymentRisk' ? '68% Done' : '42% Done'}</div>
               <div>{props.type === 'PaymentRisk' ? '6/01/24 - 9/1/24' : '6/20/24 - 8/15/24'}</div>
               <div>{props.type === 'PaymentRisk' ? '3 Months' : '8 Weeks'}</div>
            </div>
            <img src={props.type === 'PaymentRisk' ? paymentRiskChart : staffingGapChart} alt='Project Timeline' style={{ marginTop: '-40px' }} />
         </div>
      </div>
   )

}

export default ProjectTimeline;