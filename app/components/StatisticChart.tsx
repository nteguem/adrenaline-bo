"use client";

import * as React from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";

type Props = { data: any };

export default function StatisticChart({ data }: any) {
  const mappeddata = data.map(
    (event: { participantCount: any }) => event.participantCount
  );
  return (
    <Stack direction="row" sx={{ width: "100%" }}>
      <Box sx={{ flexGrow: 1 }}>
        <SparkLineChart data={mappeddata} height={100} />
      </Box>
    </Stack>
  );
}
