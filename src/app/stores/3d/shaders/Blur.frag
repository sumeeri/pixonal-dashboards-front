precision mediump float;
precision mediump int;

uniform vec2 u_resolution;
uniform sampler2D u_color;
uniform sampler2D u_blur;

float offset[5];
float weight[5];

void main() {
    offset[0] = 0.0;
    offset[1] = 1.0;
    offset[2] = 2.0;
    offset[3] = 3.0;
    offset[4] = 4.0;

    weight[0] = 0.2270270270;
    weight[1] = 0.1945945946;
    weight[2] = 0.1216216216;
    weight[3] = 0.0540540541;
    weight[4] = 0.0162162162;

    vec2 coord = gl_FragCoord.xy / u_resolution;
    vec4 color = texture2D(u_color, coord);
    float blur = texture2D(u_blur, coord).x;
    bool is_blur = blur > 0.0;

    if (is_blur) {
        color *= weight[0];

        for (int i=1; i<5; i++) {
            color += texture2D(u_color, (gl_FragCoord.xy + vec2(0.0, offset[i] * blur)) / u_resolution) * weight[i];
            color += texture2D(u_color, (gl_FragCoord.xy - vec2(0.0, offset[i] * blur)) / u_resolution) * weight[i];
        }
    }

    gl_FragColor = color;
}
