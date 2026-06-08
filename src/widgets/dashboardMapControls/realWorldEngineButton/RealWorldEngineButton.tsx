import { Box, ButtonBase } from '@mui/material';
import { useEffect, useState } from 'react';

import map3d from '../../../app/stores/3d/Map3d.ts';
import { axiosInstance } from '../../../shared/constants/axiosInstance.ts';
import { RealWorldEngineLogo } from '../../../shared/icons/RealWorldEngineLogo.tsx';

const DEFAULT_URL = 'http://10.100.20.102:8000/';

export const RealWorldEngineButton = () => {
  const [realWorldEngineUrl, setRealWorldEngineUrl] = useState(DEFAULT_URL);

  useEffect(() => {
    axiosInstance
      .get<{ url: string }>('/config/real-world-engine-url')
      .then((response) => {
        if (response.data?.url) {
          setRealWorldEngineUrl(response.data.url);
        }
      })
      .catch(() => {
        // Use default URL if API fails
      });
  }, []);

  const getCompressedScreenshot = (): string | undefined => {
    const canvas = map3d.mapbox?.getCanvas();
    if (!canvas) return undefined;

    const offscreen = document.createElement('canvas');
    const scale = 0.5;
    offscreen.width = Math.floor(canvas.width * scale);
    offscreen.height = Math.floor(canvas.height * scale);
    const ctx = offscreen.getContext('2d');
    if (!ctx) return undefined;
    ctx.drawImage(canvas, 0, 0, offscreen.width, offscreen.height);
    return offscreen.toDataURL('image/jpeg', 0.7);
  };

  const getBearerToken = (): string | undefined => {
    const token = localStorage.getItem('token');
    if (!token) return undefined;
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  };

  const handleClick = () => {
    const mapbox = map3d.mapbox;
    const bearerToken = getBearerToken();

    if (mapbox) {
      const center = mapbox.getCenter();
      const zoom = mapbox.getZoom();
      const pitch = mapbox.getPitch();
      const bearing = mapbox.getBearing();

      const viewParam = `{x:${center.lng},y:${center.lat},z:${zoom}}`;
      const fromParam = encodeURIComponent(window.location.href);
      const tokenParam = bearerToken ? `&token=${encodeURIComponent(bearerToken)}` : '';
      const baseUrl = `${realWorldEngineUrl}#/?view=${viewParam}&pitch=${pitch}&bearing=${bearing}&from=${fromParam}${tokenParam}`;

      // Canvas pixels must be read inside the render callback — WebGL clears
      // the buffer immediately after compositing when preserveDrawingBuffer is false.
      mapbox.once('render', () => {
        const screenshot = getCompressedScreenshot();
        const fullUrl = screenshot ? `${baseUrl}&image=${encodeURIComponent(screenshot)}` : baseUrl;
        window.location.href = fullUrl;
      });
      mapbox.setBearing(mapbox.getBearing());
    } else {
      const fromParam = encodeURIComponent(window.location.href);
      const tokenParam = bearerToken ? `&token=${encodeURIComponent(bearerToken)}` : '';
      window.location.href = `${realWorldEngineUrl}#/?from=${fromParam}${tokenParam}`;
    }
  };

  return (
    <ButtonBase
      aria-label="View on Real World Engine"
      id="real-world-engine-button"
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderRadius: '144px',
        background: 'rgba(48, 56, 91, 0.6)',
        backdropFilter: 'blur(100px)',
        border: '1px solid #5BF8F0',
        boxShadow: '0 0 20px rgba(91, 248, 240, 0.4)',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          background:
            'linear-gradient(221.42deg, rgba(91, 248, 240, 0.10) 9.61%, rgba(19, 220, 90, 0.10) 82.62%), rgba(48, 56, 91, 0.6)',
          boxShadow: '0 0 25px rgba(91, 248, 240, 0.5)',
        },
      }}
    >
      <Box
        component="span"
        sx={{
          fontFamily: 'RadioGrotesk, sans-serif',
          fontSize: '16px',
          color: 'white',
          opacity: 0.7,
          lineHeight: 0.85,
          whiteSpace: 'nowrap',
        }}
      >
        View on
      </Box>
      <RealWorldEngineLogo width={180} height={23} />
    </ButtonBase>
  );
};
