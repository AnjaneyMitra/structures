import React from 'react';
import { useParams } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

const ProblemPage: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 ml-64"> {/* Ensure proper margin for sidebar */}
        <div className="h-full overflow-hidden">
          {/* Problem content */}
          <div className="p-6">
            <h1>Problem {id}</h1>
            {/* Rest of problem content */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;