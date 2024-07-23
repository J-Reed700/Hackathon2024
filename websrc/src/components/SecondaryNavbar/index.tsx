import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import './secondary-navbar.css';

enum Items {
   DASHBOARD = 'My Dashboard',
   RISKSANDTRENDS = 'Risks and Trends'
}

const SecondaryNavbar: React.FC = () => {
   const { pathname } = useLocation();
   const navigate = useNavigate();

   const [selected, setSelected] = React.useState<string>(pathname === '/' ? Items.RISKSANDTRENDS : Items.DASHBOARD);

   React.useEffect(() => {
      setSelected(pathname === '/' ? Items.RISKSANDTRENDS : Items.DASHBOARD);
   }, [pathname]);

   return (
      <div className='secondary-navbar'>
         <header className='secondary-navbar-header'>Home</header>

         <section className='secondary-navbar-section'>
            <div 
               className={'secondary-navbar-item' + ' ' + (selected === Items.DASHBOARD ? 'secondary-navbar-item--selected' : '')}
               onClick={() => selected !== Items.DASHBOARD && navigate('/dashboard')}
            >
               {Items.DASHBOARD}
            </div>
            <div 
               className={'secondary-navbar-item' + ' ' + (selected === Items.RISKSANDTRENDS ? 'secondary-navbar-item--selected': '')}
               onClick={() => selected !== Items.RISKSANDTRENDS && navigate('/')}
            >
               {Items.RISKSANDTRENDS}
            </div>
         </section>
      </div>
   )

}

export default SecondaryNavbar;