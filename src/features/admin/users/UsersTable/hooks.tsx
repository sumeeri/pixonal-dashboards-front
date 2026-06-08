import { Button, Chip, IconButton, Stack, Tooltip } from '@mui/material';
import { format } from 'date-fns/format';
import React, { ReactNode, useState } from 'react';
import { CopyIcon, PencilIcon } from 'shared/icons';

import { useStore } from '../../../../app/providers/storeProvider/StoreProvider';

interface Column {
  id: string;
  label: string;
  render?: (value: unknown, id?: number | null) => ReactNode;
}

export const useColumns = (): readonly Column[] => {
  const { adminStore } = useStore();

  const [isCopied, setIsCopied] = useState(false);

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

  return [
    { id: 'login', label: 'Username' },
    { id: 'email', label: 'Email' },
    {
      id: 'role',
      label: 'Role',
    },
    {
      id: 'permissions',
      label: 'Access',
      render: (value) => {
        if (!Array.isArray(value)) return null;

        return (
          <Stack spacing={{ lg: 1 }} direction="row" useFlexGap sx={{ flexWrap: 'wrap' }}>
            {value.map((permission) => (
              <Chip
                sx={{
                  border: '1px solid #FFFFFFB2',
                  color: '#FFFFFFB2',
                  background: '#FFFFFF1A',
                }}
                key={permission}
                label={permission}
              />
            ))}
          </Stack>
        );
      },
    },
    {
      id: 'link',
      label: 'Link',
      render: (value) => {
        if (!value) {
          return;
        }

        return (
          <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
            <Tooltip title={value as string}>
              <p>{(value as string).substring(0, 30)}...</p>
            </Tooltip>

            <Tooltip title={isCopied ? 'Copied' : 'Click to copy'}>
              <IconButton sx={{ padding: '2px', width: 20 }} onClick={() => handleCopyToClipboard(value as string)}>
                <CopyIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      },
    },
    {
      id: 'inactive',
      label: 'Status',
      render: (isInactive) => {
        if (typeof isInactive !== 'boolean') return null;

        if (isInactive) {
          return (
            <Chip
              sx={{
                border: '1px solid #912018',
                color: '#FDA29B',
                background: '#55160C',
              }}
              label="Inactive"
            />
          );
        }

        return (
          <Chip
            sx={{
              border: '1px solid #085D3A',
              color: '#159963',
              background: '#053321',
            }}
            label="Active"
          />
        );
      },
    },
    {
      id: 'created',
      label: 'Date Added',
      render: (value) => {
        if (typeof value !== 'string') return null;
        const date = new Date(value);

        return format(date, 'MMM d, yyyy');
      },
    },
    {
      id: 'actions',
      label: '',
      render: (_, id) => {
        const handleEditUser = () => {
          if (id) {
            adminStore.fetchUserById(id);
          }
        };

        return (
          <Button onClick={handleEditUser}>
            <PencilIcon />
          </Button>
        );
      },
    },
  ];
};
