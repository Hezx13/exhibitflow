import React from 'react';
import { useGetPurchaseStatsQuery } from '../store/api/statisticsApi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, Typography, Grid, Box, Skeleton } from '@mui/material';
import { motion } from 'motion/react';

export const PurchaseStatsChart: React.FC = () => {
  const { data, isLoading } = useGetPurchaseStatsQuery();

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', height: 400 }}>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  const chartData = data?.dailyStats.map((day) => ({
    date: day._id,
    amount: day.totalAmount,
    items: day.itemCount,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Chart */}
      <Grid size={{xs:12}}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Purchase Trends (Last 7 Days)
            </Typography>
            <Box sx={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <LineChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip
                    wrapperStyle={{ backgroundColor: '#000000', color: '#FFFFFF' }}
                    contentStyle={{ backgroundColor: '#101010', color: '#FFFFFF', border: 'none', boxShadow:'1px 1px 1px 1px #000000' }}
                    formatter={(value: number) => [`$${value}`, 'Amount']}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </motion.div>
  );
};
