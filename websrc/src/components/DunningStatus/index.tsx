import { LinearProgress } from '@mui/material';
import React from 'react';

const DunningStatus: React.FC = () => {
   return (
      <div>
         <section style={{ display: 'flex', gap: '1em' }}>
            <strong style={{ alignSelf: 'center' }}>Dunning Status:</strong>
            <button style={{ color: '#1F74CE', backgroundColor: 'inherit', padding: '0.5em 0.75em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: '700', cursor: 'pointer' }}>
               View All 
            </button>
         </section>

         <section style={{ marginTop: '1em', display: 'flex', flexDirection: 'column', gap: '0.25em' }}>
            <div style={{ fontSize: '10px' }}>Data Cloud Storage</div>
            <LinearProgress variant="determinate" value={20} style={{ height: '10px', borderRadius: '5px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
               <div>$3,135.65</div>
               <div style={{ color: '#1F74CE' }}>#16789</div>
            </div>
         </section>
      </div>
   )
}

export default DunningStatus;