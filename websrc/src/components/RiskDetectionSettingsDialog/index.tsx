import { CloseOutlined, RequestQuoteOutlined } from '@mui/icons-material';
import { Autocomplete, Dialog, DialogContent, DialogProps, DialogTitle, Slider, TextField } from '@mui/material';
import React from 'react';

const MARKS = [{ value: 0, label: '0%' }, { value: 100, label: '100%' }];
const LEVEL_OPTIONS = ['Firm Level', 'Department Level'];
const RANGE_OPTIONS = ['$1,200 - $1,000,000.00', '$1,000,000.01 - $2,000,000.00', '$2,000,000.01 - $3,000,000.00'];
const DATE_RANGE_OPTIONS = ['6/1/2024 - 7/1/2024', '7/2/2024 - 8/1/2024', '8/2/2024 - 9/1/2024'];
const ROLE_OPTIONS = ['All Roles', 'Project Manager', 'Finance Manager'];
const PROJECT_OPTIONS = ['All Projects', 'Active Projects Only', 'Completed Projects Only'];
const REGION_OPTIONS = ['All Regions', 'North America', 'Europe'];

type RiskDetectionSettingsDialogProps = DialogProps & {};

const RiskDetectionSettingsDialog: React.FC<RiskDetectionSettingsDialogProps> = props => {
   const [budgetSliderValue, setBudgetSliderValue] = React.useState<number>(60);
   const [marginSliderValue, setMarginSliderValue] = React.useState<number>(30);
   const [levelValue, setLevelValue] = React.useState<string>(LEVEL_OPTIONS[0]);
   const [rangeValue, setRangeValue] = React.useState<string>(RANGE_OPTIONS[0]);
   const [dateRangeValue, setDateRangeValue] = React.useState<string>(DATE_RANGE_OPTIONS[0]);
   const [roleValue, setRoleValue] = React.useState<string>(ROLE_OPTIONS[0]);
   const [projectValue, setProjectValue] = React.useState<string>(PROJECT_OPTIONS[0]);
   const [regionValue, setRegionValue] = React.useState<string>(REGION_OPTIONS[0]);

   const onChangeBudgetVariance = React.useCallback((_: Event, newValue: number | number[]) => {
      setBudgetSliderValue(newValue as number);
   }, []);

   const onChangeMarginVariance = React.useCallback((_: Event, newValue: number | number[]) => {
      setMarginSliderValue(newValue as number);
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
            <span style={{ display: 'flex', alignItems: 'center' }}><RequestQuoteOutlined style={{ color: '#DC2F18', height: '30px', width: '30px' }} /> <span><strong> Risk Detection</strong> Settings</span></span>
            <div style={{ cursor: 'pointer' }} onClick={onCloseDialog}><CloseOutlined style={{ color: '#616161', fontSize: '24px' }} /></div>
         </DialogTitle>
         <DialogContent>
            <section>
               Customize your risk detection by setting your preferences below.
            </section>

            <section style={{ margin: '1em' }}>
               <div><strong>Budget Deviation:</strong> {budgetSliderValue}%</div>
               <Slider 
                  value={budgetSliderValue}
                  onChange={onChangeBudgetVariance}
                  marks={MARKS}
                  style={{ width: '80%', color: '#CA5141' }}
                  slotProps={{ markLabel: { style: { fontSize: '14px', fontFamily: 'inherit' } } }}
               />
            </section>

            <section style={{ margin: '1em' }}>
               <div><strong>Margin Variance:</strong> {marginSliderValue}%</div>
               <Slider 
                  value={marginSliderValue}
                  onChange={onChangeMarginVariance}
                  marks={MARKS}
                  style={{ width: '80%', color: '#CA5141' }}
                  slotProps={{ markLabel: { style: { fontSize: '14px', fontFamily: 'inherit' } } }}
               />
            </section>

            <section style={{ margin: '2em 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1em', alignItems: 'center' }}>
               <div>
                  <div style={{ fontSize: '14px', color: '#616161', marginBottom: '0.25em' }}>Level</div>
                  <Autocomplete 
                     options={LEVEL_OPTIONS}
                     value={levelValue}
                     onChange={(_, newValue) => setLevelValue(newValue)}
                     renderInput={(params) => <TextField {...params} InputLabelProps={{ ...params.InputLabelProps, style: { fontFamily: 'inherit', color: '#595959', fontWeight: 700 }}} sx={{ '.MuiAutocomplete-root': { paddingTop: '3px' }, '.MuiOutlinedInput-root': { paddingBottom: '3px', fontFamily: 'inherit' } }} />}
                     sx={{ width: '250px' }}
                     disableClearable
                  />
               </div>
               <div>
                  <div style={{ fontSize: '14px', color: '#616161', marginBottom: '0.25em' }}>Range</div>
                  <Autocomplete 
                     options={RANGE_OPTIONS}
                     value={rangeValue}
                     onChange={(_, newValue) => setRangeValue(newValue)}
                     renderInput={(params) => <TextField {...params} InputLabelProps={{ ...params.InputLabelProps, style: { fontFamily: 'inherit', color: '#595959', fontWeight: 700 }}} sx={{ '.MuiAutocomplete-root': { paddingTop: '3px' }, '.MuiOutlinedInput-root': { paddingBottom: '3px', fontFamily: 'inherit' } }} />}
                     sx={{ width: '250px' }}
                     disableClearable
                  />
               </div>

               <div>
                  <div style={{ fontSize: '14px', color: '#616161', marginBottom: '0.25em' }}>Date Range</div>
                  <Autocomplete 
                     options={DATE_RANGE_OPTIONS}
                     value={dateRangeValue}
                     onChange={(_, newValue) => setDateRangeValue(newValue)}
                     renderInput={(params) => <TextField {...params} InputLabelProps={{ ...params.InputLabelProps, style: { fontFamily: 'inherit', color: '#595959', fontWeight: 700 }}} sx={{ '.MuiAutocomplete-root': { paddingTop: '3px' }, '.MuiOutlinedInput-root': { paddingBottom: '3px', fontFamily: 'inherit' } }} />}
                     sx={{ width: '250px' }}
                     disableClearable
                  />
               </div>
               <div>
                  <div style={{ fontSize: '14px', color: '#616161', marginBottom: '0.25em' }}>Roles</div>
                  <Autocomplete 
                     options={ROLE_OPTIONS}
                     value={roleValue}
                     onChange={(_, newValue) => setRoleValue(newValue)}
                     renderInput={(params) => <TextField {...params} InputLabelProps={{ ...params.InputLabelProps, style: { fontFamily: 'inherit', color: '#595959', fontWeight: 700 }}} sx={{ '.MuiAutocomplete-root': { paddingTop: '3px' }, '.MuiOutlinedInput-root': { paddingBottom: '3px', fontFamily: 'inherit' } }} />}
                     sx={{ width: '250px' }}
                     disableClearable
                  />
               </div>

               <div>
                  <div style={{ fontSize: '14px', color: '#616161', marginBottom: '0.25em' }}>Projects</div>
                  <Autocomplete 
                     options={PROJECT_OPTIONS}
                     value={projectValue}
                     onChange={(_, newValue) => setProjectValue(newValue)}
                     renderInput={(params) => <TextField {...params} InputLabelProps={{ ...params.InputLabelProps, style: { fontFamily: 'inherit', color: '#595959', fontWeight: 700 }}} sx={{ '.MuiAutocomplete-root': { paddingTop: '3px' }, '.MuiOutlinedInput-root': { paddingBottom: '3px', fontFamily: 'inherit' } }} />}
                     sx={{ width: '250px' }}
                     disableClearable
                  />
               </div>
               <div>
                  <div style={{ fontSize: '14px', color: '#616161', marginBottom: '0.25em' }}>Regions</div>
                  <Autocomplete 
                     options={REGION_OPTIONS}
                     value={regionValue}
                     onChange={(_, newValue) => setRegionValue(newValue)}
                     renderInput={(params) => <TextField {...params} InputLabelProps={{ ...params.InputLabelProps, style: { fontFamily: 'inherit', color: '#595959', fontWeight: 700 }}} sx={{ '.MuiAutocomplete-root': { paddingTop: '3px' }, '.MuiOutlinedInput-root': { paddingBottom: '3px', fontFamily: 'inherit' } }} />}
                     sx={{ width: '250px' }}
                     disableClearable
                  />
               </div>
            </section>
         </DialogContent>
      </Dialog>
   )
}

export default RiskDetectionSettingsDialog;