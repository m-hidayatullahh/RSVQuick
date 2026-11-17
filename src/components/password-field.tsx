import React, { useState } from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

type Props = Omit<TextFieldProps, "type">;

export default function PasswordField(props: Props) {
  const [show, setShow] = useState(false);
  const { InputProps, ...rest } = props;

  return (
    <TextField
      {...rest}
      type={show ? "text" : "password"}
      InputProps={{
        ...InputProps,
        endAdornment: (
          <InputAdornment position="end">
            {InputProps?.endAdornment}
            <Tooltip title={show ? "Sembunyikan password" : "Lihat password"}>
              <IconButton
                size="small"
                onClick={() => setShow((s) => !s)}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
                tabIndex={-1}
              >
                {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </Tooltip>
          </InputAdornment>
        ),
      }}
    />
  );
}
