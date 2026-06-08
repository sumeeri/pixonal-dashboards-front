#define LAMBERT

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

// -------------------------------------
attribute int fenceIndex;  
attribute float current;  
attribute float target;
attribute float currentColor;  
attribute float targetColor;

varying vec3 vPosition;

uniform bool uIsShowEmpty;
uniform int uFenceIndexSelected;
uniform float uAnimationK;

varying vec4 vColor;

#include <formulas_func>
// -------------------------------------

void main() {

	#include <uv_vertex>
	#include <color_vertex>
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

	float k = clamp(uAnimationK, 0.0, 1.0);
	// k = smoothstep(0.0, 1.0, k);

    // -------------------------------------
    // Top vertex height
	float value = mix(current, target, k);

    if (mod(float(gl_VertexID), 2.0) != 0.0) {
		transformed.z = value;
    }
    // -------------------------------------

	vec4 color = mix(
		getColorFromTable(currentColor),
		getColorFromTable(targetColor),
		k);

	if (uFenceIndexSelected >= 0) {
		color.a = 0.1;
		if (uFenceIndexSelected == fenceIndex) color.a = 1.;
	}

	vColor = color;

    vPosition = transformed;

	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}
