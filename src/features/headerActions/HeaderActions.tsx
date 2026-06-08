import { IconButton, Popover } from '@mui/material';
import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignOutIcon, SteamFusionLogo, UserIcon, UsersIcon } from 'shared/icons';
import { HelpIcon } from 'shared/icons/HelpIcon.tsx';

import authStoreInstance from '../../app/stores/authStore.ts';
import { UserPermissions } from '../../entities/admin/users/types.ts';
import { AdminPages, AvailablePages } from '../../entities/navigation/types.ts';
import style from './HeaderActions.module.scss';

export const HeaderActions = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const isUserHavePermissionForManage = (authStoreInstance.permissions ?? []).includes(UserPermissions.USERS);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('permissions');
    window.location.replace(`${window.location.origin}/login`);
  };

  const handleManageUsers = useCallback(() => {
    navigate(`/${AvailablePages.ADMIN}/${AdminPages.USERS}`);
  }, [navigate]);

  return (
    <div className={style.wrapper}>
      <div className={style.actions}>
        <IconButton
          ref={menuRef}
          LinkComponent={'a'}
          href={`${import.meta.env.VITE_REACT_APP_BASE_URL}/s3-mock/userManual.pdf`}
          target="_blank"
          rel="noreferrer"
        >
          <HelpIcon />
        </IconButton>
        <IconButton ref={menuRef} onClick={() => setIsMenuOpen(true)}>
          <UserIcon />
        </IconButton>
      </div>
      <SteamFusionLogo className={style.logo} />

      <Popover
        open={isMenuOpen}
        anchorEl={menuRef.current}
        onClose={() => setIsMenuOpen(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <div className={style.popoverWrapper}>
          <button className={style.popoverButton} onClick={handleLogout}>
            <SignOutIcon />
            Logout
          </button>
          {isUserHavePermissionForManage && (
            <button className={style.popoverButton} onClick={handleManageUsers}>
              <UsersIcon />
              Manage Users
            </button>
          )}
        </div>
      </Popover>
    </div>
  );
};
