import 'overlayscrollbars/styles/overlayscrollbars.css';

import { observer } from 'mobx-react-lite';
import { Suspense, useEffect } from 'react';

import { useCheckCurrentUser } from '../entities/auth/model/useCheckCurrentUser.tsx';
import { LocationType } from '../entities/locationPanel/types.ts';
import { Loader } from '../shared/ui/loader/Loader.tsx';
import { ErrorLayout } from './layout/error';
import { AppRouter } from './providers/routerProvider/AppRouter.tsx';
import { useStore } from './providers/storeProvider/StoreProvider.tsx';
import zones3DStoreInstance from './stores/3d/stores/Zones3DStore.ts';
import patternsStoreInstance from './stores/patternsStore.ts';

const App = observer(() => {
  const { authStore } = useStore();
  const isAuth = authStore.isAuth;

  // TODO: refactor
  const { getCurrentUser } = useCheckCurrentUser();

  const patternsLoad = async () => {
    await patternsStoreInstance.loadPatterns();
  };

  const districtsLoad = async () => {
    await zones3DStoreInstance.fetchZones(LocationType.DISTRICT);
  };

  useEffect(() => {
    const init = async () => {
      if (!isAuth) {
        authStore.initAuth();
        return;
      }

      await getCurrentUser();

      const permissions = localStorage.getItem('permissions');
      if (permissions) {
        await Promise.all([patternsLoad(), districtsLoad()]);
      }
    };

    init();
  }, [isAuth]);

  if (isAuth === null) return null;

  return (
    <Suspense fallback={<Loader />}>
      <ErrorLayout>
        <AppRouter />
      </ErrorLayout>
    </Suspense>
  );
});

export default App;
