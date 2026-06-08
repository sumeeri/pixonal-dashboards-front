import { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { StatusCode } from 'shared/constants/StatusCode.ts';

import { Slide } from '../../../../entities/dashboard/types.ts';
import { AdminPages, AvailablePages } from '../../../../entities/navigation/types.ts';
import { AccessPage } from '../../../../pages/access/AccessPage.async.ts';
import { AdminUsers } from '../../../../pages/admin/users';
import { Dashboard } from '../../../../pages/dashboard';
import { ErrorStatus } from '../../../../pages/errorStatus';
import { Login } from '../../../../pages/login';
import { Stories } from '../../../../pages/stories';
import { AdminLayout } from '../../../layout/admin';
import { AuthLayout } from '../../../layout/auth/AuthLayout.tsx';
import { MapLayout } from '../../../layout/map';

export const useRouterConfig = () => {
  const storiesRoutes = Object.keys(Slide) as Array<keyof typeof Slide>;

  const stories = [
    { path: '', element: <Stories /> },
    ...storiesRoutes.map((key) => {
      return {
        path: Slide[key],
        element: <Dashboard page={Slide[key]} />,
      };
    }),
  ];

  return createBrowserRouter([
    {
      path: AvailablePages.AUTHORIZATION,
      element: (
        <Suspense>
          <Login />
        </Suspense>
      ),
    },
    { path: AvailablePages.ACCESS, element: <AccessPage /> },

    { path: AvailablePages.NOT_FOUND, element: <ErrorStatus status={StatusCode.NotFound} /> },
    {
      path: AvailablePages.FORBIDDEN,
      element: <ErrorStatus status={StatusCode.Forbidden} />,
    },
    {
      path: AvailablePages.INTERNAL_SERVER_ERROR,
      element: <ErrorStatus status={StatusCode.InternalServerError} />,
    },
    {
      path: AvailablePages.MAINTENANCE,
      element: <ErrorStatus status={'maintenance'} />,
    },

    {
      element: <AuthLayout />,
      children: [
        {
          path: AvailablePages.ADMIN,
          element: <AdminLayout />,
          children: [{ path: AdminPages.USERS, element: <AdminUsers /> }],
        },
      ],
    },

    {
      element: <AuthLayout />,
      children: [
        {
          path: AvailablePages.ROOT,
          element: <MapLayout />,
          children: stories,
        },
      ],
    },
  ]);
};
