import React from 'react';

import './card.css';

export type CardProps = {
   variant?: 'info' | 'error',
   icon?: React.ReactNode;
}

function Card({ variant = 'info', ...props }: React.PropsWithChildren<CardProps>) {

   const className = React.useMemo(() => {
      return 'card-container' 
         + (variant === 'info' ? ' card-container--info' : '')
         + (variant === 'error' ? ' card-container--error' : '');
   }, [variant])

   return (
      <div className={className}>
         <div>
            {props.icon}
         </div>
         {props.children}
      </div>
   )
}

export default Card;