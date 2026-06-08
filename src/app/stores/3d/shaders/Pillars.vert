#define LAMBERT
#define FLAT_SHADED

#undef USE_INSTANCING

varying vec3 vViewPosition;

#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

attribute vec3 translate;
attribute float currentHeight;  
attribute float targetHeight;

uniform float uAnimationK;
uniform float opacity;
uniform float selectedInstance;

uniform vec3 lowColor;
uniform vec3 highColor;
uniform float colorCurve;
uniform float colorMul;

varying vec3 vPosition;

#if defined(PICK_INSTANCE_ID)
  flat varying int instanceID; 
#endif

void main() {

  #if defined(PICK_INSTANCE_ID)
    instanceID = gl_InstanceID;
  #endif

	#include <uv_vertex>
  // fix custom instanced buffers
	// #include <color_vertex>
  vPosition = position;
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
  #include <defaultnormal_vertex>
	#include <normal_vertex>

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>

  // fix custom instanced buffers
	// #include <project_vertex>
	float k = clamp(uAnimationK, 0.0, 1.0);
  float height = mix(currentHeight, targetHeight, k);
  transformed = transformed + translate;
  transformed *= vec3(1.0, 1.0, height);
  vec4 mvPosition = vec4( transformed, 1.0 );
  mvPosition = modelViewMatrix * mvPosition;
  gl_Position = projectionMatrix * mvPosition;

  vColor = mix(lowColor, highColor, pow(height, colorCurve));
  vColor *= colorMul;

  // color change to vColor
  // .... vColor = getColorFromTable(); ....

  // change color selected element
  if (int(selectedInstance) == gl_InstanceID) 
    vColor = vec3(1.0, 0.0, 0.0);

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

  // fix custom instanced buffers
	// #include <worldpos_vertex>
	vec4 worldPosition = vec4( transformed, 1.0 );
	worldPosition = modelMatrix * worldPosition;

	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

  
  #if defined(PICK_INSTANCE_ID)
  // gl_Position.xy += pointer * gl_Position.w;
  #endif

}
