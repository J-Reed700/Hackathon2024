import React from 'react';
import { SyncOutlined } from '@mui/icons-material';

import '../dashboard.css';

import dashbardMiniTiles from '../assets/dashboard-mini-tiles.svg';
import dashbardTiles from '../assets/dashboard-tiles.svg';

const Dashboard: React.FC = () => {

   const currentDate = React.useMemo(() => new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()), []);

   const timeOfDay = React.useMemo(() => {
      const hrs = new Date().getHours();
      return hrs < 12 ? 'Morning' : hrs < 18 ? 'Afternoon' : 'Evening';
   }, []);

   return (
      <div className='dashboard-container'>
         <section>
            <div>{currentDate}</div>
            <div className='greeting'>Good {timeOfDay}, Emory</div>
         </section>

         <section style={{ display: 'flex', gap: '1em', maxWidth: '1000px', alignItems: 'center' }}>
            <button 
               style={{ height: 'fit-content', backgroundColor: '#1F74CE', color: 'white', padding: '0.25em 0.5em', border: 'none', borderRadius: '5px', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '0.25em', alignItems: 'center' }}
            >
               <SyncOutlined style={{ marginRight: '0.25em' }} /> Sync QuickBooks
            </button>
            <div style={{ fontSize: '14px', color: '#747474' }}>
               <div style={{ fontWeight: 700 }}>6/24/24, 4:55:00 AM</div>
               <div>Last QB Cloud Sync</div>
            </div>
            <img src={dashbardMiniTiles} style={{ marginLeft: 'auto' }} />
         </section>

         <section style={{ marginTop: '2em' }}>
            <img src={dashbardTiles} style={{ height: '600px' }} />
         </section>
      </div>
   )
}

export default Dashboard;