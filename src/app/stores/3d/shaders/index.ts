import { ShaderChunk, UniformsLib } from 'three';

import clip_polygon_fragment from './ClipPolygon.frag?raw';
import clip_polygon_pars_fragment from './ClipPolygonPars.frag?raw';
import formulas_func from './Formulas.vert?raw';

Object.assign(ShaderChunk, {
  clip_polygon_pars_fragment: clip_polygon_pars_fragment,
  clip_polygon_fragment: clip_polygon_fragment,
  formulas_func: formulas_func,
});

Object.assign(UniformsLib, {
  clip_polygon: {
    uClipPolygon: { value: [] },
  },
});
