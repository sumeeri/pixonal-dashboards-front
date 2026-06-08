import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader } from 'shared/ui/loader/Loader';

import { useStore } from '../../../app/providers/storeProvider/StoreProvider';
import { useCheckCurrentUser } from '../../../entities/auth/model/useCheckCurrentUser';
import { AvailablePages } from '../../../entities/navigation/types';

const AccessPage = () => {
  const { authStore, currentUserStore } = useStore();

  const location = useLocation();
  const navigate = useNavigate();

  const userData = currentUserStore.userData;
  const isAuth = authStore.isAuth;

  const { getCurrentUser } = useCheckCurrentUser();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    if (!token) {
      navigate(`/${AvailablePages.AUTHORIZATION}`, { state: { from: location }, replace: true });
      return;
    }

    void authStore.checkToken(token);
  }, []);

  useEffect(() => {
    if (isAuth) {
      getCurrentUser();
    }
  }, [isAuth]);

  useEffect(() => {
    if (userData && isAuth === true) {
      window.location.replace(`${window.location.origin}/`);
    }
  }, [userData]);

  return <Loader />;
};

export default observer(AccessPage);
