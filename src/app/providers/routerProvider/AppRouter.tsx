import { observer } from 'mobx-react-lite';
import { RouterProvider } from 'react-router-dom';

import { useRouterConfig } from './hooks/useRouterConfig.tsx';

export const AppRouter = observer(() => {
  const router = useRouterConfig();

  return <RouterProvider router={router} />;
});
