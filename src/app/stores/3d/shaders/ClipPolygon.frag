
#if defined(clipPoints) && clipPoints > 0
if (!pointInClipPolygon(vPosition.xy)) {
  discard;
  return;
}
#endif
