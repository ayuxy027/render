import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
  return (
    <main className="flex-1 overflow-auto bg-background">
      <Outlet />
    </main>
  );
};

export default Layout;