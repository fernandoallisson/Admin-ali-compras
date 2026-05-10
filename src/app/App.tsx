import { RouterProvider } from 'react-router';
import { router } from './routes';
import { SystemNoticeHost } from './components/SystemNoticeModal';

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <SystemNoticeHost />
    </>
  );
}
