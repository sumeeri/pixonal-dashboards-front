import { Alert, Button, Snackbar, Stack } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { closeSnackbar, SnackbarKey, SnackbarProvider } from 'notistack';
import React, { useCallback, useState } from 'react';
import { CloseIcon } from 'shared/icons/CloseIcon.tsx';
import { CopyIcon } from 'shared/icons/CopyIcon.tsx';

import { useStore } from '../../../providers/storeProvider/StoreProvider.tsx';

type Props = {
  children: React.ReactNode;
};

export const ErrorLayout = observer(({ children }: Props) => {
  const [isCopied, setIsCopied] = useState(false);
  const { errorStore } = useStore();

  const handleCopyToClipboard = useCallback((key: SnackbarKey) => {
    const errorMessage = errorStore.getErrorMessage(key);

    if (errorMessage) {
      navigator.clipboard.writeText(errorMessage);
      setIsCopied(true);
    }
  }, []);

  return (
    <React.Fragment>
      <SnackbarProvider
        style={{
          maxWidth: '30vw',
        }}
        action={(key) => (
          <Stack direction="row" alignItems="center" justifyContent="center">
            <Button variant="text" onClick={() => handleCopyToClipboard(key)}>
              <CopyIcon />
            </Button>
            <Button variant="text" onClick={() => closeSnackbar(key)}>
              <CloseIcon />
            </Button>
          </Stack>
        )}
      >
        {children}
      </SnackbarProvider>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={1000}
        open={isCopied}
        onClose={() => setIsCopied(false)}
      >
        <Alert severity="success" variant="filled">
          Copied to clipboard!
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
});
