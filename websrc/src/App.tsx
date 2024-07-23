import React, { createContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './components/PrimaryNavbar';
import SecondaryNavbar from './components/SecondaryNavbar';
import { EmailOutlined, ExpandLessOutlined, ExpandMoreOutlined } from '@mui/icons-material';
import { Menu, MenuItem } from '@mui/material';

import './index.css';

import logo from './assets/logo.svg';
import stars from './assets/stars.svg';
import acmeFirmLogo from './assets/acme-firm-logo.svg';
import vertexFirmLogo from './assets/vertex-firm-logo.svg';

type Firm = 'Acme Consulting' | 'Vertex Services';


export const AppContext = createContext<Firm>('Acme Consulting');

export const App: React.FC = () => {
   const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
   const [firm, setFirm] = React.useState<Firm>('Acme Consulting');

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

   return (
      <AppContext.Provider value={firm}>
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

