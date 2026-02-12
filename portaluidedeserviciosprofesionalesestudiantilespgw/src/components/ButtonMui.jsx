import React from 'react';
import Button from '@mui/material/Button';

/**
 * ButtonMui - Wrapper around Material UI Button
 * Matches the API from the user's example code
 */
const ButtonMui = ({
    name,
    backgroundColor,
    type = 'submit',
    onClick,
    startIcon,
    fullWidth = true,
    sx,
    ...props
}) => {
    const customStyles = backgroundColor ? {
        backgroundColor: backgroundColor,
        '&:hover': {
            backgroundColor: backgroundColor,
            filter: 'brightness(0.9)',
        },
        ...sx
    } : sx;

    return (
        <Button
            type={type}
            onClick={onClick}
            variant="contained"
            fullWidth={fullWidth}
            startIcon={startIcon}
            sx={customStyles}
            {...props}
        >
            {name}
        </Button>
    );
};

export default ButtonMui;
