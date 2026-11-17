import React, { useMemo } from "react";
import { CreateButton, List } from "@refinedev/mui";
import { IResourceComponentsProps, useList } from "@refinedev/core";
import { Box, Typography, Stack, CircularProgress } from "@mui/material";
import RequestListCard from "../../components/request-card/list-card";
import { IUser } from "../../components/header";
import { useGetIdentity } from "@refinedev/core";

export interface IRequest {
  id: string;
  background_color: string;
  background_image: string | null;
  card_image: string | null;
  card_image_x: number | null;
  card_image_y: number | null;
  card_image_width: number | null;
  title: string;
  address: string;
  acceptance_label: string;
  rejection_label: string;
  close_date: string;
  secondary_color: string;
  primary_color: string;
  limit: number;
  font_family: string;
  italicize: boolean;
  background_gradient: boolean;
  secondary_gradient: boolean;
  style: string;
  custom_message: string | null;
  reply_prefix: string | null;
  rsvp_title: string | null;
  question_label: string | null;
}

export interface IResponse {
  id: string;
  responder_name: string;
  accepted_at: string;
  accept: boolean;
  request_id: string;
}

export const RequestList: React.FC<IResourceComponentsProps> = () => {
  const { data: user } = useGetIdentity<IUser>();

  const { data } = useList<IRequest>({
    resource: "requests",
    queryOptions: { enabled: !!user },
    filters: [{ field: "user_id", operator: "eq", value: user?.id }],
    pagination: { pageSize: 100 },
  });

  const requests = data?.data;

  const requestIds = useMemo(() => requests?.map((r) => r.id) ?? [], [requests]);
  const { data: responsesData } = useList<IResponse>({
    resource: "responses",
    queryOptions: { enabled: requestIds.length > 0 },
    filters: [{ field: "request_id", operator: "in", value: requestIds }],
    pagination: { pageSize: 5000 },
  });

  const statsByRequest = useMemo(() => {
    const map: Record<string, { accepted: number; rejected: number; total: number }> = {};
    (responsesData?.data ?? []).forEach((r) => {
      const key = r.request_id;
      if (!map[key]) map[key] = { accepted: 0, rejected: 0, total: 0 };
      map[key].total += 1;
      if (r.accept) map[key].accepted += 1;
      else map[key].rejected += 1;
    });
    return map;
  }, [responsesData]);

  return (
    <List>
      {requests ? (
        requests.length > 0 ? (
          <Box display="flex" flexWrap="wrap" gap={2}>
            {requests.map((req) => (
              <RequestListCard
                key={req.id}
                request={req}
                stats={statsByRequest[req.id]}
              />
            ))}
          </Box>
        ) : (
          <Box
            padding={2}
            bgcolor="action.hover"
            borderRadius={2}
            minHeight={200}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Stack gap={4} alignItems="center">
              <Typography>
                Belum ada undangan. Buat undangan pertama Anda dengan menekan
                tombol "Create".
              </Typography>
              <CreateButton />
            </Stack>
          </Box>
        )
      ) : (
        <Box
          padding={2}
          bgcolor="action.hover"
          borderRadius={2}
          minHeight={200}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <CircularProgress />
        </Box>
      )}
    </List>
  );
};
