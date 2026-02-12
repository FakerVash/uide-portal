import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

/**
 * ModalMui - Wrapper around Material UI Dialog
 * Matches the API from the user's example code
 */
const ModalMui = ({
    open,
    title,
    message,
    status = 'info', // 'info' | 'error' | 'success' | 'warning'
    handleClose,
}) => {
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
                {title}
            </DialogTitle>
            <DialogContent>
                <Alert severity={status} sx={{ mt: 1 }}>
                    {message}
                </Alert>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                    onClick={handleClose}
                    variant="contained"
                    color="primary"
                >
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalMui;
