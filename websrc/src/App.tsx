import React, { createContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './components/PrimaryNavbar';
import SecondaryNavbar from './components/SecondaryNavbar';
import { EmailOutlined, ExpandLessOutlined, ExpandMoreOutlined } from '@mui/icons-material';
import { Menu, MenuItem } from '@mui/material';
import axios from 'axios';

import './index.css';

import logo from './assets/logo.svg';
import stars from './assets/stars.svg';
import acmeFirmLogo from './assets/acme-firm-logo.svg';
import vertexFirmLogo from './assets/vertex-firm-logo.svg';

type Firm = 'Acme Consulting' | 'Vertex Services';

type Invoice = {
   Amt: number,
   AmtPd: number,
   ClientSID: number,
   Dt_Due: Date,
   Dt_sent: Date,
   InvoiceSID: number,
   InvoiceStatus: string,
   ProjectSID: number,
   ReviewStatus: number
}

type Risk = {
   analysis: string
}

type Insight = {
   analysis: string
}

type AppContextType = {
   firm: Firm,
   invoices: Array<Invoice>,
   stats: Array<Risk | Insight>
}

export const AppContext = createContext<AppContextType>({ firm: 'Acme Consulting', invoices: [], stats: [] });

export const App: React.FC = () => {
   const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
   const [firm, setFirm] = React.useState<Firm>('Acme Consulting');

   const [invoices, setInvoices] = React.useState<Array<Invoice>>([]);
   const [stats, setStats] = React.useState<Array<any>>([]);


   React.useEffect(() => {
      (async () => {

         const response = (await axios.get('http://localhost:5001/consultant', { headers: { "Content-Type": 'application/json', "UserId": "1" } }));
         let stuff: Array<Risk | Insight> = response.data.map((s: any) => ({ analysis: s.analysis }));


         const response2 = (await axios.get('http://localhost:5001/consultant/invoices', { headers: { "Content-Type": 'application/json', "UserId": "1" } }));
         const stuff2: Array<Invoice> = response2.data.analysis.map((i: any) => ({
            Amt: i.Amt,
            AmtPd: i.AmtPd,
            ClientSID: i.ClientSID,
            Dt_Due: i.Dt_Due ? new Date(i.Dt_Due) : null,
            Dt_sent: i.Dt_Due ? new Date(i.Dt_sent) : null,
            InvoiceSID: i.InvoiceSID,
            InvoiceStatus: i.InvoiceStatus,
            ProjectSID: i.ProjectSID,
            ReviewStatus: i.ReviewStatus
         }));

         setStats(stuff);
         setInvoices(stuff2);
      })();
   }, []);

   const navigate = useNavigate();

   const open = React.useMemo(() => Boolean(anchorEl), [anchorEl]); 
  
   const handleClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
   }, []);
   
   const onClose = React.useCallback(() => {
      setAnchorEl(null);
   }, []);
   
   const onClickOtherFirm = React.useCallback(() => {
      setFirm(prev => prev === 'Acme Consulting' ? 'Vertex Services' : 'Acme Consulting');
      onClose();
   }, [onClose]);

   const context: AppContextType = React.useMemo(() => {
      return {
         firm,
         invoices,
         stats
      }
   }, [firm, invoices, stats]);

   return (
      <AppContext.Provider value={context}>
         <div className='wrapper'>
            <div className='top-bar'>
               <img src={logo} style={{ cursor: 'pointer' }} onClick={() => navigate('/')} />
               <div className='search-bar'>
                  <img src={stars} /> What are you looking for?
               </div>
               <div className='actions'>
                  <EmailOutlined style={{ paddingRight: '0.5em', borderRight: '2px solid #D9DFE5', cursor: 'pointer' }} />
                  <div className='firm-logo'>
                     <img src={firm === 'Acme Consulting' ? acmeFirmLogo : vertexFirmLogo} style={{ width: '30px', height: '30px' }} />
                  </div>
                  <div>
                     <strong style={{ color: '#2A333C' }}>Emory Warren</strong>
                     <div style={{ color: '#6A8095', fontSize: '10px' }}>{firm}</div>
                  </div>
                  <button onClick={handleClick} style={{ cursor: 'pointer', backgroundColor: 'transparent', border: 'none' }}>
                     {
                        open 
                           ? <ExpandLessOutlined /> 
                           : <ExpandMoreOutlined />
                     }
                  </button>
               </div>
            </div>
            <div className='container'>
               <Navbar />
               <SecondaryNavbar />
               <Outlet />
            </div>
            <Menu
               anchorEl={anchorEl}
               open={open}
               onClose={onClose}
            >
               <MenuItem onClick={onClickOtherFirm} style={{ fontFamily: 'inherit' }}>
                  {firm === 'Acme Consulting' ? 'Vertex Services' : 'Acme Consulting'}
               </MenuItem>
            </Menu>
         </div>
      </AppContext.Provider>
   )
}

export default App;

