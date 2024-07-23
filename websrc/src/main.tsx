import React from 'react';
import ReactDOM from 'react-dom/client';
import RisksTrends from './pages/RisksTrends.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Dashboard from './pages/Dashboard.tsx';
import App from './App.tsx';

import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <RisksTrends />
      },
      {
        path: '/dashboard',
        element: <Dashboard />,
        
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
