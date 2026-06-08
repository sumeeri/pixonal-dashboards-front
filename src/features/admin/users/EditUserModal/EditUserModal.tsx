import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  IconButton,
  InputAdornment,
  MenuItem,
  Modal,
  OutlinedInput,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  Tooltip,
} from '@mui/material';
import { differenceInDays } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { CloseIcon, CopyIcon } from 'shared/icons';
import { generatePassword } from 'shared/utils/generatePassword';

import { useStore } from '../../../../app/providers/storeProvider/StoreProvider.tsx';
import {
  changeUserStatus,
  deleteUser,
  generateUserLink,
  sendUserLink,
  updateUser,
  updateUserPassword,
} from '../../../../entities/admin/users/api.ts';
import { UpdateUserDto, UserById, UserTabValues } from '../../../../entities/admin/users/types.ts';
import { CustomTabPanel } from '../../../selectTimeModal/tabPanel/CustomTabPanel.tsx';
import style from './EditUserModal.module.scss';

type Props = {
  open: boolean;
  onClose: () => void;
};

const tabsSx = {
  '& .MuiTabs-indicator': {
    display: 'none',
  },

  '& .MuiTabs-flexContainer': {
    gap: '4px',
  },
};

const tabSx = {
  padding: '12px 16px',
  minHeight: 'auto',
  background: 'transparent',
  borderRadius: '6px',
  gap: '4px',
  textTransform: 'capitalize',
  color: '#fff',
  opacity: 0.5,

  '&.Mui-disabled': {
    svg: {
      path: {
        stroke: 'transparent',
      },
    },
  },

  '&.Mui-selected': {
    background: '#525457',
    opacity: 1,

    svg: {
      path: {
        stroke: 'white',
      },
    },
  },
  svg: {
    path: {
      stroke: '#9DA3DC',
    },
  },
};

const getDefaultValuesForEditing = (user: UserById): UpdateUserDto => {
  return {
    login: user.login,
    email: user.email,
    link: user.link?.link,
    expireDate: user.link?.expireDate,
    roleId: user.role.id,
    permissionIds: user.permissions?.map((it) => it.id),
  };
};

export const EditUserModal = observer(({ open, onClose }: Props) => {
  const { adminStore, currentUserStore } = useStore();

  const defaultFormValues = adminStore.editableUserData
    ? getDefaultValuesForEditing(adminStore.editableUserData)
    : undefined;

  const { register, control, handleSubmit, setValue, getValues, reset, watch } = useForm<UpdateUserDto>({
    values: defaultFormValues,
  });

  const [password, setPassword] = useState('');
  const [tabValue, setTabValue] = useState<UserTabValues>(UserTabValues.INFO);
  const [isInactive, setIsInactive] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [openConfirmModal, setOpenConfirmModal] = useState<boolean>(false);

  useEffect(() => {
    setIsInactive(Boolean(adminStore.editableUserData?.inactive));
  }, [open]);

  const [isCopied, setIsCopied] = useState(false);

  const isCurrentUser = currentUserStore.userData?.unique_name === defaultFormValues?.login;

  const expireDate = getValues('expireDate');

  const remainingDays = expireDate ? `${Math.abs(differenceInDays(expireDate, new Date()))} Days Remain` : '';

  const handleCopyLink = () => {
    const value = getValues('link');

    if (!value) {
      return;
    }

    handleCopyToClipboard(value);
  };

  const handleCopyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
    } catch (error) {
      console.error('Failed to copy text:', error);
    } finally {
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const fillRandomPassword = () => {
    setPassword(generatePassword());
  };

  const handleRegenerateLink = async () => {
    if (!adminStore.editableUserData?.id) {
      return;
    }

    const response = await generateUserLink(adminStore.editableUserData.id);

    setValue('link', response.link);

    enqueueSnackbar('Successfully generated', {
      autoHideDuration: 2000,
      preventDuplicate: true,
      variant: 'success',
    });
  };

  const handlePasswordChange = async () => {
    if (adminStore.editableUserData?.id && password) {
      const response = await updateUserPassword(adminStore.editableUserData.id, password);

      enqueueSnackbar(response?.message, {
        autoHideDuration: 2000,
        preventDuplicate: true,
        variant: 'success',
      });

      setPassword('');
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsInactive(!e.target.checked);
  };

  const getPermissionsArray = (currentValue: number[], permissionId: number) => {
    if (currentValue.includes(permissionId)) {
      return currentValue.filter((item) => item !== permissionId);
    } else {
      return [...currentValue, permissionId];
    }
  };

  const onSubmit = async (values: UpdateUserDto) => {
    if (adminStore.editableUserData?.id) {
      await updateUser(adminStore.editableUserData.id, values);

      if (adminStore.editableUserData?.inactive === !isInactive) {
        await changeUserStatus(adminStore.editableUserData.id, isInactive);
      }
    }

    await adminStore.fetchUsers();
    adminStore.setEditableUserData(null);
  };

  const handleDeleteUser = async () => {
    setOpenDeleteModal(false);

    if (adminStore.editableUserData?.id) {
      await deleteUser(adminStore.editableUserData.id);

      await adminStore.fetchUsers();
      adminStore.setEditableUserData(null);
      setOpenConfirmModal(true);
      handleClose();
    }
  };

  const handleResendLink = async () => {
    if (adminStore.editableUserData?.id) {
      const response = await sendUserLink(adminStore.editableUserData.id);

      enqueueSnackbar(response?.message, {
        autoHideDuration: 2000,
        preventDuplicate: true,
        variant: 'success',
      });
    }
  };

  const handleClose = () => {
    reset();
    setPassword('');
    onClose();
  };

  const isLinkGenerated = watch('link');
  const isRoleChanged = watch('roleId');

  useEffect(() => {
    if (isRoleChanged === 1) {
      setValue('permissionIds', [1, 2, 3, 4, 5]);
    }
  }, [isRoleChanged]);

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <div className={style.wrapper}>
          <div className={style.content}>
            <div className={style.header}>
              <p>Edit User</p>
              <button className={style.closeButton} onClick={handleClose}>
                <CloseIcon />
              </button>
            </div>

            <form className={style.form} onSubmit={handleSubmit(onSubmit)} noValidate>
              <Tabs
                className={style.tabs}
                value={tabValue}
                onChange={(_e, newValue) => setTabValue(newValue)}
                aria-label="select editing tab"
                sx={tabsSx}
              >
                <Tab sx={tabSx} label="User Info" iconPosition="start" value={UserTabValues.INFO} />
                <Tab sx={tabSx} label="User Access" iconPosition="start" value={UserTabValues.ACCESS} />
              </Tabs>
              <CustomTabPanel value={tabValue} index={UserTabValues.INFO}>
                <div className={style.formSection}>
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
                      <label htmlFor="status">Status (Active)</label>
                      <Switch id="status" checked={!isInactive} onChange={handleStatusChange} />
                    </FormControl>
                  </div>

                  <div className={style.divider} />

                  <div className={style.formSection}>
                    <FormControl className={style.sectionItem}>
                      <label htmlFor="password">Password</label>
                      <OutlinedInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                      <Stack direction="row" spacing={2}>
                        <Button variant="outlined" onClick={fillRandomPassword}>
                          Generate
                        </Button>
                        <Button variant="outlined" onClick={handlePasswordChange}>
                          Submit
                        </Button>
                      </Stack>
                    </FormControl>
                  </div>

                  <div className={style.divider} />

                  <div className={style.formSection}>
                    <FormControl className={style.sectionItem}>
                      <label htmlFor="link">Link</label>
                      <div>
                        <OutlinedInput
                          id="link"
                          className={style.input}
                          {...register('link')}
                          endAdornment={
                            <InputAdornment position="end">
                              <Tooltip title={isCopied ? 'Copied' : 'Click to copy'}>
                                <IconButton
                                  sx={{
                                    ['&.MuiIconButton-root']: { padding: '2px', width: 20, boxSizing: 'border-box' },
                                  }}
                                  onClick={() => handleCopyLink()}
                                >
                                  <CopyIcon />
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          }
                        />
                        <FormHelperText className={style.helperText}>{remainingDays}</FormHelperText>
                      </div>
                      <Stack direction="row" spacing={2}>
                        {isLinkGenerated && (
                          <Button variant="outlined" onClick={handleResendLink}>
                            Resend
                          </Button>
                        )}
                        <Button variant="outlined" onClick={handleRegenerateLink}>
                          {isLinkGenerated ? 'Refresh' : 'Generate'}
                        </Button>
                      </Stack>
                    </FormControl>
                  </div>

                  <div className={style.divider} />

                  <div className={style.formSection}>
                    <FormControl className={style.sectionItem}>
                      <label htmlFor="link">Delete User</label>
                      <FormHelperText className={style.helperTextDeleteUser}>This step cannot be undone</FormHelperText>
                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="outlined"
                          className={style.deleteUserButton}
                          onClick={() => setOpenDeleteModal(true)}
                        >
                          Delete User Permanently
                        </Button>
                      </Stack>
                    </FormControl>
                  </div>
                </div>
              </CustomTabPanel>
              <CustomTabPanel value={tabValue} index={UserTabValues.ACCESS}>
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

                  {!isCurrentUser && (
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
                                      disabled={isRoleChanged === 1}
                                      onChange={() =>
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
                  )}
                </div>
              </CustomTabPanel>

              <div className={style.divider} />

              <div className={style.footer}>
                <Button variant="outlined" size="small" onClick={handleClose}>
                  Cancel
                </Button>
                <Button variant="contained" color="secondary" size="small" type="submit">
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Modal>

      <Modal open={openDeleteModal}>
        <div className={style.wrapper}>
          <div className={style.deleteModalContent}>
            <p>Are you sure you want to delete the user?</p>
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" className={style.deleteButton} size="small" onClick={handleDeleteUser}>
                Delete
              </Button>
              <Button variant="outlined" size="small" onClick={() => setOpenDeleteModal(false)}>
                Cancel
              </Button>
            </Stack>
          </div>
        </div>
      </Modal>

      <Modal open={openConfirmModal}>
        <div className={style.wrapper}>
          <div className={style.deleteModalContent}>
            <p>{`User ${getValues('login')} has been deleted`}</p>

            <Button variant="outlined" size="small" onClick={() => setOpenConfirmModal(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
});
