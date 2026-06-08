export const getBorderConfig = (length: number) => {
  switch (length) {
    case 1:
      return [{ borderWidth: '0 0 0 0' }];
    case 2:
      return [{ borderWidth: '0 1px 0 0' }, { borderWidth: '0 0 0 0' }];
    case 3:
      return [{ borderWidth: '0 1px 0 0' }, { borderWidth: '0 1px 0 0' }, { borderWidth: '0 0 0 0' }];
    case 4:
      return [
        { borderWidth: '0 1px 1px 0' },
        { borderWidth: '0 0 1px 0' },
        { borderWidth: '0 1px 0 0' },
        { borderWidth: '0 0 0 0' },
      ];
    case 5:
    case 6:
      return [
        { borderWidth: '0 1px 1px 0' },
        { borderWidth: '0 1px 1px 0' },
        { borderWidth: '0 0 1px 0' },
        { borderWidth: '0 1px 0 0' },
        { borderWidth: '0 1px 0 0' },
        { borderWidth: '0 0 0 0' },
      ];
    default:
      return [];
  }
};

export const getGridConfig = (length: number) => {
  switch (length) {
    case 1:
      return { gridTemplateColumns: '1fr', gridTemplateRows: '1fr' };
    case 2:
      return { gridTemplateColumns: '1fr   1fr', gridTemplateRows: '1fr' };
    case 3:
      return { gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: '1fr' };
    case 4:
      return { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' };
    case 5:
    case 6:
    default:
      return { gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr' };
  }
};
