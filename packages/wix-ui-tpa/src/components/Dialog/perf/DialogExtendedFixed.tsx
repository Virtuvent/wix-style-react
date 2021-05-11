import * as React from 'react';
import { Dialog } from '../';
import { classes } from './DialogExtendedFixed.st.css';

export const DialogPerf = () => {
  return (
    <Dialog className={classes.dialogComponent} isOpen>
      This is the content!
    </Dialog>
  );
};
