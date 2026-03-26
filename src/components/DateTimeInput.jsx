import React, { useRef } from 'react';
import { formatDateTimeMask, isValidDate } from '../utils/dateUtils.js';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { OutlinedInput, InputAdornment, IconButton } from '@mui/material';

const DateTimeInput = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  readOnly = false,
  disabled = false,
  maxLength = 19,
  className, // eslint-disable-line no-unused-vars
  sx,
  tabIndex,
  placeholder = 'MM/DD/YYYY HH:MM',
  showCalendarIcon = false,
  required = false,
}) => {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const raw = e.target.value;
    const masked = formatDateTimeMask(raw);
    onChange(masked, e);
  };

  const handleBlur = (e) => {
    const val = e.target.value;
    if (val && !isValidDate(val)) {
      if (onBlur) onBlur(val, false, e);
    } else {
      if (onBlur) onBlur(val, true, e);
    }
  };

  return (
    <OutlinedInput
      ref={inputRef}
      type="text"
      id={id}
      name={name}
      value={value || ''}
      onChange={handleChange}
      onBlur={handleBlur}
      readOnly={readOnly}
      disabled={disabled}
      maxLength={maxLength}
      tabIndex={tabIndex}
      placeholder={placeholder}
      size="small"
      fullWidth
      autoComplete="off"
      endAdornment={
        showCalendarIcon && !readOnly && !disabled ? (
          <InputAdornment position="end">
            <IconButton size="small" tabIndex={-1} aria-label="Open calendar picker" edge="end" sx={{ p: '2px', mr: '-2px' }}>
              <CalendarMonthOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </InputAdornment>
        ) : undefined
      }
      sx={{ minWidth: 0, ...(sx || {}) }}
    />
  );
};

export default DateTimeInput;
