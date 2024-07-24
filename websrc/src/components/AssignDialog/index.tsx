import { AddOutlined, ArrowRightAltOutlined, CloseOutlined, EditOutlined, GroupAddOutlined, PauseOutlined, PlayArrowOutlined, SyncOutlined, VisibilityOutlined } from '@mui/icons-material';
import { Box, Card, CardActions, CardContent, CardHeader, CircularProgress, Dialog, DialogContent, DialogProps, DialogTitle, keyframes, Slider, styled } from '@mui/material';
import React from 'react';

import './assign-dialog.css';

import amandaLogo from '../../assets/amanda-zane.svg';
import bigtimeAi from '../../assets/bigtime-ai.svg';
import checkmark from '../../assets/checkmark.svg';
import cristophLogo from '../../assets/christoph-franklin.svg';
import dunnerAILogo from '../../assets/dunner-ai-logo.svg';
import inayyaLogo from '../../assets/inayya-warren.svg';
import justineLogo from '../../assets/justine-comados.svg';
import mailSparkle from '../../assets/mail-sparkle.svg';
import settings from '../../assets/settings.svg';
import sparkle from '../../assets/sparkle.svg';
import voiceFlow from '../../assets/voice-flow.mp4';
import SettingsDialog from '../SettingsDialog';

const LOADING_TIME = 2500;

export type DunningType = 'Email' | 'Call';

type AssignDialogProps = DialogProps & {
   dunningType: DunningType,
   onDunningComplete: () => void
};

enum Step {
   Options,
   Loading,
   Results,
   Confirmation
}

const AssignDialog: React.FC<AssignDialogProps> = props => {
   const [step, setStep] = React.useState<Step>(Step.Options);

   const onClickDunnerAssign = React.useCallback(() => {
      setStep(Step.Loading);
   }, []);

   const onClickStartDunning = React.useCallback(() => {
      props.onDunningComplete();
      setStep(Step.Confirmation);
   }, []);

   React.useEffect(() => {
      if (step === Step.Loading) {
         const timeout = setTimeout(() => {
            setStep(Step.Results);
         }, LOADING_TIME);
      
         return () => clearTimeout(timeout);
      }
   }, [step]);

   const onCloseDialog = React.useCallback((_: any) => {
      props.onClose?.({}, 'backdropClick');
      setStep(Step.Options);
   }, [props.onClose]);

   return (
      <>
         <Dialog
            {...props}
            maxWidth='md' 
            fullWidth 
            style={{ fontFamily: 'inherit', maxHeight: '850px' }}
         >
            <DialogTitle 
               style={{ fontFamily: 'inherit', display: 'flex', justifyContent: 'space-between' }}
            >
               <span style={{ display: 'flex', gap: '0.5em', fontWeight: 700 }}>
                  {
                     step === Step.Results 
                        ? <><img src={bigtimeAi} style={{ width: '24px', height: '24px' }} /> {props.dunningType === 'Email' ? <><strong><span style={{ color: '#B50C00' }}> 4th Notice</span> Draft</strong></> : <strong>Dunning Call</strong>}</>
                        : <><GroupAddOutlined style={{ color: '#1F74CE', fontSize: '24px' }} /> Send Notice</>
                  }
               </span>
               <div style={{ cursor: 'pointer' }} onClick={onCloseDialog}><CloseOutlined style={{ color: '#616161', fontSize: '24px' }} /></div>
            </DialogTitle>
            <DialogContent className='custom-scrollbar' style={{ backgroundColor: '#F4F8FD' }}>
               <section style={{ marginTop: '1em' }}>
                  {step === Step.Options && <OptionsStep dunningType={props.dunningType} onClickDunnerAssign={onClickDunnerAssign} />}
                  {step === Step.Loading && <LoadingStep dunningType={props.dunningType} />}
                  {step === Step.Results && <ResultsStep dunningType={props.dunningType} onClickStartDunning={onClickStartDunning} />}
                  {step === Step.Confirmation && <ConfirmationStep />}
               </section>
            </DialogContent>
         </Dialog>
      </>
   )
}

export default AssignDialog;


type OptionsStepProps = {
   dunningType: DunningType,
   onClickDunnerAssign: () => void
}

const OptionsStep: React.FC<OptionsStepProps> = props => {
 
   return (
      <Card>
         <CardHeader 
            title={<span><GroupAddOutlined style={{ color: '#1F74CE', marginRight: '0.25em' }} /> <strong>Assign Task</strong></span>}
            titleTypographyProps={{ style: { fontFamily: 'inherit' } }}
         />
         <CardContent>
            <section>
               <strong>You can automate this task by assigning to Dunner AI</strong>, or you can assign to another team member to manually follow-up.
            </section>
            
            <section style={{ marginTop: '1em' }}>
               <div className='gradient-box'>
                  <img src={dunnerAILogo} />
                  <div>
                     <strong style={{ fontSize: '20px' }}>Dunner AI</strong>
                     <div>Assign an AI agent to instantly automate the dunning {props.dunningType === 'Email' ? 'emails' : 'calls'} for you.</div>
                  </div>
                  <button 
                     onClick={props.onClickDunnerAssign} 
                     style={{ backgroundColor: '#1F74CE', color: 'white', padding: '0.25em 0.5em', border: 'none', borderRadius: '5px', fontFamily: 'inherit', cursor: 'pointer', display: 'flex', gap: '0.25em', alignItems: 'center' }}
                  >
                     Assign <ArrowRightAltOutlined style={{ marginLeft: '0.25em' }} /> 
                  </button>
               </div>
            </section>

            <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2em', marginTop: '3em' }}>
               <div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', width: '350px' }}>
                  <img src={amandaLogo} style={{ border: '1px solid #CCCCCC', borderRadius: '50%', width: '4em' }} />
                  <div style={{ width: '150px' }}>
                     <strong style={{ fontSize: '16px' }}>Amanda Zane</strong>
                     <div style={{ fontSize: '12px' }}>Project Manager</div>
                  </div>
                  <button 
                     style={{ backgroundColor: '#DAE8F7', color: '#1F74CE', padding: '0.25em 0.5em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '0.25em', alignItems: 'center' }}
                  >
                     Assign <AddOutlined style={{ color: '#1F74CE', marginLeft: '0.25em' }} /> 
                  </button>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', width: '350px' }}>
                  <img src={justineLogo} style={{ border: '1px solid #CCCCCC', borderRadius: '50%', width: '4em' }} />
                  <div style={{ width: '150px' }}>
                     <strong style={{ fontSize: '16px' }}>Justine Comados</strong>
                     <div style={{ fontSize: '12px' }}>Finance Director</div>
                  </div>
                  <button 
                     style={{ backgroundColor: '#DAE8F7', color: '#1F74CE', padding: '0.25em 0.5em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '0.25em', alignItems: 'center' }}
                  >
                     Assign <AddOutlined style={{ color: '#1F74CE', marginLeft: '0.25em' }} /> 
                  </button>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', width: '350px' }}>
                  <img src={cristophLogo} style={{ border: '1px solid #CCCCCC', borderRadius: '50%', width: '4em' }} />
                  <div style={{ width: '150px' }}>
                     <strong style={{ fontSize: '16px' }}>Christoph Franklin</strong>
                     <div style={{ fontSize: '12px' }}>Account Manager</div>
                  </div>
                  <button 
                     style={{ backgroundColor: '#DAE8F7', color: '#1F74CE', padding: '0.25em 0.5em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '0.25em', alignItems: 'center' }}
                  >
                     Assign <AddOutlined style={{ color: '#1F74CE', marginLeft: '0.25em' }} /> 
                  </button>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', width: '350px' }}>
                  <img src={inayyaLogo} style={{ border: '1px solid #CCCCCC', borderRadius: '50%', width: '4em' }} />
                  <div style={{ width: '150px' }}>
                     <strong style={{ fontSize: '16px' }}>Inayya Warren</strong>
                     <div style={{ fontSize: '12px' }}>Team Lead</div>
                  </div>
                  <button 
                     style={{ backgroundColor: '#DAE8F7', color: '#1F74CE', padding: '0.25em 0.5em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '0.25em', alignItems: 'center' }}
                  >
                     Assign <AddOutlined style={{ color: '#1F74CE', marginLeft: '0.25em' }} /> 
                  </button>
               </div>
            </section>
         </CardContent>
      </Card>
   )
}

type LoadingStepProps = {
   dunningType: DunningType
}

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const RotatingProgress = styled(CircularProgress)(() => ({
   position: 'absolute',
   animation: `${rotate} 5s linear infinite`,
   width: '240px',
   height: '240px',
   margin: '0 auto 0 auto',
   left: 0,
   right: 0,
   marginLeft: '-20px',
   marginTop: '-20px'
}));

const ImageWrapper = styled(Box)(() => ({
  position: 'relative',
  display: 'inline-block',
}));

const LoadingStep: React.FC<LoadingStepProps> = props => {
 
   return (
      <section style={{ margin: '1em 0' }}>
         <div className='gradient-box' style={{ flexDirection: 'column', height: 400, width: 800 }}>
            <ImageWrapper>
               <img src={mailSparkle} width={200} height={200} />
               <RotatingProgress size={240} />
            </ImageWrapper>            
            <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: '20px', fontWeight: 700, color: '#878787' }}>DUNNER IS ON IT!</div>
               <div style={{ fontSize: '20px', fontWeight: 700 }}>Generating {props.dunningType === 'Email' ? '4th Notice' : 'Call Template'}...</div>
            </div>
         </div>
      </section>
   )
}

type ResultsStepProps = {
   dunningType: DunningType,
   onClickStartDunning: () => void
}

const ResultsStep: React.FC<ResultsStepProps> = props => {
   const [openSettings, setOpenSettings] = React.useState<boolean>(false);
   const [sliderValue, setSliderValue] = React.useState<number>(0);
   const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
   const [currentTime, setCurrentTime] = React.useState<number>(0);

   const ref = React.useRef<HTMLVideoElement>(null);
   
   const onOpenSettings = React.useCallback(() => {
      setOpenSettings(true);
   }, []);

   const onCloseSettingsDialog = React.useCallback(() => {
      setOpenSettings(false);
   }, []);

   React.useEffect(() => {
      const video = ref.current;

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handlePlaying = () => setCurrentTime(video?.currentTime || 0);

      video?.addEventListener('play', handlePlay);
      video?.addEventListener('pause', handlePause);
      video?.addEventListener('timeupdate', handlePlaying);

      return () => {
         video?.removeEventListener('play', handlePlay);
         video?.removeEventListener('pause', handlePause);
         video?.removeEventListener('timeupdate', handlePlaying);
      };
   }, []);

   React.useEffect(() => {
      const newTime = (currentTime / ref.current?.duration!) || 0;
      setSliderValue(Math.round(newTime * 100));
   }, [currentTime]);

   const onMediaButtonClick = React.useCallback(() => {
      if (ref.current?.paused || ref.current?.ended || ref.current?.currentTime === 0) {
         ref.current?.play()
      } else {
         ref.current?.pause();
      }
   }, []);
 
   return (
      <>
         <section style={{ margin: '1em 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <div style={{ fontSize: '20px' }}>
                  <div><strong>Innovatech</strong> Data Cloud Storage</div>
                  <div style={{ fontWeight: '700' }}>
                     {
                        props.dunningType === 'Email' 
                           ? <><span style={{ color: '#B50C00' }}>39 Days Past Due</span> #17894</>
                           : <span style={{ color: '#B50C00' }}>3 Overdue Invoices</span>
                     }
                  </div>
                  <button style={{ marginTop: '0.5em', color: '#1F74CE', backgroundColor: 'inherit', padding: '0.5em 0.75em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: '700', cursor: 'pointer', display: 'flex', gap: '0.25em', alignItems: 'center' }}>
                     <VisibilityOutlined style={{ color: '#1F74CE', marginRight: '0.25em' }} /> {props.dunningType === 'Email' ? 'View Invoice' : 'View Overdue Invoices'} <ArrowRightAltOutlined style={{ color: '#1F74CE', marginLeft: '0.25em' }} /> 
                  </button>
               </div>
               <div style={{ display: 'flex', gap: '2em', alignItems: 'center' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5em' }}>
                     <div>
                        <div style={{ fontSize: '10px', color: '#9E9E9E' }}>Template</div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#616161' }}>Net 30+</div>
                     </div>
                     <div>
                        <div style={{ fontSize: '10px', color: '#9E9E9E' }}>Tone</div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#616161' }}>Strong</div>
                     </div>
                     <div>
                        <div style={{ fontSize: '10px', color: '#9E9E9E' }}>Follow-Up</div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#616161' }}>Every 2 Days</div>
                     </div>

                     <div>
                        <div style={{ fontSize: '10px', color: '#9E9E9E' }}>Date & Time</div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#616161' }}>Today, 10:30A CMT</div>
                     </div>
                     <div>
                        <div style={{ fontSize: '10px', color: '#9E9E9E' }}>{props.dunningType === 'Email' ? 'Style' : 'Voice'}</div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#616161' }}>{props.dunningType === 'Email' ? 'Professional' : 'Sandra'}</div>
                     </div>
                     <div>
                        <div style={{ fontSize: '10px', color: '#9E9E9E' }}>From</div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#616161' }}>Acme Consulting</div>
                     </div>
                  </div>
                  <button 
                     onClick={onOpenSettings} 
                     style={{ backgroundColor: 'white', padding: '0.75em 0.5em 0.5em 0.5em', border: 'none', borderRadius: '50%', boxShadow: '0px 7px 17.6px 0px rgba(32, 54, 255, 0.25)', cursor: 'pointer' }}
                  >
                     <img style={{ width: '40px', height: '35px' }} src={settings} />
                  </button>
               </div>
            </div>
         </section>
         <Card>
            <CardHeader 
               title={
                  <div style={{ display: 'flex', gap: '1em', alignItems: 'center' }}>
                     <img src={sparkle} />
                     <div style={{ fontSize: '14px' }}>
                        <div style={{ color: '#616161' }}>7/24/2024, 10:30A CMT</div>
                        <div>
                           {
                              props.dunningType === 'Email' 
                                 ? <><strong>Dunner AI</strong> drafted the <strong>4th Notice</strong> for Invoice <span style={{ color: '#1F74CE', textDecoration: 'underline' }}>#17894</span> to Innovatech</>
                                 : <><strong>Dunner AI</strong> drafted the <strong>4th Notice Call Script</strong> for Innovatech</>
                           }
                        </div>
                     </div>
                     <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5em' }}>
                        {
                           props.dunningType === 'Email' && 
                           <button style={{ color: '#1F74CE', backgroundColor: 'inherit', padding: '0.25em 0.25em 0em 0.25em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: '700', cursor: 'pointer' }}>
                              <SyncOutlined style={{ color: '#1F74CE' }} />
                           </button>
                        }
                        <button style={{ color: '#1F74CE', backgroundColor: 'inherit', padding: '0.25em 0.25em 0em 0.25em', border: '1px solid #B4D1EF', borderRadius: '5px', fontFamily: 'inherit', fontWeight: '700', cursor: 'pointer' }}>
                           <EditOutlined style={{ color: '#1F74CE' }} />
                        </button>
                     </div>
                  </div>
               }
               titleTypographyProps={{ style: { fontFamily: 'inherit' } }}
               style={{ boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.1)' }}
            />
            <CardContent style={{ padding: '2em 6em', fontSize: '13px' }}>
               <div style={{ width: '700px' }}>
                  {
                     props.dunningType === 'Email' 
                        ? (
                           <>
                              <div><strong>URGENT:</strong> Overdue Invoice for Innovatech Data Cloud Storage Migration Project</div>

                              <div style={{ marginTop: '1em' }}>
                                 Hello Christopher,
                              </div>

                              <div style={{ marginTop: '1em' }}>
                                 You are receiving this notification because you are the designated billing contact for your account. 
                                 This is a final reminder regarding the outstanding payment for the Innovatech Data Cloud Storage migration project. 
                                 Our records indicate that Invoice #23457, totaling $15,678.23, is now 39 days past due.
                              </div>

                              <div style={{ marginTop: '1em' }}>
                                 Any accounts over 60 days past due are subject to suspension. Please remit payment immediately to avoid the suspension of your account. 
                                 You can send payment at www.acmeconsulting.com, or call us at 654-234-3456, 7 days a week from 8:30 AM to 5:30 PM. 
                              </div>

                              <div style={{ marginTop: '1em' }}>
                                 We value your business and want you to have continued access to our products and services. You can pay your invoice now, 
                                 or request new payment terms for future invoices below.
                              </div>

                              <div style={{ display: 'flex', gap: '0.75em', marginTop: '0.75em' }}>
                                 <button 
                                    style={{ backgroundColor: '#2B8751', color: 'white', padding: '0.5em', border: 'none', borderRadius: '5px', fontFamily: 'inherit', fontWeight: 500, cursor: 'pointer' }}
                                 >
                                       Pay Now
                                 </button>
                                 <button 
                                    style={{ backgroundColor: '#E6F4EC', color: '#2B8751', padding: '0.5em', border: '1px solid #9DD2B1', borderRadius: '5px', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer' }}
                                 >
                                    Request New Payment Terms
                                 </button>
                              </div>

                              <div style={{ marginTop: '0.75em' }}>
                                 Thank you for your immediate attention to this overdue payment.
                              </div>

                              <div style={{ marginTop: '0.75em' }}>
                                 <div>Thank you!</div>
                                 <div>Acme Consulting</div>
                              </div>
                           </>
                        )
                        : (
                           <>
                              <video ref={ref} width='700' height='240' preload='metadata' style={{ marginBottom: '-25px' }}>
                                 <source src={voiceFlow + '#t=0.1'} type='video/mp4' />
                              </video>
                              <Slider 
                                 value={sliderValue} 
                                 style={{ height: '5px', borderRadius: '5px', color: '#27CED8', marginTop: '-15px' }} 
                                 onChange={(_, newValue) => {
                                    ref.current!.currentTime = Math.round((newValue as number) * ref.current?.duration! / 100) || 0
                                 }}
                              />

                              <div style={{ display: 'flex', gap: '0.75em', justifyContent: 'space-between' }}>
                              <button 
                                 onClick={onMediaButtonClick}
                                 style={{ height: 'fit-content', backgroundColor: '#1F74CE', color: 'white', padding: '0.5em 0.5em 0.25em 0.5em', border: 'none', borderRadius: '50%', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer'  }}
                              >
                                 {
                                    isPlaying 
                                       ? <PauseOutlined />  
                                       : <PlayArrowOutlined />
                                 }
                              </button>
                              <div style={{ fontSize: '14px', color: '#616161', marginLeft: '2em' }}>
                                 <div style={{ fontWeight: 700 }}>Christopher Benson</div>
                                 <div style={{ fontWeight: 700 }}>+1 (978) 456-2389</div>

                                 <div style={{ fontWeight: 700, marginTop: '1em' }}>Starting:</div>
                                 <div>Today 10:30AM, CMT</div>
                                 <div>1st Attempt</div>
                              </div>
                              <div style={{ fontSize: '14px', color: '#616161', width: '330px', marginLeft: '4em' }}>
                                 <div style={{ fontWeight: 700 }}>Trancript Preview:</div>
                                 <div style={{ fontStyle: 'italic' }}>
                                    "Hi Christopher! I'm reaching out from Acme Consulting with the 4th notice regarding outstanding balances on your account. 
                                    According to our records, there are 3 overdue invoices with a total amount of $72,981.15 that needs to be paid this week to avoid disruption on projects."
                                 </div>
                              </div>
                              </div>
                           </>
                        )
                  }
               </div>
            </CardContent>
         </Card>
         <CardActions style={{ justifyContent: 'flex-end' }}>
            <button 
               onClick={props.onClickStartDunning}
               style={{ backgroundColor: '#1F74CE', color: 'white', padding: '0.5em', border: 'none', borderRadius: '5px', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '0.25em', alignItems: 'center'  }}
            >
                  Start Dunning <ArrowRightAltOutlined style={{ marginLeft: '0.25em' }} /> 
            </button>
         </CardActions>
         <SettingsDialog open={openSettings} onClose={onCloseSettingsDialog} />
      </>
   )
}

const ConfirmationStep: React.FC = () => {
 
   return (
      <section style={{ margin: '1em 0' }}>
         <div className='gradient-box' style={{ flexDirection: 'column', height: 400, width: 800 }}>
            <img src={checkmark} />
            <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: '20px', fontWeight: 700, color: '#878787' }}>All Set!</div>
               <div style={{ fontSize: '20px', fontWeight: 700 }}>The dunning process will start today at 10:30 AM</div>
            </div>
            <div style={{ marginTop: '1em', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '3em', justifyContent: 'space-evenly' }}>
               <div>
                  <div style={{ fontSize: '14px', color: '#9E9E9E' }}>Client</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#616161' }}>Innovatech</div>
               </div>
               <div>
                  <div style={{ fontSize: '14px', color: '#9E9E9E' }}>Follow-Up</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#616161' }}>Every 2 Days</div>
               </div>
               <div>
                  <div style={{ fontSize: '14px', color: '#9E9E9E' }}>Sender</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#616161' }}>Acme Consulting</div>
               </div>
            </div>
         </div>
      </section>
   )
}