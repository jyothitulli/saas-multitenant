import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  TextField,
} from '@mui/material';
import apiClient from '../api/axios';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  const loadProjects = async () => {
    try {
      const response = await apiClient.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async () => {
    try {
      await apiClient.post('/projects', newProject);
      setDialogOpen(false);
      setNewProject({ name: '', description: '' });
      loadProjects();
    } catch (error) {
      alert('Unable to create project. Please try again.');
    }
  };

  const handleChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Projects</Typography>
        <Button variant="contained" color="primary" onClick={() => setDialogOpen(true)}>
          + Create Project
        </Button>
      </Box>

      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} md={4} key={project.id}>
            <Card sx={{ height: '100%', boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6">{project.name}</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {project.description}
                </Typography>
                <Chip label={project.status || 'Active'} color="primary" variant="outlined" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <Box sx={{ p: 3, width: 400 }}>
          <Typography variant="h6" gutterBottom>
            New Project
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            label="Project Name"
            name="name"
            value={newProject.name}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Description"
            name="description"
            multiline
            rows={3}
            value={newProject.description}
            onChange={handleChange}
          />
          <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleCreateProject}>
            Save Project
          </Button>
        </Box>
      </Dialog>
    </Container>
  );
};

export default Projects;
