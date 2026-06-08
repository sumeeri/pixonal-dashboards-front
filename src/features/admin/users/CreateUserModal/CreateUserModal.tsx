import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Modal,
  OutlinedInput,
  Select,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { enqueueSnackbar } from 'notistack';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { CloseIcon } from 'shared/icons';
import { generatePassword } from 'shared/utils/generatePassword';

import { useStore } from '../../../../app/providers/storeProvider/StoreProvider.tsx';
import { createUser } from '../../../../entities/admin/users/api.ts';
import { CreateUserDto } from '../../../../entities/admin/users/types.ts';
import style from './CreateUserModal.module.scss';

type Props = {
  open: boolean;
  onClose: () => void;
};

export const CreateUserModal = observer(({ open, onClose }: Props) => {
  const { adminStore } = useStore();

  const { register, control, handleSubmit, setValue, reset, watch } = useForm<CreateUserDto>({
    defaultValues: {
      permissionIds: [],
      roleId: 3,
    },
  });

  const fillRandomPassword = () => {
    setValue('password', generatePassword());
  };

  const getPermissionsArray = (currentValue: number[], permissionId: number) => {
    if (currentValue.includes(permissionId)) {
      return currentValue.filter((item) => item !== permissionId);
    } else {
      return [...currentValue, permissionId];
    }
  };

  const onSubmit = async (values: CreateUserDto) => {
    const response = await createUser(values);

    const message = response && 'User was created successfully';
    enqueueSnackbar(message, {
      autoHideDuration: 2000,
      preventDuplicate: true,
      variant: 'success',
    });

    await adminStore.fetchUsers();
    adminStore.setEditableUserData(null);

    handleClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isRoleChanged = watch('roleId');

  useEffect(() => {
    if (isRoleChanged === 1) {
      setValue('permissionIds', [1, 2, 3, 4, 5]);
    }
  }, [isRoleChanged]);

  return (
    <Modal open={open} onClose={handleClose}>
      <div className={style.wrapper}>
        <div className={style.content}>
          <div className={style.header}>
            <p>Add New User</p>
            <button className={style.closeButton} onClick={handleClose}>
              <CloseIcon />
            </button>
          </div>

          <form className={style.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <span className={style.sectionTitle}>User Info</span>
            <div className={style.formSection}>
              <FormControl className={style.sectionItem}>
                <label htmlFor="login">Username</label>
                <OutlinedInput id="login" {...register('login', { required: 'Username is required' })} />
              </FormControl>
              <FormControl className={style.sectionItem}>
                <label htmlFor="email">Email</label>
                <OutlinedInput
                  id="email"
                  {...register('email', { required: 'Email is required', pattern: /^.+@.+\..+$/ })}
                />
              </FormControl>
              <FormControl className={style.sectionItem}>
                <label htmlFor="password">Password</label>
                <OutlinedInput id="password" {...register('password', { required: 'Password is required' })} />
                <Button variant="outlined" onClick={fillRandomPassword}>
                  Generate
                </Button>
              </FormControl>
            </div>

            <div className={style.divider} />

            <span className={style.sectionTitle}>User Access</span>
            <div className={style.formSection}>
              <FormControl className={style.sectionItem}>
                <label htmlFor="roleId">Role</label>
                <Controller
                  name="roleId"
                  control={control}
                  rules={{ required: 'Category is required' }}
                  render={({ field }) => (
                    <Select {...field} id="roleId">
                      {adminStore.roles?.map((role) => (
                        <MenuItem key={role.id} value={role.id}>
                          {role.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
              <FormControl className={style.sectionItem}>
                <label htmlFor="permissions">Access</label>
                <Controller
                  name="permissionIds"
                  control={control}
                  render={({ field }) => {
                    return (
                      <FormGroup>
                        {adminStore.permissions?.map((permission) => (
                          <FormControlLabel
                            key={permission.id}
                            control={
                              <Checkbox
                                checked={field.value?.includes(permission.id) || isRoleChanged === 1}
                                onClick={() =>
                                  setValue('permissionIds', getPermissionsArray(field.value, permission.id))
                                }
                              />
                            }
                            label={permission.name}
                          />
                        ))}
                      </FormGroup>
                    );
                  }}
                />
              </FormControl>
            </div>

            <div className={style.divider} />

            <div className={style.footer}>
              <Button variant="outlined" size="small" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="contained" color="secondary" size="small" type="submit">
                Add
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
});
