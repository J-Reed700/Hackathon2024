import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import PaymentDelayRiskDialog from '../PaymentDelayRiskDialog';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Chip, IconButton, LinearProgress } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import React, { useContext } from 'react';

import sparkle from '../../assets/sparkle.svg';
import StaffingRiskDialog from '../StaffingRiskDialog';
import { AppContext } from '../../App';

type Priority = 'High' | 'Medium' | 'Low';

type Project = {
   name: string,
   description: string
}

type Row = {
   id: number,
   project: Project,
   details: string | JSX.Element,
   suggestions: Array<string>,
   priority: Priority
};

type RisksTableProps = {
   showDunningStatus: boolean,
   setShowDunningStatus: React.Dispatch<React.SetStateAction<boolean>>
}

const RisksTable: React.FC<RisksTableProps> = props => {
   const [clickedRow, setClickedRow] = React.useState<Row>();

   const firm = useContext(AppContext);

   const onRowClick = React.useCallback((row: Row) => {
      setClickedRow(row);
   }, []);

   const handleClose = React.useCallback(() => {
      setClickedRow(undefined)
   }, []);

   const rows: Array<Row> = React.useMemo(() => {
      if (firm === 'Acme Consulting') {
         return [
            { 
               id: 0, 
               project: { 
                  name: 'Innovatech', 
                  description: 'Data Cloud Storage Project' 
               }, 
               details: props.showDunningStatus 
                  ? <>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Dunning in progress...</span>
                        <span>+$450.00</span>
                     </div> 
                     <LinearProgress 
                        variant="determinate" 
                        value={20} 
                        style={{ height: '10px', backgroundColor: '#E4E4E4', marginTop: '2px', borderRadius: '5px' }} 
                        sx={{ '.MuiLinearProgress-bar': { backgroundColor: '#39CCF7' }}} 
                     />
                  </> 
                  : 'Invoice payment delays and staff overtime', 
               suggestions: ['Send 3rd Notice', 'Adjust Staffing, +2'], 
               priority: 'High' 
            },
            { 
               id: 2, 
               project: { 
                  name: 'Tech Wave', 
                  description: 'Data Cloud Storage Project' 
               }, 
               details: '4 Invoice discrepancies for cloud service usage', 
               suggestions: ['Review Disputed Charges'], 
               priority: 'Medium' 
            }
         ];
      } else {
         return [
            { 
               id: 1, 
               project: { 
                  name: 'Norris Design', 
                  description: 'Server Rebuild' 
               }, 
               details: 'Critical phases are blocked', 
               suggestions: ['Review Skill Matching', 'Adjust project schedule'], 
               priority: 'High' 
            },
            { 
               id: 3, 
               project: { 
                  name: 'NextGen', 
                  description: 'Data Lake Build' 
               }, 
               details: 'Unplanned overtime entries', 
               suggestions: ['Review Skill Matching'], 
               priority: 'Medium' 
            }
         ];
      }
   }, [firm, props.showDunningStatus]);

   const columns: GridColDef<Array<Row>[number]>[] = React.useMemo(() => [
      { 
         field: 'project', 
         headerName: 'Project', 
         width: 250,
         renderCell: (params: GridRenderCellParams<any, Project>) => (
            <div style={{ lineHeight: 'normal', height: '100%', alignContent: 'center' }}>
               <strong style={{ fontSize: '16px' }}>{params.value?.name}</strong>
               <div>{params.value?.description}</div>
            </div>
         ) 
      },
      {
         field: 'details',
         headerName: 'Insight Details',
         sortable: false,
         width: 350,
         renderCell: (params: GridRenderCellParams<any, string | JSX.Element>) => (
            params.row.project.name === 'Innovatech' && props.showDunningStatus 
               ? <div style={{ lineHeight: 'normal', height: '100%', alignContent: 'center', marginRight: '1em' }}>
                  {params.value}
               </div>
               : params.value
         )
      },
      {
         field: 'suggestions',
         headerName: 'Suggestions',
         sortable: false,
         width: 250,
         renderCell: (params: GridRenderCellParams<any, Array<string>>) => (
            <div style={{ lineHeight: 'normal', height: '100%', alignContent: 'center', color: '#9E9E9E' }}>
               {
                  params.value?.map((suggestion, index) => (
                     <div key={index}>{suggestion}</div>
                  ))
               }
            </div>
         )
      },
      {
         field: 'priority',
         headerName: 'Priority',
         width: 175,
         renderCell: (params: GridRenderCellParams<any, Priority>) => (
            <Chip 
               label={params.value} 
               color={params.value === 'High' ? 'error' : params.value === 'Medium' ? 'warning' : 'info'}
               size='small'
               sx={{ fontFamily: 'inherit', fontSize: '12px', padding: '0 1em', ...(params.value === 'Low' && { backgroundColor: '#AEAEAE' } ) }}
            />
         )
      },
      {
         field: 'actions',
         headerName: 'Actions',
         sortable: false,
         width: 200,
         renderCell: (params: GridRenderCellParams<any, JSX.Element>) => <div style={{ display: 'flex', gap: '0.75em', alignItems: 'center', height: "100%" }}>
            <IconButton size='small' color='primary'>
               <DeleteOutlinedIcon style={{ color: '#616161' }} />
            </IconButton>
            {
               params.row.project.name === 'Innovatech' && props.showDunningStatus 
                  ? <img src={sparkle} style={{ width: '35px', height: '35px' }} />
                  : <IconButton size='small' color='primary'>
                     <GroupAddOutlinedIcon style={{ color: '#616161' }} />
                  </IconButton>
            }
            <IconButton size='small' color='primary'>
               <VisibilityOutlinedIcon style={{ color: '#616161' }} />
            </IconButton>
            <IconButton>
               <KeyboardArrowDownOutlinedIcon style={{ color: '#616161' }} />
            </IconButton>
         </div>
      },
   ], [props.showDunningStatus]);

   return (
      <>
         <DataGrid 
            rows={rows}
            columns={columns}
            isCellEditable={() => false}
            onRowClick={(params: GridRowParams<Row>) => onRowClick(params.row)}
            sx={{ fontFamily: 'inherit', fontSize: '12px' }}
            slotProps={{ row: { style: { backgroundColor: 'white' } }}}
            rowHeight={60}
         />
         <PaymentDelayRiskDialog
            open={clickedRow?.id === 0}
            onClose={handleClose}
            showDunningStatus={props.showDunningStatus}
            setShowDunningStatus={props.setShowDunningStatus}
         />
         <StaffingRiskDialog
            open={clickedRow?.id === 1}
            onClose={handleClose}
         />
      </>
   );
}

export default RisksTable;