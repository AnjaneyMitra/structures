import React from 'react';
import { useParams } from 'react-router-dom';

const ProblemPage: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="flex h-screen">
      <div className="flex-1"> {/* Ensure proper margin for sidebar */}
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