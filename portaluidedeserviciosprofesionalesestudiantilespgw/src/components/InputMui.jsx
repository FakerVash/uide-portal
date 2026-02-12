import React from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

/**
 * InputMui - Wrapper around Material UI TextField
 * Matches the API from the user's example code
 */
const InputMui = ({
    startIcon,
    endIcon,
    label,
    placeholder,
    type = 'text',
    helperText,
    value,
    onChange,
    required = false,
    ...props
}) => {
    const InputProps = {};

    if (startIcon) {
        InputProps.startAdornment = (
            <InputAdornment position="start">
                {startIcon}
            </InputAdornment>
        );
    }

    if (endIcon) {
        InputProps.endAdornment = (
            <InputAdornment position="end">
                {endIcon}
            </InputAdornment>
        );
    }

    return (
        <TextField
            label={label}
            placeholder={placeholder}
            type={type}
            value={value}
            onChange={onChange}
            required={required}
            helperText={helperText}
            fullWidth
            variant="outlined"
            InputProps={InputProps}
            sx={{
                '& .MuiOutlinedInput-root': {
                    fontSize: '1rem',
                    fontWeight: 500,
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    '& fieldset': {
                        borderColor: '#e5e7eb',
                        borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                        borderColor: '#870a42',
                        borderWidth: '2px',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#870a42',
                        borderWidth: '2px',
                        boxShadow: '0 0 0 3px rgba(135, 10, 66, 0.1)',
                    },
                    '& input': {
                        fontSize: '1rem',
                        fontWeight: 500,
                        color: '#111827',
                        padding: '14px 16px',
                        fontFamily: 'inherit',
                        letterSpacing: 'normal',
                    },
                },
                '& .MuiInputLabel-root': {
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'none',
                    '&.Mui-focused': {
                        color: '#870a42',
                        fontWeight: 700,
                    },
                },
                '& .MuiInputAdornment-root': {
                    color: '#6b7280',
                },
                ...props.sx,
            }}
            {...props}
        />
    );
};

export default InputMui;
