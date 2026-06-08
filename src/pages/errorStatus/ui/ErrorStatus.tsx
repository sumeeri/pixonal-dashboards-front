import { useMemo } from 'react';
import { StatusCode } from 'shared/constants/StatusCode.ts';

import style from './ErrorStatus.module.scss';

export interface PageStatusProps {
  status: StatusCode | 'maintenance';
}

const ErrorStatus = (props: PageStatusProps) => {
  const { status } = props;

  const renderPageByErrorStatus = useMemo(() => {
    switch (status) {
      case StatusCode.NotFound: {
        return (
          <>
            <h1>404 ERROR</h1>
          </>
        );
      }
      case StatusCode.InternalServerError: {
        return (
          <>
            <h1>500 ERROR</h1>
          </>
        );
      }
      case StatusCode.Forbidden: {
        return (
          <>
            <h1>403 ERROR</h1>
          </>
        );
      }
      case 'maintenance': {
        return (
          <>
            <h1>maintenance...</h1>
          </>
        );
      }
      default: {
        return <h1>Unknown error</h1>;
      }
    }
  }, []);

  return <div className={style.wrapper}>{renderPageByErrorStatus}</div>;
};

export default ErrorStatus;
