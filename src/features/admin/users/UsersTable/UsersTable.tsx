import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';

import { useStore } from '../../../../app/providers/storeProvider/StoreProvider.tsx';
import { User, UserListWithPagination } from '../../../../entities/admin/users/types.ts';
import { useColumns } from './hooks';
import style from './UsersTable.module.scss';

type Props = {
  users: UserListWithPagination;
};

export const UsersTable = observer(({ users }: Props) => {
  const columns = useColumns();
  const { adminStore } = useStore();

  const [page, setPage] = useState(0);

  const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage: number) => {
    setPage(newPage);
    adminStore.fetchUsers(newPage + 1);
  };

  return (
    <div className={style.wrapper}>
      <TableContainer sx={{ height: '500px ' }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id}>{column.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {users.items.map((user) => {
              return (
                <TableRow key={user.id}>
                  {columns.map((column) => {
                    const value = user[column.id as keyof User];

                    if (column.render) {
                      return <TableCell key={column.id}>{column.render(value, user.id)}</TableCell>;
                    }

                    return <TableCell key={column.id}>{value}</TableCell>;
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={users.totalCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={users.pageSize}
        sx={{
          '& .MuiTablePagination-selectLabel': {
            display: 'none',
          },
          '& .MuiTablePagination-select': {
            display: 'none',
          },
        }}
      />
    </div>
  );
});
