const PSXVert = `precision lowp float;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 color;

varying vec2 vUv; // change to vec3 for psx stretching
varying vec3 vColor;

void main() {
    vColor = color;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vec4 snapped = gl_Position;
    snapped.xyz = gl_Position.xyz / vec3(gl_Position.w);
    snapped.x = floor(160.0 * snapped.x) / 160.0;
    snapped.y = floor(120.0 * snapped.y) / 120.0;
	//vUv = vec3(uv.x * snapped.w, uv.y * snapped.w, snapped.w); // TODO: Not sure if this works, try a quad?
    snapped.xyz = snapped.xyz * vec3(gl_Position.w);
    gl_Position = snapped;

    // o.uv_MainTex = TRANSFORM_TEX(v.texcoord, _MainTex);
    // o.uv_MainTex *= distance + (vertex.w*(UNITY_LIGHTMODEL_AMBIENT.a * 8)) / distance / 2;
    // o.normal = distance + (vertex.w*(UNITY_LIGHTMODEL_AMBIENT.a * 8)) / distance / 2;
    
	//float distance = length(modelViewMatrix * vec4(position, 1.0));
    //vUv *= distance + (gl_Position * 8) / distance / 2;
	
	//vec4 wp = modelViewMatrix * vec4(position, 1.0);
	//wp.xyz = floor(wp.xyz * _GeoRes) / _GeoRes;
	//vec4 sp = projectionMatrix * wp;
	//vUv = vec3(uv.x * snapped.w, uv.y * snapped.w, snapped.w);
	//vUv = vec3(uv.x * snapped.w, uv.y * snapped.w, snapped.w);

    vUv = uv; // Below here is the real stuff
	//float distance = length((modelViewMatrix * vec4(position, 1.0)).xyz);
	//vUv = vec3(uv.x, uv.y, 0.0);
	//vUv *= distance + (snapped.w * 8.0) / distance / 2.0;
	//vUv.z = distance + (snapped.w * 8.0) / distance / 2.0;
}`

const PSXFrag = `precision lowp float;

uniform sampler2D map;
uniform vec3 tintColor;

varying vec2 vUv;
varying vec3 vColor;

const mat4 psxDitherTable = mat4(
    0,    8,    2,    10,
    12,    4,    14,    6, 
    3,    11,    1,    9, 
    15,    7,    13,    5
);

float getData(int x, int y) {
    for (int i = 0; i < 16; i++) {
        if (i == x) {
            for (int j = 0; j < 16; j++) {
                if (j == y) {
                    return psxDitherTable[i][j];
                }
            }
        }
    }
}

const int BIT_COUNT = 8;

int modi(int x, int y) {
    return x - y * (x / y);
}

int and(int a, int b) {
    int result = 0;
    int n = 1;

    for(int i = 0; i < BIT_COUNT; i++) {
        if ((modi(a, 2) == 1) && (modi(b, 2) == 1)) {
            result += n;
        }

        a = a / 2;
        b = b / 2;
        n = n * 2;

        if(!(a > 0 && b > 0)) {
            break;
        }
    }
    return result;
}

vec3 ditherCrunch(vec3 col, vec2 p) {
    col = col * vec3(255.0);

    int x = int(mod(p.x, 4.0));
    int y = int(mod(p.y, 4.0));
    float dither = getData(x, y);
    col = col + (dither / 2.0 - 4.0);

    col.r = mix(float(and(int(floor(col.r)), 248)), 248.0, step(248.0, col.r));
    col.g = mix(float(and(int(floor(col.g)), 248)), 248.0, step(248.0, col.g));
    col.b = mix(float(and(int(floor(col.b)), 248)), 248.0, step(248.0, col.b));

    col = col / vec3(255.0);

    return col;
}

void main() {
    vec4 diffuseColor = texture2D(map, vUv); // vUv.xy / vUv.z  //texture2D(psxDitherTable, vUv);//vec4(1.0);//
	if (diffuseColor.a < 0.5) discard;
    diffuseColor.xyz = diffuseColor.xyz * vColor;
    diffuseColor.xyz = diffuseColor.xyz * tintColor;
    diffuseColor.xyz = ditherCrunch(diffuseColor.xyz, gl_FragCoord.xy);
    // diffuseColor.xyz = mix(diffuseColor.xyz, diffuseColor.xyz * vec3(0.2, 0.2, 0.2), gl_FrontFacing);
    //diffuseColor.x = mix(float(diffuseColor.x), float(diffuseColor.x * 0.2), gl_FrontFacing);
    //diffuseColor.y = mix(diffuseColor.y, diffuseColor.y * 0.2, gl_FrontFacing);
    //diffuseColor.z = mix(diffuseColor.z, diffuseColor.z * 0.2, gl_FrontFacing);
    if (!gl_FrontFacing) {
        diffuseColor.xyz = diffuseColor.xyz * 0.2;
    }
    gl_FragColor = diffuseColor;
}`

const PSXFragNoTexture = `precision lowp float;

uniform vec3 tintColor;

varying vec3 vColor;

const mat4 psxDitherTable = mat4(
    0,    8,    2,    10,
    12,    4,    14,    6, 
    3,    11,    1,    9, 
    15,    7,    13,    5
);

float getData(int x, int y) {
    for (int i = 0; i < 16; i++) {
        if (i == x) {
            for (int j = 0; j < 16; j++) {
                if (j == y) {
                    return psxDitherTable[i][j];
                }
            }
        }
    }
}

const int BIT_COUNT = 8;

int modi(int x, int y) {
    return x - y * (x / y);
}

int and(int a, int b) {
    int result = 0;
    int n = 1;

    for(int i = 0; i < BIT_COUNT; i++) {
        if ((modi(a, 2) == 1) && (modi(b, 2) == 1)) {
            result += n;
        }

        a = a / 2;
        b = b / 2;
        n = n * 2;

        if(!(a > 0 && b > 0)) {
            break;
        }
    }
    return result;
}

vec3 ditherCrunch(vec3 col, vec2 p) {
    col = col * vec3(255.0);

    int x = int(mod(p.x, 4.0));
    int y = int(mod(p.y, 4.0));
    float dither = getData(x, y);
    col = col + (dither / 2.0 - 4.0);

    col.r = mix(float(and(int(floor(col.r)), 248)), 248.0, step(248.0, col.r));
    col.g = mix(float(and(int(floor(col.g)), 248)), 248.0, step(248.0, col.g));
    col.b = mix(float(and(int(floor(col.b)), 248)), 248.0, step(248.0, col.b));

    col = col / vec3(255.0);

    return col;
}

void main() {
    vec4 diffuseColor = vec4(vColor, 1.0);
    diffuseColor.xyz = diffuseColor.xyz * tintColor;
    diffuseColor.xyz = ditherCrunch(diffuseColor.xyz, gl_FragCoord.xy);
    gl_FragColor = diffuseColor;
}`

const PSXFragUI = `precision lowp float;

//uniform sampler2D map;
//uniform vec3 tintColor;

//varying vec2 vUv;
//varying vec3 vColor;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

const mat4 psxDitherTable = mat4(
    0,    8,    2,    10,
    12,    4,    14,    6, 
    3,    11,    1,    9, 
    15,    7,    13,    5
);

float getData(int x, int y) {
    for (int i = 0; i < 16; i++) {
        if (i == x) {
            for (int j = 0; j < 16; j++) {
                if (j == y) {
                    return psxDitherTable[i][j];
                }
            }
        }
    }
}

const int BIT_COUNT = 8;

int modi(int x, int y) {
    return x - y * (x / y);
}

int and(int a, int b) {
    int result = 0;
    int n = 1;

    for(int i = 0; i < BIT_COUNT; i++) {
        if ((modi(a, 2) == 1) && (modi(b, 2) == 1)) {
            result += n;
        }

        a = a / 2;
        b = b / 2;
        n = n * 2;

        if(!(a > 0 && b > 0)) {
            break;
        }
    }
    return result;
}

vec3 ditherCrunch(vec3 col, vec2 p) {
    col = col * vec3(255.0);

    int x = int(mod(p.x, 4.0));
    int y = int(mod(p.y, 4.0));
    float dither = getData(x, y);
    col = col + (dither / 2.0 - 4.0);

    col.r = mix(float(and(int(floor(col.r)), 248)), 248.0, step(248.0, col.r));
    col.g = mix(float(and(int(floor(col.g)), 248)), 248.0, step(248.0, col.g));
    col.b = mix(float(and(int(floor(col.b)), 248)), 248.0, step(248.0, col.b));

    col = col / vec3(255.0);

    return col;
}

void main() {
    vec4 diffuseColor = texture2D(uSampler, vTextureCoord); //texture2D(psxDitherTable, vUv);//vec4(1.0);//
    // diffuseColor.xyz = diffuseColor.xyz * vColor;
    // diffuseColor.xyz = diffuseColor.xyz * tintColor;
    diffuseColor.xyz = ditherCrunch(diffuseColor.xyz, gl_FragCoord.xy);
    // diffuseColor.xyz = mix(diffuseColor.xyz, diffuseColor.xyz * vec3(0.2, 0.2, 0.2), gl_FrontFacing);
    //diffuseColor.x = mix(float(diffuseColor.x), float(diffuseColor.x * 0.2), gl_FrontFacing);
    //diffuseColor.y = mix(diffuseColor.y, diffuseColor.y * 0.2, gl_FrontFacing);
    //diffuseColor.z = mix(diffuseColor.z, diffuseColor.z * 0.2, gl_FrontFacing);
    //if (!gl_FrontFacing) {
        //diffuseColor.xyz = diffuseColor.xyz * 0.2;
    //}
    gl_FragColor = diffuseColor;
}`

const BulletParticleVert = `precision lowp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 color;

attribute vec3 position;

varying float vDistance;
varying float vDistanceCamera;
varying vec4 vColor;

void main() {
    vDistance = length(position);

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
	vDistanceCamera = -mvPosition.z;
    gl_PointSize = 200.0 / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;

    vec4 snapped = gl_Position;
    snapped.xyz = gl_Position.xyz / vec3(gl_Position.w);
    snapped.x = floor(160.0 * snapped.x) / 160.0;
    snapped.y = floor(120.0 * snapped.y) / 120.0;
    snapped.xyz = snapped.xyz * vec3(gl_Position.w);
    gl_Position = snapped;

	vColor = vec4(color, 1.0);

    //vec4 fogColor = c * 0.86; // 0.8
    float fogFactor = smoothstep(9.0, 0.0, vDistance);
    vColor = mix(vColor, vec4(vColor.xyz * 0.86, vColor.w), fogFactor);

	vColor = mix(vColor, vec4(1.0, 0.0, 0.0, 1.0), smoothstep(8.0, 4.0, vDistanceCamera));

    float deathFactor = smoothstep(18.4, 20.0, vDistance);
    vColor = mix(vColor, vec4(0.0), deathFactor);
}`

const BulletParticleFrag = `precision lowp float;

uniform vec3 color;

varying float vDistance;
varying float vDistanceCamera;
varying vec4 vColor;

// const mat4 psxDitherTable = mat4(
//     0,    8,    2,    10,
//     12,    4,    14,    6, 
//     3,    11,    1,    9, 
//     15,    7,    13,    5
// );

// float getData(int x, int y) {
//     for (int i = 0; i < 16; i++) {
//         if (i == x) {
//             for (int j = 0; j < 16; j++) {
//                 if (j == y) {
//                     return psxDitherTable[i][j];
//                 }
//             }
//         }
//     }
// }

const int BIT_COUNT = 8;

int modi(int x, int y) {
    return x - y * (x / y);
}

int and(int a, int b) {
    int result = 0;
    int n = 1;

    for(int i = 0; i < BIT_COUNT; i++) {
        if ((modi(a, 2) == 1) && (modi(b, 2) == 1)) {
            result += n;
        }

        a = a / 2;
        b = b / 2;
        n = n * 2;

        if(!(a > 0 && b > 0)) {
            break;
        }
    }
    return result;
}

vec3 ditherCrunch(vec3 col, vec2 p) {
    col = col * vec3(255.0);

    int x = int(mod(p.x, 4.0));
    int y = int(mod(p.y, 4.0));
    // float dither = getData(x, y);
    // col = col + (dither / 2.0 - 4.0);

    col.r = mix(float(and(int(floor(col.r)), 248)), 248.0, step(248.0, col.r));
    col.g = mix(float(and(int(floor(col.g)), 248)), 248.0, step(248.0, col.g));
    col.b = mix(float(and(int(floor(col.b)), 248)), 248.0, step(248.0, col.b));

    col = col / vec3(255.0);

    return col;
}

void main() {
    // vec3 c = color;
    float l = length((floor(gl_PointCoord.xy * 16.0) / 16.0) - vec2(0.5, 0.5));
    if (l > 0.475) discard;
    ////if (l > 0.405) c = vec3(0.0, 1.0, 0.8);


	vec3 c = ditherCrunch(vColor.xyz, gl_FragCoord.xy);
	gl_FragColor = mix(vec4(c, vColor.w), vec4(ditherCrunch(vec3(0.0, 1.0, 0.8), gl_FragCoord.xy), 1.0), float(l > 0.405)); // vec4(0.0, 1.0, 0.8, 1.0)
    //c = mix(c, vec3(0.0, 1.0, 0.8), float(l > 0.405));

    //gl_FragColor = vec4(c, 1.0);

    //vec3 fogColor = c * 0.86; // 0.8
    //float fogFactor = smoothstep(9.0, 0.0, vDistance);
    //gl_FragColor = mix(gl_FragColor, vec4(fogColor, gl_FragColor.w), fogFactor);

	//gl_FragColor = mix(gl_FragColor, vec4(1.0, 0.0, 0.0, 1.0), smoothstep(8.0, 4.0, vDistanceCamera));

    //float deathFactor = smoothstep(18.4, 20.0, vDistance);
    //gl_FragColor = mix(gl_FragColor, vec4(0), deathFactor);
}`

export { PSXVert, PSXFrag, PSXFragNoTexture, PSXFragUI, BulletParticleVert, BulletParticleFrag }
