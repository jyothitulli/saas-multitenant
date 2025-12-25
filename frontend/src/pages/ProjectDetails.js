import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from '@mui/material';
import apiClient from '../api/axios';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const loadProjectDetails = async () => {
      try {
        const projectResponse = await apiClient.get(`/projects/${projectId}`);
        const tasksResponse = await apiClient.get(`/projects/${projectId}/tasks`);
        setProject(projectResponse.data);
        setTasks(tasksResponse.data);
      } catch (error) {
        console.error('Failed to load project details:', error);
      }
    };

    loadProjectDetails();
  }, [projectId]);

  if (!project) return <Typography>Loading project details...</Typography>;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {project.name}
      </Typography>
      <Typography color="textSecondary" paragraph>
        {project.description}
      </Typography>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Tasks</Typography>
        <Button variant="contained" color="primary">
          + Add Task
        </Button>
      </Box>

      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Due Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>{task.title}</TableCell>
              <TableCell>
                <Chip label={task.priority} size="small" />
              </TableCell>
              <TableCell>
                <Chip label={task.status} color="info" variant="outlined" size="small" />
              </TableCell>
              <TableCell>{task.dueDate || 'No date'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default ProjectDetails;
