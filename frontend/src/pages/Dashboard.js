import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography } from '@mui/material';
import apiClient from '../api/axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    completed: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await apiClient.get('/projects/stats'); // Make sure backend provides this endpoint
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    loadStats();
  }, []);

  const statItems = [
    { title: 'Total Projects', value: stats.projects },
    { title: 'Total Tasks', value: stats.tasks },
    { title: 'Completed Tasks', value: stats.completed },
  ];

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {statItems.map((stat) => (
          <Grid item xs={12} md={4} key={stat.title}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: '#f9f9f9',
                boxShadow: 2,
                borderRadius: 2,
              }}
            >
              <Typography variant="h6">{stat.title}</Typography>
              <Typography variant="h3" color="primary">
                {stat.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard;
