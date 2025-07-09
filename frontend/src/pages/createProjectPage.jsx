import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../lib/axios';

const CreateProject = () => {
  const [projectName, setProjectName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    // console.log("projectName : ",projectName)
    const res = await axiosInstance.post('/projects/create', { name: projectName });
    console.log("res in CreateProject :", res)
    const data = res.data.data
    if (res.data.success) {
      navigate(`/editor/${data}/`);
    } else {
      alert(res.data.error);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🛠️ Create a New Project</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          required
          style={{ padding: '0.5rem', fontSize: '1rem', width: '300px' }}
        />
        <button type="submit" style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}>
          Create
        </button>
      </form>
    </div>
  );
};

export default CreateProject;
