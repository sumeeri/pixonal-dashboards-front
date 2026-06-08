import { Button, FormControl, FormHelperText, InputAdornment, OutlinedInput } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { EmailIcon, PasswordIcon } from 'shared/icons';

import SteamFusionLogo from '../../../../public/steamFusionLogo.svg';
import { useStore } from '../../../app/providers/storeProvider/StoreProvider.tsx';
import { userLogin } from '../../../entities/auth/model/login.ts';
import style from './Login.module.scss';

type FormValues = {
  email: string;
  password: string;
};

const Login = observer(() => {
  const navigate = useNavigate();
  const { authStore, currentUserStore } = useStore();

  useEffect(() => {
    if (currentUserStore.userData) {
      navigate('/');
    }
  }, [currentUserStore.userData]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>();

  const onSubmit = async (values: FormValues) => {
    try {
      await userLogin(values.email, values.password, authStore);
    } catch (e) {
      if (authStore.error) {
        setError('root', { type: 'custom', message: authStore.error });
      } else {
        setError('root', { type: 'custom', message: 'Unknown error' });
      }
    }
  };

  return (
    <div className={style.wrapper}>
      <img src={SteamFusionLogo} alt="Steam Fusion" className={style.logo} />

      <div className={style.innerWrapper}>
        <span className={style.subtitle}>A Transport Model & More</span>

        <form className={style.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormControl className={style.field} fullWidth>
            <label htmlFor="email" className={style.label}>
              Email
            </label>
            <OutlinedInput
              type="email"
              {...register('email', { required: 'Email is required' })}
              autoComplete="off"
              startAdornment={
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              }
              disabled={authStore.isLoading}
              id="email"
              placeholder="email@example.com"
            />
            <FormHelperText id="email">{errors?.email?.message}</FormHelperText>
          </FormControl>

          <FormControl className={style.field} fullWidth>
            <label htmlFor="password" className={style.label}>
              Password
            </label>
            <OutlinedInput
              type="password"
              {...register('password', { required: 'Password is required' })}
              autoComplete="off"
              startAdornment={
                <InputAdornment position="start">
                  <PasswordIcon />
                </InputAdornment>
              }
              disabled={authStore.isLoading}
              id="password"
              placeholder="password"
            />
            <FormHelperText id="password">{errors?.password?.message}</FormHelperText>
          </FormControl>

          <FormHelperText>{errors?.root?.message}</FormHelperText>

          <Button className={style.loginButton} variant="contained" type="submit" disabled={authStore.isLoading}>
            Login
          </Button>
        </form>
      </div>

      <span className={style.copyright}>All rights reserved © {new Date().getFullYear()}</span>
    </div>
  );
});

export default Login;
