import { Button } from '@mui/material';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';

import { useStore } from '../../../../app/providers/storeProvider/StoreProvider';
import { CreateUserModal } from '../../../../features/admin/users/CreateUserModal';
import { EditUserModal } from '../../../../features/admin/users/EditUserModal';
import { UsersTable } from '../../../../features/admin/users/UsersTable';
import style from './AdminUsers.module.scss';

const AdminUsers = observer(() => {
  const { adminStore } = useStore();

  useEffect(() => {
    adminStore.fetchUsers();
    adminStore.fetchDictionaries();
  }, []);

  return (
    <div className={style.wrapper}>
      <div className={style.header}>
        <div className={style.title}>
          <h1>Manage Users</h1>
          <span>Manage your users and their permissions.</span>
        </div>
        <div className={style.actions}>
          <Button variant="contained" size="small" onClick={() => adminStore.setIsCreateUserOpen(true)}>
            Add User
          </Button>
        </div>
      </div>
      <div className={style.divider} />
      {adminStore.usersList ? <UsersTable users={adminStore.usersList} /> : null}

      <CreateUserModal open={adminStore.isCreateUserOpen} onClose={() => adminStore.setIsCreateUserOpen(false)} />
      <EditUserModal open={!!adminStore.editableUserData} onClose={() => adminStore.setEditableUserData(null)} />
    </div>
  );
});

export default AdminUsers;
