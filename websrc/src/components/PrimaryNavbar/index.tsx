import React from 'react';
import './navbar.css';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import ChecklistRtlOutlinedIcon from '@mui/icons-material/ChecklistRtlOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import CloudSyncOutlinedIcon from '@mui/icons-material/CloudSyncOutlined';
import ApprovalOutlinedIcon from '@mui/icons-material/ApprovalOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';

const ITEMS = {
   'Home': DashboardOutlinedIcon,
   'Time': ScheduleOutlinedIcon,
   'Expenses': PaymentsOutlinedIcon,
   'People': GroupOutlinedIcon,
   'Tasks': ChecklistRtlOutlinedIcon,
   'Invoicing': RequestQuoteOutlinedIcon,
   'Cloud': CloudSyncOutlinedIcon,
   'Approvals': ApprovalOutlinedIcon,
   'Analytics': BarChartOutlinedIcon
};

const Navbar: React.FC = () => {

   return (
      <nav className='navbar'>
         {Object.values(ITEMS).map(Icon => <Icon className='navbar-item' sx={{ height: '2em' }} />)}
      </nav>
   )
}

export default Navbar;