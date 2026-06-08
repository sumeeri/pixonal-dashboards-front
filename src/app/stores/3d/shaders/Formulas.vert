
vec4 getColorFromTable(float value) {
    if (value <= 0.0) return vec4(0., 0., 0., 0.);               // 0x00000000
    else if (value <= 1.0) return vec4(0.031, 0.392, 0.118, 1.); // 0x08641e
    else if (value <= 2.0) return vec4(0.173, 0.965, 0.361, 1.); // 0x2cf65c
    else if (value <= 3.0) return vec4(0.996, 0.894, 0.000, 1.); // 0xfee400
    else if (value <= 4.0) return vec4(0.961, 0.718, 0.098, 1.); // 0xf5b719
    else if (value <= 5.0) return vec4(0.945, 0.275, 0.275, 1.); // 0xf14646
    else if (value <= 6.0) return vec4(0.447, 0.118, 0.118, 1.); // 0x721e1e
    else if (value >= 10.0 && value <= 110.0) 
        return mix(
            vec4(0.000, 0.812, 1.000, .3),                       // 0x00cfffc3
            vec4(0.000, 0.812, 1.000, 1.),                       // 0x00cfff
            (value - 10.0) / 100.0
        );
    else if (value >= 110.0 && value <= 210.0) 
        return mix(
            vec4(0.439, 0.000, 1.000, 1.),                       // 0x7000ff
            vec4(0.000, 0.812, 1.000, 1.),                       // 0x00cfff
            (value - 110.0) / 100.0
        );

    // Density
    else if (value >= 220.0 && value <= 221.0) return vec4(0.31, 0.839, 1.0, 1.); // #4FD6FF
    else if (value <= 222.0) return vec4(0.263, 0.624, 0.898, 1.); // #439FE5
    else if (value <= 223.0) return vec4(0.235, 0.514, 0.851, 1.); // #3C83D9
    else if (value <= 224.0) return vec4(0.188, 0.298, 0.749, 1.); // #304CBF

    return vec4(1.000, 0.000, 1.000, 1.);                        // 0xff00ff range error color
}
