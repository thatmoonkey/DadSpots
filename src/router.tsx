import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { MapHome } from './screens/MapHome';
import { SpotDetail } from './screens/SpotDetail';
import { AddSpotFlow } from './screens/AddSpotFlow';
import { Profile } from './screens/Profile';

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: '/', element: <MapHome /> },
      { path: '/spot/:id', element: <SpotDetail /> },
      { path: '/add', element: <AddSpotFlow /> },
      { path: '/profile', element: <Profile /> },
    ],
  },
]);
