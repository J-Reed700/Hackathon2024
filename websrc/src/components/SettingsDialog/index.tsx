import { Autocomplete, Checkbox, Dialog, DialogContent, DialogProps, DialogTitle, FormControlLabel, Slider, TextField } from '@mui/material';
import React from 'react';
import { CloseOutlined } from '@mui/icons-material';

import './settings-dialog.css'

import sparkle from '../../assets/sparkle.svg';

const TONE_MARKS = [{ value: 0, label: 'Polite' }, { value: 100, label: 'Aggressive' }];
const TEMPLATE_OPTIONS = ['Net 7', 'Net 15', 'Net 30', 'Net 45'];
const STYLE_OPTIONS = ['Professional', 'Casual', 'Detailed', 'Concise'];
const DATE_OPTIONS = ['7/24/2024', '7/25/2024 (Tomorrow)', '7/31/2024 (Next Wednesday)'];
const FOLLOW_UP_OPTIONS = ['Every day', 'Every two days', 'Every three days', 'Every week', 'Every month'];
const TIME_OPTIONS = ['10:30AM CMT', '12:00PM CMT', '3:00PM CMT', '6:00PM CMT'];
const FROM_OPTIONS = ['Acme Consulting', 'Acme Consulting Finance Dept.', 'Justine Comados (Finance Director)']
const TONE_OPTIONS = ['Polite', 'Firm', 'Strong', 'Aggressive'];

type SettingsDialogProps = DialogProps & {};

const SettingsDialog: React.FC<SettingsDialogProps> = props => {
   const [sliderValue, setSliderValue] = React.useState<number>(60);
   const [templateValue, setTemplateValue] = React.useState<string>(TEMPLATE_OPTIONS[0]);
   const [styleValue, setStyleValue] = React.useState<string>(STYLE_OPTIONS[0]);
   const [dateValue, setDateValue] = React.useState<string>(DATE_OPTIONS[0]);
   const [followUpValue, setFollowUpValue] = React.useState<string>(FOLLOW_UP_OPTIONS[1]);
   const [timeValue, setTimeValue] = React.useState<string>(TIME_OPTIONS[0]);
   const [fromValue, setFromValue] = React.useState<string>(FROM_OPTIONS[0]);
   const [toneValue, setToneValue] = React.useState<string>(TONE_OPTIONS[2]);

   const onChange = React.useCallback((_: Event, newValue: number | number[]) => {
      setSliderValue(newValue as number);
   }, []);

   const onCloseDialog = React.useCallback((_: any) => {
      props.onClose?.({}, 'backdropClick');
   }, [props.onClose]);

   return (
      <Dialog
         {...props}
         maxWidth='sm' 
         fullWidth 
         style={{ fontFamily: 'inherit', maxHeight: '800px' }}
      >
         <DialogTitle 
            style={{ fontFamily: 'inherit', display: 'flex', justifyContent: 'space-between', gap: '0.5em', alignItems: 'center', fontSize: '22px' }}
         >
            <span style={{ display: 'flex', alignItems: 'center' }}><img src={sparkle} /> <span><strong>Dunner AI</strong> Settings</span></span>
            <div style={{ cursor: 'pointer' }} onClick={onCloseDialog}><CloseOutlined style={{ color: '#616161', fontSize: '24px' }} /></div>
         </DialogTitle>
         <DialogContent>
            <section>
               Customize your Dunner AI collection service by setting your preferences below.
            </section>
            
            <section style={{ marginTop: '0.5em', fontWeight: 700 }}>
               <div>4th Notice Template</div>
            </section>

            <section style={{ marginTop: '2em' }}>
               <div>Set to: <strong>Strong Tone</strong></div>
            </section>

            <section style={{ margin: '0 3em' }}>
               <Slider 
                  value={sliderValue}
                  onChange={onChange}
                  marks={TONE_MARKS}
                  style={{ width: '80%' }}
                  slotProps={{ markLabel: { style: { fontSize: '14px', fontFamily: 'inherit' } } }}
               />
            </section>

            <section style={{ marginTop: '1em', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1em', alignItems: 'center' }}>
               <div>
                  <div style={{ fontSize: '14px', color: '#616161', marginBottom: '0.25em' }}>Template</div>
                  <Autocomplete 
                     options={TEMPLATE_OPTIONS}
                     value={templateValue}
                     onChange={(_, newValue) => setTemplateValue(newValue)}
                     renderInput={(params) => <TextField {...params} InputLabelProps={{ ...params.InputLabelProps, style: { fontFamily: 'inherit', color: '#595959', fontWeight: 700 }}} sx={{ '.MuiAutocomplete-root': { paddingTop: '3px' }, '.MuiOutlinedInput-root': { paddingBottom: '3px', fontFamily: 'inherit' } }} />}
                     sx={{ width: '250px' }}
                     disableClearable
                  />
               </div>
               <div>
                  <div style={{ fontSize: '14px', color: '#616161', marginBottom: '0.25em' }}>Style</div>
                  <Autocomplete 
                     options={STYLE_OPTIONS}
                     value={styleValue}
                     onChange={(_, newValue) => setStyleValue(newValue)}
                     renderInput={(params) => <TextField {...params} InputLabelProps={{ ...params.InputLabelProps, style: { fontFamily: 'inherit', color: '#595959', fontWeight: 700 }}} sx={{ '.MuiAutocomplete-root': { paddingTop: '3px' }, '.MuiOutlinedInput-root': { paddingBottom: '3px', fontFamily: 'inherit' }}} />}
                     sx={{ width: '250px' }}
                     disableClearable
                  />
               </div>

               <div>
                  <div style={{ fontSize: '14px', color: '#616161', marginBottom: '0.25em' }}>Date</div>
                  <Autocomplete 
                     options={DATE_OPTIONS}
                     value={dateValue}
                     onChange={(_, newValue) => setDateValue(newValue)}
                     renderInput={(params) => <TextField {...params} InputLabelProps={{ ...params.InputLabelProps, style: { fontFamily: 'inherit', color: '#595959', fontWeight: 700 }}} sx={{ '.MuiAutocomplete-root': { paddingTop: '3px' }, '.MuiOutlinedInput-root': { paddingBottom: '3px', fontFamily: 'inherit' }}} />}
                     sx={{ width: '250px' }}
                     disableClearable
                  />
               </div>
               <div>
                  <div style={{ fontSize: '14px', color: '#616161', marginBottom: '0.25em' }}>Follow-Up</div>
                  <Autocomplete 
                     options={FOLLOW_UP_OPTIONS}
                     value={followUpValue}
                     onChange={(_, newValue) => setFollowUpValue(newValue)}
                     renderInput={(params) => <TextField {...params} InputLabelProps={{ ...params.InputLabelProps, style: { fontFamily: 'inherit', color: '#595959', fontWeight: 700 }}} sx={{ '.MuiAutocomplete-root': { paddingTop: '3px' }, '.MuiOutlinedInput-root': { paddingBottom: '3px', fontFamily: 'inherit' }}} />}
                     sx={{ width: '250px' }}
                     disableClearable
                  />
               </div>

               <div>
                  <div style={{ fontSize: '14px', color: '#616161', marginBottom: '0.25em' }}>Time</div>
                  <Autocomplete 
                     options={TIME_OPTIONS}
                     value={timeValue}
                     onChange={(_, newValue) => setTimeValue(newValue)}
                     renderInput={(params) => <TextField {...params} InputLabelProps={{ ...params.InputLabelProps, style: { fontFamily: 'inherit', color: '#595959', fontWeight: 700 }}} sx={{ '.MuiAutocomplete-root': { paddingTop: '3px' }, '.MuiOutlinedInput-root': { paddingBottom: '3px', fontFamily: 'inherit' }}} />}
                     sx={{ width: '250px' }}
                     disableClearable
                  />
               </div>
               <div>
                  <div style={{ fontSize: '14px', color: '#616161', marginBottom: '0.25em' }}>From</div>
                  <Autocomplete 
                     options={FROM_OPTIONS}
                     value={fromValue}
                     onChange={(_, newValue) => setFromValue(newValue)}
                     renderInput={(params) => <TextField {...params} InputLabelProps={{ ...params.InputLabelProps, style: { fontFamily: 'inherit', color: '#595959', fontWeight: 700 }}} sx={{ '.MuiAutocomplete-root': { paddingTop: '3px' }, '.MuiOutlinedInput-root': { paddingBottom: '3px', fontFamily: 'inherit' }}} />}
                     sx={{ width: '250px' }}
                     disableClearable
                  />
               </div>

               <div>
                  <div style={{ fontSize: '14px', color: '#616161', marginBottom: '0.25em' }}>Tone</div>
                  <Autocomplete 
                     options={TONE_OPTIONS}
                     value={toneValue}
                     onChange={(_, newValue) => setToneValue(newValue)}
                     renderInput={(params) => <TextField {...params} InputLabelProps={{ ...params.InputLabelProps, style: { fontFamily: 'inherit', color: '#595959', fontWeight: 700 }}} sx={{ '.MuiAutocomplete-root': { paddingTop: '3px' }, '.MuiOutlinedInput-root': { paddingBottom: '3px', fontFamily: 'inherit' }}} />}
                     sx={{ width: '250px' }}
                     disableClearable
                  />
               </div>
               <div style={{ marginTop: '1em' }}>
                  <FormControlLabel control={<Checkbox defaultChecked style={{ paddingRight: '0.25em' }} />} label="Set as Default" slotProps={{ typography: { style: { fontFamily: 'inherit' }}}} />
               </div>
            </section>
         </DialogContent>
      </Dialog>
   );
}

export default SettingsDialog;