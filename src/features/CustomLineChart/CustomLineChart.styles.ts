import { Stack, styled } from '@mui/material';
import { axisClasses, chartsAxisHighlightClasses, LineChart } from '@mui/x-charts';

export const ChartBlockWrapper = styled('div')<{ disabled?: boolean }>(({ disabled }) => ({
  pointerEvents: 'all',
  ...(disabled && {
    pointerEvents: 'none',
    opacity: 0.5,
  }),
}));

export const BottomBlock = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gridTemplateRows: '1fr',
  alignItems: 'flex-start',
  gap: '1rem',
  color: 'white',
  fontSize: '16px',
  fontWeight: 700,
  lineHeight: '28px',
  textTransform: 'capitalize',
  paddingLeft: '25px',
  borderBottom: '1px solid #9da3dc33',
});

export const Fragment = styled('div')({
  padding: '4px 0',
  gap: '16px',
  display: 'flex',
  borderRight: '1px solid #9da3dc33',
});

export const ValueWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  ['& div']: {
    fontFamily: 'DM Mono, monospace',
    fontSize: '32px',
    fontWeight: 500,
  },
});

export const ValueRow = styled('div')({
  display: 'flex',
  alignItems: 'last baseline',
  gap: '8px',
});

export const ValueUnit = styled('span')({
  fontSize: '14px',
  fontWeight: 500,
  opacity: 0.7,
});

export const LoaderWrapper = styled('div')({
  width: '80%',
  position: 'absolute',
  bottom: '130px',
  left: '10%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export const ColorIndicator = styled('div')({
  width: '20px',
  height: '20px',
  marginTop: '4px',
  opacity: 1,
  borderRadius: '50%',
  transition: 'opacity 0.5s ease-in-out',
});

export const LineChartWrapper = styled(Stack)({
  width: '100%',
  height: 'fit-content',
  position: 'relative',
});

export const StyledLineChart = styled(LineChart)(() => ({
  [`& .${axisClasses.directionY}`]: {
    display: 'none',
  },

  [`& .${axisClasses.root}`]: {
    transform: 'translateY(120px)',

    [`& .${axisClasses.tick}`]: {
      display: 'none',
    },

    [`& .${axisClasses.tickLabel}`]: {
      transform: 'translateY(5px)',
      fontSize: '18px',
      fill: 'white',
    },

    [`& .${axisClasses.line}`]: {
      stroke: 'rgb(255,255,255)',
    },
  },

  '& .MuiMarkElement-root': {
    opacity: 0,
  },

  [`& .${chartsAxisHighlightClasses.root}`]: {
    stroke: 'rgb(204, 204, 204)',
    strokeDasharray: 'unset',
  },

  [`& .MuiHighlightElement-root`]: {
    stroke: 'rgb(255,255,255)',
    strokeWidth: 2,
    r: 4,
  },
}));
