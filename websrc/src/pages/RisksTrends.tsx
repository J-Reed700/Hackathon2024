import ArrowRightAltOutlinedIcon from '@mui/icons-material/ArrowRightAltOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Tab from '@mui/material/Tab';
import React, { useContext } from 'react';
import Card from '../components/Card';
import PaymentDelayRiskDialog from '../components/PaymentDelayRiskDialog';
import RisksTable from '../components/RisksTable';
import RiskDetectionSettingsDialog from '../components/RiskDetectionSettingsDialog';
import { AppContext } from '../App';
import StaffingRiskDialog from '../components/StaffingRiskDialog';
import { CircularProgress } from '@mui/material';

import '../risks-trends.css';

import settings from '../assets/settings.svg';

enum TabValue {
  Risks = 'Risks',
  Trends = 'Trends'
}

const RisksTrends: React.FC = () => {
  const [currentTab, setCurrentTab] = React.useState<TabValue>(TabValue.Risks);
  const [openRiskDialog, setOpenRiskDialog] = React.useState<boolean>(false);
  const [openStaffingRiskDialog, setOpenStaffingRiskDialog] = React.useState<boolean>(false);
  const [openRiskDetectionSettings, setOpenRiskDetectionSettings] = React.useState<boolean>(false);
  const [showDunningStatus, setShowDunningStatus] = React.useState<boolean>(false);
  const [fetching, setFetching] = React.useState<boolean>(true);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
       setFetching(false);
    }, 2000);

    return () => clearTimeout(timeout);
 }, []);

  const { firm, stats } = useContext(AppContext);

  const topRisk = React.useMemo(() => stats[0]?.analysis || '', [stats]);

  const topTrend = React.useMemo(() => stats[1]?.analysis || '', [stats]);

  const currentDate = React.useMemo(() => new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()), []);

  const timeOfDay = React.useMemo(() => {
    const hrs = new Date().getHours();
    return hrs < 12 ? 'Morning' : hrs < 18 ? 'Afternoon' : 'Evening';
  }, []);

  const onChangeTab = React.useCallback((_: React.SyntheticEvent, value: TabValue) => {
    setCurrentTab(value);
  }, []);

  const onClickReview = React.useCallback(() => {
    if (firm === 'Acme Consulting') {
      setOpenRiskDialog(true);
    } else {
      setOpenStaffingRiskDialog(true);
    }
  }, [firm]);
  
  const handleClose = React.useCallback(() => {
    if (firm === 'Acme Consulting') {
      setOpenRiskDialog(false);
    } else {
      setOpenStaffingRiskDialog(false);
    }
  }, [firm]);

  const onOpenRiskDetectionSettings = React.useCallback(() => {
    setOpenRiskDetectionSettings(true);
  }, []);

  const onCloseRiskDetectionSettings = React.useCallback(() => {
    setOpenRiskDetectionSettings(false);
  }, []);

  return (
    <div className='risks-trends-container'>
      <section>
        <div>{currentDate}</div>
        <div className='greeting'>Good {timeOfDay}, Emory</div>
      </section>

      <section>
        <p><strong>15% of your projects have risks detected.</strong> Some new activity was identified overnight which you can review below.</p>
      </section>

      <section className='cards'>
        <div className='card-title'>
          <WarningAmberOutlinedIcon style={{ color: '#DC2F18', fontSize: '30px' }} /> <span>Risks Detected</span>
        </div>
        <div className='card-title'>
          <BoltOutlinedIcon style={{ color: '#00C9E4', fontSize: '30px' }} /> <span>Top Trend</span>
        </div>
        <Card 
          variant='error' 
          icon={<RequestQuoteOutlinedIcon style={{ color: '#DC2F18', fontSize: '32px' }} />}
        >
          <div style={{ display: 'flex', gap: '1em', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ maxWidth: '370px' }}>
              {
                firm === 'Acme Consulting' 
                  ? !topRisk || fetching 
                    ? <CircularProgress /> 
                    : <>{topRisk}</>
                  : <><strong>The timeline for the Server Rebuild project extended by two weeks</strong> and is missing staff to finish the project.</>
              }
            </div>
            <button onClick={onClickReview} style={{ backgroundColor: '#E9614F', color: 'white', padding: '0.5em 0.75em', border: 'none', borderRadius: '5px', fontFamily: 'inherit', cursor: 'pointer', display: 'flex', gap: '0.25em', alignItems: 'center' }}>
              Review <ArrowRightAltOutlinedIcon style={{ marginLeft: '0.25em' }} />
            </button>
          </div>
        </Card>
        <Card 
          icon={<WorkspacePremiumOutlinedIcon style={{ color: '#00BDCA', fontSize: '32px' }} />}
        >
          <div style={{ display: 'flex', gap: '1em', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ maxWidth: '370px' }}>
              {
                firm === 'Acme Consulting' 
                  ? !topTrend || fetching 
                    ? <CircularProgress /> 
                    : <>{topTrend}</>
                  : <><strong>Firm-Wide Utilization Rates</strong> are trending above 95% for the past 30 days, a 15% improvement from last quarter.</>
              }
            </div>
            <button style={{ backgroundColor: '#00C9E4', color: 'white', padding: '0.5em 0.75em', border: 'none', borderRadius: '5px', fontFamily: 'inherit', cursor: 'pointer', display: 'flex', gap: '0.25em', alignItems: 'center' }}>See Details <ArrowRightAltOutlinedIcon style={{ marginLeft: '0.25em' }} /></button>
          </div>
        </Card>
      </section>

      <section className='risks-trends-grid'>
        <TabContext value={currentTab}>
          <TabList onChange={onChangeTab}>
            <Tab 
              value={TabValue.Risks} 
              label={<span style={{ display: 'flex', gap: '0.5em' }}><WarningAmberOutlinedIcon style={{ color: '#E67E00' }} /> <span style={{ fontWeight: 700 }}>{TabValue.Risks}</span><span style={{ color: '#878787', fontWeight: 200, marginLeft: '3px' }}>2</span></span>} 
              sx={{ textTransform: 'none', fontSize: '18px', fontWeight: currentTab === TabValue.Risks ? '700' : '300' }} 
            />
            <Tab 
              value={TabValue.Trends} 
              label={<span style={{ display: 'flex', gap: '0.25em' }}><BoltOutlinedIcon /> <span style={{ fontWeight: 700 }}>{TabValue.Trends}</span><span style={{ color: '#878787', fontWeight: 200, marginLeft: '3px' }}>6</span></span>} 
              sx={{ textTransform: 'none', fontSize: '18px', fontWeight: currentTab === TabValue.Trends ? '700' : '300' }} 
            />
            <button 
                onClick={onOpenRiskDetectionSettings} 
                style={{ margin: '0 4px 7px auto', backgroundColor: 'white', padding: '0.75em 0.5em 0.5em 0.5em', border: 'none', borderRadius: '50%', boxShadow: '0px 3px 6px 0px rgba(32, 54, 255, 0.25)', cursor: 'pointer' }}
            >
                <img style={{ width: '32px', height: '25px' }} src={settings} />
            </button>
          </TabList>

          <TabPanel value={TabValue.Risks} style={{ padding: '1em 0' }}>
            <RisksTable 
              showDunningStatus={showDunningStatus} 
              setShowDunningStatus={setShowDunningStatus} 
            /> 
          </TabPanel>
          <TabPanel value={TabValue.Trends}>
            These are the trends
          </TabPanel>
        </TabContext>
      </section>
      <PaymentDelayRiskDialog
        open={openRiskDialog}
        onClose={handleClose}
        showDunningStatus={showDunningStatus}
        setShowDunningStatus={setShowDunningStatus}
      />
      <StaffingRiskDialog
        open={openStaffingRiskDialog}
        onClose={handleClose}
      />
      <RiskDetectionSettingsDialog 
        open={openRiskDetectionSettings}
        onClose={onCloseRiskDetectionSettings}
      />
    </div>
  )
}

export default RisksTrends;
