import { Stack, styled } from '@mui/material';

export const CenterContentWrapper = styled(Stack)({
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  overflow: 'hidden',
  alignItems: 'center',
  justifyContent: 'center',
});

export const CenterContentTopLabel = styled('p')({
  margin: 0,
  fontSize: '5px',
  lineHeight: '110%',
  textWrap: 'wrap',
  wordBreak: 'break-word',
  fontFamily: 'RadioGrotesk, sans-serif',
});

export const CenterContentTopValue = styled('p')({
  margin: 0,
  fontSize: '10px',
  fontFamily: 'RadioGrotesk, sans-serif',
});

export const CenterContentBottomLabel = styled('p')({
  margin: 0,
  fontSize: '6px',
  opacity: 0.6,
  textWrap: 'wrap',
  wordBreak: 'break-word',
  fontFamily: 'RadioGrotesk, sans-serif',
});

export const CenterContentBottomValue = styled('p')({
  margin: 0,
  fontSize: '6px',
  opacity: 0.6,
  fontFamily: 'RadioGrotesk, sans-serif',
});

export const CenterContentDivider = styled('div')({
  width: '90%',
  height: '1px',
  margin: '3px 0',
});

export const CenterContentOnlyLabel = styled('p')({
  margin: 0,
  fontSize: '6px',
  textWrap: 'wrap',
  wordBreak: 'break-word',
  fontFamily: 'RadioGrotesk, sans-serif',
});

export const CenterContentOnlyValue = styled('p')({
  margin: 0,
  fontSize: '12px',
  fontFamily: 'RadioGrotesk, sans-serif',
});

export const ItemContentWrapper = styled('div')({
  width: '100%',
  height: '100%',
  overflow: 'hidden',
});

export const ItemLabel = styled('p')({
  margin: 0,
  lineHeight: '110%',
  fontSize: '6px',
  fontWeight: 400,
  fill: 'rgba(255, 255, 255, 1)',
  textWrap: 'wrap',
  wordBreak: 'break-word',
  fontFamily: 'RadioGrotesk, sans-serif',
  marginBottom: '1px',
});

export const ItemValue = styled('p')({
  margin: 0,
  fontSize: '10px',
  fontWeight: 400,
  fill: 'rgba(255, 255, 255, 1)',
  fontFamily: 'RadioGrotesk, sans-serif',
});
