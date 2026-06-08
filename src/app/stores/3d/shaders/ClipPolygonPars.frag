
#if defined(clipPoints) && clipPoints > 0
	uniform vec2 uClipPolygon[clipPoints];

  bool pointInClipPolygon(vec2 point) {
    float x = point.x;
    float y = point.y;

    bool inside = false;
    for (int i = 0, j = clipPoints - 1; i < clipPoints; j = i++) {
      float xi = uClipPolygon[i].x;
      float yi = uClipPolygon[i].y;
      float xj = uClipPolygon[j].x;
      float yj = uClipPolygon[j].y;

      bool intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  }
#endif
