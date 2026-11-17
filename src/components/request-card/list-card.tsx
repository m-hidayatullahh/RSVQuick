import React from "react";
import Tooltip from "@mui/material/Tooltip";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { IRequest } from "../../pages/requests/list";
import { Link } from "react-router-dom";
import { DeleteButton, EditButton, ShowButton } from "@refinedev/mui";
import RsvpIcon from "@mui/icons-material/Rsvp";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import MuiLink from "@mui/material/Link";

interface Props {
  request: IRequest;
  stats?: { accepted: number; rejected: number; total: number };
}

export default function RequestListCard({ request, stats }: Props) {
  const accepted = stats?.accepted ?? 0;
  const rejected = stats?.rejected ?? 0;
  return (
    <Card elevation={3} sx={{ flex: 1, minWidth: 250 }}>
      <Stack justifyContent="space-between" height="100%">
        <Box padding={2} bgcolor={request.secondary_color}>
          <MuiLink
            component={Link}
            to={`/requests/show/${request.id}`}
            underline="hover"
            sx={{ textDecorationColor: `${request.primary_color} !important` }}
          >
            <Typography color={request.primary_color} fontWeight="bold">
              {request.title}
            </Typography>
          </MuiLink>
        </Box>
        <Box
          padding={2}
          display="flex"
          flexDirection="column"
          height="100%"
          justifyContent="flex-end"
        >
          <Stack>
            <Typography fontWeight="bold" fontSize={12}>
              Close Date
            </Typography>
            <Typography>{request.close_date}</Typography>
          </Stack>
          <Stack mt={2} direction="row" gap={1} flexWrap="wrap">
            <Tooltip title="Hadir">
              <Chip
                size="small"
                color="success"
                variant="outlined"
                icon={<CheckCircleOutlineIcon />}
                label={`Hadir ${accepted}`}
              />
            </Tooltip>
            <Tooltip title="Tidak hadir">
              <Chip
                size="small"
                color="error"
                variant="outlined"
                icon={<CancelOutlinedIcon />}
                label={`Tidak ${rejected}`}
              />
            </Tooltip>
            <Tooltip title={`Kuota tamu`}>
              <Chip
                size="small"
                variant="outlined"
                label={`${accepted} / ${request.limit || 0}`}
              />
            </Tooltip>
          </Stack>
          <Stack mt={2}>
            <Typography fontWeight="bold">Actions</Typography>
            <Stack gap={2} direction="row" alignItems="center">
              <EditButton hideText recordItemId={request.id} />
              <ShowButton hideText recordItemId={request.id} />
              <DeleteButton hideText recordItemId={request.id} />
              <Tooltip title="See how your guests will see your invite.">
                <IconButton
                  component={Link}
                  to={`/r/${request.id}`}
                  color="primary"
                >
                  <RsvpIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}
