import { observer } from 'mobx-react-lite';
import { Suspense, useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Loader } from 'shared/ui/loader/Loader.tsx';

import { AvailablePages } from '../../../entities/navigation/types.ts';
import { getAllowedPaths } from '../../../entities/navigation/utils.ts';
import { useStore } from '../../providers/storeProvider/StoreProvider.tsx';

export const AuthLayout = observer(() => {
  const { authStore, currentUserStore } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const userData = currentUserStore.userData;
  const isAuth = authStore.isAuth;

  const allowedPaths = useMemo(() => getAllowedPaths(authStore.permissions ?? []), [authStore.permissions]);

  useEffect(() => {
    if (!userData && isAuth === false) {
      navigate(`/${AvailablePages.AUTHORIZATION}`, { state: { from: location }, replace: true });
    }
  }, [userData]);

  useEffect(() => {
    const currentPath = location.pathname.slice(1);

    if (currentPath.length === 0 || !authStore.permissions) {
      return;
    }

    if (!allowedPaths.includes(currentPath)) {
      navigate(AvailablePages.ROOT, { state: { from: location }, replace: true });
    }
  }, [location, allowedPaths]);

  // TODO: change fallback
  return (
    <Suspense fallback={<Loader />}>
      <Outlet />
    </Suspense>
  );
});
