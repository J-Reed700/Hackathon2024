import React from 'react';
import { Chip } from '@mui/material';

import './risk-assessment.css';

type RiskAssessmentProps = {
   type: 'PaymentRisk' | 'StaffingGap'
}

const RiskAssessment: React.FC<RiskAssessmentProps> = props => {

   return (
      <div>
         <div className='risk-asssessment-grid' style={{ paddingBottom: '1em', borderBottom: '1px solid #A8A8A8' }}>
            <strong style={{ alignSelf: 'center' }}>Risk Assessment:</strong>
            <Chip
               label={props.type === 'PaymentRisk' ? 'High' : 'Medium'} 
               color={props.type === 'PaymentRisk' ? 'error' : 'warning'}
               sx={{ fontFamily: 'inherit', fontSize: '14px', padding: '0 1em', backgroundColor: props.type === 'PaymentRisk' ? '#FFEDED' : '#FFF6ED' }}
               variant='outlined'
            />

            <p style={{ marginTop: '0.75em' }}>{props.type === 'PaymentRisk' ? 'A/R Invoice Balance:' : 'Materials:'}</p>
            <p style={{ color: '#898989', marginTop: '0.75em' }}>{props.type === 'PaymentRisk' ? '- $62,524.39' : '- $16,956.23'}</p>

            <p>{props.type === 'PaymentRisk' ? 'Overtime Payments:' : 'Time:'}</p>
            <p style={{ color: '#898989' }}>{props.type === 'PaymentRisk' ? '- $10,456.76' : '- $ 10,500.00'}</p>
         </div>
         <div className='risk-asssessment-grid' style={{ marginTop: '1em' }}>
            <p>{props.type === 'PaymentRisk' ? 'Total Loss:' : 'Projected Loss:'}</p>
            <p style={{ color: '#DC2F18' }}>{props.type === 'PaymentRisk' ? '- $72,981.15' : '- $27,456.23'}</p>
         </div>
      </div>
   )
}

export default RiskAssessment;